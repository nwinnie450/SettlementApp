import { create } from 'zustand';
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  GroupInvite,
  PasswordResetRequest,
  PasswordResetData
} from '../types';

interface AuthState {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingInvites: GroupInvite[];

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;

  // Password reset
  requestPasswordReset: (data: PasswordResetRequest) => Promise<boolean>;
  resetPassword: (data: PasswordResetData) => Promise<boolean>;

  // Invites
  loadPendingInvites: () => void;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  declineInvite: (inviteId: string) => Promise<boolean>;

  // Initialization
  initialize: () => void;
  checkAuthStatus: () => boolean;
}

// Simulated API calls - in a real app, these would be actual API requests
const AUTH_STORAGE_KEY = 'groupsettle_auth';
const USERS_STORAGE_KEY = 'groupsettle_users';

interface StoredAuth {
  user: AuthUser;
  token: string;
  expiresAt: string;
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // In real app, passwords would be hashed server-side
  avatar?: string;
  defaultCurrency: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper functions
const hashPassword = (password: string): string => {
  // Simple hash for demo - use proper hashing in production
  return btoa(password + 'salt123');
};

const generateToken = (): string => {
  return Math.random().toString(36).substr(2, 32);
};

const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getStoredUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const getStoredAuth = (): StoredAuth | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;

    const auth = JSON.parse(stored);

    // Check if token is expired
    if (new Date() > new Date(auth.expiresAt)) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return auth;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const saveStoredAuth = (auth: StoredAuth): void => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
};

const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

// Simulated API functions
const apiLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const passwordHash = hashPassword(credentials.password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid password' };
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    defaultCurrency: user.defaultCurrency,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  return {
    success: true,
    user: authUser,
    token,
    message: 'Login successful'
  };
};

const apiRegister = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const users = getStoredUsers();

  // Check if user already exists
  if (users.some(u => u.email.toLowerCase() === credentials.email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const userId = generateUserId();
  const now = new Date().toISOString();

  const newStoredUser: StoredUser = {
    id: userId,
    email: credentials.email.toLowerCase(),
    name: credentials.name.trim(),
    passwordHash: hashPassword(credentials.password),
    defaultCurrency: credentials.defaultCurrency,
    isEmailVerified: false,
    createdAt: now,
    updatedAt: now
  };

  users.push(newStoredUser);
  saveStoredUsers(users);

  const authUser: AuthUser = {
    id: newStoredUser.id,
    email: newStoredUser.email,
    name: newStoredUser.name,
    avatar: newStoredUser.avatar,
    defaultCurrency: newStoredUser.defaultCurrency,
    isEmailVerified: newStoredUser.isEmailVerified,
    createdAt: newStoredUser.createdAt,
    updatedAt: newStoredUser.updatedAt
  };

  const token = generateToken();

  return {
    success: true,
    user: authUser,
    token,
    message: 'Registration successful'
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  pendingInvites: [],

  // Actions
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiLogin(credentials);

      if (response.success && response.user && response.token) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const storedAuth: StoredAuth = {
          user: response.user,
          token: response.token,
          expiresAt
        };

        saveStoredAuth(storedAuth);

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return true;
      } else {
        set({
          error: response.error || 'Login failed',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'An unexpected error occurred',
        isLoading: false
      });
      return false;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiRegister(credentials);

      if (response.success && response.user && response.token) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const storedAuth: StoredAuth = {
          user: response.user,
          token: response.token,
          expiresAt
        };

        saveStoredAuth(storedAuth);

        set({
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        return true;
      } else {
        set({
          error: response.error || 'Registration failed',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      set({
        error: 'An unexpected error occurred',
        isLoading: false
      });
      return false;
    }
  },

  logout: () => {
    clearStoredAuth();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      pendingInvites: []
    });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUser: (updates: Partial<AuthUser>) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };

    // Update stored auth
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      storedAuth.user = updatedUser;
      saveStoredAuth(storedAuth);
    }

    // Update stored users
    const users = getStoredUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = {
        ...users[userIndex],
        name: updatedUser.name,
        defaultCurrency: updatedUser.defaultCurrency,
        avatar: updatedUser.avatar,
        updatedAt: updatedUser.updatedAt
      };
      saveStoredUsers(users);
    }

    set({ user: updatedUser });
  },

  requestPasswordReset: async (data: PasswordResetRequest) => {
    // Simulate password reset request
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());

    if (!user) {
      // In production, you'd still return success to prevent email enumeration
      return true;
    }

    // In a real app, you'd send an email with a reset token
    console.log(`Password reset requested for ${data.email}`);
    return true;
  },

  resetPassword: async (data: PasswordResetData) => {
    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you'd validate the token and update the password
    console.log('Password reset completed');
    return true;
  },

  loadPendingInvites: () => {
    // In a real app, you'd fetch pending invites from the API
    // For now, we'll load from localStorage
    const user = get().user;
    if (!user) return;

    // This would be implemented based on your group invitation system
    set({ pendingInvites: [] });
  },

  acceptInvite: async (inviteId: string) => {
    // Simulate accepting an invite
    await new Promise(resolve => setTimeout(resolve, 500));

    const { pendingInvites } = get();
    set({
      pendingInvites: pendingInvites.filter(invite => invite.id !== inviteId)
    });

    return true;
  },

  declineInvite: async (inviteId: string) => {
    // Simulate declining an invite
    await new Promise(resolve => setTimeout(resolve, 500));

    const { pendingInvites } = get();
    set({
      pendingInvites: pendingInvites.filter(invite => invite.id !== inviteId)
    });

    return true;
  },

  initialize: () => {
    const storedAuth = getStoredAuth();

    if (storedAuth) {
      set({
        user: storedAuth.user,
        isAuthenticated: true
      });
    }
  },

  checkAuthStatus: () => {
    const storedAuth = getStoredAuth();
    return !!storedAuth;
  }
}));