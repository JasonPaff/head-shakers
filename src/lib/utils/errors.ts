export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const createValidationError = (field: string, message: string) =>
  new AppError(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR', 400, { field });
