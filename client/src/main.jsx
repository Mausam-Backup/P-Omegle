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
