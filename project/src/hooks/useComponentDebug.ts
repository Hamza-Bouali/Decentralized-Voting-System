import { useEffect, useRef } from 'react';

/**
 * A hook for debugging component props and state changes
 */
export const useComponentDebug = (
  componentName: string, 
  props: any, 
  state?: any, 
  dependencies: any[] = []
) => {
  // Keep track of mount status and render count
  const mountRef = useRef(false);
  const renderCountRef = useRef(0);
  
  // Debug initial mount
  useEffect(() => {
    console.log(`[${componentName}] MOUNTED with props:`, props);
    
    if (state) {
      console.log(`[${componentName}] Initial state:`, state);
    }
    
    mountRef.current = true;
    
    return () => {
      console.log(`[${componentName}] UNMOUNTED`);
      mountRef.current = false;
    };
  }, []);
  
  // Debug dependency changes
  useEffect(() => {
    // Skip first render
    if (renderCountRef.current === 0) {
      renderCountRef.current++;
      return;
    }
    
    console.log(`[${componentName}] Dependencies changed:`, dependencies);
    
    if (state) {
      console.log(`[${componentName}] Current state:`, state);
    }
    
    renderCountRef.current++;
  }, dependencies);
  
  // Return utilities that could be used in the component
  return {
    debug: (message: string, data?: any) => {
      if (data) {
        console.log(`[${componentName}] ${message}:`, data);
      } else {
        console.log(`[${componentName}] ${message}`);
      }
    },
    logError: (message: string, error: any) => {
      console.error(`[${componentName}] ERROR - ${message}:`, error);
    },
    renderCount: renderCountRef.current,
    isMounted: mountRef.current
  };
};
