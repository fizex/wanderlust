export class OpenAIServiceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'OpenAIServiceError';
  }
}

export class ValidationError extends OpenAIServiceError {
  constructor(message: string, public invalidData?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ResponseParseError extends OpenAIServiceError {
  constructor(message: string, public rawResponse?: string) {
    super(message);
    this.name = 'ResponseParseError';
  }
}

export class RetryError extends OpenAIServiceError {
  constructor(message: string, public attempts: number) {
    super(message);
    this.name = 'RetryError';
  }
}