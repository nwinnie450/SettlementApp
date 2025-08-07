// Settlement calculation utilities

import { Balance, OptimalPayment } from '../types';

/**
 * Calculate optimal payments grouped by currency
 * Returns settlements organized by currency to handle multi-currency expenses
 */
export const calculateOptimalPaymentsByCurrency = (balances: Balance[]): Record<string, OptimalPayment[]> => {
  const paymentsByCurrency: Record<string, OptimalPayment[]> = {};
  
  // Group balances by currency
  const balancesByCurrency: Record<string, Balance[]> = {};
  
  balances.forEach(balance => {
    if (!balancesByCurrency[balance.currency]) {
      balancesByCurrency[balance.currency] = [];
    }
    balancesByCurrency[balance.currency].push(balance);
  });
  
  // Calculate optimal payments for each currency
  Object.entries(balancesByCurrency).forEach(([currency, currencyBalances]) => {
    paymentsByCurrency[currency] = calculateOptimalPayments(currencyBalances);
  });
  
  return paymentsByCurrency;
};

/**
 * Calculate optimal payments to minimize total number of transactions
 * Uses a greedy algorithm to match debtors with creditors
 */
export const calculateOptimalPayments = (balances: Balance[]): OptimalPayment[] => {
  const payments: OptimalPayment[] = [];
  
  // Separate creditors (owed money) and debtors (owe money)
  const creditors = balances
    .filter(b => b.netAmount > 0.01) // Small threshold to handle floating point precision
    .map(b => ({ ...b }))
    .sort((a, b) => b.netAmount - a.netAmount); // Sort by amount descending
    
  const debtors = balances
    .filter(b => b.netAmount < -0.01)
    .map(b => ({ ...b, netAmount: Math.abs(b.netAmount) }))
    .sort((a, b) => b.netAmount - a.netAmount); // Sort by amount descending
  
  // Use two pointers to match creditors and debtors
  let creditorIndex = 0;
  let debtorIndex = 0;
  
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    
    // Calculate the settlement amount (minimum of what's owed and what's due)
    const settlementAmount = Math.min(creditor.netAmount, debtor.netAmount);
    
    if (settlementAmount > 0.01) { // Only create payment if amount is significant
      payments.push({
        fromUserId: debtor.userId,
        fromUserName: debtor.userName,
        toUserId: creditor.userId,
        toUserName: creditor.userName,
        amount: Math.round(settlementAmount * 100) / 100, // Round to 2 decimal places
        currency: creditor.currency
      });
    }
    
    // Update remaining balances
    creditor.netAmount -= settlementAmount;
    debtor.netAmount -= settlementAmount;
    
    // Move to next creditor or debtor if current one is settled
    if (creditor.netAmount <= 0.01) {
      creditorIndex++;
    }
    if (debtor.netAmount <= 0.01) {
      debtorIndex++;
    }
  }
  
  return payments;
};

/**
 * Calculate the total number of transactions that would be needed
 * without optimization (everyone pays everyone they owe)
 */
export const calculateUnoptimizedTransactionCount = (balances: Balance[]): number => {
  // This is a simplified calculation - in reality, this would be more complex
  // based on the actual expense participation matrix
  const nonZeroBalances = balances.filter(b => Math.abs(b.netAmount) > 0.01);
  return Math.max(0, nonZeroBalances.length - 1);
};

/**
 * Calculate savings from optimization
 */
export const calculateSettlementSavings = (balances: Balance[]): {
  optimizedCount: number;
  unoptimizedCount: number;
  transactionsSaved: number;
} => {
  const optimalPayments = calculateOptimalPayments(balances);
  const optimizedCount = optimalPayments.length;
  const unoptimizedCount = calculateUnoptimizedTransactionCount(balances);
  const transactionsSaved = Math.max(0, unoptimizedCount - optimizedCount);
  
  return {
    optimizedCount,
    unoptimizedCount,
    transactionsSaved
  };
};

/**
 * Validate that the optimal payments actually settle all balances
 */
export const validateSettlement = (balances: Balance[], payments: OptimalPayment[]): boolean => {
  // Create a copy of balances to simulate payments
  const simulatedBalances = new Map<string, number>();
  
  balances.forEach(balance => {
    simulatedBalances.set(balance.userId, balance.netAmount);
  });
  
  // Apply all payments
  payments.forEach(payment => {
    const fromBalance = simulatedBalances.get(payment.fromUserId) || 0;
    const toBalance = simulatedBalances.get(payment.toUserId) || 0;
    
    simulatedBalances.set(payment.fromUserId, fromBalance + payment.amount);
    simulatedBalances.set(payment.toUserId, toBalance - payment.amount);
  });
  
  // Check if all balances are close to zero (within floating point precision)
  return Array.from(simulatedBalances.values()).every(balance => 
    Math.abs(balance) < 0.01
  );
};

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate what each person's final balance will be after all settlements
 */
export const calculateFinalBalances = (balances: Balance[], payments: OptimalPayment[]): Balance[] => {
  const finalBalances = balances.map(balance => ({ ...balance }));
  
  payments.forEach(payment => {
    const fromIndex = finalBalances.findIndex(b => b.userId === payment.fromUserId);
    const toIndex = finalBalances.findIndex(b => b.userId === payment.toUserId);
    
    if (fromIndex >= 0) {
      finalBalances[fromIndex].netAmount += payment.amount;
    }
    if (toIndex >= 0) {
      finalBalances[toIndex].netAmount -= payment.amount;
    }
  });
  
  return finalBalances;
};

/**
 * Generate a human-readable settlement summary
 */
export const generateSettlementSummary = (payments: OptimalPayment[]): string => {
  if (payments.length === 0) {
    return 'Everyone is settled up! No payments needed.';
  }
  
  const summaryLines = payments.map(payment => 
    `${payment.fromUserName} pays ${payment.toUserName} ${formatCurrency(payment.amount, payment.currency)}`
  );
  
  return summaryLines.join('\n');
};

/**
 * Check if a group is completely settled
 */
export const isGroupSettled = (balances: Balance[]): boolean => {
  return balances.every(balance => Math.abs(balance.netAmount) < 0.01);
};