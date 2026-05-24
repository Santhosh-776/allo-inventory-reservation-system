import { NextRequest, NextResponse } from "next/server";
import { sendSuccess } from "../utils/response";
import { asyncHandler } from "../utils/asyncHandler";
import {
    validateBody,
    extractIdempotencyKey,
} from "../middlewares/validation.middleware";
import { logRequest } from "../middlewares/logger.middleware";
import { CreateReservationSchema } from "../validators/reservation.validator";
import * as reservationService from "../services/reservation.service";
import {
    checkIdempotencyKey,
    storeIdempotencyResponse,
    hashRequestBody,
} from "../services/idempotency.service";

/**
 * POST /api/v1/reservations
 *
 * Creates a new inventory reservation.
 * Supports idempotency via the Idempotency-Key header.
 * Concurrency-safe via Redis distributed lock.
 */
export const createReservationController = asyncHandler(
    async (req: NextRequest): Promise<NextResponse> => {
        logRequest(req);

        // ── Idempotency check ───────────────────────────────────────────────────
        const idempotencyKey = extractIdempotencyKey(req);

        if (idempotencyKey) {
            const cached = await checkIdempotencyKey(idempotencyKey);
            if (cached?.found) {
                return NextResponse.json(cached.responseBody, {
                    status: cached.statusCode,
                    headers: { "X-Idempotent-Replayed": "true" },
                });
            }
        }

        // ── Validation ──────────────────────────────────────────────────────────
        const { data, error } = await validateBody(
            req,
            CreateReservationSchema,
        );
        if (error) return error;

        // ── Service call ────────────────────────────────────────────────────────
        const reservation = await reservationService.createReservation(data);

        const responseBody = {
            success: true,
            message: "Reservation created successfully",
            data: reservation,
        };

        // ── Store idempotency result ─────────────────────────────────────────────
        if (idempotencyKey) {
            const requestHash = hashRequestBody(data);
            await storeIdempotencyResponse(
                idempotencyKey,
                requestHash,
                responseBody,
                201,
            );
        }

        return sendSuccess(
            reservation,
            "Reservation created successfully",
            201,
        );
    },
);

/**
 * POST /api/v1/reservations/:id/confirm
 *
 * Confirms a PENDING reservation — permanently decrements stock.
 */
export const confirmReservationController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> => {
        logRequest(req);
        const params = await context?.params;
        const reservationId = params?.id ?? "";

        const reservation =
            await reservationService.confirmReservation(reservationId);

        return sendSuccess(reservation, "Reservation confirmed successfully");
    },
);

/**
 * POST /api/v1/reservations/:id/release
 *
 * Releases a PENDING reservation — restores reserved stock.
 */
export const releaseReservationController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> => {
        logRequest(req);
        const params = await context?.params;
        const reservationId = params?.id ?? "";

        const reservation =
            await reservationService.releaseReservation(reservationId);

        return sendSuccess(reservation, "Reservation released successfully");
    },
);

/**
 * GET /api/v1/reservations/:id
 *
 * Gets a single reservation's current state.
 */
export const getReservationController = asyncHandler(
    async (
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> },
    ): Promise<NextResponse> => {
        logRequest(req);
        const params = await context?.params;
        const reservationId = params?.id ?? "";

        const reservation =
            await reservationService.getReservation(reservationId);

        return sendSuccess(reservation, "Reservation retrieved successfully");
    },
);
