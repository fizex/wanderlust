import { createApi } from 'unsplash-js';
import { UnsplashAPIError, UnsplashConfigError } from './errors';

let unsplashApi: ReturnType<typeof createApi> | null = null;

// Cache with shorter duration
const imageCache = new Map<string, {
  url: string;
  timestamp: number;
}>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const REQUEST_DELAY = 100; // ms between requests
let lastRequestTime = 0;

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function initUnsplash(accessKey: string) {
  if (!accessKey) {
    throw new UnsplashConfigError('Unsplash access key is required');
  }

  try {
    console.log('Initializing Unsplash API with Client ID...');
    unsplashApi = createApi({
      accessKey,
      fetch: window.fetch,
    });
  } catch (error) {
    console.error('Failed to initialize Unsplash API:', error);
    throw new UnsplashConfigError('Failed to initialize Unsplash API');
  }
}

export async function getCountryImage(country: string): Promise<string> {
  if (!country?.trim()) {
    console.warn('Invalid country name provided');
    return DEFAULT_IMAGE;
  }

  // Clean up country name
  const cleanCountry = country.trim().toLowerCase();
  console.log('Getting image for country:', cleanCountry);

  if (!unsplashApi) {
    console.error('Unsplash API not initialized');
    return DEFAULT_IMAGE;
  }

  const cacheKey = `country-${cleanCountry}`;

  // Check cache
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached image for:', cleanCountry);
    return cached.url;
  }

  try {
    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_DELAY) {
      await delay(REQUEST_DELAY - (now - lastRequestTime));
    }
    lastRequestTime = now;

    // Build search query
    const searchQuery = `${cleanCountry} landmarks travel`;
    console.log('Unsplash search query:', searchQuery);

    const result = await unsplashApi.search.getPhotos({
      query: searchQuery,
      orientation: 'landscape',
      perPage: 1,
      contentFilter: 'high',
      orderBy: 'relevant'
    });

    if (result.type === 'error') {
      throw new UnsplashAPIError(
        result.errors?.[0] || 'Failed to fetch image',
        result.status
      );
    }

    if (!result.response?.results?.length) {
      console.warn('No images found for country:', cleanCountry);
      return DEFAULT_IMAGE;
    }

    const photo = result.response.results[0];
    const imageUrl = photo.urls.regular;

    console.log('Found image for', cleanCountry, ':', imageUrl);

    // Cache the result
    imageCache.set(cacheKey, {
      url: imageUrl,
      timestamp: Date.now()
    });

    return imageUrl;
  } catch (error) {
    console.error('Error fetching country image:', error);
    
    // Clear cache in case it's corrupted
    imageCache.delete(cacheKey);
    
    return DEFAULT_IMAGE;
  }
}