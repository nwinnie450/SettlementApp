import React from 'react';
import { InputProps } from '../../types';

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  step,
  suffix
}) => {
  const inputClasses = [
    'w-full',
    'px-4',
    'py-3',
    'text-body-large',
    'border',
    'rounded-md',
    'transition',
    'focus:outline-none',
    'focus:ring-2',
    className
  ].filter(Boolean).join(' ');

  const getInputStyle = () => ({
    backgroundColor: disabled ? 'var(--color-surface)' : 'var(--color-background)',
    borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
    color: 'var(--color-text-primary)'
  });

  return (
    <div className="w-full">
      {label && (
        <label className="block text-label text-primary mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          step={step}
          className={`${inputClasses} ${suffix ? 'pr-8' : ''}`}
          style={getInputStyle()}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-body-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-caption text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;