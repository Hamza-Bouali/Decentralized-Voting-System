import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ResponsiveProvider } from './hooks/useResponsive';
import { ThemeProvider } from './hooks/useTheme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ResponsiveProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ResponsiveProvider>
  </StrictMode>
);
