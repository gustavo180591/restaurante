import type { HttpError } from '@sveltejs/kit';

type ErrorWithMessage = {
  message: string;
  cause?: unknown;
  stack?: string;
};

export class AppError extends Error implements HttpError {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code || 'INTERNAL_SERVER_ERROR',
        message: this.message,
        ...(this.details && { details: this.details })
      }
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Credenciales inválidas') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export function getErrorStack(error: unknown) {
  if (error instanceof Error) {
    return error.stack;
  }
  return new Error().stack;
}

export function logError(error: unknown, context: Record<string, unknown> = {}) {
  const errorWithMessage = toErrorWithMessage(error);
  const stack = getErrorStack(error);
  
  console.error({
    timestamp: new Date().toISOString(),
    error: {
      name: errorWithMessage.name,
      message: errorWithMessage.message,
      stack,
      ...(errorWithMessage.cause && { cause: errorWithMessage.cause }),
      ...context
    }
  });
}

export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | ReturnType<AppError['toJSON']>> {
  return async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, { args: args.length > 0 ? args : undefined });
      
      if (error instanceof AppError) {
        return {
          status: error.status,
          body: error.toJSON()
        };
      }
      
      const appError = new AppError(
        'Ocurrió un error inesperado',
        500,
        'INTERNAL_SERVER_ERROR'
      );
      
      return {
        status: appError.status,
        body: appError.toJSON()
      };
    }
  };
}
