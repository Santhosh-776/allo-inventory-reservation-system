import { NextRequest, NextResponse } from "next/server";
import { cleanupExpiredReservations } from "../../../../services/reservation.service";
import { sendSuccess, sendError } from "../../../../utils/response";
import { logger } from "../../../../utils/logger";

/**
 * POST /api/internal/cleanup-expired-reservations
 *
 * Called by Vercel Cron every minute (see vercel.json).
 * Finds all PENDING reservations past expiresAt, releases stock, marks EXPIRED.
 *
 * Protected by CRON_SECRET header to prevent unauthorized calls.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
    // Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        logger.warn("Unauthorized cron job call attempt", {
            path: req.nextUrl.pathname,
        });
        return sendError("Unauthorized", 401, "UNAUTHORIZED");
    }

    try {
        logger.info("Cron: Starting expired reservation cleanup");

        const result = await cleanupExpiredReservations();

        logger.info("Cron: Cleanup completed", {
            expiredCount: result.expiredCount,
            ids: result.reservationIds,
        });

        return sendSuccess(
            result as object,
            "Expired reservations cleaned up successfully",
        );
    } catch (error) {
        logger.error("Cron: Cleanup failed", {
            error: error instanceof Error ? error.message : String(error),
        });
        return sendError("Cleanup failed", 500, "CLEANUP_FAILED");
    }
}
