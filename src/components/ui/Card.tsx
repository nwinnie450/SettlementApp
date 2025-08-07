import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  interactive = false, 
  onClick 
}) => {
  const baseClasses = [
    'bg-surface',
    'border',
    'border-border',
    'rounded-lg',
    'p-md',
    'shadow-sm',
    'transition'
  ];

  const interactiveClasses = interactive ? [
    'cursor-pointer',
    'hover:bg-gray-50',
    'active:scale-98',
    'hover:shadow-md'
  ] : [];

  const classes = [
    ...baseClasses,
    ...interactiveClasses,
    className
  ].filter(Boolean).join(' ');

  const cardStyle = {
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    boxShadow: 'var(--shadow-sm)'
  };

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      className={classes}
      onClick={interactive ? onClick : undefined}
      type={interactive ? 'button' : undefined}
      style={cardStyle}
    >
      {children}
    </Component>
  );
};

export default Card;