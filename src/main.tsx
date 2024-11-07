import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { FirestoreProvider } from './contexts/FirestoreContext';
import { Toaster } from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <FirestoreProvider>
        <App />
        <Toaster position="top-right" />
      </FirestoreProvider>
    </AuthProvider>
  </React.StrictMode>
);