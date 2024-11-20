import { Activity } from '../types/itinerary';

interface AIContext {
  location: string;
  date?: string;
  currentActivities: Activity[];
}

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

  async generateActivity(prompt: string): Promise<Activity | null> {
    try {
      const timeOfDay = this.extractTimeOfDay(prompt);
      
      // Create a custom activity without image
      const activity: Activity = {
        id: `ai-${Date.now()}`,
        type: 'custom',
        title: 'Custom Activity',
        description: prompt,
        details: {
          location: this.context.location,
          duration: '2 hours',
          tags: ['Custom', 'Exploration'],
        },
      };

      return activity;
    } catch (error) {
      console.error('Error generating activity:', error);
      return null;
    }
  }

  validatePrompt(prompt: string): { isValid: boolean; message?: string } {
    if (prompt.length < 10) {
      return {
        isValid: false,
        message: "Could you provide more details about what you'd like to do?",
      };
    }

    return { isValid: true };
  }
}