import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

          {/* Action button or spacer */}
          <div className="w-8">
            {/* Future: Add notification bell, user avatar, etc. */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;