// Core data types for GroupSettle app

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  baseCurrency: string;
  members: GroupMember[];
  expenses: Expense[];
  settlements: Settlement[];
  invites: GroupInvite[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  qrCode?: string;
  inviteCode: string;
  adminIds: string[];
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
  isActive: boolean;
  avatar?: string;
  role: GroupRole;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  inviterUserId: string;
  inviterName: string;
  inviteeEmail?: string;
  inviteeUserId?: string;
  status: InviteStatus;
  message?: string;
  createdAt: string;
  respondedAt?: string;
  expiresAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  currency: string;
  baseCurrencyAmount: number; // Converted to group's base currency
  category: string;
  paidBy: string; // userId
  splits: ExpenseSplit[];
  date: string;
  receiptUrl?: string;
  photo?: string; // Base64 encoded photo
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
  percentage: number;
}


export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  baseCurrencyAmount: number;
  method?: PaymentMethod;
  status: SettlementStatus;
  date: string;
  notes?: string;
  relatedExpenses: string[]; // Expense IDs that this settlement covers
  createdAt: string;
}

export interface Balance {
  userId: string;
  userName: string;
  netAmount: number; // Positive = owed money, Negative = owes money
  currency: string;
  breakdown: BalanceBreakdown[];
}

export interface BalanceBreakdown {
  withUserId: string;
  withUserName: string;
  amount: number; // Positive = they owe you, Negative = you owe them
  currency: string;
}

export interface OptimalPayment {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  currency: string;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: string;
  source: string;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag?: string;
}

// Enums
export enum ExpenseCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  ACCOMMODATION = 'accommodation',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  OTHER = 'other'
}

export enum SplitMethod {
  EQUAL = 'equal',
  CUSTOM = 'custom',
  PERCENTAGE = 'percentage'
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other'
}

export enum SettlementStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum GroupRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  SYNCING = 'syncing',
  CONFLICT = 'conflict',
  OFFLINE = 'offline',
  ERROR = 'error'
}

// UI State types
export interface AppState {
  currentUser: User | null;
  activeGroupId: string | null;
  syncStatus: SyncStatus;
  isOffline: boolean;
  lastSyncTime: string | null;
}

export interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  balances: Balance[];
  optimalPayments: OptimalPayment[];
  isCalculatingSettlements: boolean;
}

export interface FormState {
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Local storage structure
export interface LocalStorageData {
  users: User[];
  groups: Group[];
  exchangeRates: ExchangeRate[];
  appSettings: AppSettings;
  syncData: SyncData;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultCurrency: string;
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  expenseAdded: boolean;
  settlementRequests: boolean;
  groupInvites: boolean;
  syncStatus: boolean;
}

export interface PrivacySettings {
  shareUsageData: boolean;
  allowErrorReporting: boolean;
}

export interface SyncData {
  lastSyncTime: string;
  pendingChanges: PendingChange[];
  conflicts: SyncConflict[];
}

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'group' | 'expense' | 'settlement';
  entityId: string;
  data: any;
  timestamp: string;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: string;
  resolved: boolean;
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'number' | 'password' | 'search' | 'date';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  step?: string;
  suffix?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

// Navigation types
export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: number;
}

export interface NavigationState {
  currentTab: string;
  history: string[];
  canGoBack: boolean;
}

// Export/Import types
export interface ExportOptions {
  format: 'csv' | 'pdf' | 'json';
  dateRange?: {
    start: string;
    end: string;
  };
  includeSettled: boolean;
  groupBy?: 'date' | 'category' | 'member';
  currency: string;
}

export interface ExportData {
  group: Group;
  expenses: Expense[];
  settlements: Settlement[];
  balances: Balance[];
  exportedAt: string;
  exportOptions: ExportOptions;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  defaultCurrency: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  defaultCurrency: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
  error?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Group invitation types
export interface GroupInviteLink {
  groupId: string;
  groupName: string;
  inviteCode: string;
  inviterName: string;
  expiresAt: string;
  url: string;
}

export interface JoinGroupRequest {
  inviteCode: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  message?: string;
}

export interface GroupJoinResponse {
  success: boolean;
  requiresApproval: boolean;
  inviteId?: string;
  group?: Group;
  message?: string;
  error?: string;
}

// Auth state types
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  pendingInvites: GroupInvite[];
}

// Group management types
export interface GroupManagementPermissions {
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canEditGroup: boolean;
  canDeleteGroup: boolean;
  canManageInvites: boolean;
  canViewAllExpenses: boolean;
}