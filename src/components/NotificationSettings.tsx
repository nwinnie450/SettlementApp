import React, { useState, useEffect } from 'react';
import {
  requestNotificationPermission,
  areNotificationsEnabled,
  getNotificationPermission,
  showTestNotification
} from '../services/browserNotifications';

const NotificationSettings: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const status = getNotificationPermission();
    setPermissionStatus(status);
    setIsEnabled(areNotificationsEnabled());
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      setIsEnabled(true);
      showTestNotification();
    } else {
      setPermissionStatus('denied');
      setIsEnabled(false);
    }
  };

  if (permissionStatus === 'unsupported') {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', margin: '0 0 4px 0' }}>
              Browser Notifications Not Supported
            </h4>
            <p style={{ fontSize: '13px', color: '#78350f', margin: 0 }}>
              Your browser doesn't support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <div style={{
        backgroundColor: '#fee2e2',
        border: '1px solid #fca5a5',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🔕</span>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: '0 0 4px 0' }}>
              Notifications Blocked
            </h4>
            <p style={{ fontSize: '13px', color: '#7f1d1d', margin: 0 }}>
              You've blocked notifications. Enable them in your browser settings to receive updates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isEnabled) {
    return (
      <div style={{
        backgroundColor: '#d1fae5',
        border: '1px solid #6ee7b7',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', flex: 1 }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', margin: '0 0 4px 0' }}>
                Notifications Enabled
              </h4>
              <p style={{ fontSize: '13px', color: '#064e3b', margin: 0 }}>
                You'll receive browser notifications for new expenses, join requests, and settlements.
              </p>
            </div>
          </div>
          <button
            onClick={showTestNotification}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginLeft: '12px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            Test Notification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#e0e7ff',
      border: '1px solid #a5b4fc',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '20px' }}>🔔</span>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#3730a3', margin: '0 0 4px 0' }}>
              Enable Browser Notifications
            </h4>
            <p style={{ fontSize: '13px', color: '#312e81', margin: 0 }}>
              Get notified about new expenses, join requests, and settlements even when you're not using the app.
            </p>
          </div>
        </div>
        <button
          onClick={handleEnableNotifications}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            marginLeft: '12px'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
        >
          Enable
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
