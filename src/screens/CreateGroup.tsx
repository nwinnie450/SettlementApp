import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuthStore } from '../stores/useAuthStore';
import { useGroupStore } from '../stores/useGroupStore';

const DEFAULT_CURRENCIES = [
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
];

const OTHER_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
];

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createGroup, setCurrentGroup } = useGroupStore();

  const [groupName, setGroupName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.defaultCurrency || 'USD');
  const [showOtherCurrencies, setShowOtherCurrencies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Create the group with authenticated user info
      console.log('Creating group with:', { name: groupName.trim(), currency: selectedCurrency, userId: user.id });
      const group = createGroup(groupName.trim(), selectedCurrency, user.id, user.name, user.email);
      console.log('Group created:', group);

      // Set as active group and navigate
      setCurrentGroup(group.id);

      // Debug: Check current state
      console.log('After setting user and group:', {
        currentUser: user,
        activeGroup: group.id,
        groupsList: useGroupStore.getState().groups.length
      });

      // Delay to ensure Zustand state updates propagate to all components
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        // Navigate to dashboard - use '/' which will resolve to dashboard
        navigate('/dashboard', { replace: true });
      }, 300); // Increased from 100ms to 300ms

    } catch (error) {
      console.error('Error creating group:', error);
      setErrors({ general: `Failed to create group: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const allCurrencies = showOtherCurrencies ? [...DEFAULT_CURRENCIES, ...OTHER_CURRENCIES] : DEFAULT_CURRENCIES;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px',
              marginLeft: '-8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginLeft: '8px' }}>Start a new group</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
        {/* User Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Creating as
            </label>
            <div style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#f9fafb',
              color: '#6b7280'
            }}>
              {user?.name} ({user?.email})
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Group name {errors.groupName && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="text"
              placeholder="e.g., Trip to Paris"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: errors.groupName ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937'
              }}
              onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.target.style.borderColor = errors.groupName ? '#ef4444' : '#d1d5db'}
            />
            {errors.groupName && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.groupName}</p>
            )}
          </div>
          
          {/* Currency Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px' }}>
              Currency
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {allCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => setSelectedCurrency(currency.code)}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: selectedCurrency === currency.code ? '2px solid #14b8a6' : '1px solid #e5e7eb',
                    backgroundColor: selectedCurrency === currency.code ? '#f0fdfa' : 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (selectedCurrency !== currency.code) {
                      (e.target as HTMLElement).style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCurrency !== currency.code) {
                      (e.target as HTMLElement).style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {currency.symbol} {currency.code}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {currency.name.length > 15 ? currency.name.substring(0, 12) + '...' : currency.name}
                  </div>
                </button>
              ))}
            </div>
            
            {!showOtherCurrencies && (
              <button
                type="button"
                onClick={() => setShowOtherCurrencies(true)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                  color: '#6b7280',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#14b8a6';
                  (e.target as HTMLElement).style.color = '#14b8a6';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.borderColor = '#d1d5db';
                  (e.target as HTMLElement).style.color = '#6b7280';
                }}
              >
                + Add other currencies
              </button>
            )}
            
            {showOtherCurrencies && (
              <button
                type="button"
                onClick={() => setShowOtherCurrencies(false)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.target as HTMLElement).style.color = '#374151'}
                onMouseOut={(e) => (e.target as HTMLElement).style.color = '#6b7280'}
              >
                Show less currencies
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px' }}>
            <p style={{ color: '#dc2626', fontSize: '14px' }}>{errors.general}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', padding: '16px' }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          <button
            onClick={handleCreateGroup}
            disabled={isLoading || !groupName.trim()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: (isLoading || !groupName.trim()) ? '#d1d5db' : '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: (isLoading || !groupName.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading && groupName.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#0d9488';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && groupName.trim()) {
                (e.target as HTMLElement).style.backgroundColor = '#14b8a6';
              }
            }}
          >
            {isLoading ? 'Creating...' : 'Create group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;