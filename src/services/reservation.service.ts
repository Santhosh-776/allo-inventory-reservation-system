import prisma from "../lib/prisma";
import { logger } from "../utils/logger";
import { withLock } from "../utils/redis";
import { AppError } from "../utils/AppError";
import { ReservationWithDetails } from "../types";

const RESERVATION_TTL_MINUTES = 10;
const LOCK_TTL_SECONDS = 30;

/**
 * Builds the distributed lock key for a product+warehouse combination.
 * Ensures only one reservation operation at a time per inventory slot.
 */
function buildLockKey(productId: string, warehouseId: string): string {
    return `reservation:${productId}:${warehouseId}`;
}

/**
 * Enriches a raw Prisma Reservation with product and warehouse details.
 */
async function getReservationWithDetails(
    reservationId: string,
): Promise<ReservationWithDetails> {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
            product: {
                select: { id: true, name: true, sku: true, price: true },
            },
            warehouse: {
                select: { id: true, name: true, code: true, city: true },
            },
        },
    });

    if (!reservation) {
        throw AppError.notFound("Reservation");
    }

    return {
        ...reservation,
        product: {
            ...reservation.product,
            price: reservation.product.price.toString(),
        },
    };
}

// ─── Create Reservation ──────────────────────────────────────────────────────

interface CreateReservationParams {
    productId: string;
    warehouseId: string;
    quantity: number;
}

/**
 * Creates a reservation with distributed locking and Prisma transaction.
 *
 * Flow:
 *  1. Acquire Redis lock (SET NX EX) → guarantees serialized access per slot
 *  2. Start Prisma transaction
 *  3. Re-read inventory inside transaction (consistent read)
 *  4. Check available stock (totalStock - reservedStock)
 *  5. Throw 409 if insufficient
 *  6. Atomically increment reservedStock
 *  7. Create reservation record
 *  8. Commit transaction
 *  9. Release Redis lock
 */
