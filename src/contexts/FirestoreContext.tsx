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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshItineraries = useCallback(async () => {
    if (!user) {
      setItineraries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userItineraries = await getUserItineraries(user.uid);
      setItineraries(userItineraries);
    } catch (err) {
      setError('Failed to load itineraries');
      console.error('Error loading itineraries:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    refreshItineraries();
  }, [refreshItineraries]);

  return (
    <FirestoreContext.Provider value={{ itineraries, loading, error, refreshItineraries }}>
      {children}
    </FirestoreContext.Provider>
  );
}

export function useFirestore() {
  return useContext(FirestoreContext);
}