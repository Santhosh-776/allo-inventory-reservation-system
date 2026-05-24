import { Redis } from "@upstash/redis";
import { logger } from "./logger";

let redisClient: Redis | null = null;

/**
 * Returns a singleton Upstash Redis client.
 * Lazily initialized on first use.
 */
export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Upstash Redis configuration. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }

  redisClient = new Redis({ url, token });
  logger.info("Redis client initialized");
  return redisClient;
}

// ─── Distributed Lock Utilities ──────────────────────────────────────────────

const LOCK_TTL_SECONDS = 30; // Maximum lock hold time (safety net)

/**
 * Acquires a distributed Redis lock using SET NX EX.
 * Returns the lock value (used to safely release) or null if lock is taken.
 */
export async function acquireLock(
  lockKey: string,
  ttlSeconds: number = LOCK_TTL_SECONDS
): Promise<string | null> {
  const redis = getRedisClient();
  const lockValue = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // SET key value NX EX ttl — atomic "set if not exists"
  const result = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: ttlSeconds,
  });

  if (result === "OK") {
    logger.debug("Distributed lock acquired", { lockKey, lockValue });
    return lockValue;
  }

  logger.debug("Distributed lock NOT acquired (held by another process)", {
    lockKey,
  });
  return null;
}

/**
 * Releases a Redis lock ONLY if we are still the owner.
 * Uses a Lua script for atomic check-and-delete.
 */
export async function releaseLock(
  lockKey: string,
  lockValue: string
): Promise<void> {
  const redis = getRedisClient();

  // Atomic Lua: only delete if value matches (prevents releasing another holder's lock)
  const luaScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  const result = await redis.eval(luaScript, [lockKey], [lockValue]);

  if (result === 1) {
    logger.debug("Distributed lock released", { lockKey });
  } else {
    logger.warn("Lock release skipped — lock expired or owned by another process", {
      lockKey,
    });
  }
}

/**
 * Runs a callback while holding a distributed Redis lock.
 * Automatically releases the lock after the callback (success or failure).
 */
export async function withLock<T>(
  lockKey: string,
  fn: () => Promise<T>,
  ttlSeconds: number = LOCK_TTL_SECONDS
): Promise<{ acquired: boolean; result?: T }> {
  const lockValue = await acquireLock(lockKey, ttlSeconds);

  if (!lockValue) {
    return { acquired: false };
  }

  try {
    const result = await fn();
    return { acquired: true, result };
  } finally {
    await releaseLock(lockKey, lockValue);
  }
}

/**
 * Cache a value in Redis with optional TTL.
 */
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const redis = getRedisClient();
  const serialized = JSON.stringify(value);

  if (ttlSeconds) {
    await redis.set(key, serialized, { ex: ttlSeconds });
  } else {
    await redis.set(key, serialized);
  }
}

/**
 * Get a cached value from Redis.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();
  const value = await redis.get<string>(key);

  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as unknown as T;
  }
}

/**
 * Delete a cached value from Redis.
 */
export async function cacheDel(key: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(key);
}
