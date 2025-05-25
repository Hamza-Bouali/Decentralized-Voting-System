import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className, 
  id, 
  fullWidth = true,
  disabled,
  ...props 
}) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={twMerge(
          'px-4 py-2 bg-white/50 backdrop-blur-sm border',
          'shadow-sm border-gray-200 placeholder-gray-400',
          'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
          'rounded-lg transition-all duration-200',
          disabled ? 'bg-gray-100 cursor-not-allowed' : '',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : '',
          fullWidth ? 'w-full' : '',
          className
        )}
        disabled={disabled}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;