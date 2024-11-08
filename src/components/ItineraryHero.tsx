import React from 'react';
import { Calendar, MapPin, CalendarClock, Sparkles, Info, AlertCircle } from 'lucide-react';
import { ItineraryDay } from '../types/itinerary';
import { formatDistanceToNow } from 'date-fns';
import { getCountryImage } from '../services/unsplash';

interface ItineraryHeroProps {
  name: string;
  description: string;
  destination: string;
  country: string;
  date?: string;
  normalizedDate?: string;
  duration: string;
  days: ItineraryDay[];
  createdAt: number;
  corrections?: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
}

export default function ItineraryHero({
  name,
  description,
  destination,
  country,
  date,
  normalizedDate,
  duration,
  days = [],
  createdAt,
  corrections = [],
}: ItineraryHeroProps) {
  const [imageUrl, setImageUrl] = React.useState<string>('');
  
  React.useEffect(() => {
    async function loadImage() {
      const url = await getCountryImage(country);
      setImageUrl(url);
    }
    loadImage();
  }, [country]);

  const totalDays = days?.length || 0;
  const locations = [...new Set(days?.map(day => day.location))].filter(Boolean);

  const formattedCreatedAt = React.useMemo(() => {
    try {
      const timestamp = typeof createdAt === 'number' ? createdAt : parseInt(createdAt);
      if (isNaN(timestamp)) return 'recently';
      
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  }, [createdAt]);

  const localEvents = React.useMemo(() => {
    if (!days?.[0]?.localEvents || !Array.isArray(days[0].localEvents)) {
      return [];
    }

    return days[0].localEvents
      .filter((event): event is { event_name: string; event_description?: string } => {
        return typeof event === 'object' && event !== null && 'event_name' in event;
      });
  }, [days]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-64 md:h-80">
        <img
          src={imageUrl}
          alt={`${country} - ${destination}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{name}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <p className="text-lg text-gray-700 mb-4">{description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <MapPin className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-gray-600 leading-tight">
                {locations.join(', ')}
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-gray-600 leading-tight">
                {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>
            
            {(normalizedDate || date) && (
              <div className="flex items-start space-x-3">
                <CalendarClock className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div className="text-gray-600 leading-tight">
                  {normalizedDate || date}
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-3">
              <Sparkles className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-gray-600 leading-tight">
                Created {formattedCreatedAt}
              </div>
            </div>
          </div>
        </div>

        {corrections.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h3 className="text-lg font-semibold">Input Corrections</h3>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <ul className="space-y-4">
                {corrections.map((correction, index) => (
                  <li key={index} className="border-l-2 border-amber-300 pl-4">
                    <div className="flex items-center space-x-2">
                      <span className="line-through text-gray-500">{correction.original}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-gray-900">{correction.corrected}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{correction.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {localEvents.length > 0 && (
          <div className="border-t pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <Info className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-semibold">Local Events During Your Stay</h3>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <ul className="space-y-4">
                {localEvents.map((event, index) => (
                  <li key={index} className="border-l-2 border-indigo-300 pl-4">
                    <span className="font-medium text-gray-900">{event.event_name}</span>
                    {event.event_description && (
                      <p className="text-sm text-gray-600 mt-1">{event.event_description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}