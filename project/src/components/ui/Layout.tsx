import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
}

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

interface HeaderProps {
  children: React.ReactNode;
  className?: string;
  onMenuToggle?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={twMerge("flex flex-col min-h-screen", className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === Header) {
            return React.cloneElement(child as React.ReactElement<HeaderProps>, {
              onMenuToggle: () => setIsSidebarOpen(!isSidebarOpen)
            });
          } else if (child.type === Sidebar) {
            return React.cloneElement(child as React.ReactElement<SidebarProps>, {
              isOpen: isSidebarOpen
            });
          }
        }
        return child;
      })}
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ children, className, onMenuToggle }) => {
  return (
    <header className={twMerge(
      "sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button onClick={onMenuToggle} className="mr-2 sm:mr-4 lg:hidden text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ children, className, isOpen }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className={twMerge(
        "bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-20",
        isOpen ? "w-64" : "w-0 lg:w-64",
        "fixed lg:static h-[calc(100vh-4rem)] top-16",
        "overflow-y-auto",
        className
      )}>
        <div className="px-4 py-6">
          {children}
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      <div 
        className={twMerge(
          "fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => {}}
      />
    </div>
  );
};

export const MainContent: React.FC<MainContentProps> = ({ children, className }) => {
  return (
    <main className={twMerge(
      "flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 transition-all duration-300",
      "ml-0 lg:ml-64",
      className
    )}>
      {children}
    </main>
  );
};

export const PageContainer: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={twMerge("container mx-auto", className)}>
      {children}
    </div>
  );
};

export default Layout;
