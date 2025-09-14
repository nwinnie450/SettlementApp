import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../stores/useAuthStore';
import { LoginCredentials } from '../types';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: ''
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

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const success = await login(formData);
      if (success) {
        // If there's an invite code, redirect to join group flow
        if (inviteCode) {
          navigate(`/join-group?invite=${inviteCode}`);
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <h1 className="text-2xl font-light text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600">Sign in to your GroupSettle account</p>

        {inviteCode && (
          <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-sm text-teal-700">
              You've been invited to join a group! Sign in to continue.
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
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={formErrors.email}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />

        <Input
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={formErrors.password}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Sign In
        </Button>
      </form>

      {/* Links */}
      <div className="mt-6 text-center space-y-4">
        <Link
          to="/forgot-password"
          className="block text-sm text-teal-600 hover:text-teal-700"
        >
          Forgot your password?
        </Link>

        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to={inviteCode ? `/register?invite=${inviteCode}` : '/register'}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Sign up
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

export default LoginScreen;