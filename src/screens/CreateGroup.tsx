import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAppStore } from '../stores/useAppStore';
import { useGroupStore } from '../stores/useGroupStore';
import { saveUser } from '../utils/storage';
import { User } from '../types';

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
  const { currentUser, setCurrentUser } = useAppStore();
  const { createGroup, setCurrentGroup } = useGroupStore();
  
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [groupName, setGroupName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('SGD');
  const [showOtherCurrencies, setShowOtherCurrencies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!userName.trim()) {
      newErrors.userName = 'Your name is required';
    }
    
    if (!groupName.trim()) {
      newErrors.groupName = 'Group name is required';
    } else if (groupName.length < 3) {
      newErrors.groupName = 'Group name must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGroup = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      // Create or update user if needed
      let user = currentUser;
      if (!user) {
        user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: userName.trim(),
          defaultCurrency: selectedCurrency,
          createdAt: new Date().toISOString()
        };
        console.log('Creating new user:', user);
        saveUser(user); // Save user to localStorage
        setCurrentUser(user); // This will also set isFirstTime to false
      } else if (user.name !== userName.trim()) {
        user = {
          ...user,
          name: userName.trim()
        };
        console.log('Updating user:', user);
        saveUser(user); // Save updated user to localStorage
        setCurrentUser(user);
      }
      
      // Create the group
      console.log('Creating group with:', { name: groupName.trim(), currency: selectedCurrency, userId: user.id });
      const group = createGroup(groupName.trim(), selectedCurrency, user.id);
      console.log('Group created:', group);
      
      // Set as active group
      setCurrentGroup(group.id);
      
      // Debug: Check current state
      console.log('After setting user and group:', {
        currentUser: user,
        activeGroup: group.id,
        isFirstTime: !user
      });
      
      // Small delay to ensure state updates are processed
      setTimeout(() => {
        console.log('Navigating to dashboard...');
        // Navigate to dashboard - use '/' which will resolve to dashboard for non-first-time users
        navigate('/', { replace: true });
      }, 100);
      
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
            onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
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
              Your name {errors.userName && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: errors.userName ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.target.style.borderColor = errors.userName ? '#ef4444' : '#d1d5db'}
            />
            {errors.userName && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{errors.userName}</p>
            )}
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
                backgroundColor: 'white'
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
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedCurrency !== currency.code) {
                      e.target.style.borderColor = '#e5e7eb';
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
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.color = '#14b8a6';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.color = '#6b7280';
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
                onMouseOver={(e) => e.target.style.color = '#374151'}
                onMouseOut={(e) => e.target.style.color = '#6b7280'}
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
            disabled={isLoading || !userName.trim() || !groupName.trim()}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: (isLoading || !userName.trim() || !groupName.trim()) ? '#d1d5db' : '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: (isLoading || !userName.trim() || !groupName.trim()) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading && userName.trim() && groupName.trim()) {
                e.target.style.backgroundColor = '#0d9488';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && userName.trim() && groupName.trim()) {
                e.target.style.backgroundColor = '#14b8a6';
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