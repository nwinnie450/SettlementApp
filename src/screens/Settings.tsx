import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { clearAllData } from '../utils/storage';
import DarkModeToggle from '../components/DarkModeToggle';
import { useThemeStore } from '../stores/useThemeStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppStore();
  const { currentGroup, setCurrentGroup, loadGroups } = useGroupStore();
  const [notifications, setNotifications] = useState({
    expenseAdded: true,
    settlementRequests: true,
    groupInvites: true
  });
  const [defaultCurrency, setDefaultCurrency] = useState('SGD');
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);

  const currencies = [
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  const handleClearAllData = () => {
    try {
      // Clear all localStorage data
      clearAllData();
      
      // Reset app state
      setCurrentUser(null);
      setCurrentGroup(null);
      
      // Navigate to onboarding
      navigate('/onboarding');
    } catch (error) {
      console.error('Failed to clear data:', error);
    } finally {
      setShowClearDataConfirm(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
            ⚙️ Settings
          </h1>
        </div>
      </div>

      <div style={{ padding: '16px', maxWidth: '448px', margin: '0 auto' }}>
        {/* User Profile */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            👤 Profile
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {currentUser?.name || 'User'}
              </p>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {currentUser?.email || 'No email set'}
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎨 Appearance
          </h3>

          {/* Dark Mode Toggle */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              Theme Mode
            </p>
            <DarkModeToggle />
          </div>

          {/* Theme Color Picker */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              Accent Color
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
              {[
                { color: '#14b8a6', name: 'Teal' },
                { color: '#3b82f6', name: 'Blue' },
                { color: '#8b5cf6', name: 'Purple' },
                { color: '#ec4899', name: 'Pink' },
                { color: '#f59e0b', name: 'Amber' },
                { color: '#10b981', name: 'Green' },
              ].map((theme) => (
                <button
                  key={theme.color}
                  onClick={() => useThemeStore.getState().setAccentColor(theme.color)}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: theme.color,
                    border: useThemeStore.getState().accentColor === theme.color ? '3px solid white' : '2px solid transparent',
                    boxShadow: useThemeStore.getState().accentColor === theme.color
                      ? `0 0 0 2px ${theme.color}, 0 4px 12px ${theme.color}40`
                      : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    transform: useThemeStore.getState().accentColor === theme.color ? 'scale(1.1)' : 'scale(1)',
                  }}
                  onMouseOver={(e) => {
                    if (useThemeStore.getState().accentColor !== theme.color) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = `0 4px 8px ${theme.color}40`;
                    }
                  }}
                  onMouseOut={(e) => {
                    if (useThemeStore.getState().accentColor !== theme.color) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  aria-label={`Select ${theme.name} theme`}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Current Group Info */}
        {currentGroup && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '16px',
            border: '1px solid var(--color-border)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
              🏠 Current Group
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                  {currentGroup.name}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  {currentGroup.members.filter(m => m.isActive).length} active members • {currentGroup.baseCurrency}
                </p>
              </div>
              <div style={{
                padding: '4px 8px',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-primary)',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                Active
              </div>
            </div>
          </div>
        )}

        {/* Preferences */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            🎛️ Preferences
          </h3>
          
          {/* Default Currency */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Default Currency
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
              onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Notifications */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            🔔 Notifications
          </h3>
          
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '2px' }}>
                  {key === 'expenseAdded' ? 'New Expenses' :
                   key === 'settlementRequests' ? 'Settlement Requests' :
                   'Group Invites'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {key === 'expenseAdded' ? 'Get notified when expenses are added' :
                   key === 'settlementRequests' ? 'Get notified about payment requests' :
                   'Get notified about group invitations'}
                </p>
              </div>
              <button
                onClick={() => setNotifications(prev => ({ ...prev, [key]: !value }))}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: value ? 'var(--color-primary)' : 'var(--color-border)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: value ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* App Info */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            ℹ️ About
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>App Version</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>1.0.0</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Build</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>2025.08.07</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Storage Used</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                {currentGroup ? 
                  `${currentGroup.expenses.length} expenses, ${currentGroup.settlements.length} settlements` :
                  'No active group'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid var(--color-border)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            💾 Data Management
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => {
                if (!currentGroup) return;
                
                const exportData = {
                  group: currentGroup,
                  exportedAt: new Date().toISOString(),
                  version: '1.0.0'
                };
                
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                  type: 'application/json' 
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${currentGroup.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_backup_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #14b8a6',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#14b8a6',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f0fdfa';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              📤 Export Group Data
            </button>
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const importedData = JSON.parse(reader.result as string);
                    
                    // Basic validation
                    if (!importedData.group || !importedData.group.name) {
                      alert('Invalid backup file format');
                      return;
                    }
                    
                    // Import the group data
                    const groups = JSON.parse(localStorage.getItem('groups') || '[]');
                    const existingIndex = groups.findIndex(g => g.id === importedData.group.id);
                    
                    if (existingIndex >= 0) {
                      if (confirm('A group with this ID already exists. Do you want to overwrite it?')) {
                        groups[existingIndex] = importedData.group;
                      } else {
                        return;
                      }
                    } else {
                      groups.push(importedData.group);
                    }
                    
                    localStorage.setItem('groups', JSON.stringify(groups));
                    loadGroups(); // Refresh the groups
                    alert('Group data imported successfully!');
                  } catch (error) {
                    alert('Failed to import backup file. Please check the file format.');
                  }
                };
                reader.readAsText(file);
              }}
              style={{ display: 'none' }}
              id="import-file"
            />
            <button
              onClick={() => document.getElementById('import-file')?.click()}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #3b82f6',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#3b82f6',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#eff6ff';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              📥 Import Group Data
            </button>
            <button
              onClick={() => setShowClearDataConfirm(true)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #f97316',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#f97316',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#fff7ed';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              🗑️ Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Clear All Data Confirmation Modal */}
      {showClearDataConfirm && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '16px',
          zIndex: 40 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '400px' 
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginBottom: '16px' }}>
              ⚠️ Clear All Data
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              This will permanently delete all your groups, expenses, settlements, and user data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowClearDataConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#374151',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
