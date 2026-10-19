import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party browser extensions (e.g. MetaMask, web3 injectors, adblockers)
// whose internal scripts fail to connect and emit unhandled rejections into the web page.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const message =
        typeof reason === 'string'
          ? reason
          : reason?.message || reason?.stack || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('moz-extension://') ||
        message.includes('MetaMask') ||
        message.includes('metamask') ||
        message.includes('Failed to connect to MetaMask')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const message = event.message || '';
      if (
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        message.includes('MetaMask') ||
        message.includes('metamask') ||
        message.includes('Failed to connect to MetaMask')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(<App />);
