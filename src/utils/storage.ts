// Local storage utilities for GroupSettle app

import { 
  Group, 
  User, 
  LocalStorageData, 
  AppSettings, 
  ExchangeRate,
  SyncData 
} from '../types';

const STORAGE_KEYS = {
  USERS: 'groupsettle_users',
  GROUPS: 'groupsettle_groups',
  EXCHANGE_RATES: 'groupsettle_exchange_rates',
  APP_SETTINGS: 'groupsettle_app_settings',
  SYNC_DATA: 'groupsettle_sync_data',
  CURRENT_USER: 'groupsettle_current_user',
  ACTIVE_GROUP: 'groupsettle_active_group'
};

// Generic storage functions
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error writing to localStorage:', error);
    return false;
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// User management
export const getCurrentUser = (): User | null => {
  return getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
};

export const setCurrentUser = (user: User | null): boolean => {
  return setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getUsers = (): User[] => {
  return getStorageItem<User[]>(STORAGE_KEYS.USERS, []);
};

export const saveUser = (user: User): boolean => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  return setStorageItem(STORAGE_KEYS.USERS, users);
};

// Group management
export const getGroups = (): Group[] => {
  return getStorageItem<Group[]>(STORAGE_KEYS.GROUPS, []);
};

export const saveGroup = (group: Group): boolean => {
  const groups = getGroups();
  const existingIndex = groups.findIndex(g => g.id === group.id);
  
  if (existingIndex >= 0) {
    groups[existingIndex] = group;
  } else {
    groups.push(group);
  }
  
  return setStorageItem(STORAGE_KEYS.GROUPS, groups);
};

export const getGroup = (groupId: string): Group | null => {
  const groups = getGroups();
  return groups.find(g => g.id === groupId) || null;
};

export const deleteGroup = (groupId: string): boolean => {
  const groups = getGroups();
  const filteredGroups = groups.filter(g => g.id !== groupId);
  return setStorageItem(STORAGE_KEYS.GROUPS, filteredGroups);
};

export const getActiveGroupId = (): string | null => {
  return getStorageItem<string | null>(STORAGE_KEYS.ACTIVE_GROUP, null);
};

export const setActiveGroupId = (groupId: string | null): boolean => {
  return setStorageItem(STORAGE_KEYS.ACTIVE_GROUP, groupId);
};

// Exchange rate management
export const getExchangeRates = (): ExchangeRate[] => {
  return getStorageItem<ExchangeRate[]>(STORAGE_KEYS.EXCHANGE_RATES, []);
};

export const saveExchangeRates = (rates: ExchangeRate[]): boolean => {
  return setStorageItem(STORAGE_KEYS.EXCHANGE_RATES, rates);
};

export const getExchangeRate = (
  fromCurrency: string, 
  toCurrency: string, 
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): ExchangeRate | null => {
  const rates = getExchangeRates();
  const rate = rates.find(r => 
    r.fromCurrency === fromCurrency && 
    r.toCurrency === toCurrency
  );
  
  if (!rate) return null;
  
  const rateDate = new Date(rate.date);
  const now = new Date();
  const ageDiff = now.getTime() - rateDate.getTime();
  
  if (ageDiff > maxAge) {
    return null; // Rate is too old
  }
  
  return rate;
};

// App settings
const DEFAULT_APP_SETTINGS: AppSettings = {
  theme: 'system',
  defaultCurrency: 'USD',
  language: 'en',
  notifications: {
    expenseAdded: true,
    settlementRequests: true,
    groupInvites: true,
    syncStatus: false
  },
  privacy: {
    shareUsageData: false,
    allowErrorReporting: true
  }
};

export const getAppSettings = (): AppSettings => {
  return getStorageItem<AppSettings>(STORAGE_KEYS.APP_SETTINGS, DEFAULT_APP_SETTINGS);
};

export const saveAppSettings = (settings: AppSettings): boolean => {
  return setStorageItem(STORAGE_KEYS.APP_SETTINGS, settings);
};

export const updateAppSetting = <K extends keyof AppSettings>(
  key: K, 
  value: AppSettings[K]
): boolean => {
  const settings = getAppSettings();
  settings[key] = value;
  return saveAppSettings(settings);
};

// Sync data
const DEFAULT_SYNC_DATA: SyncData = {
  lastSyncTime: '',
  pendingChanges: [],
  conflicts: []
};

export const getSyncData = (): SyncData => {
  return getStorageItem<SyncData>(STORAGE_KEYS.SYNC_DATA, DEFAULT_SYNC_DATA);
};

export const saveSyncData = (syncData: SyncData): boolean => {
  return setStorageItem(STORAGE_KEYS.SYNC_DATA, syncData);
};

// Data export/import
export const exportAllData = (): LocalStorageData => {
  return {
    users: getUsers(),
    groups: getGroups(),
    exchangeRates: getExchangeRates(),
    appSettings: getAppSettings(),
    syncData: getSyncData()
  };
};

export const importAllData = (data: LocalStorageData): boolean => {
  try {
    setStorageItem(STORAGE_KEYS.USERS, data.users);
    setStorageItem(STORAGE_KEYS.GROUPS, data.groups);
    setStorageItem(STORAGE_KEYS.EXCHANGE_RATES, data.exchangeRates);
    setStorageItem(STORAGE_KEYS.APP_SETTINGS, data.appSettings);
    setStorageItem(STORAGE_KEYS.SYNC_DATA, data.syncData);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeStorageItem(key);
  });
};

// Utility to check storage quota
export const getStorageInfo = () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return navigator.storage.estimate();
  }
  return null;
};

// Backup single group to file
export const exportGroupToFile = (groupId: string): string | null => {
  const group = getGroup(groupId);
  if (!group) return null;
  
  const exportData = {
    group,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0'
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Import group from file data
export const importGroupFromFile = (fileData: string): boolean => {
  try {
    const data = JSON.parse(fileData);
    if (data.group && data.group.id) {
      return saveGroup(data.group);
    }
    return false;
  } catch (error) {
    console.error('Error importing group:', error);
    return false;
  }
};