
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map(a => String(a)).join(' ');
  if (msg.includes('abort') || msg.includes('AbortError') || msg.includes('cancel') || msg.includes('Missing or insufficient permissions')) {
    return; // ignore
  }
  originalConsoleError(...args);
};

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || String(event.reason);
  if (msg.toLowerCase().includes('abort')) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  const msg = event.message || String(event.error);
  if (msg.toLowerCase().includes('abort')) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
