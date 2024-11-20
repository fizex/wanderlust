import OpenAI from "openai";
import { Activity, ItineraryDay } from "../../types/itinerary";
import { FormData } from "../../types/form";

const SYSTEM_PROMPT = `You are an expert travel planner. Create detailed itineraries that include:

1. Basic Information:
   - Itinerary name (creative and destination-specific)
   - Brief description
   - Country and primary locations

2. Daily Activities:
   - 3-4 activities per day
   - Specific locations and landmarks
   - Timing and duration
   - Price ranges ($ to $$$$)
   - Travel tips

3. Metadata:
   - Recommended seasons
   - Time zone
   - Local currency
   - Common languages
   - Cultural considerations

Return a JSON object with:
{
  "name": "string",
  "description": "string",
  "days": Array<{
    "day": number,
    "location": string,
    "activities": Array<{
      "title": string,
      "type": "dining" | "exploration" | "activity",
      "description": string,
      "details": {
        "location": string,
        "duration": string,
        "price": string,
        "tags": string[]
      }
    }>
  }>,
  "metadata": {
    "country": string,
    "recommendedSeasons": string[],
    "timeZone": string,
    "currency": string,
    "languages": string[]
  }
}`;

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateFullItinerary(formData: FormData): Promise<{
    itinerary: ItineraryDay[];
    name: string;
    description: string;
    metadata: any;
  }> {
    try {
      const prompt = `Create a ${formData.duration}-day itinerary for ${formData.destination}.

Travel period: ${formData.dates || 'Flexible'}
Interests: ${formData.interests || 'Various activities'}

Consider:
- Local weather and seasonal activities for the specified dates
- Visitor interests and preferences
- Logical geographic progression
- Opening hours and peak times
- Travel time between locations

IMPORTANT: For each activity, include the main landmark or attraction name in the location field.

Return a complete itinerary JSON matching the example structure provided.`;

      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const response = JSON.parse(content);
      const country = response.metadata?.country || response.country || 'Unknown';

      // Create itinerary without images - they'll be handled by the UI components
      const itinerary = response.days.map((day: any) => ({
        ...day,
        activities: day.activities
          .filter((activity: Activity) => 
            activity && 
            activity.title && 
            activity.description && 
            activity.type
          )
          .map((activity: Activity) => ({
            ...activity,
            id: `activity-${day.day}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }))
      }));

      return {
        itinerary,
        name: response.name,
        description: response.description,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate itinerary. Please try again.');
    }
  }
}