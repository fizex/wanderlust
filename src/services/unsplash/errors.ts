export class UnsplashError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'UnsplashError';
  }
}