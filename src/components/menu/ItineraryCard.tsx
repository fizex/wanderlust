import React from 'react';
import { MapPin, Trash2, ArrowRight } from 'lucide-react';
import { SavedItinerary } from '../../services/firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface ItineraryCardProps {
  itinerary: SavedItinerary;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function ItineraryCard({ itinerary, onSelect, onDelete }: ItineraryCardProps) {
  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return 'Recently';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Recently';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Recently';
    }
  };

  return (
    <div
      onClick={onSelect}
      className="w-full text-left bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium group-hover:text-indigo-600 transition-colors">
            {itinerary.name}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {itinerary.destination}
              {itinerary.days?.length > 0 && ` - ${itinerary.days.length} days`}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Created {formatDate(itinerary.createdAt)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete itinerary"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </div>
      </div>
    </div>
  );
}