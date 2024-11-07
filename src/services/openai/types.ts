export interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export interface ItineraryResponse {
  days: Day[];
}

export interface Day {
  id: string;
  day: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  time?: string;
  title: string;
  description: string;
  imageUrl?: string;
  details?: {
    rating?: number;
    price?: string;
    duration?: string;
    location?: string;
    website?: string;
    tags?: string[];
  };
}