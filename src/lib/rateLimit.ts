type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export const RATE_LIMITS = {
  upload: { limit: 10, windowMs: 10 * 60 * 1000 },
  retrieve: { limit: 30, windowMs: 5 * 60 * 1000 },
  generate: { limit: 20, windowMs: 5 * 60 * 1000 },
} as const;

export function resetRateLimits(): void {
  buckets.clear();
}

/**
 * Best-effort per-instance limiter. Serverless replicas do not share this map.
 */
export function assertRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): void {
  if (buckets.size > 10_000) {
    buckets.clear();
  }

  const entry = buckets.get(key);
  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new Error("Too many requests. Please try again later.");
  }

  entry.count += 1;
}
