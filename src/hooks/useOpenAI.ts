import { useState, useCallback } from 'react';
import { OpenAIClient } from '../services/openai/client';
import { Activity, ItineraryDay } from '../types/itinerary';

export const useOpenAI = (apiKey: string, destinations: string[]) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<OpenAIClient | null>(null);

  const getClient = useCallback(() => {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!client) {
      try {
        const newClient = new OpenAIClient(apiKey, destinations);
        setClient(newClient);
        return newClient;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to initialize OpenAI client';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
    return client;
  }, [apiKey, destinations, client]);

  const generateItinerary = async (duration: number): Promise<ItineraryDay[]> => {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (loading) {
      throw new Error('An operation is already in progress');
    }

    if (destinations.length === 0) {
      throw new Error('At least one destination is required');
    }

    setLoading(true);
    setError(null);

    try {
      const openAIClient = getClient();
      const itinerary = await openAIClient.generateFullItinerary(duration);
      
      if (!itinerary || itinerary.length === 0) {
        throw new Error('Failed to generate itinerary');
      }

      return itinerary;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate itinerary';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateActivity = async (prompt: string, currentLocation: string): Promise<Activity> => {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (loading) {
      throw new Error('An operation is already in progress');
    }

    if (!currentLocation) {
      throw new Error('Current location is required');
    }

    setLoading(true);
    setError(null);

    try {
      const openAIClient = getClient();
      const activity = await openAIClient.generateActivity(prompt, currentLocation);
      
      if (!activity) {
        throw new Error('Failed to generate activity');
      }

      return activity;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate activity';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateItinerary,
    generateActivity,
    loading,
    error,
  };
};