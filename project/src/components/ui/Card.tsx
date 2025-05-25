import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
  variant?: 'default' | 'glass' | 'outlined';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle,
  className, 
  headerClassName,
  bodyClassName,
  footerClassName,
  footer,
  hoverable = true,
  variant = 'glass',
  children 
}) => {
  const variantClasses = {
    default: 'bg-white shadow-md',
    glass: 'glass-card backdrop-blur-xl border border-white/20',
    outlined: 'bg-white border border-gray-200'
  };

  return (
    <div 
      className={twMerge(
        'rounded-xl animate-fade-in',
        'transition-all duration-300',
        hoverable && 'hover:shadow-2xl hover:translate-y-[-2px]',
        variantClasses[variant],
        className
      )}
    >
      {(title || subtitle) && (
        <div className={twMerge("p-6 border-b border-gray-100", headerClassName)}>
          {title && (
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-500 mt-1 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={twMerge("p-6 animate-slide-up", bodyClassName)}>
        {children}
      </div>
      
      {footer && (
        <div className={twMerge("p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl", footerClassName)}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;