import React, { useEffect } from 'react';
import { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  className = '' 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 40,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        paddingBottom: '80px' // Leave space for bottom navigation
      }}
    >
      {/* Backdrop */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          transition: 'opacity 0.2s'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxHeight: 'calc(90vh - 80px)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: size === 'small' ? '384px' : size === 'medium' ? '448px' : '512px',
          margin: '0 16px'
        }}
        className={className}
      >
        {/* Header */}
        {title && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '16px', 
            borderBottom: '1px solid var(--color-border)' 
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: 'var(--color-text-primary)', 
              margin: 0 
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '4px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'var(--color-surface)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <svg
                style={{ width: '24px', height: '24px', color: 'var(--color-text-secondary)' }}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Content */}
        <div style={{ 
          overflowY: 'auto', 
          maxHeight: 'calc(90vh - 160px)' // Account for header and bottom nav
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
