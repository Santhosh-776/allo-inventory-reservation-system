import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";
import { createHash } from "crypto";

const IDEMPOTENCY_TTL_HOURS = 24;

interface IdempotencyRecord {
    responseBody: unknown;
    statusCode: number;
    found: boolean;
}

/**
 * Creates a hash of the request content to detect duplicate requests
 * with the same key but different bodies.
 */
export function hashRequestBody(body: unknown): string {
    return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

/**
 * Checks if an idempotency key has been used before.
 * Returns the cached response if found, null otherwise.
 */
export async function checkIdempotencyKey(
    key: string,
): Promise<IdempotencyRecord | null> {
    const record = await prisma.idempotencyKey.findUnique({
        where: { key },
    });

    if (!record) return null;

    // Check if the idempotency key has expired
    if (new Date() > record.expiresAt) {
        await prisma.idempotencyKey.delete({ where: { key } });
        return null;
    }

    logger.info("Idempotency key hit — returning cached response", { key });

    return {
        responseBody: record.responseBody,
        statusCode: record.statusCode,
        found: true,
    };
}

/**
 * Stores the response for an idempotency key.
 */
export async function storeIdempotencyResponse(
    key: string,
    requestHash: string,
    responseBody: unknown,
    statusCode: number,
): Promise<void> {
    const expiresAt = new Date(
        Date.now() + IDEMPOTENCY_TTL_HOURS * 60 * 60 * 1000,
    );

    await prisma.idempotencyKey.upsert({
        where: { key },
        update: {
            requestHash,
            responseBody: responseBody as never,
            statusCode,
            expiresAt,
        },
        create: {
            key,
            requestHash,
            responseBody: responseBody as never,
            statusCode,
            expiresAt,
        },
    });

    logger.debug("Idempotency key stored", { key, statusCode });
}
