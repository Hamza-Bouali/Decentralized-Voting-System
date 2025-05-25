import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from './Navbar';
import Container from './Container';

interface AppLayoutProps {
  children: React.ReactNode;
  navItems?: React.ReactNode;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  navItems,
  logo = <div className="font-bold text-xl">VDApp</div>,
  footer,
  className
}) => {
  return (
    <div className={twMerge('flex flex-col min-h-screen', className)}>
      {/* Navigation */}
      <Navbar sticky className="bg-white/80 backdrop-blur-md shadow-sm">
        <Container>
          <div className="flex items-center justify-between w-full">
            <NavbarBrand>{logo}</NavbarBrand>
            <NavbarContent>{navItems}</NavbarContent>
          </div>
        </Container>
      </Navbar>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      {footer && (
        <footer className="bg-gray-50 border-t border-gray-200 py-6">
          <Container>
            {footer}
          </Container>
        </footer>
      )}
    </div>
  );
};

export default AppLayout;
