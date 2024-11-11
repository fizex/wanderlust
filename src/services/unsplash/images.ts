import { UnsplashClient } from './client';
import { REGIONS, COUNTRY_TO_REGION } from './regions';
import { UnsplashError } from './errors';

// Default images by country
const COUNTRY_IMAGES = {
  'usa': [
    'photo-1501466044931-62695578d499', // Washington Monument
    'photo-1501466044931-62695578d499', // Statue of Liberty
    'photo-1496588152823-86ff7695e68f'  // Golden Gate Bridge
  ],
  'france': [
    'photo-1499856871958-5b9627545d1a', // Eiffel Tower
    'photo-1502602898657-3e91760cbb34', // Paris Street
    'photo-1520939817895-060bdaf4fe90'  // Loire Valley
  ],
  'italy': [
    'photo-1498307833015-e7b400441eb8', // Colosseum
    'photo-1534445867742-43195f401b6c', // Venice
    'photo-1516483638261-f4dbaf036963'  // Tuscany
  ],
  'default': [
    'photo-1476514525535-07fb3b4ae5f1', // Generic Travel 1
    'photo-1469854523086-cc02fe5d8800', // Generic Travel 2
    'photo-1508672019048-805c876b67e2'  // Generic Travel 3
  ]
};

// Common country name variations
const COUNTRY_ALIASES = {
  'united states': 'usa',
  'united states of america': 'usa',
  'u.s.a.': 'usa',
  'u.s.': 'usa',
  'united kingdom': 'uk',
  'great britain': 'uk',
};

async function getRandomImage(query: string, retries = 2): Promise<string | null> {
  if (!unsplashClient) return null;

  try {
    const photos = await unsplashClient.searchPhotos(
      `${query} landmark travel destination`,
      5
    );
    return photos[Math.floor(Math.random() * photos.length)];
  } catch (error) {
    if (retries > 0) {
      return getRandomImage(query, retries - 1);
    }
    return null;
  }
}

function getCountryFallbackImage(country: string): string {
  const normalizedCountry = country.toLowerCase();
  const countryKey = COUNTRY_ALIASES[normalizedCountry] || normalizedCountry;
  const images = COUNTRY_IMAGES[countryKey] || COUNTRY_IMAGES.default;
  return `https://images.unsplash.com/${images[Math.floor(Math.random() * images.length)]}?auto=format&fit=crop&q=80`;
}

let unsplashClient: UnsplashClient | null = null;

export function initUnsplash(accessKey: string) {
  if (!accessKey) {
    console.warn('Unsplash access key not provided');
    return;
  }
  unsplashClient = new UnsplashClient(accessKey);
}

export async function getCityImage(location: string, country: string = 'usa'): Promise<string> {
  // Clean up the location string
  const [specificLocation, cityName] = location.split(',').map(s => s.trim());
  
  try {
    // Try specific location first
    const specificImage = await getRandomImage(specificLocation);
    if (specificImage) return specificImage;

    // Try city name if available
    if (cityName) {
      const cityImage = await getRandomImage(cityName);
      if (cityImage) return cityImage;
    }

    // Fallback to country-specific image
    return getCountryFallbackImage(country);
  } catch (error) {
    console.warn('Failed to fetch location image:', error);
    return getCountryFallbackImage(country);
  }
}