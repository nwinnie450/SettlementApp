// Export service for CSV and PDF generation

import { Group, Expense } from '../types';
import { formatCurrency } from '../utils/settlements';
import { getCategoryLabel } from '../utils/categories';

/**
 * Filter expenses by date range
 */
const filterExpensesByDateRange = (
  expenses: Expense[],
  dateRange?: { start: Date; end: Date }
): Expense[] => {
  if (!dateRange) return expenses;

  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
  });
};

/**
 * Export expenses to CSV format
 */
export const exportToCSV = (group: Group, dateRange?: { start: Date; end: Date }): void => {
  // CSV Headers
  const headers = [
    'Date',
    'Description',
    'Category',
    'Amount',
    'Currency',
    'Base Amount',
    'Paid By',
    'Split Between'
  ];

  // Filter expenses by date range
  const filteredExpenses = filterExpensesByDateRange(group.expenses, dateRange);

  // CSV Rows
  const rows = filteredExpenses.map(expense => {
    const paidBy = group.members.find(m => m.userId === expense.paidBy);
    const splitMembers = expense.splits
      .map(split => group.members.find(m => m.userId === split.userId)?.name || 'Unknown')
      .join(', ');

    return [
      new Date(expense.date).toLocaleDateString(),
      `"${expense.description}"`, // Quote description in case it contains commas
      getCategoryLabel(expense.category || 'other'),
      expense.amount.toFixed(2),
      expense.currency,
      expense.baseCurrencyAmount.toFixed(2),
      paidBy?.name || 'Unknown',
      `"${splitMembers}"` // Quote member list
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create and download file
  downloadFile(
    csvContent,
    `${group.name}_expenses_${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

/**
 * Export expenses to PDF format (using HTML and print)
 */
export const exportToPDF = (group: Group, dateRange?: { start: Date; end: Date }): void => {
  // Filter expenses by date range
  const filteredExpenses = filterExpensesByDateRange(group.expenses, dateRange);

  // Calculate totals
  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.baseCurrencyAmount, 0);
  const expenseCount = filteredExpenses.length;

  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${group.name} - Expense Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #14b8a6;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #14b8a6;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .summary {
      background-color: #f0fdfa;
      border: 1px solid #14b8a6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .summary-item .value {
      font-size: 24px;
      font-weight: bold;
      color: #14b8a6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background-color: #14b8a6;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    tr:hover {
      background-color: #f0fdfa;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    @media print {
      body {
        margin: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${group.name}</h1>
    <p>Expense Report</p>
    <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="label">Total Expenses</div>
      <div class="value">${expenseCount}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Amount</div>
      <div class="value">${formatCurrency(totalSpent, group.baseCurrency)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Active Members</div>
      <div class="value">${group.members.filter(m => m.isActive).length}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th>Amount</th>
        <th>Paid By</th>
        <th>Split Between</th>
      </tr>
    </thead>
    <tbody>
      ${filteredExpenses.map(expense => {
        const paidBy = group.members.find(m => m.userId === expense.paidBy);
        const splitMembers = expense.splits
          .map(split => group.members.find(m => m.userId === split.userId)?.name || 'Unknown')
          .join(', ');

        return `
          <tr>
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td><strong>${expense.description}</strong></td>
            <td>${getCategoryLabel(expense.category || 'other')}</td>
            <td>${formatCurrency(expense.baseCurrencyAmount, group.baseCurrency)}</td>
            <td>${paidBy?.name || 'Unknown'}</td>
            <td>${splitMembers}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This report was generated by SettlementApp</p>
    <p>${group.name} - ${group.members.length} members</p>
  </div>

  <div class="no-print" style="text-align: center; margin-top: 30px;">
    <button onclick="window.print()" style="
      padding: 12px 24px;
      background-color: #14b8a6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 600;
    ">Print / Save as PDF</button>
    <button onclick="window.close()" style="
      padding: 12px 24px;
      background-color: #6b7280;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      font-weight: 600;
      margin-left: 10px;
    ">Close</button>
  </div>
</body>
</html>
  `;

  // Open in new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

/**
 * Export settlements summary to CSV
 */
export const exportSettlementsToCSV = (group: Group): void => {
  const headers = ['From', 'To', 'Amount', 'Currency'];

  // Calculate settlements (this would use the actual settlement calculation from settlements.ts)
  // For now, just export the raw data - you can enhance this later
  const rows: string[][] = [];

  group.members.forEach(member => {
    if (!member.isActive) return;

    const paid = group.expenses
      .filter(exp => exp.paidBy === member.userId)
      .reduce((sum, exp) => sum + exp.baseCurrencyAmount, 0);

    const owed = group.expenses.reduce((sum, exp) => {
      const split = exp.splits.find(s => s.userId === member.userId);
      return sum + (split?.amount || 0);
    }, 0);

    const balance = paid - owed;

    if (Math.abs(balance) > 0.01) {
      rows.push([
        member.name,
        balance > 0 ? 'Receives' : 'Owes',
        Math.abs(balance).toFixed(2),
        group.baseCurrency
      ]);
    }
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(
    csvContent,
    `${group.name}_settlements_${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  );
};

/**
 * Helper function to download a file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
