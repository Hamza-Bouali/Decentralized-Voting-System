import React from 'react';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  dot?: boolean;
  bordered?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
  dot = false,
  bordered = false,
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center font-medium',
        rounded ? 'rounded-full' : 'rounded',
        bordered && 'border',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={twMerge(
            'w-2 h-2 rounded-full mr-1.5',
            variant === 'primary' && 'bg-primary-500',
            variant === 'secondary' && 'bg-secondary-500',
            variant === 'success' && 'bg-emerald-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'default' && 'bg-gray-500'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
