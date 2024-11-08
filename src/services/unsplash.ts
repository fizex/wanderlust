import { createApi } from 'unsplash-js';

let unsplashApi: ReturnType<typeof createApi> | null = null;

export function initUnsplash(accessKey: string) {
  if (!accessKey) {
    console.warn('Unsplash access key not provided');
    return;
  }
  
  unsplashApi = createApi({
    accessKey,
    fetch: fetch,
  });
}

// Cache for storing fetched images to avoid repeated API calls
const imageCache = new Map<string, string>();

// Default images for fallback
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2'
];

export async function getCountryImage(country: string): Promise<string> {
  if (!country || !unsplashApi) {
    return getDefaultImage();
  }

  const cacheKey = `country-${country.toLowerCase()}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const result = await unsplashApi.search.getPhotos({
      query: `${country} landmarks travel`,
      orientation: 'landscape',
      perPage: 1
    });

    if (result.errors || !result.response) {
      throw new Error(result.errors?.[0] || 'Failed to fetch image');
    }

    const photo = result.response.results[0];
    if (!photo) {
      return getDefaultImage();
    }

    const imageUrl = photo.urls.regular;
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching country image:', error);
    return getDefaultImage();
  }
}

export async function getCityImage(city: string): Promise<string> {
  if (!city || !unsplashApi) {
    return getDefaultImage();
  }

  const cacheKey = `city-${city.toLowerCase()}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  try {
    const result = await unsplashApi.search.getPhotos({
      query: `${city} cityscape landmark`,
      orientation: 'landscape',
      perPage: 1
    });

    if (result.errors || !result.response) {
      throw new Error(result.errors?.[0] || 'Failed to fetch image');
    }

    const photo = result.response.results[0];
    if (!photo) {
      return getDefaultImage();
    }

    const imageUrl = photo.urls.regular;
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching city image:', error);
    return getDefaultImage();
  }
}

function getDefaultImage(): string {
  return DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
}