import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { SavedItinerary, getUserItineraries } from '../services/firebase/firestore';

interface FirestoreContextType {
  itineraries: SavedItinerary[];
  loading: boolean;
  error: string | null;
  refreshItineraries: () => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType>({
  itineraries: [],
  loading: false,
  error: null,
  refreshItineraries: async () => {}
});

export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

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
      console.log('Fetching itineraries for user:', user.uid);
      const userItineraries = await getUserItineraries(user.uid);
      console.log('Fetched itineraries:', userItineraries);
      setItineraries(userItineraries);
    } catch (err) {
      console.error('Error loading itineraries:', err);
      const message = err instanceof Error ? err.message : 'Failed to load itineraries';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch itineraries when user changes
  React.useEffect(() => {
    refreshItineraries();
  }, [refreshItineraries]);

  const value = React.useMemo(() => ({
    itineraries,
    loading,
    error,
    refreshItineraries
  }), [itineraries, loading, error, refreshItineraries]);

  return (
    <FirestoreContext.Provider value={value}>
      {children}
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