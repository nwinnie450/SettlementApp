import React from 'react';
import { useThemeStore } from '../stores/useThemeStore';

const DarkModeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative inline-flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-3 focus:ring-teal-500/30"
      style={{
        backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
        border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      }}
      aria-label="Toggle dark mode"
    >
      {/* Sun Icon */}
      <div
        style={{
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDarkMode ? 'rotate(180deg) scale(0)' : 'rotate(0deg) scale(1)',
          opacity: isDarkMode ? 0 : 1,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </div>

      {/* Moon Icon */}
      <div
        style={{
          position: 'absolute',
          left: '16px',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isDarkMode ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)',
          opacity: isDarkMode ? 1 : 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Toggle Switch */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: '48px',
          height: '24px',
          borderRadius: '12px',
          backgroundColor: isDarkMode ? '#3b82f6' : '#14b8a6',
          transition: 'background-color 300ms ease',
          boxShadow: isDarkMode
            ? '0 0 10px rgba(59, 130, 246, 0.5)'
            : '0 0 10px rgba(20, 184, 166, 0.5)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: isDarkMode ? '26px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: 'white',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: '500',
          color: isDarkMode ? '#e5e7eb' : '#374151',
          transition: 'color 300ms ease',
        }}
      >
        {isDarkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
