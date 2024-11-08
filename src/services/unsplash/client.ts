import { UnsplashError } from './errors';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    regular: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
}

export class UnsplashClient {
  private cache: Map<string, string[]> = new Map();
  
  constructor(private accessKey: string) {
    if (!accessKey) {
      throw new UnsplashError('Unsplash access key is required');
    }
  }

  async searchPhotos(query: string, count: number = 5): Promise<string[]> {
    const cacheKey = `${query}-${count}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: count.toString(),
        orientation: 'landscape',
        content_filter: 'high',
        order_by: 'relevant'
      });

      const response = await fetch(
        `${UNSPLASH_API_URL}?${params}`,
        {
          headers: {
            'Authorization': `Client-ID ${this.accessKey}`
          }
        }
      );

      if (!response.ok) {
        throw new UnsplashError(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json() as UnsplashSearchResponse;
      
      if (!data.results.length) {
        throw new UnsplashError('No images found');
      }

      // Filter results to prioritize images with matching location data
      const photos = data.results
        .sort((a, b) => {
          const aHasLocation = a.location?.country || a.location?.city;
          const bHasLocation = b.location?.country || b.location?.city;
          return (bHasLocation ? 1 : 0) - (aHasLocation ? 1 : 0);
        })
        .map(photo => photo.urls.regular);

      this.cache.set(cacheKey, photos);
      return photos;
    } catch (error) {
      if (error instanceof UnsplashError) throw error;
      throw new UnsplashError('Failed to fetch images from Unsplash', error as Error);
    }
  }
}