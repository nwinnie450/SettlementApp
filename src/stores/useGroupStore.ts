import { create } from 'zustand';
import {
  Group,
  Expense,
  Settlement,
  Balance,
  OptimalPayment,
  SettlementStatus,
  GroupRole,
  GroupInvite,
  InviteStatus,
  JoinGroupRequest,
  GroupJoinResponse,
  GroupInviteLink
} from '../types';
import {
  getGroups,
  saveGroup,
  getGroup,
  deleteGroup as removeGroup,
  getActiveGroupId,
  setActiveGroupId
} from '../utils/storage';
import { calculateOptimalPayments } from '../utils/settlements';

interface GroupState {
  // Data
  groups: Group[];
  currentGroup: Group | null;
  balances: Balance[];
  optimalPayments: OptimalPayment[];

  // UI state
  isCalculatingSettlements: boolean;
  isLoading: boolean;

  // Actions - Groups
  loadGroups: () => void;
  initializeActiveGroup: () => void;
  createGroup: (name: string, baseCurrency: string, createdBy: string, creatorName: string, creatorEmail: string) => Group;
  updateGroup: (groupId: string, updates: Partial<Group>) => boolean;
  deleteGroup: (groupId: string) => boolean;
  setCurrentGroup: (groupId: string | null) => void;

  // Actions - Members
  addMember: (groupId: string, name: string, email: string, role?: GroupRole) => boolean;
  removeMember: (groupId: string, userId: string) => boolean;
  updateMemberName: (groupId: string, userId: string, newName: string) => boolean;

  // Actions - Invitations
  generateInviteLink: (groupId: string, inviterUserId: string) => GroupInviteLink | null;
  joinGroupByInvite: (request: JoinGroupRequest) => Promise<GroupJoinResponse>;
  approveInvite: (groupId: string, inviteId: string) => Promise<boolean>;
  declineInvite: (groupId: string, inviteId: string) => Promise<boolean>;
  getPendingInvites: (groupId: string) => GroupInvite[];

  // Actions - Expenses
  addExpense: (expense: Expense) => Promise<boolean>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<boolean>;

  // Actions - Settlements
  calculateSettlements: (groupId: string) => void;
  markSettlementPaid: (groupId: string, fromUserId: string, toUserId: string, amount: number, currency?: string) => Promise<boolean>;

  // Utilities
  refreshBalances: (groupId: string) => void;
  refreshBalancesByCurrency: (groupId: string) => Record<string, Balance[]>;
  recalculateAll: (groupId: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  // Initial state
  groups: [],
  currentGroup: null,
  balances: [],
  optimalPayments: [],
  isCalculatingSettlements: false,
  isLoading: false,

  // Group management
  loadGroups: () => {
    const groups = getGroups();
    set({ groups });
  },

  initializeActiveGroup: () => {
    const activeGroupId = getActiveGroupId();
    if (activeGroupId) {
      const group = getGroup(activeGroupId);
      if (group) {
        set({ currentGroup: group });
        get().refreshBalances(group.id);
      } else {
        // Active group was deleted, clear the stored ID
        setActiveGroupId(null);
      }
    }
  },

  createGroup: (name: string, baseCurrency: string, createdBy: string, creatorName: string, creatorEmail: string) => {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteCode = `invite_${groupId}_${Date.now()}`;

    const newGroup: Group = {
      id: groupId,
      name,
      baseCurrency,
      members: [{
        userId: createdBy,
        name: creatorName,
        email: creatorEmail,
        joinedAt: new Date().toISOString(),
        isActive: true,
        role: GroupRole.ADMIN
      }],
      expenses: [],
      settlements: [],
      invites: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy,
      inviteCode,
      adminIds: [createdBy]
    };
    
    if (saveGroup(newGroup)) {
      const groups = [...get().groups, newGroup];
      set({ groups });
      return newGroup;
    }
    
    throw new Error('Failed to create group');
  },

  updateGroup: (groupId: string, updates: Partial<Group>) => {
    const group = getGroup(groupId);
    if (!group) return false;
    
    const updatedGroup = {
      ...group,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === groupId ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }
    
    return false;
  },

  deleteGroup: (groupId: string) => {
    if (removeGroup(groupId)) {
      const groups = get().groups.filter(g => g.id !== groupId);
      const isCurrentGroup = get().currentGroup?.id === groupId;
      
      set({ 
        groups,
        currentGroup: isCurrentGroup ? null : get().currentGroup
      });
      
      // Clear active group from localStorage if it was deleted
      if (isCurrentGroup) {
        setActiveGroupId(null);
      }
      
      return true;
    }
    return false;
  },

  setCurrentGroup: (groupId: string | null) => {
    const group = groupId ? getGroup(groupId) : null;
    set({ currentGroup: group });
    
    // Persist the active group to localStorage
    setActiveGroupId(groupId);
    
    if (group) {
      get().refreshBalances(group.id);
    }
  },

  // Expense management
  addExpense: async (expense: Expense) => {
    const { currentGroup } = get();
    if (!currentGroup) return false;
    
    const updatedGroup = {
      ...currentGroup,
      expenses: [...currentGroup.expenses, expense],
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === currentGroup.id ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: updatedGroup
      });
      
      // Refresh balances after adding expense
      get().refreshBalances(currentGroup.id);
      return true;
    }
    
