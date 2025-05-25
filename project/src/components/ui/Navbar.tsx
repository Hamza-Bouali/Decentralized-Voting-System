import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface NavbarProps {
  children?: React.ReactNode;
  className?: string;
  logo?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  variant?: 'light' | 'dark';
}

interface NavbarBrandProps {
  children: React.ReactNode;
  className?: string;
}

interface NavbarContentProps {
  children: React.ReactNode;
  className?: string;
}

interface NavbarItemProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  children,
  className,
  logo,
  sticky = false,
  transparent = false,
  variant = 'light',
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={twMerge(
        'relative z-30 w-full',
        sticky && 'sticky top-0',
        !transparent && 
          (variant === 'light' 
            ? 'bg-white border-b border-gray-200'
            : 'bg-gray-900 border-b border-gray-800'),
        transparent && 'bg-transparent',
        className
      )}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {logo && <div className="flex-shrink-0">{logo}</div>}

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className={twMerge(
                'rounded-md p-2',
                variant === 'light' 
                  ? 'text-gray-500 hover:bg-gray-100 hover:text-gray-600' 
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              )}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center">{children}</div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={twMerge(
          'md:hidden transition-all duration-300 ease-in-out overflow-hidden',
          isMenuOpen ? 'max-h-96' : 'max-h-0',
          variant === 'light' ? 'bg-white' : 'bg-gray-900'
        )}
        id="mobile-menu"
      >
        <div className="space-y-1 px-3 pb-3 pt-2">{children}</div>
      </div>
    </nav>
  );
};

export const NavbarBrand: React.FC<NavbarBrandProps> = ({ children, className }) => {
  return <div className={twMerge('flex-shrink-0 flex items-center mr-6', className)}>{children}</div>;
};

export const NavbarContent: React.FC<NavbarContentProps> = ({ children, className }) => {
  return (
    <div className={twMerge('flex items-center justify-between w-full', className)}>
      {children}
    </div>
  );
};

export const NavbarItem: React.FC<NavbarItemProps> = ({ children, className, isActive }) => {
  return (
    <div
      className={twMerge(
        'px-3 py-2 rounded-md text-sm font-medium',
        isActive 
          ? 'bg-primary-100 text-primary-700' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Navbar;
