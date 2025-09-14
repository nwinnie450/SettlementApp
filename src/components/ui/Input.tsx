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
    backgroundColor: disabled ? '#f3f4f6' : 'white',
    borderColor: error ? '#ef4444' : '#d1d5db',
    color: '#1f2937'
  });

  return (
    <div className="w-full">
      {label && (
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
          {label}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
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
          onFocus={(e) => {
            e.target.style.borderColor = '#14b8a6';
            e.target.style.boxShadow = '0 0 0 2px rgba(20, 184, 166, 0.2)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
            e.target.style.boxShadow = 'none';
          }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-body-medium">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p style={{ marginTop: '4px', fontSize: '14px', color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
};

export default Input;