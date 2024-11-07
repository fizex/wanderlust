import { useState, useEffect } from 'react';
import { getItineraries, SavedItinerary } from '../services/firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export function useItineraries() {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItineraries() {
      if (!user) {
        setItineraries([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getItineraries(user.uid);
        setItineraries(data);
      } catch (err) {
        setError('Failed to load itineraries');
        console.error('Failed to load itineraries:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchItineraries();
  }, [user]);

  return { itineraries, loading, error };
}