import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const createRatelimit = (requests: number, window: `${number} ${'s' | 'm' | 'h' | 'd'}`) => {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as any),
    analytics: true,
    prefix: "techbox:ratelimit",
  });
};

// In-memory sliding window fallback when Redis is unavailable.
// Per-process only — on Vercel each serverless function invocation is isolated,
// so this is a soft limit (good enough for dev; Redis is preferred for production).
const memoryBuckets = new Map<string, { timestamps: number[] }>();

function checkMemoryLimit(
  identifier: string,
  limiterKey: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; limit: number; remaining: number } {
  const key = `${limiterKey}:${identifier}`;
  const now = Date.now();
  let bucket = memoryBuckets.get(key);

  if (!bucket) {
    bucket = { timestamps: [] };
    memoryBuckets.set(key, bucket);
  }

  // Remove expired entries
  bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);

  if (bucket.timestamps.length >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0 };
  }

  bucket.timestamps.push(now);
  return { success: true, limit: maxRequests, remaining: maxRequests - bucket.timestamps.length };
}

// Rate limiters per endpoint — config defines both Redis and in-memory limits
const limiters = {
  login:          { redis: createRatelimit(5, "1 m"),   memMax: 5,   memWindowMs: 60_000 },
  register:       { redis: createRatelimit(3, "10 m"),  memMax: 3,   memWindowMs: 600_000 },
  comments:       { redis: createRatelimit(10, "1 m"),  memMax: 10,  memWindowMs: 60_000 },
  like:           { redis: createRatelimit(30, "1 m"),  memMax: 30,  memWindowMs: 60_000 },
  rating:         { redis: createRatelimit(20, "1 m"),  memMax: 20,  memWindowMs: 60_000 },
  upload:         { redis: createRatelimit(10, "1 m"),  memMax: 10,  memWindowMs: 60_000 },
  chat:           { redis: createRatelimit(15, "1 m"),  memMax: 15,  memWindowMs: 60_000 },
  views:          { redis: createRatelimit(30, "1 m"),  memMax: 30,  memWindowMs: 60_000 },
  jobs:           { redis: createRatelimit(3, "1 h"),   memMax: 3,   memWindowMs: 3_600_000 },
  contact:        { redis: createRatelimit(3, "1 h"),   memMax: 3,   memWindowMs: 3_600_000 },
  forgotPassword: { redis: createRatelimit(3, "1 h"),   memMax: 3,   memWindowMs: 3_600_000 },
  resetPassword:  { redis: createRatelimit(5, "1 h"),   memMax: 5,   memWindowMs: 3_600_000 },
  newsletter:     { redis: createRatelimit(3, "1 h"),   memMax: 3,   memWindowMs: 3_600_000 },
};

export type RateLimiterKey = keyof typeof limiters;

export async function checkRateLimit(
  identifier: string,
  limiterKey: RateLimiterKey
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const config = limiters[limiterKey];

  if (!config) {
    return { success: true };
  }

  // Use Redis rate limiter when available
  if (config.redis) {
    const result = await config.redis.limit(identifier);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  // Fallback to in-memory sliding window
  return checkMemoryLimit(identifier, limiterKey, config.memMax, config.memWindowMs);
}

/**
 * Extract client IP from request headers.
 * On Vercel, the last entry in x-forwarded-for is set by the platform (trusted).
 * The first entry can be spoofed by the client, so we prefer the last.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // On Vercel, the rightmost value is the platform-injected client IP.
    // x-forwarded-for format: client, proxy1, proxy2, ... , vercel-proxy
    const parts = forwarded.split(",").map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      // Use last entry (trusted platform IP) when behind Vercel/proxy chain
      return parts[parts.length - 1];
    }
  }
  return request.headers.get("x-real-ip") || "unknown";
}
