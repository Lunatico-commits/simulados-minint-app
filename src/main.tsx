import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress third-party cross-origin ad script errors from breaking preview UI
if (typeof window !== 'undefined') {
  const originalOnError = window.onerror;
  window.onerror = function (msg, url, lineNo, columnNo, error) {
    if (
      msg === 'Script error.' ||
      !url ||
      (typeof msg === 'string' && msg.includes('Script error')) ||
      (url && url.includes('effectivecpmnetwork'))
    ) {
      return true; // Suppress error propagation
    }
    if (originalOnError) {
      return originalOnError.call(window, msg, url, lineNo, columnNo, error);
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    if (
      event.message === 'Script error.' ||
      (event.message && event.message.includes('Script error')) ||
      (event.filename && event.filename.includes('effectivecpmnetwork'))
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.message === 'Script error.' || String(event.reason).includes('effectivecpmnetwork'))) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
