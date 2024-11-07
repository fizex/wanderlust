import OpenAI from "openai";
import { Activity, ItineraryDay } from "../../types/itinerary";
import { FormData } from "../../types/form";
import { SYSTEM_PROMPT, createRoutingPrompt, createDayPrompt } from "./prompts";
import { getRandomCityImage } from "./images";

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

  async generateFullItinerary(duration: number): Promise<ItineraryDay[]> {
    if (!duration || duration < 1) {
      throw new Error('Duration must be at least 1 day');
    }

    try {
      // Step 1: Generate routing plan
      const routingResponse = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are a travel routing expert. Return JSON only."
          },
          {
            role: "user",
            content: createRoutingPrompt(
              this.destinations, 
              duration,
              this.dates,
              this.interests,
              this.additionalInfo
            )
          }
        ],
        response_format: { type: "json_object" }
      });

      const routingPlan = JSON.parse(routingResponse.choices[0]?.message?.content || '{}');
      if (!routingPlan.days || !Array.isArray(routingPlan.days)) {
        throw new Error('Invalid routing plan format');
      }

      // Step 2: Generate detailed itinerary for each day
      const itinerary: ItineraryDay[] = [];

      for (const [index, dayPlan] of routingPlan.days.entries()) {
        const dayResponse = await this.client.chat.completions.create({
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
                this.dates,
                this.interests,
                this.additionalInfo
              )
            }
          ],
          response_format: { type: "json_object" }
        });

        const dayContent = JSON.parse(dayResponse.choices[0]?.message?.content || '{}');
        if (!dayContent.activities || !Array.isArray(dayContent.activities)) {
          throw new Error('Invalid day activities format');
        }

        const activities = dayContent.activities.map((activity: Activity) => ({
          ...activity,
          id: `day-${index + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));

        itinerary.push({
          id: `day-${index + 1}`,
          day: index + 1,
          location: dayPlan.main_city,
          accommodation: dayPlan.suggested_accommodation,
          travelInfo: dayPlan.travel_from_previous,
          weatherInfo: dayPlan.weather_info,
          localEvents: dayPlan.local_events,
          activities
        });
      }

      return itinerary;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  async generateActivity(prompt: string, location: string): Promise<Activity> {
    if (!prompt || !location) {
      throw new Error('Prompt and location are required');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Generate a detailed activity in ${location} based on: ${prompt}. 
                     Consider weather conditions${this.dates ? ` during ${this.dates}` : ''} and 
                     ${this.interests ? `align with interests: ${this.interests}` : 'general tourist preferences'}.
                     Return a single activity in JSON format.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const activityData = JSON.parse(content);

      return {
        ...activityData,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}