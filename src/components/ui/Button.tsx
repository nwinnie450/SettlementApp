import React from 'react';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = ''
}) => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-medium',
    'rounded-md',
    'transition',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-primary',
    'active:scale-95'
  ];

  const variantClasses = {
    primary: [
      'text-white',
      'hover:opacity-90'
    ],
    secondary: [
      'text-secondary',
      'border',
      'hover:opacity-80'
    ],
    text: [
      'bg-transparent',
      'text-secondary',
      'hover:opacity-80'
    ],
    danger: [
      'text-white',
      'hover:opacity-90'
    ]
  };

  const sizeClasses = {
    small: ['px-3', 'py-1.5', 'text-sm', 'h-8'],
    medium: ['px-6', 'py-3', 'text-base', 'h-12'],
    large: ['px-8', 'py-4', 'text-lg', 'h-14']
  };

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor: variant === 'primary' ? 'var(--color-primary)' : 
                     variant === 'secondary' ? 'var(--color-surface)' :
                     variant === 'danger' ? 'var(--color-error)' : 'transparent',
      borderColor: variant === 'secondary' ? 'var(--color-border)' : 'transparent'
    };
    return baseStyle;
  };

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={classes}
      style={getButtonStyle()}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;