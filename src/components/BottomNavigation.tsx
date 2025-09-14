import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: (isActive: boolean) => JSX.Element;
}

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      path: '/',
      icon: (isActive) => (
        <div style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              opacity: '0.15'
            }} />
          )}
          <svg
            style={{ 
              width: '24px', 
              height: '24px', 
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              position: 'relative',
              zIndex: 1
            }}
            fill={isActive ? 'currentColor' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isActive ? '0' : '1.5'}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill={isActive ? 'currentColor' : 'none'} />
            <path d="M9 21V12h6v9" strokeWidth="1.5" />
          </svg>
        </div>
      )
    },
    {
      id: 'groups',
      label: 'Groups',
      path: '/groups',
      icon: (isActive) => (
        <div style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              opacity: '0.15'
            }} />
          )}
          <svg
            style={{ 
              width: '24px', 
              height: '24px', 
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              position: 'relative',
              zIndex: 1
            }}
            fill={isActive ? 'currentColor' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" fill={isActive ? 'currentColor' : 'none'} />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="1.5" />
            {isActive && <circle cx="9" cy="7" r="1.5" fill="white" />}
          </svg>
        </div>
      )
    },
    {
      id: 'expenses',
      label: 'Expenses',
      path: '/expenses',
      icon: (isActive) => (
        <div style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              opacity: '0.15'
            }} />
          )}
          <svg
            style={{ 
              width: '24px', 
              height: '24px', 
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              position: 'relative',
              zIndex: 1
            }}
            fill={isActive ? 'currentColor' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" fill={isActive ? 'currentColor' : 'none'} />
            <path d="M7 8h10M7 12h6" strokeWidth="1.5" />
            {isActive && <circle cx="17" cy="12" r="2" fill="white" />}
          </svg>
        </div>
      )
    },
    {
      id: 'settlements',
      label: 'Settle',
      path: '/settlements',
      icon: (isActive) => (
        <div style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              opacity: '0.15'
            }} />
          )}
          <svg
            style={{ 
              width: '24px', 
              height: '24px', 
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              position: 'relative',
              zIndex: 1
            }}
            fill={isActive ? 'currentColor' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" fill={isActive ? 'currentColor' : 'none'} />
            <path d="M12 3v18M21 12H3" strokeWidth="1.5" />
            {isActive && (
              <>
                <circle cx="8" cy="8" r="1.5" fill="white" />
                <circle cx="16" cy="16" r="1.5" fill="white" />
              </>
            )}
          </svg>
        </div>
      )
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: (isActive) => (
        <div style={{ position: 'relative' }}>
          {isActive && (
            <div style={{
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              opacity: '0.15'
            }} />
          )}
          <svg
            style={{ 
              width: '24px', 
              height: '24px', 
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              position: 'relative',
              zIndex: 1
            }}
            fill={isActive ? 'currentColor' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="3" fill={isActive ? 'currentColor' : 'none'} />
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" strokeWidth="1.5" />
            {isActive && <circle cx="12" cy="12" r="1" fill="white" />}
          </svg>
        </div>
      )
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 50 // Ensure it stays above modal
    }}>
      <div style={{ maxWidth: '448px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          alignItems: 'center', 
          padding: '8px 0 12px 0' 
        }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: '48px',
                  padding: '8px 2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '12px',
                  transform: active ? 'translateY(-1px)' : 'translateY(0)',
                }}
                onMouseOver={(e) => {
                  if (!active) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!active) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = active ? 'translateY(-1px)' : 'translateY(0)';
                }}
              >
                {item.icon(active)}
                <span style={{
                  fontSize: '11px',
                  marginTop: '4px',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
