import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../stores/useAuthStore';
import { RegisterCredentials } from '../types';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
];

const RegisterScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, isLoading, error, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    defaultCurrency: 'USD'
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get redirect path from state or default to groups
  const from = location.state?.from?.pathname || '/groups';

  // Get invite code if coming from invite link
  const inviteCode = new URLSearchParams(location.search).get('invite');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.defaultCurrency) {
      errors.defaultCurrency = 'Please select a default currency';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const success = await register(formData);
      if (success) {
        // If there's an invite code, redirect to join group flow
        if (inviteCode) {
          navigate(`/join-group?invite=${inviteCode}`);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'white', padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', maxWidth: '448px', margin: '0 auto' }}>
          <button
            onClick={() => navigate('/onboarding')}
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
          <h1 style={{ fontSize: '18px', fontWeight: '500', color: '#1f2937', marginLeft: '8px' }}>Create account</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px', maxWidth: '448px', margin: '0 auto' }}>
        {/* Welcome section */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              backgroundColor: '#14b8a6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h2v4H7V6zm2 6H7v2h2v-2zm2-6h2v2h-2V6zm2 4h-2v2h2v-2zm2-4h2v2h-2V6zm0 4h2v2h-2v-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Join GroupSettle to manage shared expenses</p>
          </div>

          {inviteCode && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#ccfbf1', borderRadius: '6px', border: '1px solid #5eead4' }}>
              <p style={{ color: '#0f766e', fontSize: '14px', margin: 0 }}>
                You've been invited to join a group! Create your account to continue.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <Input
                type="text"
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={formErrors.name}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={formErrors.email}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Default Currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={handleInputChange('defaultCurrency')}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  border: formErrors.defaultCurrency ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#14b8a6'}
                onBlur={(e) => e.target.style.borderColor = formErrors.defaultCurrency ? '#ef4444' : '#d1d5db'}
                required
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
              {formErrors.defaultCurrency && (
                <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px' }}>{formErrors.defaultCurrency}</p>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Input
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={formErrors.password}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <Input
                type="password"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={formErrors.confirmPassword}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Links */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 16px 0' }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#14b8a6', textDecoration: 'none' }}>Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: '#14b8a6', textDecoration: 'none' }}>Privacy Policy</Link>
            </p>

            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Already have an account?{' '}
              <Link
                to={inviteCode ? `/login?invite=${inviteCode}` : '/login'}
                style={{ color: '#14b8a6', textDecoration: 'none', fontWeight: '500' }}
                onMouseOver={(e) => e.target.style.color = '#0d9488'}
                onMouseOut={(e) => e.target.style.color = '#14b8a6'}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;