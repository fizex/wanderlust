import { FormData } from "../types/form";
import { ItineraryDay } from "../types/itinerary";
import { OpenAIClient } from "./openai/client";
import { getRandomCityImage } from "./unsplash";

export async function generateItinerary(
  openAIClient: OpenAIClient,
  formData: FormData
): Promise<ItineraryDay[]> {
  try {
    const prompt = buildPrompt(formData);
    const response = await openAIClient.generateItinerary(prompt);

    // Add images to activities
    const itinerary = await Promise.all(
      response.days.map(async (day: ItineraryDay) => {
        const activitiesWithImages = await Promise.all(
          day.activities.map(async (activity) => {
            if (activity.details?.location) {
              activity.imageUrl = await getRandomCityImage(activity.details.location);
            }
            return activity;
          })
        );
        return { ...day, activities: activitiesWithImages };
      })
    );

    return itinerary;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error generating itinerary:", error);
      throw new Error(`Failed to generate itinerary: ${error.message}`);
    }
    throw error;
  }
}

function buildPrompt(formData: FormData): string {
  const parts = [
    `Create a ${formData.duration}-day travel itinerary for ${formData.destination}.`,
  ];

  if (formData.dates) {
    parts.push(`Travel period: ${formData.dates}`);
  }

  if (formData.interests) {
    parts.push(`Interests: ${formData.interests}`);
  }

  if (formData.additionalInfo) {
    parts.push(`Additional requirements: ${formData.additionalInfo}`);
  }

  parts.push(
    "Include a mix of activities:",
    "- Cultural experiences and landmarks",
    "- Local cuisine and dining",
    "- Nature and outdoor activities",
    "- Entertainment and nightlife",
    "Consider travel time between locations and group activities by geographic proximity.",
    "Include specific times, durations, and practical details for each activity."
  );

  return parts.join("\n");
}