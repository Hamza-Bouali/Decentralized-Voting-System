import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, className, children }) => {
  return (
    <div 
      className={twMerge(
        'glass-card rounded-xl p-6 mb-6 animate-fade-in',
        'transition-all duration-300 hover:shadow-2xl',
        'border border-white/20 backdrop-blur-xl',
        className
      )}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
          {title}
        </h2>
      )}
      <div className="animate-slide-up">{children}</div>
    </div>
  );
};

export default Card;