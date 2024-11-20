export class UnsplashError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'UnsplashError';
  }
}

export class UnsplashConfigError extends UnsplashError {
  constructor(message: string) {
    super(message);
    this.name = 'UnsplashConfigError';
  }
}

export class UnsplashAPIError extends UnsplashError {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'UnsplashAPIError';
  }
}