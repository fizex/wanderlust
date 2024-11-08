import OpenAI from "openai";
import { Activity, ItineraryDay } from "../../types/itinerary";
import { FormData } from "../../types/form";
import { SYSTEM_PROMPT, createRoutingPrompt, createDayPrompt, INPUT_NORMALIZATION_PROMPT } from "./prompts";
import { getCityImage } from "../unsplash";
import { OpenAIServiceError, ValidationError, ResponseParseError } from "./errors";
import { validateRoutingPlan, validateDayActivities } from "./validation";
import { withRetry } from "./retry";

interface NormalizedInput {
  destination: string;
  dates: string | null;
  suggestedName: string;
  corrections: {
    original: string;
    corrected: string;
    reason: string;
  }[];
}

export class OpenAIClient {
  private client: OpenAI;
  private destinations: string[];
  private dates?: string;
  private interests?: string;
  private additionalInfo?: string;

  constructor(apiKey: string, destinations: string[], formData?: FormData) {
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
    this.dates = formData?.dates;
    this.interests = formData?.interests;
    this.additionalInfo = formData?.additionalInfo;
  }

  private async normalizeUserInput(): Promise<NormalizedInput> {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: INPUT_NORMALIZATION_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              destination: this.destinations[0],
              dates: this.dates || null,
              duration: this.duration,
              interests: this.interests || null,
              additionalInfo: this.additionalInfo || null
            })
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new ResponseParseError('No response from input normalization');
      }

      const normalized = JSON.parse(content);
      if (!normalized.destination || typeof normalized.destination !== 'string') {
        throw new ValidationError('Invalid normalized input format', normalized);
      }

      return normalized;
    } catch (error) {
      console.error('Input normalization error:', error);
      throw new OpenAIServiceError(
        'Failed to normalize user input',
        error instanceof Error ? error : undefined
      );
    }
  }

  async generateFullItinerary(duration: number): Promise<ItineraryDay[]> {
    if (!duration || duration < 1) {
      throw new Error('Duration must be at least 1 day');
    }

    try {
      // First, normalize the user input
      const normalizedInput = await this.normalizeUserInput();
      console.log('Normalized input:', normalizedInput);

      // Update the destinations with the normalized version
      this.destinations = [normalizedInput.destination];
      
      // Generate routing plan with normalized locations
      const routingPlan = await withRetry(async () => {
        const response = await this.client.chat.completions.create({
          model: "gpt-4-turbo-preview",
          messages: [
            {
              role: "system",
              content: "You are a travel routing expert. Return JSON only."
            },
            {
              role: "user",
              content: createRoutingPrompt(
                [normalizedInput.destination],
                duration,
                normalizedInput.dates || undefined,
                this.interests,
                this.additionalInfo
              )
            }
          ],
          response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new ResponseParseError('No response from OpenAI routing completion');
        }

        try {
          const data = JSON.parse(content);
          if (!validateRoutingPlan(data)) {
            throw new ValidationError('Invalid routing plan format', data);
          }
          return {
            ...data,
            suggestedName: normalizedInput.suggestedName,
            corrections: normalizedInput.corrections
          };
        } catch (error) {
          throw new ResponseParseError('Failed to parse routing plan', content);
        }
      });

      const itinerary: ItineraryDay[] = [];

      for (const [index, dayPlan] of routingPlan.days.entries()) {
        const dayResponse = await withRetry(async () => {
          const completion = await this.client.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: createDayPrompt(
                  index + 1,
                  dayPlan.main_city,
                  index > 0 ? routingPlan.days[index - 1].main_city : null,
                  dayPlan.suggested_accommodation,
                  dayPlan.travel_from_previous,
                  normalizedInput.dates || undefined,
                  this.interests,
                  this.additionalInfo
                )
              }
            ],
            response_format: { type: "json_object" }
          });

          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new ResponseParseError('No response from OpenAI activities completion');
          }

          try {
            const data = JSON.parse(content);
            if (!validateDayActivities(data)) {
              throw new ValidationError('Invalid day activities format', data);
            }
            return data;
          } catch (error) {
            throw new ResponseParseError('Failed to parse day activities', content);
          }
        });

        const activities = await Promise.all(
          dayResponse.activities.map(async (activity: Activity) => ({
            ...activity,
            id: `day-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            imageUrl: await getCityImage(dayPlan.main_city)
          }))
        );

        itinerary.push({
          id: `day-${index + 1}`,
          day: index + 1,
          location: dayPlan.main_city,
          country: routingPlan.country,
          accommodation: dayPlan.suggested_accommodation,
          travelInfo: dayPlan.travel_from_previous,
          weatherInfo: dayPlan.weather_info,
          localEvents: dayPlan.local_events,
          activities,
          suggestedName: routingPlan.suggestedName,
          corrections: routingPlan.corrections
        });
      }

      return itinerary;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new OpenAIServiceError(
        error instanceof Error ? error.message : 'Failed to generate itinerary',
        error instanceof Error ? error : undefined
      );
    }
  }
}