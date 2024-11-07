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

      const { days, country, metadata } = await client.generateFullItinerary(parseInt(formData.duration));

      // Save the itinerary
      if (user && days.length > 0) {
        const name = `${formData.destination} - ${formData.duration} Days`;
        const description = `${formData.duration}-day adventure in ${formData.destination}`;
        
        const itineraryId = await saveNewItinerary(
          user.uid,
          name,
          description,
          formData.destination,
          country,
          formData.dates,
          formData.duration,
          days,
          metadata
        );

        await refreshItineraries();
        navigate(`/itinerary/${itineraryId}`);
        toast.success('Itinerary generated successfully');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError('Failed to generate itinerary. Please try again.');
      toast.error('Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingScreen />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TravelForm 
              onSubmit={handleGenerateItinerary}
              loading={loading}
              error={error}
            />
          </div>
          <div>
            <BookingWidget />
          </div>
        </div>
      </div>
    </>
  );
}