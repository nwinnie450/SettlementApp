import { Group, GroupMember, Expense, Balance, Settlement, SettlementStatus } from '../types';
import { getGroup, saveGroup, getGroups } from './storage';

export interface GroupSummary {
  id: string;
  name: string;
  memberCount: number;
  totalExpenses: number;
  totalAmount: number;
  currency: string;
  outstandingBalance: number;
  lastActivity: string;
}

export interface GroupStatistics {
  totalExpenses: number;
  totalAmount: number;
  avgExpenseAmount: number;
  largestExpense: number;
  smallestExpense: number;
  mostActiveUser: {
    userId: string;
    userName: string;
    expenseCount: number;
  };
  categoryBreakdown: Record<string, number>;
  monthlyTotals: Record<string, number>;
}

/**
 * Create a new group with validation
 */
export function createGroup(
  name: string,
  baseCurrency: string,
  creatorUserId: string,
  creatorName: string,
  description?: string
): Group {
  if (!name.trim()) {
    throw new Error('Group name is required');
  }

  if (name.length > 50) {
    throw new Error('Group name must be 50 characters or less');
  }

  if (!baseCurrency || baseCurrency.length !== 3) {
    throw new Error('Valid currency code is required');
  }

  const newGroup: Group = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    description: description?.trim(),
    baseCurrency: baseCurrency.toUpperCase(),
    members: [{
      userId: creatorUserId,
      name: creatorName,
      joinedAt: new Date().toISOString(),
      isActive: true
    }],
    expenses: [],
    settlements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: creatorUserId
  };

  if (!saveGroup(newGroup)) {
    throw new Error('Failed to create group');
  }

  return newGroup;
}

/**
 * Get group summary for listing views
 */
export function getGroupSummary(groupId: string): GroupSummary | null {
  const group = getGroup(groupId);
  if (!group) return null;

  const activeMembers = group.members.filter(m => m.isActive);
  const totalAmount = group.expenses.reduce((sum, expense) => sum + expense.baseCurrencyAmount, 0);

  // Calculate outstanding balance
  const memberBalances = new Map<string, number>();
  group.members.forEach(member => memberBalances.set(member.userId, 0));

  group.expenses.forEach(expense => {
    const currentBalance = memberBalances.get(expense.paidBy) || 0;
    memberBalances.set(expense.paidBy, currentBalance + expense.baseCurrencyAmount);

    expense.splits.forEach(split => {
      const participantBalance = memberBalances.get(split.userId) || 0;
      memberBalances.set(split.userId, participantBalance - split.amount);
    });
  });

  group.settlements.forEach(settlement => {
    if (settlement.status === SettlementStatus.COMPLETED) {
      const fromBalance = memberBalances.get(settlement.fromUserId) || 0;
      const toBalance = memberBalances.get(settlement.toUserId) || 0;
      memberBalances.set(settlement.fromUserId, fromBalance + settlement.baseCurrencyAmount);
      memberBalances.set(settlement.toUserId, toBalance - settlement.baseCurrencyAmount);
    }
  });

  const outstandingBalance = Array.from(memberBalances.values())
    .reduce((sum, balance) => sum + Math.abs(balance), 0) / 2;

  const lastActivity = Math.max(
    new Date(group.updatedAt).getTime(),
    ...group.expenses.map(e => new Date(e.createdAt).getTime()),
    ...group.settlements.map(s => new Date(s.createdAt).getTime())
  );

  return {
    id: group.id,
    name: group.name,
    memberCount: activeMembers.length,
    totalExpenses: group.expenses.length,
    totalAmount,
    currency: group.baseCurrency,
    outstandingBalance,
    lastActivity: new Date(lastActivity).toISOString()
  };
}

/**
 * Get all group summaries sorted by last activity
 */
export function getAllGroupSummaries(): GroupSummary[] {
  const groups = getGroups();
  const summaries = groups
    .map(group => getGroupSummary(group.id))
    .filter((summary): summary is GroupSummary => summary !== null)
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

  return summaries;
}

/**
 * Get detailed group statistics
 */
export function getGroupStatistics(groupId: string): GroupStatistics | null {
  const group = getGroup(groupId);
  if (!group) return null;

  const expenses = group.expenses;
  if (expenses.length === 0) {
    return {
      totalExpenses: 0,
      totalAmount: 0,
      avgExpenseAmount: 0,
      largestExpense: 0,
      smallestExpense: 0,
      mostActiveUser: { userId: '', userName: '', expenseCount: 0 },
      categoryBreakdown: {},
      monthlyTotals: {}
    };
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.baseCurrencyAmount, 0);
  const amounts = expenses.map(e => e.baseCurrencyAmount);

  // User activity tracking
  const userActivity = new Map<string, number>();
  expenses.forEach(expense => {
    const current = userActivity.get(expense.paidBy) || 0;
    userActivity.set(expense.paidBy, current + 1);
  });

  const mostActiveUserId = Array.from(userActivity.entries())
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  const mostActiveUser = group.members.find(m => m.userId === mostActiveUserId);

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  expenses.forEach(expense => {
    categoryBreakdown[expense.category] = (categoryBreakdown[expense.category] || 0) + expense.baseCurrencyAmount;
  });

  // Monthly totals (last 12 months)
  const monthlyTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    const month = new Date(expense.date).toISOString().substr(0, 7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.baseCurrencyAmount;
  });

  return {
    totalExpenses: expenses.length,
    totalAmount,
    avgExpenseAmount: totalAmount / expenses.length,
    largestExpense: Math.max(...amounts),
    smallestExpense: Math.min(...amounts),
    mostActiveUser: {
      userId: mostActiveUserId,
      userName: mostActiveUser?.name || 'Unknown',
      expenseCount: userActivity.get(mostActiveUserId) || 0
    },
    categoryBreakdown,
    monthlyTotals
  };
}

