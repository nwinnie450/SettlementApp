import React from 'react';
import { getCategoryConfig } from '../utils/categories';

interface CategoryBadgeProps {
  categoryId: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoryId, size = 'medium', showLabel = true }) => {
  const category = getCategoryConfig(categoryId);

  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    medium: 'text-sm px-2.5 py-1',
    large: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    small: '14px',
    medium: '16px',
    large: '20px'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`}
      style={{
        backgroundColor: category.bgColor,
        color: category.color
      }}
    >
      <span style={{ fontSize: iconSizes[size], marginRight: showLabel ? '4px' : '0' }}>
        {category.icon}
      </span>
      {showLabel && <span>{category.label}</span>}
    </span>
  );
};

export default CategoryBadge;
