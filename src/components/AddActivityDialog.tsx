import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';

interface AddActivityDialogProps {
  onClose: () => void;
  onAddActivity: (type: 'ai' | 'text', prompt?: string) => void;
  isLoading?: boolean;
  currentLocation?: string;
}

export default function AddActivityDialog({ 
  onClose, 
  onAddActivity, 
  isLoading,
  currentLocation 
}: AddActivityDialogProps) {
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!currentLocation) {
      setError('Unable to determine current location');
      return;
    }
    
    if (!prompt.trim()) {
      setError('Please enter a description of the activity');
      return;
    }

    setError('');
    onAddActivity('ai', prompt);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Activity</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onAddActivity('text')}
            className="w-full py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
          >
            <div className="font-medium">Add Text Note</div>
            <div className="text-sm text-gray-600">
              Add transfer times, personal notes, or rest periods
            </div>
          </button>

          <div className="relative">
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-700">
                Or describe an activity for {currentLocation}
              </label>
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError('');
              }}
              placeholder="E.g., Visit the Eiffel Tower in the evening..."
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
            />
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="absolute bottom-3 right-3 text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}