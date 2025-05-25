import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  defaultCollapsed?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className,
  sidebarClassName,
  contentClassName,
  defaultCollapsed = false,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Toggle sidebar on mobile
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Toggle sidebar collapse state
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Check window width on resize
  useEffect(() => {
    const checkWindowWidth = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkWindowWidth();
    window.addEventListener('resize', checkWindowWidth);
    return () => window.removeEventListener('resize', checkWindowWidth);
  }, []);

  return (
    <div className={twMerge('flex h-screen overflow-hidden bg-gray-50', className)}>
      {/* Sidebar for desktop */}
      {sidebar && (
        <aside
          className={twMerge(
            'hidden lg:block transition-all duration-300 ease-in-out',
            'bg-white border-r border-gray-200 shadow-sm',
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
            sidebarClassName
          )}
        >
          <div className="h-full flex flex-col">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              {!isSidebarCollapsed && (
                <div className="text-xl font-semibold">VDApp</div>
              )}
              <button
                onClick={toggleSidebarCollapse}
                className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
              >
                {isSidebarCollapsed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              {sidebar}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile sidebar overlay */}
      {sidebar && isMobile && (
        <>
          <div
            className={twMerge(
              'fixed inset-0 bg-gray-900 bg-opacity-50 z-30 transition-opacity duration-300',
              isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <aside
            className={twMerge(
              'fixed top-0 left-0 h-full w-64 z-40 transition-all duration-300 ease-in-out transform',
              'bg-white border-r border-gray-200 shadow-xl',
              isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
              sidebarClassName
            )}
          >
            <div className="h-full flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                <div className="text-xl font-semibold">VDApp</div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:bg-gray-100"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-6">
                {sidebar}
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        {header && (
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              {/* Mobile menu button */}
              {sidebar && isMobile && (
                <button
                  onClick={toggleMobileSidebar}
                  className="p-2 rounded-md text-gray-500 lg:hidden"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </button>
              )}
              {header}
            </div>
          </header>
        )}

        {/* Page Content */}
        <main
          className={twMerge(
            'flex-1 overflow-y-auto',
            contentClassName
          )}
        >
          {children}
        </main>

        {/* Footer */}
        {footer && (
          <footer className="bg-white border-t border-gray-200">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
              {footer}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;
