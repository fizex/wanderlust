import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { ItineraryDay } from '../types/itinerary';
import { getCountryImage } from '../services/unsplash';

interface TripSummaryProps {
  destination: string;
  itinerary: ItineraryDay[];
}

export default function TripSummary({ destination, itinerary }: TripSummaryProps) {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const totalDays = itinerary.length;

  React.useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        const url = await getCountryImage(destination);
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Failed to load destination image:', error);
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [destination]);

  return (
    <div className="relative mb-8 rounded-xl overflow-hidden">
      <div className="h-48 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={destination}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{destination}</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{totalDays} {totalDays === 1 ? 'Day' : 'Days'}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{itinerary[0]?.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}