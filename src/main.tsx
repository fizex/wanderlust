import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { FirestoreProvider } from './contexts/FirestoreContext';
import { Toaster } from 'react-hot-toast';
import { initUnsplash } from './services/unsplash';

// Initialize Unsplash with proper error handling
const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
if (!unsplashKey) {
  console.error('VITE_UNSPLASH_ACCESS_KEY is not set in environment variables');
} else {
  try {
    console.log('Initializing Unsplash API...');
    initUnsplash(unsplashKey);
  } catch (error) {
    console.error('Failed to initialize Unsplash:', error);
  }
}

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