export interface Activity {
  id: string;
  type: 'dining' | 'exploration' | 'event' | 'accommodation' | 'custom';
  time?: string;
  title: string;
  description: string;
  imageUrl?: string;
  details?: {
    rating?: number | string;
    price?: string;
    duration?: string;
    location?: string;
    website?: string;
    weather_considerations?: string;
    seasonal_notes?: string;
    tags?: string[];
  };
}

export interface Event {
  event_name: string;
  event_description: string;
}

export interface ItineraryDay {
  id: string;
  day: number;
  location: string;
  accommodation?: string;
  travelInfo?: string | null;
  weatherInfo?: string;
  localEvents?: Event[];
  activities: Activity[];
  suggestedName?: string;
  normalizedDate?: string;
  corrections?: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
}

export interface ItineraryMetadata {
  country: string;
  startLocation: string;
  totalDays: number;
  recommendedSeasons?: string[];
  timeZone?: string;
  currency?: string;
  languages?: string[];
}