/**
 * Custom application error class.
 * Thrown from the service layer to signal known, predictable failures.
 * The global error middleware translates this into the standardized API response.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Preserve prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  /** 400 Bad Request */
  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, code ?? "BAD_REQUEST");
  }

  /** 401 Unauthorized */
  static unauthorized(message: string = "Unauthorized"): AppError {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  /** 403 Forbidden */
  static forbidden(message: string = "Forbidden"): AppError {
    return new AppError(message, 403, "FORBIDDEN");
  }

  /** 404 Not Found */
  static notFound(resource: string = "Resource"): AppError {
    return new AppError(`${resource} not found`, 404, "NOT_FOUND");
  }

  /** 409 Conflict — used for insufficient stock */
  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, code ?? "CONFLICT");
  }

  /** 410 Gone — used for expired reservations */
  static gone(message: string): AppError {
    return new AppError(message, 410, "GONE");
  }

  /** 422 Unprocessable Entity */
  static unprocessable(message: string): AppError {
    return new AppError(message, 422, "UNPROCESSABLE_ENTITY");
  }

  /** 429 Too Many Requests */
  static tooManyRequests(message: string = "Too many requests"): AppError {
    return new AppError(message, 429, "TOO_MANY_REQUESTS");
  }

  /** 500 Internal Server Error */
  static internal(message: string = "Internal server error"): AppError {
    return new AppError(message, 500, "INTERNAL_SERVER_ERROR", false);
  }
}
