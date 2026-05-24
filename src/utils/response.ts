import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: object;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Sends a standardized success response.
 */
export function sendSuccess<T>(
  data: T,
  message: string = "Success",
  statusCode: number = 200,
  meta?: object
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {}),
    } as ApiSuccessResponse<T>,
    { status: statusCode }
  );
}

/**
 * Sends a standardized error response.
 */
export function sendError(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        ...(code ? { code } : {}),
        ...(details ? { details } : {}),
      },
    } as ApiErrorResponse,
    { status: statusCode }
  );
}
