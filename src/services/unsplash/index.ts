import { createApi } from 'unsplash-js';
import { UnsplashAPIError, UnsplashConfigError } from './errors';

let unsplashApi: ReturnType<typeof createApi> | null = null;

// Simple cache for storing fetched images
const imageCache = new Map<string, {
  url: string;
  timestamp: number;
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const REQUEST_DELAY = 100; // ms between requests
let lastRequestTime = 0;

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
  if (!country?.trim() || !unsplashApi) {
    throw new UnsplashConfigError('Invalid country input or Unsplash not initialized');
  }

  const cacheKey = `country-${country.toLowerCase()}`;

  // Check cache
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached image for:', country);
    return cached.url;
  }

  try {
    // Rate limiting
    const now = Date.now();
    if (now - lastRequestTime < REQUEST_DELAY) {
      await delay(REQUEST_DELAY - (now - lastRequestTime));
    }
    lastRequestTime = now;

    console.log('Fetching image for country:', country);
    
    const result = await unsplashApi.search.getPhotos({
      query: `${country} landmarks travel`,
      orientation: 'landscape',
      perPage: 1,
      contentFilter: 'high',
      orderBy: 'relevant'
    });

    if (result.type === 'error') {
      throw new UnsplashAPIError(result.errors?.[0] || 'Failed to fetch image');
    }

    if (!result.response?.results?.length) {
      throw new UnsplashAPIError('No images found');
    }

    const imageUrl = result.response.results[0].urls.regular;
    console.log('Received image URL:', imageUrl);

    // Cache the result
    imageCache.set(cacheKey, {
      url: imageUrl,
      timestamp: Date.now()
    });

    return imageUrl;
  } catch (error) {
    console.error('Error fetching country image:', error);
    throw error;
  }
}