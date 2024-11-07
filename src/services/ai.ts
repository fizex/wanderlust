import { Activity } from '../types/itinerary';

interface AIContext {
  location: string;
  date?: string;
  timeOfDay?: string;
  currentActivities: Activity[];
}

interface ActivitySuggestion {
  title: string;
  description: string;
  imageUrl: string;
  type: Activity['type'];
  details: Activity['details'];
}

const LANDMARK_DATABASE = {
  'paris': {
    'eiffel tower': {
      title: 'Eiffel Tower Visit',
      description: 'Experience the iconic symbol of Paris. The Tower sparkles for 5 minutes every hour on the hour after sunset until 1 AM.',
      imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&q=80',
      type: 'exploration' as const,
      details: {
        rating: 4.8,
        price: '€€',
        duration: '2-3 hours',
        location: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris',
        website: 'https://www.toureiffel.paris/en',
        tags: ['Landmark', 'Photography', 'Romantic', 'Must-See'],
      },
    },
    'louvre': {
      title: 'Louvre Museum Tour',
      description: 'Discover the world\'s largest art museum and a historic monument in Paris. Home to the Mona Lisa and countless other masterpieces.',
      imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
      type: 'exploration' as const,
      details: {
        rating: 4.7,
        price: '€€',
        duration: '3-4 hours',
        location: 'Rue de Rivoli, 75001 Paris',
        website: 'https://www.louvre.fr/en',
        tags: ['Museum', 'Art', 'History', 'Must-See'],
      },
    },
  },
};

const ACTIVITY_SUGGESTIONS = {
  'paris': {
    'morning': [
      {
        title: 'Parisian Café Experience',
        description: 'Start your day like a local at a charming café with fresh croissants and coffee. Watch the city come to life from a sidewalk table.',
        imageUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80',
        type: 'dining' as const,
        details: {
          rating: 4.6,
          price: '€',
          duration: '1 hour',
          location: 'Le Marais, Paris',
          tags: ['Local Experience', 'Breakfast', 'Café'],
        },
      },
    ],
    'afternoon': [
      {
        title: 'Luxembourg Gardens Stroll',
        description: 'Explore one of Paris\'s most beautiful parks. Perfect for a picnic or watching locals play pétanque.',
        imageUrl: 'https://images.unsplash.com/photo-1524396309943-e03f5249f002?auto=format&fit=crop&q=80',
        type: 'exploration' as const,
        details: {
          rating: 4.8,
          duration: '1-2 hours',
          location: '6th Arrondissement, Paris',
          tags: ['Park', 'Nature', 'Relaxation'],
        },
      },
    ],
    'evening': [
      {
        title: 'Seine River Dinner Cruise',
        description: 'Enjoy fine French cuisine while cruising past illuminated landmarks along the Seine.',
        imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80',
        type: 'dining' as const,
        details: {
          rating: 4.7,
          price: '€€€',
          duration: '2.5 hours',
          location: 'Seine River, Paris',
          tags: ['Romantic', 'Dining', 'Views'],
        },
      },
    ],
  },
};

export class AIService {
  private context: AIContext;

  constructor(context: AIContext) {
    this.context = context;
  }

  private extractTimeOfDay(prompt: string): string {
    const timeIndicators = {
      morning: ['morning', 'breakfast', 'sunrise', 'early'],
      afternoon: ['afternoon', 'lunch', 'noon', 'day'],
      evening: ['evening', 'dinner', 'sunset', 'night'],
    };

    for (const [time, indicators] of Object.entries(timeIndicators)) {
      if (indicators.some(indicator => prompt.toLowerCase().includes(indicator))) {
        return time;
      }
    }

    return 'afternoon'; // default
  }

  private findLandmark(prompt: string): ActivitySuggestion | null {
    const cityData = LANDMARK_DATABASE[this.context.location.toLowerCase()];
    if (!cityData) return null;

    for (const [landmark, data] of Object.entries(cityData)) {
      if (prompt.toLowerCase().includes(landmark)) {
        return data;
      }
    }

    return null;
  }

  private getContextualSuggestion(timeOfDay: string): ActivitySuggestion | null {
    const cityData = ACTIVITY_SUGGESTIONS[this.context.location.toLowerCase()];
    if (!cityData || !cityData[timeOfDay]) return null;

    const suggestions = cityData[timeOfDay];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }

  async generateActivity(prompt: string): Promise<Activity | null> {
    // First, check if this is a known landmark
    const landmark = this.findLandmark(prompt);
    if (landmark) {
      return {
        id: `ai-${Date.now()}`,
        ...landmark,
      };
    }

    // If not a landmark, try to understand the context and time
    const timeOfDay = this.extractTimeOfDay(prompt);
    const suggestion = this.getContextualSuggestion(timeOfDay);

    if (suggestion) {
      return {
        id: `ai-${Date.now()}`,
        ...suggestion,
      };
    }

    // If we can't find a specific match, create a custom activity
    return {
      id: `ai-${Date.now()}`,
      type: 'custom',
      title: 'Custom Activity',
      description: prompt,
      imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80',
      details: {
        location: this.context.location,
        duration: '2 hours',
        tags: ['Custom', 'Exploration'],
      },
    };
  }

  validatePrompt(prompt: string): { isValid: boolean; message?: string } {
    const promptLower = prompt.toLowerCase();
    
    // Check for location mismatches
    if (promptLower.includes('big ben') && this.context.location.toLowerCase() === 'paris') {
      return {
        isValid: false,
        message: "It seems you're trying to visit Big Ben while in Paris. Would you like suggestions for similar landmarks in Paris instead?",
      };
    }

    // Check for vague prompts
    if (prompt.length < 10) {
      return {
        isValid: false,
        message: "Could you provide more details about what you'd like to do? For example, preferred time of day or specific interests?",
      };
    }

    // Suggest specific landmarks
    if (promptLower.includes('tower') && !promptLower.includes('eiffel') && this.context.location.toLowerCase() === 'paris') {
      return {
        isValid: false,
        message: "Did you mean the Eiffel Tower? If so, I can provide detailed visiting information.",
      };
    }

    return { isValid: true };
  }
}