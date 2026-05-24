import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";
import { sendError } from "../utils/response";

/**
 * Validates the request body against a Zod schema.
 * Returns the parsed data or a 422 error response.
 */
export async function validateBody<T>(
    req: NextRequest,
    schema: ZodSchema<T>,
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
    let body: unknown;

    try {
        body = await req.json();
    } catch {
        return {
            data: null,
            error: sendError("Invalid JSON body", 400, "INVALID_JSON"),
        };
    }

    const result = schema.safeParse(body);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return {
            data: null,
            error: sendError(
                "Validation failed",
                422,
                "VALIDATION_ERROR",
                fieldErrors,
            ),
        };
    }

    return { data: result.data, error: null };
}

/**
 * Validates URL search params against a Zod schema.
 */
export function validateQuery<T>(
    req: NextRequest,
    schema: ZodSchema<T>,
): { data: T; error: null } | { data: null; error: NextResponse } {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = schema.safeParse(searchParams);

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return {
            data: null,
            error: sendError(
                "Invalid query parameters",
                422,
                "VALIDATION_ERROR",
                fieldErrors,
            ),
        };
    }

    return { data: result.data, error: null };
}

/**
 * Extracts and validates the Idempotency-Key header.
 */
export function extractIdempotencyKey(req: NextRequest): string | null {
    return req.headers.get("Idempotency-Key");
}

/**
 * Validates that a required header is present.
 */
export function requireHeader(
    req: NextRequest,
    headerName: string,
): { value: string; error: null } | { value: null; error: NextResponse } {
    const value = req.headers.get(headerName);
    if (!value) {
        return {
            value: null,
            error: sendError(
                `Missing required header: ${headerName}`,
                400,
                "MISSING_HEADER",
            ),
        };
    }
    return { value, error: null };
}

// Re-export zod for convenience in controllers
export { z };
