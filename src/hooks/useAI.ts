import { useState } from 'react';
import { AIService } from '../services/ai';
import { Activity } from '../types/itinerary';

interface UseAIProps {
  location: string;
  date?: string;
  currentActivities: Activity[];
}

export function useAI({ location, date, currentActivities }: UseAIProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiService = new AIService({
    location,
    date,
    currentActivities,
  });

  const generateActivity = async (prompt: string): Promise<Activity | null> => {
    try {
      setLoading(true);
      setError(null);

      const validation = aiService.validatePrompt(prompt);
      if (!validation.isValid) {
        setError(validation.message || 'Invalid prompt');
        return null;
      }

      const activity = await aiService.generateActivity(prompt);
      return activity;
    } catch (err) {
      setError('Failed to generate activity. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const validatePrompt = (prompt: string) => {
    return aiService.validatePrompt(prompt);
  };

  return {
    generateActivity,
    validatePrompt,
    loading,
    error,
  };
}