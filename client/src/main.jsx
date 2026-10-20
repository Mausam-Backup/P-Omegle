import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </AuthProvider>
  </ErrorBoundary>
);

// Auto-reload if a Vite chunk failed to load due to a new deployment on the server
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Dynamic import preload error, reloading to fetch latest build:', event);
  window.location.reload();
});

// Register Service Worker for PWA Installation & Fullscreen Experience
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates on every load
        registration.update().catch(() => {});

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, activate immediately
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration note:', err);
      });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}


