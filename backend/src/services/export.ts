import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import type { Response } from 'express';

interface ExpenseData {
  _id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  paidBy: {
    name: string;
  };
  splits: Array<{
    userId: string;
    amount: number;
  }>;
}

interface SettlementData {
  _id: string;
  fromUserId: {
    name: string;
  };
  toUserId: {
    name: string;
  };
  amount: number;
  currency: string;
  status: string;
  date: string;
}

interface BalanceData {
  userName: string;
  netAmount: number;
  currency: string;
}

/**
 * Export expenses to CSV
 */
export const exportExpensesToCSV = (
  expenses: ExpenseData[],
  groupName: string
): string => {
  const records = expenses.map((expense) => ({
    Date: new Date(expense.date).toLocaleDateString(),
    Description: expense.description,
    Amount: expense.amount,
    Currency: expense.currency,
    Category: expense.category,
    'Paid By': expense.paidBy.name,
    Splits: expense.splits.length,
  }));

  const csv = stringify(records, {
    header: true,
    columns: [
      'Date',
      'Description',
      'Amount',
      'Currency',
      'Category',
      'Paid By',
      'Splits',
    ],
  });

  return csv;
};

/**
 * Export settlements to CSV
 */
export const exportSettlementsToCSV = (
  settlements: SettlementData[]
): string => {
  const records = settlements.map((settlement) => ({
    Date: new Date(settlement.date).toLocaleDateString(),
    From: settlement.fromUserId.name,
    To: settlement.toUserId.name,
    Amount: settlement.amount,
    Currency: settlement.currency,
    Status: settlement.status,
  }));

  const csv = stringify(records, {
    header: true,
    columns: ['Date', 'From', 'To', 'Amount', 'Currency', 'Status'],
  });

  return csv;
};

/**
 * Export balances to CSV
 */
export const exportBalancesToCSV = (balances: BalanceData[]): string => {
  const records = balances.map((balance) => ({
    Member: balance.userName,
    Balance: balance.netAmount,
    Currency: balance.currency,
    Status: balance.netAmount > 0 ? 'Owed' : balance.netAmount < 0 ? 'Owes' : 'Settled',
  }));

  const csv = stringify(records, {
    header: true,
    columns: ['Member', 'Balance', 'Currency', 'Status'],
  });

  return csv;
};

/**
 * Generate PDF report for group expenses
 */
export const generateExpenseReportPDF = (
  res: Response,
  groupName: string,
  expenses: ExpenseData[],
  balances: BalanceData[]
): void => {
  const doc = new PDFDocument({ margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${groupName}-report.pdf"`
  );

  // Pipe PDF to response
  doc.pipe(res);

  // Title
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('Expense Report', { align: 'center' });

  doc.fontSize(16).font('Helvetica').text(groupName, { align: 'center' });

  doc
    .fontSize(10)
    .text(`Generated on ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

  doc.moveDown(2);

  // Summary Section
  doc.fontSize(16).font('Helvetica-Bold').text('Summary');
  doc.moveDown(0.5);

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const currency = expenses.length > 0 ? expenses[0].currency : 'USD';

  doc.fontSize(12).font('Helvetica');
  doc.text(`Total Expenses: ${expenses.length}`);
  doc.text(`Total Amount: ${currency} ${totalExpenses.toFixed(2)}`);
  doc.moveDown(2);

  // Balances Section
  if (balances.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').text('Current Balances');
    doc.moveDown(0.5);

    doc.fontSize(10).font('Helvetica');

    // Table header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold');
    doc.text('Member', 50, tableTop);
    doc.text('Balance', 250, tableTop);
    doc.text('Status', 400, tableTop);

    // Table rows
    doc.font('Helvetica');
    let yPosition = tableTop + 20;

    balances.forEach((balance) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      const status =
        balance.netAmount > 0
          ? 'Owed'
          : balance.netAmount < 0
          ? 'Owes'
          : 'Settled';

      doc.text(balance.userName, 50, yPosition);
      doc.text(
        `${balance.currency} ${Math.abs(balance.netAmount).toFixed(2)}`,
        250,
        yPosition
      );
      doc.text(status, 400, yPosition);

      yPosition += 20;
    });

    doc.moveDown(2);
  }

  // Expenses Section
  if (expenses.length > 0) {
    doc.addPage();
    doc.fontSize(16).font('Helvetica-Bold').text('Expense Details');
    doc.moveDown(1);

    doc.fontSize(10).font('Helvetica');

    expenses.forEach((expense, index) => {
      if (doc.y > 700) {
        doc.addPage();
      }

      doc.font('Helvetica-Bold');
      doc.text(`${index + 1}. ${expense.description}`);

      doc.font('Helvetica');
      doc.text(`   Date: ${new Date(expense.date).toLocaleDateString()}`);
      doc.text(
        `   Amount: ${expense.currency} ${expense.amount.toFixed(2)}`
      );
      doc.text(`   Category: ${expense.category}`);
      doc.text(`   Paid by: ${expense.paidBy.name}`);
      doc.text(`   Split among: ${expense.splits.length} members`);

      doc.moveDown(0.5);
    });
  }

  // Finalize PDF
  doc.end();
};

/**
 * Generate PDF for settlements
 */
export const generateSettlementReportPDF = (
  res: Response,
  groupName: string,
  settlements: SettlementData[]
): void => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${groupName}-settlements.pdf"`
  );

  doc.pipe(res);

  // Title
  doc
    .fontSize(24)
    .font('Helvetica-Bold')
    .text('Settlement Report', { align: 'center' });

  doc.fontSize(16).font('Helvetica').text(groupName, { align: 'center' });

  doc
    .fontSize(10)
    .text(`Generated on ${new Date().toLocaleDateString()}`, {
      align: 'center',
    });

  doc.moveDown(2);

  // Summary
  const completedSettlements = settlements.filter(
    (s) => s.status === 'completed'
  ).length;
  const pendingSettlements = settlements.length - completedSettlements;

  doc.fontSize(14).font('Helvetica-Bold').text('Summary');
  doc.moveDown(0.5);

  doc.fontSize(12).font('Helvetica');
  doc.text(`Total Settlements: ${settlements.length}`);
  doc.text(`Completed: ${completedSettlements}`);
  doc.text(`Pending: ${pendingSettlements}`);
  doc.moveDown(2);

  // Settlements List
  doc.fontSize(14).font('Helvetica-Bold').text('Settlement Details');
  doc.moveDown(1);

  settlements.forEach((settlement, index) => {
    if (doc.y > 700) {
      doc.addPage();
    }

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(
      `${index + 1}. ${settlement.fromUserId.name} → ${settlement.toUserId.name}`
    );

    doc.font('Helvetica');
    doc.text(`   Date: ${new Date(settlement.date).toLocaleDateString()}`);
    doc.text(
      `   Amount: ${settlement.currency} ${settlement.amount.toFixed(2)}`
    );
    doc.text(`   Status: ${settlement.status.toUpperCase()}`);

    doc.moveDown(0.5);
  });

  doc.end();
};

export default {
  exportExpensesToCSV,
  exportSettlementsToCSV,
  exportBalancesToCSV,
  generateExpenseReportPDF,
  generateSettlementReportPDF,
};
