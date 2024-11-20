import OpenAI from 'openai';
import { Activity, ItineraryDay } from '../types/itinerary';
import { FormData } from '../types/form';

export const MAX_DAYS = 30;
const CHUNK_SIZE = 5; // Generate 5 days at a time

const BASE_PROMPT = `You are an expert travel planner. Create detailed itineraries that include:

1. Basic Information:
   - Itinerary name (creative and destination-specific)
   - Brief description
   - Country and primary locations

2. Daily Activities (CRITICAL: You MUST generate exactly the number of days requested):
   - 3-4 activities per day
   - Specific locations and landmarks
   - Timing and duration
   - Price ranges ($ to $$$$)
   - Travel tips

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

export class OpenAIService {
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

  private async generateDayChunk(
    destination: string,
    startDay: number,
    numDays: number,
    interests: string,
    dates: string,
    isFirstChunk: boolean,
    totalDays: number
  ): Promise<any> {
    const prompt = `Create a detailed ${numDays}-day segment (days ${startDay} to ${startDay + numDays - 1}) of a ${totalDays}-day itinerary for ${destination}.

CRITICAL REQUIREMENTS:
1. You MUST generate EXACTLY ${numDays} days
2. Days MUST be numbered from ${startDay} to ${startDay + numDays - 1}
3. Each day MUST have 3-4 activities
4. Activities MUST be in chronological order
5. Each activity MUST have a specific location

Travel period: ${dates || 'Flexible'}
Interests: ${interests || 'Various activities'}

Consider:
- Local weather and seasonal activities
- Visitor interests and preferences
- Logical geographic progression
- Opening hours and peak times
- Travel time between locations

${isFirstChunk ? 'Include full metadata about the country and trip.' : 'Focus only on the daily activities.'}

Return a complete JSON matching the example structure with EXACTLY ${numDays} days.`;

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: BASE_PROMPT },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenAI returned empty response');
      }

      let response;
      try {
        response = JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Failed to parse OpenAI response');
      }

      // Validate the number of days
      if (!response.days || !Array.isArray(response.days)) {
        throw new Error('Invalid response format: missing days array');
      }

      if (response.days.length !== numDays) {
        throw new Error(`Expected ${numDays} days but received ${response.days.length}`);
      }

      // Ensure day numbers are correct
      response.days = response.days.map((day: any, index: number) => ({
        ...day,
        id: `day-${startDay + index}`,
        day: startDay + index,
        activities: (day.activities || []).map((activity: any) => ({
          ...activity,
          id: `activity-${startDay + index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }));

      return response;
    } catch (error) {
      // Enhance error message with context
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenAI chunk generation error:', {
        error,
        context: {
          destination,
          startDay,
          numDays,
          totalDays
        }
      });
      throw new Error(`Failed to generate itinerary chunk (days ${startDay}-${startDay + numDays - 1}): ${errorMessage}`);
    }
  }

  async generateFullItinerary(formData: FormData): Promise<{
    itinerary: ItineraryDay[];
    name: string;
    description: string;
    metadata: any;
  }> {
    const days = parseInt(formData.duration);
    if (isNaN(days) || days < 1 || days > MAX_DAYS) {
      throw new Error(`Duration must be between 1 and ${MAX_DAYS} days`);
    }

    try {
      let fullItinerary: ItineraryDay[] = [];
      let metadata = null;
      let name = '';
      let description = '';

      // Generate itinerary in chunks
      for (let startDay = 1; startDay <= days;) {
        const remainingDays = days - startDay + 1;
        const chunkSize = Math.min(CHUNK_SIZE, remainingDays);
        const isFirstChunk = startDay === 1;

        console.log(`Generating chunk ${Math.ceil(startDay / CHUNK_SIZE)} of ${Math.ceil(days / CHUNK_SIZE)}`);
        console.log(`Days ${startDay} to ${startDay + chunkSize - 1} of ${days}`);
        
        let attempts = 0;
        const maxAttempts = 3;
        let response;

        while (attempts < maxAttempts) {
          try {
            response = await this.generateDayChunk(
              formData.destination,
              startDay,
              chunkSize,
              formData.interests,
              formData.dates,
              isFirstChunk,
              days
            );

            // Validate chunk
            if (!response.days || response.days.length !== chunkSize) {
              throw new Error(`Invalid chunk size: expected ${chunkSize}, got ${response.days?.length}`);
            }

            break;
          } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed:`, error);
            if (attempts === maxAttempts) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
          }
        }

        if (!response) {
          throw new Error('Failed to generate itinerary chunk after multiple attempts');
        }

        // Store metadata and details from first chunk
        if (isFirstChunk) {
          metadata = response.metadata;
          name = response.name;
          description = response.description;
        }

        // Add chunk to full itinerary
        fullItinerary = [...fullItinerary, ...response.days];

        // Log progress
        console.log(`Added ${response.days.length} days. Total days so far: ${fullItinerary.length}`);

        // Move to next chunk
        startDay += chunkSize;
      }

      // Final validation
      if (fullItinerary.length !== days) {
        throw new Error(`Generated ${fullItinerary.length} days but expected ${days}`);
      }

      // Ensure days are in order
      fullItinerary.sort((a, b) => a.day - b.day);

      return {
        itinerary: fullItinerary,
        name,
        description,
        metadata
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenAI itinerary generation error:', {
        error,
        context: {
          destination: formData.destination,
          duration: formData.duration
        }
      });
      throw new Error(`Failed to generate itinerary: ${errorMessage}`);
    }
  }
}