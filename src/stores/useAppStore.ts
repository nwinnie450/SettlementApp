import { create } from 'zustand';
import { 
  User, 
  Group, 
  AppSettings, 
  SyncStatus, 
  Balance, 
  OptimalPayment 
} from '../types';
import {
  getCurrentUser,
  setCurrentUser,
  getAppSettings,
  saveAppSettings
} from '../utils/storage';

interface AppState {
  // User state
  currentUser: User | null;
  isFirstTime: boolean;
  
  // Note: Group state moved to useGroupStore for consistency
  
  // App state
  appSettings: AppSettings;
  syncStatus: SyncStatus;
  isOffline: boolean;
  lastSyncTime: string | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setOfflineStatus: (offline: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initialize: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  isFirstTime: true,
  appSettings: getAppSettings(),
  syncStatus: SyncStatus.OFFLINE,
  isOffline: true,
  lastSyncTime: null,
  isLoading: false,
  error: null,

  // Actions
  setCurrentUser: (user: User | null) => {
    setCurrentUser(user);
    set({ currentUser: user, isFirstTime: !user });
  },

  updateUser: (updates: Partial<User>) => {
    const { currentUser } = get();
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    set({ currentUser: updatedUser });
  },

  // Note: Group management moved to useGroupStore

  updateAppSettings: (newSettings: Partial<AppSettings>) => {
    const currentSettings = get().appSettings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    saveAppSettings(updatedSettings);
    set({ appSettings: updatedSettings });
  },

  setSyncStatus: (status: SyncStatus) => {
    set({ syncStatus: status });
  },

  setOfflineStatus: (offline: boolean) => {
    set({ 
      isOffline: offline,
      syncStatus: offline ? SyncStatus.OFFLINE : SyncStatus.SYNCED
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  initialize: () => {
    const currentUser = getCurrentUser();
    
    set({
      currentUser,
      isFirstTime: !currentUser,
      appSettings: getAppSettings()
    });
  }
}));