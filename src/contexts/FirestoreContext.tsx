import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { SavedItinerary, getUserItineraries } from '../services/firebase/firestore';
import { enableNetwork, disableNetwork, enableIndexedDbPersistence, getFirestore } from 'firebase/firestore';
import { db } from '../services/firebase/config';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface FirestoreContextType {
  itineraries: SavedItinerary[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  refreshItineraries: () => Promise<void>;
  retryConnection: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType>({
  itineraries: [],
  loading: false,
  error: null,
  isOffline: false,
  refreshItineraries: async () => {},
  retryConnection: async () => {}
});

export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState<NodeJS.Timeout | null>(null);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 5000; // 5 seconds

  // Initialize persistence
  useEffect(() => {
    async function initPersistence() {
      try {
        await enableIndexedDbPersistence(db);
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support offline persistence.');
        }
      }
    }
    initPersistence();
  }, []);

  const retryConnection = async () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }

    try {
      setLoading(true);
      await enableNetwork(db);
      setIsOffline(false);
      setRetryCount(0);
      await refreshItineraries();
      
      toast.success(
        (t) => (
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            <span>Connected to network</span>
          </div>
        ),
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error retrying connection:', error);
      
      if (retryCount < MAX_RETRIES) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          retryConnection();
        }, RETRY_DELAY);
        setRetryTimer(timer);
        
        toast.error(
          (t) => (
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Retrying connection... ({retryCount + 1}/{MAX_RETRIES})</span>
            </div>
          ),
          { duration: RETRY_DELAY }
        );
      } else {
        toast.error('Connection failed. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      retryConnection();
    };

    const handleOffline = async () => {
      try {
        await disableNetwork(db);
        setIsOffline(true);
        toast.error(
          (t) => (
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>You're offline. Your changes will sync when connection is restored.</span>
            </div>
          ),
          { duration: 4000 }
        );
      } catch (error) {
        console.error('Error handling offline state:', error);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
    };
  }, [retryCount]);

  const refreshItineraries = useCallback(async () => {
    if (!user) {
      setItineraries([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userItineraries = await getUserItineraries(user.uid);
      setItineraries(userItineraries);
    } catch (err) {
      console.error('Error loading itineraries:', err);
      const message = err instanceof Error ? err.message : 'Failed to load itineraries';
      
      if (!isOffline) {
        setError(message);
        toast.error('Failed to load itineraries. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, isOffline]);

  // Fetch itineraries when user changes
  useEffect(() => {
    refreshItineraries();
  }, [refreshItineraries]);

  const value = React.useMemo(() => ({
    itineraries,
    loading,
    error,
    isOffline,
    refreshItineraries,
    retryConnection
  }), [itineraries, loading, error, isOffline, refreshItineraries]);

  return (
    <FirestoreContext.Provider value={value}>
      {children}
      {isOffline && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-red-500" />
          <span className="text-sm text-gray-600">Offline Mode</span>
          <button
            onClick={retryConnection}
            className="ml-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
}