import React from 'react';
import { Plane, Hotel, Car } from 'lucide-react';

const AFFILIATE_LINKS = {
  flights: 'https://trip.tp.st/OJpuGKoz',
  hotels: 'https://trip.tp.st/eYLjLgKb',
  cars: 'https://trip.tp.st/MpESxdb7'
};

export default function BookingWidget() {
  const handleClick = (service: keyof typeof AFFILIATE_LINKS) => {
    window.open(AFFILIATE_LINKS[service], '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-blue-500 rounded-xl shadow-sm p-6 text-white w-full">
      <h3 className="text-lg font-semibold mb-4">Ready to Book?</h3>
      <div className="space-y-4">
        <button 
          onClick={() => handleClick('flights')}
          className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <Plane className="w-5 h-5" />
            <span>Find Flights</span>
          </div>
          <span className="text-sm opacity-75">Best deals →</span>
        </button>

        <button 
          onClick={() => handleClick('hotels')}
          className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <Hotel className="w-5 h-5" />
            <span>Book Hotels</span>
          </div>
          <span className="text-sm opacity-75">Compare rates →</span>
        </button>

        <button 
          onClick={() => handleClick('cars')}
          className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
        >
          <div className="flex items-center space-x-3">
            <Car className="w-5 h-5" />
            <span>Rent a Car</span>
          </div>
          <span className="text-sm opacity-75">Special offers →</span>
        </button>
      </div>

      <div className="mt-6 text-sm text-white/70 text-center">
        Best price guarantee with our trusted partners
      </div>
    </div>
  );
}