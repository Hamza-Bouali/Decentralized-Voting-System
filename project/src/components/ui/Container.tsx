import React from 'react';
import { twMerge } from 'tailwind-merge';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const Container: React.FC<ContainerProps> = ({
  children,
  className,
  fluid = false,
  maxWidth = '2xl'
}) => {
  const maxWidthClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <div 
      className={twMerge(
        fluid ? 'w-full' : 'px-4 sm:px-6 lg:px-8 mx-auto',
        !fluid && maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
