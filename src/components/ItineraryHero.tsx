import React from 'react';
import { Calendar, MapPin, CalendarClock, Sparkles, Info, AlertCircle, Loader2 } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [imageError, setImageError] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  
  React.useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      try {
        setIsLoading(true);
        setImageError(false);
        console.log('Fetching image for country:', country);
        const url = await getCountryImage(country);
        console.log('Received image URL:', url);
        
        if (isMounted) {
          setImageUrl(url);
        }
      } catch (error) {
        console.error('Error loading country image:', error);
        if (isMounted) {
          setImageError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-64 md:h-80">
        {isLoading ? (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
        ) : imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={`${country} - ${destination}`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-white/50" />
          </div>
        )}
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
      </div>
    </div>
  );
}