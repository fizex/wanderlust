import { UnsplashClient } from './client';
import { REGIONS, COUNTRY_TO_REGION, COUNTRY_ALIASES } from './regions';
import { UnsplashError } from './errors';

let unsplashClient: UnsplashClient | null = null;

export function initUnsplash(accessKey: string) {
  unsplashClient = new UnsplashClient(accessKey);
}

export async function getCountryImage(country: string): Promise<string> {
  if (!unsplashClient) {
    throw new UnsplashError('Unsplash client not initialized');
  }

  if (!country?.trim()) {
    return getDefaultImage();
  }

  try {
    // Normalize country name
    const normalizedCountry = country.toLowerCase().trim();
    const resolvedCountry = COUNTRY_ALIASES[normalizedCountry] || normalizedCountry;

    // Try country-specific search with explicit location
    try {
      const photos = await unsplashClient.searchPhotos(
        `${resolvedCountry} landmarks travel destination location:${resolvedCountry}`, 
        5
      );
      return photos[Math.floor(Math.random() * photos.length)];
    } catch (error) {
      // If specific search fails, try broader regional images
      const region = COUNTRY_TO_REGION[resolvedCountry];
      if (region) {
        const photos = await unsplashClient.searchPhotos(
          REGIONS[region].searchTerm,
          5
        );
        return photos[Math.floor(Math.random() * photos.length)];
      }
      throw error;
    }
  } catch (error) {
    console.warn('Failed to fetch country images:', error);
    return getDefaultImage();
  }
}

export async function getCityImage(city: string): Promise<string> {
  if (!unsplashClient) {
    throw new UnsplashError('Unsplash client not initialized');
  }

  if (!city?.trim()) {
    return getDefaultImage();
  }

  try {
    // Extract city name without country/state
    const cityName = city.split(',')[0].trim();
    
    // Try city-specific search with explicit location
    const photos = await unsplashClient.searchPhotos(
      `${cityName} city landmarks architecture location:${cityName}`,
      5
    );
    return photos[Math.floor(Math.random() * photos.length)];
  } catch (error) {
    console.warn('Failed to fetch city images:', error);
    return getDefaultImage();
  }
}

function getDefaultImage(): string {
  const defaultImages = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    'https://images.unsplash.com/photo-1508672019048-805c876b67e2'
  ];
  return defaultImages[Math.floor(Math.random() * defaultImages.length)];
}