    return false;
  },

  updateExpense: async (expenseId: string, updates: Partial<Expense>) => {
    const { currentGroup } = get();
    if (!currentGroup) return false;
    
    const expenseIndex = currentGroup.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return false;
    
    const updatedExpense = {
      ...currentGroup.expenses[expenseIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    const updatedExpenses = [...currentGroup.expenses];
    updatedExpenses[expenseIndex] = updatedExpense;
    
    const updatedGroup = {
      ...currentGroup,
      expenses: updatedExpenses,
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === currentGroup.id ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: updatedGroup
      });
      
      get().refreshBalances(currentGroup.id);
      return true;
    }
    
    return false;
  },

  deleteExpense: async (expenseId: string) => {
    const { currentGroup } = get();
    if (!currentGroup) return false;
    
    const updatedGroup = {
      ...currentGroup,
      expenses: currentGroup.expenses.filter(e => e.id !== expenseId),
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === currentGroup.id ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: updatedGroup
      });
      
      get().refreshBalances(currentGroup.id);
      return true;
    }
    
    return false;
  },

  // Settlement calculations
  calculateSettlements: (groupId: string) => {
    set({ isCalculatingSettlements: true });
    
    const group = getGroup(groupId);
    if (!group) {
      set({ isCalculatingSettlements: false });
      return;
    }
    
    // Calculate balances first
    get().refreshBalances(groupId);
    const balances = get().balances;
    
    // Calculate optimal payments
    const optimalPayments = calculateOptimalPayments(balances);
    
    set({ 
      optimalPayments,
      isCalculatingSettlements: false 
    });
  },

  markSettlementPaid: async (groupId: string, fromUserId: string, toUserId: string, amount: number, currency?: string) => {
    const group = getGroup(groupId);
    if (!group) return false;
    
    const settlementCurrency = currency || group.baseCurrency;
    
    // Convert to base currency if needed
    let baseCurrencyAmount = amount;
    if (settlementCurrency !== group.baseCurrency) {
      // Use the hardcoded rates from SettlementView for consistency
      const exchangeRates: Record<string, Record<string, number>> = {
        USD: { SGD: 1.35, MYR: 4.65, CNY: 7.25, EUR: 0.92, GBP: 0.79, JPY: 148 },
        SGD: { USD: 0.74, MYR: 3.45, CNY: 5.37, EUR: 0.68, GBP: 0.59, JPY: 109.8 },
        MYR: { USD: 0.215, SGD: 0.29, CNY: 1.56, EUR: 0.20, GBP: 0.17, JPY: 31.8 },
        CNY: { USD: 0.138, SGD: 0.186, MYR: 0.64, EUR: 0.127, GBP: 0.109, JPY: 20.4 },
        EUR: { USD: 1.087, SGD: 1.47, MYR: 5.06, CNY: 7.88, GBP: 0.86, JPY: 161 },
        GBP: { USD: 1.267, SGD: 1.71, MYR: 5.89, CNY: 9.17, EUR: 1.16, JPY: 187 },
        JPY: { USD: 0.0068, SGD: 0.0091, MYR: 0.0315, CNY: 0.049, EUR: 0.0062, GBP: 0.0053 }
      };
      
      const rate = exchangeRates[settlementCurrency]?.[group.baseCurrency] || 1;
      baseCurrencyAmount = Math.round(amount * rate * 100) / 100;
    }
    
    const settlement: Settlement = {
      id: `settlement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      groupId,
      fromUserId,
      toUserId,
      amount,
      currency: settlementCurrency,
      baseCurrencyAmount,
      status: SettlementStatus.COMPLETED,
      date: new Date().toISOString(),
      relatedExpenses: [], // Could be improved to track which expenses this settles
      createdAt: new Date().toISOString()
    };
    
    const updatedGroup = {
      ...group,
      settlements: [...group.settlements, settlement],
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === groupId ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      
      // Refresh balances to reflect the new settlement
      get().refreshBalances(groupId);
      return Promise.resolve(true);
    }
    
    return Promise.resolve(false);
  },

  // Member management
  addMember: (groupId: string, name: string, email: string, role: GroupRole = GroupRole.MEMBER) => {
    const group = getGroup(groupId);
    if (!group) return false;

    const newMember = {
      userId: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      email: email.trim(),
      joinedAt: new Date().toISOString(),
      isActive: true,
      role
    };
    
    const updatedGroup = {
      ...group,
      members: [...group.members, newMember],
      updatedAt: new Date().toISOString()
    };
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === groupId ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }
    
    return false;
  },

  removeMember: (groupId: string, userId: string) => {
    const group = getGroup(groupId);
    if (!group) return false;
    
    // Don't allow removing the group creator
    if (userId === group.createdBy) return false;
    
    // Check if user has expenses - if so, mark as inactive instead of removing
    const hasExpenses = group.expenses.some(expense => 
      expense.paidBy === userId || expense.splits.some(split => split.userId === userId)
    );
    
    let updatedGroup;
    if (hasExpenses) {
      // Mark as inactive instead of removing
      updatedGroup = {
        ...group,
        members: group.members.map(member => 
          member.userId === userId ? { ...member, isActive: false } : member
        ),
        updatedAt: new Date().toISOString()
      };
    } else {
      // Safe to remove completely
      updatedGroup = {
        ...group,
        members: group.members.filter(member => member.userId !== userId),
        updatedAt: new Date().toISOString()
      };
    }
    
    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => 
        g.id === groupId ? updatedGroup : g
      );
      set({ 
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }
    
    return false;
  },

  updateMemberName: (groupId: string, userId: string, newName: string) => {
    const group = getGroup(groupId);
    if (!group) return false;

    const updatedGroup = {
      ...group,
      members: group.members.map(member =>
        member.userId === userId ? { ...member, name: newName.trim() } : member
      ),
      updatedAt: new Date().toISOString()
    };

    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g =>
        g.id === groupId ? updatedGroup : g
      );
      set({
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }

    return false;
  },

  // Invitation management
  generateInviteLink: (groupId: string, inviterUserId: string) => {
    const group = getGroup(groupId);
    if (!group) return null;

    const inviter = group.members.find(m => m.userId === inviterUserId);
    if (!inviter) return null;

    const baseUrl = window.location.origin;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const inviteLink: GroupInviteLink = {
      groupId: group.id,
      groupName: group.name,
      inviteCode: group.inviteCode,
      inviterName: inviter.name,
      expiresAt,
      url: `${baseUrl}/join-group?invite=${group.inviteCode}`
    };

    return inviteLink;
  },

  joinGroupByInvite: async (request: JoinGroupRequest) => {
    set({ isLoading: true });

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const groups = getGroups();
      const group = groups.find(g => g.inviteCode === request.inviteCode);

      if (!group) {
        set({ isLoading: false });
        return {
          success: false,
          requiresApproval: false,
          error: 'Invalid or expired invite link'
        };
      }

      // Check if user is already a member
      if (request.userId && group.members.some(m => m.userId === request.userId)) {
        set({ isLoading: false });
        return {
          success: false,
          requiresApproval: false,
          error: 'You are already a member of this group'
        };
      }

      // Create invite record for admin approval
      const newInvite: GroupInvite = {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        groupId: group.id,
        inviterUserId: group.createdBy,
        inviterName: group.members.find(m => m.userId === group.createdBy)?.name || 'Admin',
        inviteeEmail: request.userEmail,
        inviteeUserId: request.userId,
        status: InviteStatus.PENDING,
        message: request.message,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      const updatedGroup = {
        ...group,
        invites: [...group.invites, newInvite],
        updatedAt: new Date().toISOString()
      };

      if (saveGroup(updatedGroup)) {
        const updatedGroups = groups.map(g => g.id === group.id ? updatedGroup : g);
        set({
          groups: updatedGroups,
          isLoading: false
        });

        return {
          success: true,
          requiresApproval: true,
          inviteId: newInvite.id,
          message: 'Join request sent successfully'
        };
      } else {
        set({ isLoading: false });
        return {
          success: false,
          requiresApproval: false,
          error: 'Failed to send join request'
        };
      }
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        requiresApproval: false,
        error: 'An error occurred while processing your request'
      };
    }
  },

  approveInvite: async (groupId: string, inviteId: string) => {
    const group = getGroup(groupId);
    if (!group) return false;

    const invite = group.invites.find(i => i.id === inviteId);
    if (!invite || invite.status !== InviteStatus.PENDING) return false;

    // Add user as member
    const newMember = {
      userId: invite.inviteeUserId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: invite.inviteeEmail?.split('@')[0] || 'New Member',
      email: invite.inviteeEmail || '',
      joinedAt: new Date().toISOString(),
      isActive: true,
      role: GroupRole.MEMBER
    };

    const updatedGroup = {
      ...group,
      members: [...group.members, newMember],
      invites: group.invites.map(i =>
        i.id === inviteId
          ? { ...i, status: InviteStatus.ACCEPTED, respondedAt: new Date().toISOString() }
          : i
      ),
      updatedAt: new Date().toISOString()
    };

    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => g.id === groupId ? updatedGroup : g);
      set({
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }

    return false;
  },

  declineInvite: async (groupId: string, inviteId: string) => {
    const group = getGroup(groupId);
    if (!group) return false;

    const updatedGroup = {
      ...group,
      invites: group.invites.map(i =>
        i.id === inviteId
          ? { ...i, status: InviteStatus.DECLINED, respondedAt: new Date().toISOString() }
          : i
      ),
      updatedAt: new Date().toISOString()
    };

    if (saveGroup(updatedGroup)) {
      const groups = get().groups.map(g => g.id === groupId ? updatedGroup : g);
      set({
        groups,
        currentGroup: get().currentGroup?.id === groupId ? updatedGroup : get().currentGroup
      });
      return true;
    }

    return false;
  },

  getPendingInvites: (groupId: string) => {
    const group = getGroup(groupId);
    if (!group) return [];

    return group.invites.filter(invite =>
      invite.status === InviteStatus.PENDING &&
      new Date(invite.expiresAt) > new Date()
    );
  },

  // Utility functions
  refreshBalances: (groupId: string) => {
    const group = getGroup(groupId);
    if (!group) return;
    
    // Calculate balances for each member
    const memberBalances = new Map<string, number>();
    
    // Initialize all members with 0 balance
    group.members.forEach(member => {
      memberBalances.set(member.userId, 0);
    });
    
    // Process all expenses
    group.expenses.forEach(expense => {
      // Add amount to the person who paid
      const currentBalance = memberBalances.get(expense.paidBy) || 0;
      memberBalances.set(expense.paidBy, currentBalance + expense.baseCurrencyAmount);
      
      // Subtract each participant's share
      expense.splits.forEach(split => {
        const participantBalance = memberBalances.get(split.userId) || 0;
        memberBalances.set(split.userId, participantBalance - split.amount);
      });
    });
    
    // Process settlements to adjust balances
    group.settlements.forEach(settlement => {
      if (settlement.status !== SettlementStatus.COMPLETED) return;
      
      const fromBalance = memberBalances.get(settlement.fromUserId) || 0;
      const toBalance = memberBalances.get(settlement.toUserId) || 0;
      
      // When fromUserId pays toUserId:
      // - fromUserId's balance increases (they owe less)
      // - toUserId's balance decreases (they are owed less)
      memberBalances.set(settlement.fromUserId, fromBalance + settlement.baseCurrencyAmount);
      memberBalances.set(settlement.toUserId, toBalance - settlement.baseCurrencyAmount);
    });
    
    // Convert to Balance array
    const balances: Balance[] = Array.from(memberBalances.entries()).map(([userId, netAmount]) => {
      const member = group.members.find(m => m.userId === userId);
      return {
        userId,
        userName: member?.name || 'Unknown',
        netAmount,
        currency: group.baseCurrency,
        breakdown: [] // Could be expanded to show detailed breakdown
      };
    });
    
    set({ balances });
  },

  refreshBalancesByCurrency: (groupId: string) => {
    const group = getGroup(groupId);
    if (!group) return {};
    
    // Calculate balances for each member by currency
    const memberBalancesByCurrency = new Map<string, Map<string, number>>();
    
    // Initialize all members with 0 balance for each currency
    const currencies = new Set<string>();
    group.expenses.forEach(expense => currencies.add(expense.currency));
    group.settlements.forEach(settlement => currencies.add(settlement.currency));
    
    group.members.forEach(member => {
      currencies.forEach(currency => {
        if (!memberBalancesByCurrency.has(currency)) {
          memberBalancesByCurrency.set(currency, new Map());
        }
        memberBalancesByCurrency.get(currency)!.set(member.userId, 0);
      });
    });
    
    // Process all expenses by their original currency
    group.expenses.forEach(expense => {
      const currencyMap = memberBalancesByCurrency.get(expense.currency);
      if (!currencyMap) return;
      
      // Add amount to the person who paid
      const currentBalance = currencyMap.get(expense.paidBy) || 0;
      currencyMap.set(expense.paidBy, currentBalance + expense.amount);
      
      // Subtract each participant's share
      expense.splits.forEach(split => {
        const participantBalance = currencyMap.get(split.userId) || 0;
        currencyMap.set(split.userId, participantBalance - split.amount);
      });
    });
    
    // Process settlements by their currency
    group.settlements.forEach(settlement => {
      if (settlement.status !== SettlementStatus.COMPLETED) return;
      
      const currencyMap = memberBalancesByCurrency.get(settlement.currency);
      if (!currencyMap) return;
      
      const fromBalance = currencyMap.get(settlement.fromUserId) || 0;
      const toBalance = currencyMap.get(settlement.toUserId) || 0;
      
      // When fromUserId pays toUserId:
      // - fromUserId's balance increases (they owe less)
      // - toUserId's balance decreases (they are owed less)
      currencyMap.set(settlement.fromUserId, fromBalance + settlement.amount);
      currencyMap.set(settlement.toUserId, toBalance - settlement.amount);
    });
    
    // Convert to Balance arrays grouped by currency
    const balancesByCurrency: Record<string, Balance[]> = {};
    
    memberBalancesByCurrency.forEach((currencyMap, currency) => {
      balancesByCurrency[currency] = Array.from(currencyMap.entries()).map(([userId, netAmount]) => {
        const member = group.members.find(m => m.userId === userId);
        return {
          userId,
          userName: member?.name || 'Unknown',
          netAmount,
          currency,
          breakdown: []
        };
      }).filter(balance => Math.abs(balance.netAmount) > 0.01); // Only include non-zero balances
    });
    
    return balancesByCurrency;
  },

  recalculateAll: (groupId: string) => {
    // Refresh balances and recalculate settlements
    get().refreshBalances(groupId);
    get().calculateSettlements(groupId);
  }
}));