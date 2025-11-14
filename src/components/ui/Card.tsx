import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  interactive = false,
  onClick,
  variant = 'default',
  loading = false
}) => {
  const baseClasses = [
    'relative',
    'rounded-xl',
    'p-5',
    'transition-all',
    'duration-300',
    'ease-out',
    'transform'
  ];

  const variantClasses = {
    default: [
      'bg-white',
      'border',
      'border-gray-200',
      'shadow-sm',
      'hover:shadow-md'
    ],
    elevated: [
      'bg-white',
      'shadow-lg',
      'shadow-gray-200/50',
      'hover:shadow-xl',
      'hover:shadow-gray-300/50'
    ],
    outlined: [
      'bg-white',
      'border-2',
      'border-gray-300',
      'hover:border-teal-500'
    ],
    gradient: [
      'bg-gradient-to-br',
      'from-white',
      'to-gray-50',
      'border',
      'border-gray-200',
      'shadow-md',
      'hover:shadow-lg',
      'hover:from-teal-50',
      'hover:to-white'
    ]
  };

  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:-translate-y-1',
    'active:scale-98',
    'focus:outline-none',
    'focus:ring-3',
    'focus:ring-teal-500/30',
    'focus:ring-offset-2'
  ] : [];

  const loadingClasses = loading ? [
    'animate-pulse',
    'pointer-events-none'
  ] : [];

  const classes = [
    ...baseClasses,
    ...variantClasses[variant],
    ...interactiveClasses,
    ...loadingClasses,
    className
  ].filter(Boolean).join(' ');

  const Component = interactive ? 'button' : 'div';

  if (loading) {
    return (
      <div className={classes}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={classes}
      onClick={interactive ? onClick : undefined}
      type={interactive ? 'button' : undefined}
    >
      {/* Gradient border effect for interactive cards */}
      {interactive && variant === 'gradient' && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      )}

      {children}
    </Component>
  );
};

export default Card;
