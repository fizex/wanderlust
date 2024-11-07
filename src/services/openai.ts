import OpenAI from 'openai';
import { Activity, ItineraryDay } from '../types/itinerary';

interface RoutingDay {
  main_city: string;
  suggested_accommodation: string;
  travel_from_previous: string | null;
}

interface RoutingPlan {
  days: RoutingDay[];
}

const SYSTEM_PROMPT = `You are an expert travel planning assistant. Create detailed, logistically optimized itineraries considering:

1. Geographic Proximity:
   - Group activities by location to minimize travel time
   - Consider logical routes between cities/regions
   - Account for realistic travel times between destinations

2. For each activity include:
   - Descriptive title
   - Detailed description with local context
   - Specific location (city, neighborhood, address)
   - Duration (including travel time from previous location)
   - Price range (€ to €€€€)
   - Opening hours if applicable
   - Travel tips and logistics
   - Relevant tags

3. Daily Structure:
   - Morning activity (typically starts 9-10 AM)
   - Afternoon activity (typically starts 2-3 PM)
   - Evening activity (typically starts 7-8 PM)
   - Account for travel time between activities`;

export class OpenAIService {
  private client: OpenAI;
  private destinations: string[];

  constructor(apiKey: string, destinations: string[]) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    if (!destinations || destinations.length === 0) {
      throw new Error('At least one destination is required');
    }

    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    this.destinations = destinations;
  }

  async generateFullItinerary(duration: number): Promise<ItineraryDay[]> {
    if (!duration || duration < 1) {
      throw new Error('Duration must be at least 1 day');
    }

    try {
      const routingPrompt = `I need to visit these destinations over ${duration} days: ${this.destinations.join(', ')}. 
        Provide a JSON array where each element represents a day and includes:
        1. main_city: The primary city for that day
        2. suggested_accommodation: Where to stay
        3. travel_from_previous: Travel instructions from the previous day's location (null for first day)
        
        Optimize the route to minimize travel time and group nearby destinations.`;

      const routingCompletion = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { 
            role: "system", 
            content: "You are a travel routing expert. Provide optimal multi-city itinerary routes in JSON format."
          },
          { role: "user", content: routingPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const routingContent = routingCompletion.choices[0]?.message?.content;
      if (!routingContent) {
        throw new Error('No response from OpenAI routing completion');
      }

      const routingPlan = JSON.parse(routingContent) as RoutingPlan;
      if (!routingPlan.days || !Array.isArray(routingPlan.days)) {
        throw new Error('Invalid routing plan format');
      }

      const itinerary: ItineraryDay[] = [];

      for (const [index, dayPlan] of routingPlan.days.entries()) {
        const dayPrompt = `Generate 3 activities for day ${index + 1} in ${dayPlan.main_city}.
          Previous location: ${index > 0 ? routingPlan.days[index - 1].main_city : 'Starting point'}
          Accommodation: ${dayPlan.suggested_accommodation}
          Travel instructions: ${dayPlan.travel_from_previous || 'First day of trip'}
          
          Consider:
          1. Opening hours and local timing
          2. Geographic proximity between activities
          3. Local culture and specialties
          4. Travel time between locations`;

        const activitiesCompletion = await this.client.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: dayPrompt }
          ],
          response_format: { type: "json_object" }
        });

        const activitiesContent = activitiesCompletion.choices[0]?.message?.content;
        if (!activitiesContent) {
          throw new Error('No response from OpenAI activities completion');
        }

        const activities = JSON.parse(activitiesContent);
        if (!Array.isArray(activities)) {
          throw new Error('Invalid activities format');
        }

        const activitiesWithImages = await Promise.all(
          activities.map(async (activity: Activity) => ({
            ...activity,
            imageUrl: await this.getRelevantImage(activity.title, dayPlan.main_city)
          }))
        );

        itinerary.push({
          id: `day-${index + 1}`,
          day: index + 1,
          activities: activitiesWithImages,
          location: dayPlan.main_city,
          accommodation: dayPlan.suggested_accommodation,
          travelInfo: dayPlan.travel_from_previous
        });
      }

      return itinerary;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate itinerary: ${error.message}`);
      }
      throw new Error('Failed to generate itinerary: Unknown error');
    }
  }

  async generateActivity(prompt: string, currentLocation: string): Promise<Activity> {
    if (!prompt || !currentLocation) {
      throw new Error('Prompt and current location are required');
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: `Generate a travel activity in ${currentLocation} based on: ${prompt}. 
                     Include specific details about location, timing, and practical information.
                     For imageUrl, leave it as null - we'll handle images separately.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const response = JSON.parse(content);
      const imageUrl = await this.getRelevantImage(response.title, currentLocation);
      
      return {
        id: `ai-${Date.now()}`,
        ...response,
        imageUrl
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate activity: ${error.message}`);
      }
      throw new Error('Failed to generate activity: Unknown error');
    }
  }

  private async getRelevantImage(title: string, location: string): Promise<string> {
    const defaultImages = {
      'berlin': [
        'https://images.unsplash.com/photo-1560969184-10fe8719e047',
        'https://images.unsplash.com/photo-1599946347371-68eb71b16afc',
        'https://images.unsplash.com/photo-1587330979470-3595ac045ab0'
      ],
      'munich': [
        'https://images.unsplash.com/photo-1595867818082-083862f3d630',
        'https://images.unsplash.com/photo-1664464229271-843a8c1c6ad0',
        'https://images.unsplash.com/photo-1629652487043-fb2825838f8c'
      ],
      'zurich': [
        'https://images.unsplash.com/photo-1515488764276-beab7607c1e6',
        'https://images.unsplash.com/photo-1574178625340-5f81faa56551',
        'https://images.unsplash.com/photo-1544230356-8353a8e75641'
      ],
      'lucerne': [
        'https://images.unsplash.com/photo-1527668752968-14dc70a27c95',
        'https://images.unsplash.com/photo-1591984942831-eb239650e174',
        'https://images.unsplash.com/photo-1504308805006-0f7a5f1f0f71'
      ],
      'default': [
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1502920917128-1aa500764cbd',
        'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f'
      ]
    };

    const cityKey = location.toLowerCase();
    const cityImages = defaultImages[cityKey as keyof typeof defaultImages] || defaultImages.default;
    const randomIndex = Math.floor(Math.random() * cityImages.length);
    return `${cityImages[randomIndex]}?auto=format&fit=crop&q=80`;
  }
}