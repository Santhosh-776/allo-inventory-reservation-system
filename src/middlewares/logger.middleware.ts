import { NextRequest } from "next/server";
import { logger } from "../utils/logger";

/**
 * Logs incoming API requests with method, path, and timing info.
 * Call at the top of each route handler.
 */
export function logRequest(req: NextRequest): { startTime: number } {
    const startTime = Date.now();
    logger.info("Incoming request", {
        method: req.method,
        path: req.nextUrl.pathname,
        query: Object.fromEntries(req.nextUrl.searchParams.entries()),
        userAgent: req.headers.get("user-agent") ?? "unknown",
    });
    return { startTime };
}

/**
 * Logs the response time for a request.
 */
export function logResponse(
    req: NextRequest,
    statusCode: number,
    startTime: number,
): void {
    const duration = Date.now() - startTime;
    const logFn =
        statusCode >= 500
            ? logger.error
            : statusCode >= 400
              ? logger.warn
              : logger.info;

    logFn("Request completed", {
        method: req.method,
        path: req.nextUrl.pathname,
        statusCode,
        durationMs: duration,
    });
}
