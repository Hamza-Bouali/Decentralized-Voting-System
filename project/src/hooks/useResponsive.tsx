import React, { createContext, useContext, useState, useEffect } from 'react';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

const defaultValue: ResponsiveContextType = {
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
  width: typeof window !== 'undefined' ? window.innerWidth : 0,
  height: typeof window !== 'undefined' ? window.innerHeight : 0,
};

const ResponsiveContext = createContext<ResponsiveContextType>(defaultValue);

interface ResponsiveProviderProps {
  children: React.ReactNode;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
  desktopBreakpoint?: number;
  largeDesktopBreakpoint?: number;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({
  children,
  mobileBreakpoint = 640,
  tabletBreakpoint = 768,
  desktopBreakpoint = 1024,
  largeDesktopBreakpoint = 1280,
}) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const value = {
    isMobile: windowSize.width < tabletBreakpoint,
    isTablet: windowSize.width >= tabletBreakpoint && windowSize.width < desktopBreakpoint,
    isDesktop: windowSize.width >= desktopBreakpoint && windowSize.width < largeDesktopBreakpoint,
    isLargeDesktop: windowSize.width >= largeDesktopBreakpoint,
    width: windowSize.width,
    height: windowSize.height,
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsive = () => useContext(ResponsiveContext);

export default ResponsiveProvider;
