import { create } from 'zustand';
import { Notification, NotificationType } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

const NOTIFICATIONS_KEY = 'groupsettle_notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  // Actions
  loadNotifications: (userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: (userId: string) => void;
  getUnreadCount: (userId: string) => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  loadNotifications: (userId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    const userNotifications = allNotifications
      .filter(n => n.userId === userId)
      .filter(n => !n.expiresAt || new Date(n.expiresAt) > new Date()) // Filter out expired
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    set({ notifications: userNotifications, unreadCount });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };

    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    allNotifications.push(newNotification);
    setStorageItem(NOTIFICATIONS_KEY, allNotifications);

    // Update state
    get().loadNotifications(notification.userId);
  },

  markAsRead: (notificationId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    const notification = allNotifications.find(n => n.id === notificationId);

    if (notification) {
      notification.isRead = true;
      setStorageItem(NOTIFICATIONS_KEY, allNotifications);

      // Reload for current user
      const userId = notification.userId;
      get().loadNotifications(userId);
    }
  },

  markAllAsRead: (userId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    allNotifications.forEach(n => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
      }
    });
    setStorageItem(NOTIFICATIONS_KEY, allNotifications);
    get().loadNotifications(userId);
  },

  deleteNotification: (notificationId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    const notification = allNotifications.find(n => n.id === notificationId);
    const userId = notification?.userId;

    const filteredNotifications = allNotifications.filter(n => n.id !== notificationId);
    setStorageItem(NOTIFICATIONS_KEY, filteredNotifications);

    if (userId) {
      get().loadNotifications(userId);
    }
  },

  clearAllNotifications: (userId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    const filteredNotifications = allNotifications.filter(n => n.userId !== userId);
    setStorageItem(NOTIFICATIONS_KEY, filteredNotifications);
    set({ notifications: [], unreadCount: 0 });
  },

  getUnreadCount: (userId: string) => {
    const allNotifications = getStorageItem<Notification[]>(NOTIFICATIONS_KEY, []);
    return allNotifications.filter(n => n.userId === userId && !n.isRead).length;
  }
}));

// Helper function to create notifications for common events
export const createJoinRequestNotification = (
  adminUserId: string,
  groupId: string,
  groupName: string,
  requesterName: string
): Omit<Notification, 'id' | 'createdAt'> => ({
  userId: adminUserId,
  type: NotificationType.JOIN_REQUEST,
  title: 'New Join Request',
  message: `${requesterName} requested to join ${groupName}`,
  groupId,
  groupName,
  isRead: false,
  actionUrl: `/groups`
});

export const createJoinApprovedNotification = (
  userId: string,
  groupId: string,
  groupName: string
): Omit<Notification, 'id' | 'createdAt'> => ({
  userId,
  type: NotificationType.JOIN_APPROVED,
  title: 'Join Request Approved',
  message: `Your request to join ${groupName} has been approved!`,
  groupId,
  groupName,
  isRead: false,
  actionUrl: `/group/${groupId}`
});

export const createExpenseAddedNotification = (
  userId: string,
  groupId: string,
  groupName: string,
  expenseDescription: string,
  addedByName: string,
  amount: number,
  currency: string
): Omit<Notification, 'id' | 'createdAt'> => ({
  userId,
  type: NotificationType.EXPENSE_ADDED,
  title: 'New Expense Added',
  message: `${addedByName} added "${expenseDescription}" (${currency} ${amount.toFixed(2)}) in ${groupName}`,
  groupId,
  groupName,
  isRead: false,
  actionUrl: `/expenses`
});

export const createSettlementCompletedNotification = (
  userId: string,
  groupId: string,
  groupName: string,
  payerName: string,
  amount: number,
  currency: string
): Omit<Notification, 'id' | 'createdAt'> => ({
  userId,
  type: NotificationType.SETTLEMENT_COMPLETED,
  title: 'Payment Received',
  message: `${payerName} paid you ${currency} ${amount.toFixed(2)} in ${groupName}`,
  groupId,
  groupName,
  isRead: false,
  actionUrl: `/settlements`
});