export async function createReservation(
    params: CreateReservationParams,
): Promise<ReservationWithDetails> {
    const { productId, warehouseId, quantity } = params;
    const lockKey = buildLockKey(productId, warehouseId);

    // Verify product and warehouse exist before locking
    const [product, warehouse] = await Promise.all([
        prisma.product.findUnique({ where: { id: productId, isActive: true } }),
        prisma.warehouse.findUnique({
            where: { id: warehouseId, isActive: true },
        }),
    ]);

    if (!product) throw AppError.notFound("Product");
    if (!warehouse) throw AppError.notFound("Warehouse");

    logger.info("Attempting to acquire lock for reservation", {
        lockKey,
        quantity,
    });

    const { acquired, result } = await withLock(
        lockKey,
        async () => {
            // ── Inside the lock: serialize all concurrent requests ──────────────────
            return await prisma.$transaction(async (tx) => {
                // Re-read inventory with a fresh consistent read inside the transaction
                const inventory = await tx.inventory.findUnique({
                    where: {
                        productId_warehouseId: { productId, warehouseId },
                    },
                });

                if (!inventory) {
                    throw AppError.notFound(
                        `Inventory for product ${productId} at warehouse ${warehouseId}`,
                    );
                }

                const availableStock =
                    inventory.totalStock - inventory.reservedStock;

                logger.debug("Stock check inside lock+transaction", {
                    productId,
                    warehouseId,
                    totalStock: inventory.totalStock,
                    reservedStock: inventory.reservedStock,
                    availableStock,
                    requested: quantity,
                });

                if (availableStock < quantity) {
                    throw AppError.conflict(
                        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`,
                        "INSUFFICIENT_STOCK",
                    );
                }

                // Atomically increment reservedStock
                await tx.inventory.update({
                    where: {
                        productId_warehouseId: { productId, warehouseId },
                    },
                    data: {
                        reservedStock: { increment: quantity },
                    },
                });

                // Create the reservation record
                const expiresAt = new Date(
                    Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000,
                );

                const reservation = await tx.reservation.create({
                    data: {
                        productId,
                        warehouseId,
                        quantity,
                        status: "PENDING",
                        expiresAt,
                    },
                });

                logger.info("Reservation created successfully", {
                    reservationId: reservation.id,
                    productId,
                    warehouseId,
                    quantity,
                    expiresAt,
                });

                return reservation.id;
            }); // end $transaction
        },
        LOCK_TTL_SECONDS,
    );

    if (!acquired) {
        logger.warn("Failed to acquire lock — another operation in progress", {
            lockKey,
        });
        throw AppError.conflict(
            "Another reservation is being processed for this item. Please try again in a moment.",
            "LOCK_CONTENTION",
        );
    }

    // Fetch the full reservation with relations for the response
    return getReservationWithDetails(result!);
}

// ─── Confirm Reservation ─────────────────────────────────────────────────────

/**
 * Confirms a PENDING reservation, permanently decrementing totalStock.
 * Performs lazy expiry check — returns 410 if the reservation has expired.
 */
export async function confirmReservation(
    reservationId: string,
): Promise<ReservationWithDetails> {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
    });

    if (!reservation) throw AppError.notFound("Reservation");

    // Lazy expiry check
    if (reservation.status === "EXPIRED") {
        throw AppError.gone("Reservation has already expired");
    }

    if (reservation.status === "CONFIRMED") {
        throw AppError.conflict(
            "Reservation is already confirmed",
            "ALREADY_CONFIRMED",
        );
    }

    if (reservation.status === "RELEASED") {
        throw AppError.conflict(
            "Reservation has already been released",
            "ALREADY_RELEASED",
        );
    }

    // Real-time expiry check (reservation may have expired since last cleanup)
    if (
        reservation.status === "PENDING" &&
        new Date() > reservation.expiresAt
    ) {
        // Lazily mark as expired
        await prisma.$transaction([
            prisma.reservation.update({
                where: { id: reservationId },
                data: { status: "EXPIRED" },
            }),
            prisma.inventory.update({
                where: {
                    productId_warehouseId: {
                        productId: reservation.productId,
                        warehouseId: reservation.warehouseId,
                    },
                },
                data: { reservedStock: { decrement: reservation.quantity } },
            }),
        ]);

        throw AppError.gone(
            "Reservation has expired. Please create a new reservation.",
        );
    }

    // Confirm: decrement totalStock and reservedStock, mark CONFIRMED
    await prisma.$transaction([
        prisma.inventory.update({
            where: {
                productId_warehouseId: {
                    productId: reservation.productId,
                    warehouseId: reservation.warehouseId,
                },
            },
            data: {
                totalStock: { decrement: reservation.quantity },
                reservedStock: { decrement: reservation.quantity },
            },
        }),
        prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: "CONFIRMED",
                confirmedAt: new Date(),
            },
        }),
    ]);

    logger.info("Reservation confirmed", {
        reservationId,
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
        quantity: reservation.quantity,
    });

    return getReservationWithDetails(reservationId);
}

// ─── Release Reservation ─────────────────────────────────────────────────────

/**
 * Releases a PENDING reservation, restoring reserved stock.
 */
export async function releaseReservation(
    reservationId: string,
): Promise<ReservationWithDetails> {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
    });

    if (!reservation) throw AppError.notFound("Reservation");

    if (reservation.status === "RELEASED") {
        throw AppError.conflict(
            "Reservation is already released",
            "ALREADY_RELEASED",
        );
    }

    if (reservation.status === "CONFIRMED") {
        throw AppError.conflict(
            "Cannot release a confirmed reservation. Stock has been permanently decremented.",
            "CANNOT_RELEASE_CONFIRMED",
        );
    }

    if (reservation.status === "EXPIRED") {
        throw AppError.gone(
            "Reservation has already expired and stock was returned",
        );
    }

    // Release: decrement reservedStock, mark RELEASED
    await prisma.$transaction([
        prisma.inventory.update({
            where: {
                productId_warehouseId: {
                    productId: reservation.productId,
                    warehouseId: reservation.warehouseId,
                },
            },
            data: {
                reservedStock: { decrement: reservation.quantity },
            },
        }),
        prisma.reservation.update({
            where: { id: reservationId },
            data: {
                status: "RELEASED",
                releasedAt: new Date(),
            },
        }),
    ]);

    logger.info("Reservation released", {
        reservationId,
        productId: reservation.productId,
        warehouseId: reservation.warehouseId,
        quantity: reservation.quantity,
    });

    return getReservationWithDetails(reservationId);
}

// ─── Get Reservation ─────────────────────────────────────────────────────────

export async function getReservation(
    reservationId: string,
): Promise<ReservationWithDetails> {
    return getReservationWithDetails(reservationId);
}

// ─── Cleanup Expired Reservations ────────────────────────────────────────────

interface CleanupResult {
    expiredCount: number;
    reservationIds: string[];
}

/**
 * Finds all PENDING reservations past their expiresAt, releases stock,
 * and marks them EXPIRED. Called by the Vercel Cron job every minute.
 */
export async function cleanupExpiredReservations(): Promise<CleanupResult> {
    const now = new Date();

    // Find all expired PENDING reservations
    const expiredReservations = await prisma.reservation.findMany({
        where: {
            status: "PENDING",
            expiresAt: { lt: now },
        },
        select: {
            id: true,
            productId: true,
            warehouseId: true,
            quantity: true,
        },
    });

    if (expiredReservations.length === 0) {
        logger.info("No expired reservations to clean up");
        return { expiredCount: 0, reservationIds: [] };
    }

    logger.info("Cleaning up expired reservations", {
        count: expiredReservations.length,
    });

    // Process each expiry in a transaction to ensure atomicity
    const reservationIds: string[] = [];

    for (const reservation of expiredReservations) {
        await prisma.$transaction([
            prisma.inventory.update({
                where: {
                    productId_warehouseId: {
                        productId: reservation.productId,
                        warehouseId: reservation.warehouseId,
                    },
                },
                data: {
                    reservedStock: { decrement: reservation.quantity },
                },
            }),
            prisma.reservation.update({
                where: { id: reservation.id },
                data: { status: "EXPIRED" },
            }),
        ]);

        reservationIds.push(reservation.id);
    }

    logger.info("Expired reservations cleaned up", {
        expiredCount: expiredReservations.length,
        reservationIds,
    });

    return { expiredCount: expiredReservations.length, reservationIds };
}
