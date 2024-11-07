import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { ItineraryDay } from '../types/itinerary';

interface TripSummaryProps {
  destination: string;
  itinerary: ItineraryDay[];
}

export default function TripSummary({ destination, itinerary }: TripSummaryProps) {
  const imageUrl = `https://source.unsplash.com/featured/?${encodeURIComponent(destination)},landmark`;
  const totalDays = itinerary.length;

  return (
    <div className="relative mb-8 rounded-xl overflow-hidden">
      <div className="h-48 relative">
        <img
          src={imageUrl}
          alt={destination}
          className="w-full h-full object-cover"
        />
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