import React, { useEffect, useState } from 'react';
import { ModalProps } from '../../types';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
      // Start animation after render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to finish before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 200);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizeMap = {
    small: '384px',
    medium: '448px',
    large: '512px'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '80px' // Leave space for bottom navigation
      }}
    >
      {/* Glassmorphism Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'opacity 200ms ease-out',
          opacity: isAnimating ? 1 : 0
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          maxHeight: 'calc(90vh - 80px)',
          overflow: 'hidden',
          width: '100%',
          maxWidth: sizeMap[size],
          margin: '0 16px',
          transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          opacity: isAnimating ? 1 : 0,
        }}
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header Border */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #14b8a6 0%, #06b6d4 50%, #8b5cf6 100%)',
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 3s ease infinite'
        }} />

        {/* Header */}
        {title && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#0f172a',
              margin: 0
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 150ms ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
              aria-label="Close modal"
            >
              <svg
                style={{ width: '20px', height: '20px' }}
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
          padding: '24px',
          overflowY: 'auto',
          maxHeight: title ? 'calc(90vh - 160px)' : 'calc(90vh - 80px)'
        }}>
          {children}
        </div>
      </div>

      {/* Add keyframes for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default Modal;
