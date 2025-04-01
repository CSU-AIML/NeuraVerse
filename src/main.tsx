import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AlertProvider } from './components/AlertContext';

// Import the CSS for animations
import '../src/alert-animations.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AlertProvider position="top">
      <App />
    </AlertProvider>
  </StrictMode>
);