import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
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
    <div className="min-h-screen bg-white flex flex-col justify-center px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-8 h-8 mx-auto mb-3 bg-teal-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 2h2v4H7V6zm2 6H7v2h2v-2zm2-6h2v2h-2V6zm2 4h-2v2h2v-2zm2-4h2v2h-2V6zm0 4h2v2h-2v-2z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-2xl font-light text-gray-900 mb-2">Create account</h1>
        <p className="text-gray-600">Join GroupSettle to manage shared expenses</p>

        {inviteCode && (
          <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-700">
              You've been invited to join a group! Create your account to continue.
            </p>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Default Currency
          </label>
          <select
            value={formData.defaultCurrency}
            onChange={handleInputChange('defaultCurrency')}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
              formErrors.defaultCurrency ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          >
            {CURRENCIES.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.symbol} {currency.name} ({currency.code})
              </option>
            ))}
          </select>
          {formErrors.defaultCurrency && (
            <p className="text-sm text-red-600">{formErrors.defaultCurrency}</p>
          )}
        </div>

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

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Create Account
        </Button>
      </form>

      {/* Terms */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link to="/terms" className="text-teal-600 hover:text-teal-700">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-teal-600 hover:text-teal-700">
            Privacy Policy
          </Link>
        </p>
      </div>

      {/* Links */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to={inviteCode ? `/login?invite=${inviteCode}` : '/login'}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Back to home */}
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
};

export default RegisterScreen;