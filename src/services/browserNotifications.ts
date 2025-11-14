// Browser push notifications service using Web Notifications API

/**
 * Request permission to show browser notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show a browser notification
 */
export const showBrowserNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: any;
  }
): void => {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  const notification = new Notification(title, {
    icon: options?.icon || '/logo.svg',
    badge: options?.badge || '/logo.svg',
    body: options?.body,
    tag: options?.tag,
    requireInteraction: options?.requireInteraction || false,
    data: options?.data,
    vibrate: [200, 100, 200],
  });

  notification.onclick = () => {
    window.focus();
    notification.close();

    // Navigate to specific page if URL is provided in data
    if (options?.data?.url) {
      window.location.href = options.data.url;
    }
  };

  // Auto-close after 10 seconds unless requireInteraction is true
  if (!options?.requireInteraction) {
    setTimeout(() => notification.close(), 10000);
  }
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

/**
 * Show notification for new expense
 */
export const notifyNewExpense = (
  groupName: string,
  description: string,
  amount: string,
  paidBy: string
): void => {
  showBrowserNotification('New Expense Added', {
    body: `${paidBy} added "${description}" (${amount}) to ${groupName}`,
    tag: 'expense-added',
    data: { url: '/dashboard' }
  });
};

/**
 * Show notification for join request
 */
export const notifyJoinRequest = (
  groupName: string,
  requesterName: string
): void => {
  showBrowserNotification('New Join Request', {
    body: `${requesterName} wants to join ${groupName}`,
    tag: 'join-request',
    requireInteraction: true,
    data: { url: '/groups' }
  });
};

/**
 * Show notification for join approval
 */
export const notifyJoinApproval = (groupName: string): void => {
  showBrowserNotification('Join Request Approved', {
    body: `You've been added to ${groupName}!`,
    tag: 'join-approved',
    data: { url: '/dashboard' }
  });
};

/**
 * Show notification for settlement completed
 */
export const notifySettlement = (
  from: string,
  to: string,
  amount: string
): void => {
  showBrowserNotification('Settlement Completed', {
    body: `${from} paid ${to} ${amount}`,
    tag: 'settlement',
    data: { url: '/settlements' }
  });
};

/**
 * Show notification for member added
 */
export const notifyMemberAdded = (
  groupName: string,
  memberName: string
): void => {
  showBrowserNotification('New Member Added', {
    body: `${memberName} joined ${groupName}`,
    tag: 'member-added',
    data: { url: '/dashboard' }
  });
};

/**
 * Test notification to check if everything works
 */
export const showTestNotification = (): void => {
  showBrowserNotification('SettlementApp Notifications Enabled!', {
    body: 'You will now receive notifications for expenses and settlements',
    tag: 'test-notification'
  });
};