/**
 * Add multiple members to a group with validation
 */
export function addMembersToGroup(groupId: string, memberNames: string[]): boolean {
  const group = getGroup(groupId);
  if (!group) return false;

  const validNames = memberNames
    .map(name => name.trim())
    .filter(name => name.length > 0 && name.length <= 30)
    .filter(name => !group.members.some(member => member.name.toLowerCase() === name.toLowerCase()));

  if (validNames.length === 0) return false;

  const newMembers: GroupMember[] = validNames.map(name => ({
    userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    joinedAt: new Date().toISOString(),
    isActive: true
  }));

  const updatedGroup: Group = {
    ...group,
    members: [...group.members, ...newMembers],
    updatedAt: new Date().toISOString()
  };

  return saveGroup(updatedGroup);
}

/**
 * Archive/deactivate a group (soft delete)
 */
export function archiveGroup(groupId: string): boolean {
  const group = getGroup(groupId);
  if (!group) return false;

  // Mark all members as inactive
  const updatedGroup: Group = {
    ...group,
    members: group.members.map(member => ({
      ...member,
      isActive: false
    })),
    updatedAt: new Date().toISOString()
  };

  return saveGroup(updatedGroup);
}

/**
 * Get groups that need settlement (have outstanding balances)
 */
export function getGroupsNeedingSettlement(): GroupSummary[] {
  return getAllGroupSummaries().filter(summary => summary.outstandingBalance > 0.01);
}

/**
 * Get user's balance across all groups
 */
export function getUserTotalBalance(userId: string): Record<string, number> {
  const groups = getGroups();
  const totalBalances: Record<string, number> = {};

  groups.forEach(group => {
    const memberBalances = new Map<string, number>();
    group.members.forEach(member => memberBalances.set(member.userId, 0));

    // Process expenses
    group.expenses.forEach(expense => {
      const currentBalance = memberBalances.get(expense.paidBy) || 0;
      memberBalances.set(expense.paidBy, currentBalance + expense.baseCurrencyAmount);

      expense.splits.forEach(split => {
        const participantBalance = memberBalances.get(split.userId) || 0;
        memberBalances.set(split.userId, participantBalance - split.amount);
      });
    });

    // Process settlements
    group.settlements.forEach(settlement => {
      if (settlement.status === SettlementStatus.COMPLETED) {
        const fromBalance = memberBalances.get(settlement.fromUserId) || 0;
        const toBalance = memberBalances.get(settlement.toUserId) || 0;
        memberBalances.set(settlement.fromUserId, fromBalance + settlement.baseCurrencyAmount);
        memberBalances.set(settlement.toUserId, toBalance - settlement.baseCurrencyAmount);
      }
    });

    const userBalance = memberBalances.get(userId) || 0;
    if (Math.abs(userBalance) > 0.01) {
      const currency = group.baseCurrency;
      totalBalances[currency] = (totalBalances[currency] || 0) + userBalance;
    }
  });

  return totalBalances;
}

/**
 * Duplicate a group structure (without expenses/settlements)
 */
export function duplicateGroup(groupId: string, newName: string, creatorUserId: string): Group | null {
  const originalGroup = getGroup(groupId);
  if (!originalGroup) return null;

  const newGroup: Group = {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: newName.trim(),
    description: originalGroup.description,
    baseCurrency: originalGroup.baseCurrency,
    members: [{
      userId: creatorUserId,
      name: originalGroup.members.find(m => m.userId === creatorUserId)?.name || 'You',
      joinedAt: new Date().toISOString(),
      isActive: true
    }],
    expenses: [],
    settlements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: creatorUserId
  };

  if (!saveGroup(newGroup)) return null;
  return newGroup;
}

/**
 * Validate group data integrity
 */
export function validateGroupIntegrity(groupId: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const group = getGroup(groupId);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!group) {
    return { isValid: false, errors: ['Group not found'], warnings: [] };
  }

  // Check for orphaned expenses (paidBy user not in members)
  group.expenses.forEach(expense => {
    if (!group.members.some(m => m.userId === expense.paidBy)) {
      errors.push(`Expense ${expense.id} has invalid paidBy user`);
    }

    expense.splits.forEach(split => {
      if (!group.members.some(m => m.userId === split.userId)) {
        errors.push(`Expense ${expense.id} has invalid split user`);
      }
    });

    // Check if splits add up to expense amount
    const totalSplitAmount = expense.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplitAmount - expense.amount) > 0.01) {
      warnings.push(`Expense ${expense.id} split amounts don't match total`);
    }
  });

  // Check settlements
  group.settlements.forEach(settlement => {
    if (!group.members.some(m => m.userId === settlement.fromUserId)) {
      errors.push(`Settlement ${settlement.id} has invalid fromUserId`);
    }
    if (!group.members.some(m => m.userId === settlement.toUserId)) {
      errors.push(`Settlement ${settlement.id} has invalid toUserId`);
    }
  });

  // Check for duplicate member names
  const memberNames = group.members.map(m => m.name.toLowerCase());
  const duplicateNames = memberNames.filter((name, index) => memberNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    warnings.push(`Duplicate member names found: ${duplicateNames.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}