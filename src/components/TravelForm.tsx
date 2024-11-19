import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Heart, MessageSquare, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { FormData } from '../types/form';

interface TravelFormProps {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error: string | null;
}

export default function TravelForm({ onSubmit, loading, error }: TravelFormProps) {
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    dates: '',
    duration: '',
    interests: '',
    additionalInfo: '',
  });

  const [surpriseMe, setSurpriseMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSurpriseMe = () => {
    setSurpriseMe(!surpriseMe);
    if (!surpriseMe) {
      setFormData(prev => ({ ...prev, destination: 'Surprise me!' }));
    } else {
      setFormData(prev => ({ ...prev, destination: '' }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold mb-6">Plan Your Adventure</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4 mr-2" />
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={surpriseMe}
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50"
              placeholder="Where to?"
            />
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Surprise me
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              Travel Dates
            </label>
            <input
              type="text"
              value={formData.dates}
              onChange={(e) => setFormData(prev => ({ ...prev, dates: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Month, season, or specific dates"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 mr-2" />
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="How many days?"
              required
            />
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <Heart className="w-4 h-4 mr-2" />
            Interests & Preferences
          </label>
          <textarea
            value={formData.interests}
            onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="What do you love doing while traveling?"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <MessageSquare className="w-4 h-4 mr-2" />
            Additional Information
          </label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={3}
            placeholder="Any specific requirements or preferences?"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.destination || !formData.duration}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-blue-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>{loading ? 'Generating...' : 'Generate My Adventure'}</span>
        </button>
      </form>
    </div>
  );
}