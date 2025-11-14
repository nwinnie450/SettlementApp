import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, setAuthToken, getAuthToken } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();

      if (token) {
        try {
          const response = await api.auth.getProfile();
          setUser(transformBackendUser(response.user));
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Invalid token, clear it
          setAuthToken(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Transform backend user format to frontend format
  const transformBackendUser = (backendUser: any): User => {
    return {
      id: backendUser.id || backendUser._id,
      name: backendUser.name,
      email: backendUser.email,
      avatar: backendUser.avatar,
      defaultCurrency: backendUser.defaultCurrency || 'USD',
      createdAt: backendUser.createdAt || new Date().toISOString(),
      updatedAt: backendUser.updatedAt || new Date().toISOString(),
      isEmailVerified: backendUser.isEmailVerified || false,
    };
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.auth.login(email, password);
      setUser(transformBackendUser(response.user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string) => {
    try {
      const response = await api.auth.register(email, name, password);
      setUser(transformBackendUser(response.user));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const response = await api.auth.updateProfile({
        name: updates.name,
        defaultCurrency: updates.defaultCurrency,
        avatar: updates.avatar,
      });
      setUser(transformBackendUser(response.user));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.auth.getProfile();
      setUser(transformBackendUser(response.user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
