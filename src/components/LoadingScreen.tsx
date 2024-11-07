import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const loadingMessages = [
  "Crafting your perfect adventure...",
  "Discovering hidden gems...",
  "Planning unforgettable moments...",
  "Curating unique experiences...",
  "Mapping out your journey...",
  "Finding local secrets...",
  "Optimizing your route...",
  "Adding special touches..."
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center z-50">
      <div className="text-center space-y-6">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        <p className="text-xl font-medium text-gray-900 animate-fade-in">
          {loadingMessages[messageIndex]}
        </p>
        <p className="text-sm text-gray-600">
          Please wait while we generate your personalized itinerary
        </p>
      </div>
    </div>
  );
}