import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker registration (as discussed)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/ck-forest-gardens-booking-app/service-worker.js', { scope: '/ck-forest-gardens-booking-app/' })
      .then(reg => {
        console.log('SW registered with scope:', reg.scope);
      })
      .catch(err => {
        console.error('SW registration failed:', err);
      });
  });

  // Update awareness (no auto-reload; just a console notice)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('A new Service Worker is now controlling this page.');
  });
}
