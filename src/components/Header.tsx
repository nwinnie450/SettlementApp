import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import NotificationCenter from './NotificationCenter';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/expenses':
        return 'Expenses';
      case '/add-expense':
        return 'Add Expense';
      case '/settlements':
        return 'Settlements';
      case '/settings':
        return 'Settings';
      default:
        return 'GroupSettle';
    }
  };

  const canGoBack = location.pathname !== '/' && location.pathname !== '/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/onboarding');
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto max-w-md">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Back button or logo */}
          {canGoBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-md hover:bg-surface transition"
            >
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : (
            <div className="w-8" /> // Spacer
          )}

          {/* Page title */}
          <h1 className="text-headline-3 text-primary font-semibold">
            {getPageTitle(location.pathname)}
          </h1>

          {/* Right side - Notifications and User menu */}
          <div className="flex items-center space-x-2">
            {/* Notification Center */}
            <NotificationCenter />

            {/* User menu */}
            <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium hover:bg-primary-dark transition"
            >
              {user?.name.charAt(0).toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium text-primary">{user?.name}</p>
                  <p className="text-xs text-secondary">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="flex w-full px-4 py-2 text-sm text-secondary hover:bg-surface"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="flex w-full px-4 py-2 text-sm text-error hover:bg-surface"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Overlay to close menu */}
          {showUserMenu && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
