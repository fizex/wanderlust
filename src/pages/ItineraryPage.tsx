import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getItinerary, updateItinerary } from '../services/firebase/firestore';
import { SavedItinerary } from '../services/firebase/firestore';
import ItineraryHero from '../components/ItineraryHero';
import ItineraryEditor from '../components/ItineraryEditor';
import BookingWidget from '../components/BookingWidget';
import { Loader2 } from 'lucide-react';
import { debounce } from 'lodash';
import toast from 'react-hot-toast';

export default function ItineraryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItinerary() {
      if (!id || !user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getItinerary(id);
        
        if (!data) {
          throw new Error('Itinerary not found');
        }

        if (data.userId !== user.uid) {
          throw new Error('Unauthorized');
        }

        setItinerary(data);
      } catch (err) {
        console.error('Failed to load itinerary:', err);
        setError('Failed to load itinerary');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [id, user, navigate]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (itineraryId: string, updatedItinerary: SavedItinerary) => {
      try {
        setSaving(true);
        await updateItinerary(itineraryId, {
          days: updatedItinerary.days,
          updatedAt: Date.now()
        });
        toast.success('Changes saved', { id: 'save-changes' });
      } catch (error) {
        console.error('Failed to save changes:', error);
        toast.error('Failed to save changes');
      } finally {
        setSaving(false);
      }
    }, 1000),
    []
  );

  const handleUpdateItinerary = (days: SavedItinerary['days']) => {
    if (!itinerary || !id) return;

    // Update local state immediately
    const updatedItinerary = { ...itinerary, days };
    setItinerary(updatedItinerary);

    // Save to database with debounce
    debouncedSave(id, updatedItinerary);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !itinerary) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row lg:gap-8">
        <div className="flex-1 mb-8 lg:mb-0">
          <div className="space-y-8">
            <ItineraryHero
              name={itinerary.name}
              description={itinerary.description}
              destination={itinerary.destination}
              country={itinerary.country || 'united states'}
              date={itinerary.date}
              duration={itinerary.duration}
              days={itinerary.days}
              createdAt={itinerary.createdAt}
            />
            
            <ItineraryEditor
              itinerary={itinerary.days}
              setItinerary={handleUpdateItinerary}
              destination={itinerary.destination}
              loading={loading}
              error={error}
              openAIClient={null}
            />

            {saving && (
              <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                <span className="text-sm text-gray-600">Saving changes...</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-80 xl:w-96">
          <div className="lg:sticky lg:top-8">
            <BookingWidget />
          </div>
        </div>
      </div>
    </div>
  );
}