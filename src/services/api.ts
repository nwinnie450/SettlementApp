// API Client for SettlementApp Backend
import type { User, Group, Expense, Settlement, Balance } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

// API Response types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    defaultCurrency: string;
  };
  token: string;
  message: string;
}

interface GroupResponse {
  group: {
    _id: string;
    name: string;
    baseCurrency: string;
    members: Array<{
      userId: string;
      name: string;
      email: string;
      role: string;
      joinedAt: string;
      isActive: boolean;
    }>;
    inviteCode: string;
    createdBy: string;
    adminIds: string[];
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface ExpenseResponse {
  expense: {
    _id: string;
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    baseCurrencyAmount: number;
    category: string;
    date: string;
    paidBy: {
      _id: string;
      name: string;
      email: string;
    };
    splits: Array<{
      userId: string;
      amount: number;
      percentage: number;
    }>;
    photoUrl?: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface BalanceResponse {
  balances: Array<{
    userId: string;
    userName: string;
    netAmount: number;
    currency: string;
  }>;
}

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base fetch wrapper with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || data.message || 'Request failed',
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(0, 'Network error - please check your connection');
    }

    throw new ApiError(500, 'An unexpected error occurred');
  }
}

// ============================================================================
// Authentication API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   */
  async register(
    email: string,
    name: string,
    password: string
  ): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });

    // Auto-save token
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Auto-save token
    if (response.token) {
      setAuthToken(response.token);
    }

    return response;
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ user: User }> {
    return apiFetch('/api/auth/me');
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    name?: string;
    defaultCurrency?: string;
    avatar?: string;
  }): Promise<{ user: User; message: string }> {
    return apiFetch('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Logout (client-side only)
   */
  logout() {
    setAuthToken(null);
  },
};

// ============================================================================
// Groups API
// ============================================================================

export const groupsApi = {
  /**
   * Get all user's groups
   */
  async getAll(): Promise<{ groups: any[] }> {
    return apiFetch('/api/groups');
  },

  /**
   * Get a specific group
   */
  async getById(groupId: string): Promise<{ group: any }> {
    return apiFetch(`/api/groups/${groupId}`);
  },

  /**
   * Create a new group
   */
  async create(name: string, baseCurrency: string): Promise<GroupResponse> {
    return apiFetch('/api/groups', {
      method: 'POST',
      body: JSON.stringify({ name, baseCurrency }),
    });
  },

  /**
   * Update a group
   */
  async update(
    groupId: string,
    updates: { name?: string; baseCurrency?: string }
  ): Promise<{ group: any; message: string }> {
    return apiFetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a group
   */
  async delete(groupId: string): Promise<{ message: string }> {
    return apiFetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Join a group via invite code
   */
  async join(inviteCode: string): Promise<{ group: any; message: string }> {
    return apiFetch('/api/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  },

  /**
   * Add member to group
   */
  async addMember(
    groupId: string,
    userId: string,
    name: string
  ): Promise<{ group: any; message: string }> {
    return apiFetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId, name }),
    });
  },

  /**
   * Remove member from group
   */
  async removeMember(
    groupId: string,
    userId: string
  ): Promise<{ message: string }> {
    return apiFetch(`/api/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Expenses API
// ============================================================================

export const expensesApi = {
  /**
   * Get all expenses for a group
   */
  async getByGroup(groupId: string): Promise<{ expenses: any[] }> {
    return apiFetch(`/api/expenses/group/${groupId}`);
  },

  /**
   * Get a specific expense
   */
  async getById(expenseId: string): Promise<{ expense: any }> {
    return apiFetch(`/api/expenses/${expenseId}`);
  },

  /**
   * Create a new expense
   */
  async create(expense: {
    groupId: string;
    description: string;
    amount: number;
    currency: string;
    baseCurrencyAmount: number;
    category: string;
    date: string;
    paidBy: string;
    splits: Array<{
      userId: string;
      amount: number;
      percentage: number;
    }>;
    photoUrl?: string;
  }): Promise<ExpenseResponse> {
    return apiFetch('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  /**
   * Update an expense
   */
  async update(
    expenseId: string,
    updates: Partial<{
      description: string;
      amount: number;
      currency: string;
      category: string;
      date: string;
      splits: Array<{
        userId: string;
        amount: number;
        percentage: number;
      }>;
    }>
  ): Promise<{ expense: any; message: string }> {
    return apiFetch(`/api/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete an expense
   */
  async delete(expenseId: string): Promise<{ message: string }> {
    return apiFetch(`/api/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Settlements API
// ============================================================================

export const settlementsApi = {
  /**
   * Calculate balances for a group
   */
  async getBalances(groupId: string): Promise<BalanceResponse> {
    return apiFetch(`/api/settlements/group/${groupId}/balances`);
  },

  /**
   * Get all settlements for a group
   */
  async getByGroup(groupId: string): Promise<{ settlements: any[] }> {
    return apiFetch(`/api/settlements/group/${groupId}`);
  },

  /**
   * Create a settlement record
   */
  async create(settlement: {
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    currency: string;
  }): Promise<{ settlement: any; message: string }> {
    return apiFetch('/api/settlements', {
      method: 'POST',
      body: JSON.stringify(settlement),
    });
  },

  /**
   * Mark settlement as paid
   */
  async markAsPaid(
    settlementId: string
  ): Promise<{ settlement: any; message: string }> {
    return apiFetch(`/api/settlements/${settlementId}/mark-paid`, {
      method: 'PUT',
    });
  },

  /**
   * Delete a settlement
   */
  async delete(settlementId: string): Promise<{ message: string }> {
    return apiFetch(`/api/settlements/${settlementId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// Health Check
// ============================================================================

export const healthApi = {
  async check(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    return apiFetch('/health');
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  groups: groupsApi,
  expenses: expensesApi,
  settlements: settlementsApi,
  health: healthApi,
};

export default api;
