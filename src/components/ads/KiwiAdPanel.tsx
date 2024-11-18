import React from 'react';
import { Plane, ArrowRight } from 'lucide-react';

export default function KiwiAdPanel() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm text-white">
      <div className="absolute top-0 right-0 w-64 h-64 transform translate-x-32 -translate-y-32">
        <div className="absolute inset-0 bg-white opacity-10 rounded-full"></div>
      </div>
      
      <div className="relative p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Plane className="w-6 h-6" />
          <span className="font-semibold">Ready for takeoff?</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          Find the Best Flight Deals
        </h3>
        
        <p className="text-white/90 mb-4">
          Compare thousands of flights and save big on your next adventure. Book with confidence on Kiwi.com
        </p>

        <a
          href="https://kiwi.tp.st/nRFegU5t"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
        >
          Search Flights
          <ArrowRight className="w-4 h-4 ml-2" />
        </a>
      </div>
    </div>
  );
}