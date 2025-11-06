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
    'font-semibold',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus:outline-none',
    'focus:ring-3',
    'focus:ring-primary/30',
    'focus:ring-offset-2',
    'active:scale-95',
    'transform',
    'relative',
    'overflow-hidden'
  ];

  const variantClasses = {
    primary: [
      'text-white',
      'bg-gradient-to-r',
      'from-teal-500',
      'to-teal-600',
      'hover:from-teal-600',
      'hover:to-teal-700',
      'hover:shadow-lg',
      'hover:shadow-teal-500/50',
      'hover:-translate-y-0.5',
      'shadow-md'
    ],
    secondary: [
      'text-gray-700',
      'bg-white',
      'border-2',
      'border-gray-200',
      'hover:border-teal-500',
      'hover:text-teal-600',
      'hover:shadow-md',
      'hover:-translate-y-0.5'
    ],
    text: [
      'bg-transparent',
      'text-gray-600',
      'hover:text-teal-600',
      'hover:bg-teal-50'
    ],
    danger: [
      'text-white',
      'bg-gradient-to-r',
      'from-red-500',
      'to-red-600',
      'hover:from-red-600',
      'hover:to-red-700',
      'hover:shadow-lg',
      'hover:shadow-red-500/50',
      'hover:-translate-y-0.5',
      'shadow-md'
    ]
  };

  const sizeClasses = {
    small: ['px-3', 'py-2', 'text-sm', 'h-9', 'gap-1.5'],
    medium: ['px-6', 'py-3', 'text-base', 'h-12', 'gap-2'],
    large: ['px-8', 'py-4', 'text-lg', 'h-14', 'gap-2.5']
  };

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    ...sizeClasses[size],
    fullWidth ? 'w-full' : '',
    disabled || loading ? 'cursor-not-allowed opacity-50 hover:shadow-none hover:translate-y-0' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {/* Shimmer effect overlay for primary/danger buttons */}
      {(variant === 'primary' || variant === 'danger') && !disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      )}

      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
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

      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button;
