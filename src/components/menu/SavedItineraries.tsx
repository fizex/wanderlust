import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFirestore } from '../../contexts/FirestoreContext';
import { deleteItinerary } from '../../services/firebase/firestore';
import { Calendar, Loader2 } from 'lucide-react';
import ItineraryCard from './ItineraryCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface SavedItinerariesProps {
  onClose: () => void;
}

export default function SavedItineraries({ onClose }: SavedItinerariesProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { itineraries, loading, error, refreshItineraries } = useFirestore();

  React.useEffect(() => {
    console.log('SavedItineraries rendered:', {
      loading,
      error,
      itinerariesCount: itineraries?.length,
      user: user?.uid
    });
  }, [loading, error, itineraries, user]);

  const handleDelete = async (itineraryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    try {
      await deleteItinerary(itineraryId, user.uid);
      await refreshItineraries();
      toast.success('Itinerary deleted');
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      toast.error('Failed to delete itinerary');
    }
  };

  const handleSelect = (itineraryId: string) => {
    navigate(`/itinerary/${itineraryId}`);
    onClose();
  };

  const handleRefresh = () => {
    refreshItineraries();
    toast.success('Refreshing itineraries...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center text-red-500">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!itineraries || itineraries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center text-gray-500">
        <Calendar className="w-12 h-12 mb-4" />
        <p>No saved itineraries yet</p>
        <p className="text-sm mt-2">Your saved trips will appear here</p>
        <button
          onClick={handleRefresh}
          className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Refresh
        </button>
      </div>
      {itineraries.map((itinerary) => (
        <ItineraryCard
          key={itinerary.id}
          itinerary={itinerary}
          onSelect={() => handleSelect(itinerary.id)}
          onDelete={(e) => handleDelete(itinerary.id, e)}
        />
      ))}
    </div>
  );
}