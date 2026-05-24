import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./AppError";
import { sendError } from "./response";
import { logger } from "./logger";

type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

/**
 * Wraps an async route handler and catches all errors, routing them through
 * the centralized error handler. This eliminates try/catch boilerplate in
 * every controller.
 */
export function asyncHandler(handler: RouteHandler): RouteHandler {
  return async (
    req: NextRequest,
    context?: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Centralized error handler — translates AppError and unexpected errors
 * into standardized API responses.
 */
export function handleError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    if (!error.isOperational) {
      logger.error("Non-operational AppError (programming bug):", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      logger.warn("Operational error returned to client:", {
        message: error.message,
        statusCode: error.statusCode,
        code: error.code,
      });
    }
    return sendError(error.message, error.statusCode, error.code);
  }

  if (error instanceof Error) {
    logger.error("Unhandled error in route handler:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    logger.error("Unknown thrown value:", { error });
  }

  return sendError(
    "An unexpected error occurred. Please try again.",
    500,
    "INTERNAL_SERVER_ERROR"
  );
}
