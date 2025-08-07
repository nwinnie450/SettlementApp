import { Group, Expense, Settlement, Balance } from '../types';
import { formatCurrency } from './currency';

interface ExportOptions {
  format: 'csv';
  dateRange?: {
    start: string;
    end: string;
  };
  includeSettled?: boolean;
  groupBy?: 'date' | 'category' | 'member';
  currency: string;
}

/**
 * Export group expenses to CSV format
 */
export function exportExpensesToCSV(
  group: Group,
  expenses: Expense[],
  options: ExportOptions = { format: 'csv', currency: 'USD' }
): string {
  const { dateRange, currency } = options;
  
  // Filter expenses by date range if specified
  let filteredExpenses = expenses;
  if (dateRange) {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }
  
  // Create CSV headers
  const headers = [
    'Date',
    'Description',
    'Category',
    'Amount',
    'Currency',
    'Amount (Group Currency)',
    'Paid By',
    'Participants',
    'Your Share',
    'Status'
  ];
  
  // Create CSV rows
  const rows = filteredExpenses.map(expense => {
    const paidByMember = group.members.find(m => m.userId === expense.paidBy);
    const participants = expense.splits.map(split => {
      const member = group.members.find(m => m.userId === split.userId);
      return `${member?.name || 'Unknown'} (${formatCurrency(split.amount, currency)})`;
    }).join('; ');
    
    // Find current user's share
    const currentUserSplit = expense.splits.find(split => split.userId === 'current_user_id'); // This should be dynamically set
    const userShare = currentUserSplit ? currentUserSplit.amount : 0;
    
    return [
      new Date(expense.date).toLocaleDateString(),
      `"${expense.description}"`,
      expense.category,
      expense.amount.toFixed(2),
      expense.currency,
      expense.baseCurrencyAmount.toFixed(2),
      paidByMember?.name || 'Unknown',
      `"${participants}"`,
      userShare.toFixed(2),
      'Pending' // For future settlement status implementation
    ];
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * Export settlement report to CSV
 */
export function exportSettlementReportToCSV(
  group: Group,
  balances: Balance[],
  settlements: Settlement[] = []
): string {
  const headers = [
    'Member',
    'Net Balance',
    'Currency',
    'Status',
    'Amount Owed To You',
    'Amount You Owe',
    'Last Settlement Date'
  ];
  
  const rows = balances.map(balance => {
    const member = group.members.find(m => m.userId === balance.userId);
    const lastSettlement = settlements
      .filter(s => s.fromUserId === balance.userId || s.toUserId === balance.userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const amountOwedToYou = Math.max(0, balance.netAmount);
    const amountYouOwe = Math.max(0, -balance.netAmount);
    const status = balance.netAmount > 0 ? 'Owes You' : balance.netAmount < 0 ? 'You Owe' : 'Settled';
    
    return [
      member?.name || 'Unknown',
      balance.netAmount.toFixed(2),
      balance.currency,
      status,
      amountOwedToYou.toFixed(2),
      amountYouOwe.toFixed(2),
      lastSettlement ? new Date(lastSettlement.date).toLocaleDateString() : 'Never'
    ];
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  return csvContent;
}

/**
 * Export complete group summary to CSV
 */
export function exportGroupSummaryToCSV(
  group: Group,
  expenses: Expense[],
  balances: Balance[]
): string {
  const summaryData = [
    ['Group Summary'],
    ['Group Name', group.name],
    ['Base Currency', group.baseCurrency],
    ['Total Members', group.members.length.toString()],
    ['Total Expenses', expenses.length.toString()],
    ['Total Amount Spent', expenses.reduce((sum, expense) => sum + expense.baseCurrencyAmount, 0).toFixed(2)],
    ['Export Date', new Date().toLocaleDateString()],
    [''],
    ['Members'],
    ['Name', 'Joined Date', 'Status'],
    ...group.members.map(member => [
      member.name,
      new Date(member.joinedAt).toLocaleDateString(),
      member.isActive ? 'Active' : 'Inactive'
    ]),
    [''],
    ['Current Balances'],
    ['Member', 'Net Balance', 'Status'],
    ...balances.map(balance => {
      const member = group.members.find(m => m.userId === balance.userId);
      const status = balance.netAmount > 0 ? 'Owed Money' : balance.netAmount < 0 ? 'Owes Money' : 'Settled';
      return [
        member?.name || 'Unknown',
        balance.netAmount.toFixed(2) + ' ' + balance.currency,
        status
      ];
    })
  ];
  
  return summaryData.map(row => row.join(',')).join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Share CSV content via Web Share API or fallback to download
 */
export async function shareCSV(content: string, filename: string): Promise<boolean> {
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([content], filename, { type: 'text/csv' });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Group Expenses Export',
          text: 'Exported expense data from GroupSettle'
        });
        return true;
      }
    } catch (error) {
      console.warn('Web Share API failed:', error);
    }
  }
  
  // Fallback to download
  downloadCSV(content, filename);
  return false;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  groupName: string,
  exportType: 'expenses' | 'settlements' | 'summary',
  dateRange?: { start: string; end: string }
): string {
  const sanitizedGroupName = groupName.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let filename = `${sanitizedGroupName}_${exportType}_${timestamp}`;
  
  if (dateRange) {
    const startDate = dateRange.start.replace(/-/g, '');
    const endDate = dateRange.end.replace(/-/g, '');
    filename += `_${startDate}_to_${endDate}`;
  }
  
  return `${filename}.csv`;
}