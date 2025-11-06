// Expense category utilities

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const EXPENSE_CATEGORIES: CategoryConfig[] = [
  {
    id: 'food',
    label: 'Food & Dining',
    icon: '🍔',
    color: '#ef4444',
    bgColor: '#fef2f2'
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: '🚗',
    color: '#3b82f6',
    bgColor: '#eff6ff'
  },
  {
    id: 'accommodation',
    label: 'Accommodation',
    icon: '🏠',
    color: '#8b5cf6',
    bgColor: '#f5f3ff'
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: '🎉',
    color: '#ec4899',
    bgColor: '#fdf2f8'
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: '🛍️',
    color: '#f59e0b',
    bgColor: '#fffbeb'
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: '🛒',
    color: '#10b981',
    bgColor: '#f0fdf4'
  },
  {
    id: 'utilities',
    label: 'Utilities & Bills',
    icon: '💡',
    color: '#6366f1',
    bgColor: '#eef2ff'
  },
  {
    id: 'healthcare',
    label: 'Healthcare',
    icon: '⚕️',
    color: '#14b8a6',
    bgColor: '#f0fdfa'
  },
  {
    id: 'other',
    label: 'Other',
    icon: '📝',
    color: '#6b7280',
    bgColor: '#f9fafb'
  }
];

export const getCategoryConfig = (categoryId: string): CategoryConfig => {
  return EXPENSE_CATEGORIES.find(c => c.id === categoryId) || EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
};

export const getCategoryIcon = (categoryId: string): string => {
  return getCategoryConfig(categoryId).icon;
};

export const getCategoryColor = (categoryId: string): string => {
  return getCategoryConfig(categoryId).color;
};

export const getCategoryBgColor = (categoryId: string): string => {
  return getCategoryConfig(categoryId).bgColor;
};

export const getCategoryLabel = (categoryId: string): string => {
  return getCategoryConfig(categoryId).label;
};
