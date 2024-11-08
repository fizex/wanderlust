import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFirestore } from '../contexts/FirestoreContext';
import TravelForm from '../components/TravelForm';
import BookingWidget from '../components/BookingWidget';
import LoadingScreen from '../components/LoadingScreen';
import { FormData } from '../types/form';
import { OpenAIClient } from '../services/openai/client';
import { saveNewItinerary } from '../services/firebase/firestore';
import { OpenAIServiceError } from '../services/openai/errors';
import toast from 'react-hot-toast';

export default function PlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshItineraries } = useFirestore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateItinerary = async (formData: FormData) => {
    setError(null);
    setLoading(true);

    try {
      const client = new OpenAIClient(
        import.meta.env.VITE_OPENAI_API_KEY,
        [formData.destination],
        formData
      );

      const itinerary = await client.generateFullItinerary(parseInt(formData.duration));

      if (!user || !itinerary.length) {
        throw new Error('Failed to generate itinerary');
      }

      const firstDay = itinerary[0];
      const name = firstDay.suggestedName || `${firstDay.location} - ${formData.duration} Days`;
      const description = `${formData.duration}-day adventure in ${firstDay.location}`;
      
      const itineraryId = await saveNewItinerary(
        user.uid,
        name,
        description,
        firstDay.location,
        firstDay.country,
        formData.dates,
        firstDay.normalizedDate || formData.dates,
        formData.duration,
        itinerary,
        {
          recommendedSeasons: ['Spring', 'Summer', 'Fall', 'Winter'],
          timeZone: 'Local Time',
          currency: 'Local Currency',
          languages: ['Local Language']
        }
      );

      await refreshItineraries();
      navigate(`/itinerary/${itineraryId}`);
      toast.success('Itinerary generated successfully');
    } catch (err) {
      let errorMessage = 'Failed to generate itinerary. Please try again.';
      
      if (err instanceof OpenAIServiceError) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <div className="flex-1 mb-8 lg:mb-0">
            <TravelForm 
              onSubmit={handleGenerateItinerary}
              loading={loading}
              error={error}
            />
          </div>
          <div className="lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-8">
              <BookingWidget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}