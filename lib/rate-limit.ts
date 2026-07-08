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

// Rate limiters per endpoint
export const rateLimiters = {
  login: createRatelimit(5, "1 m"),           // 5 attempts per minute
  register: createRatelimit(3, "10 m"),       // 3 registrations per 10 minutes
  comments: createRatelimit(10, "1 m"),       // 10 comments per minute
  like: createRatelimit(30, "1 m"),           // 30 likes per minute
  rating: createRatelimit(20, "1 m"),         // 20 ratings per minute
  upload: createRatelimit(10, "1 m"),         // 10 uploads per minute
  chat: createRatelimit(15, "1 m"),           // 15 chat messages per minute
};

export async function checkRateLimit(
  identifier: string,
  limiterKey: keyof typeof rateLimiters
): Promise<{ success: boolean; limit?: number; remaining?: number; reset?: number }> {
  const limiter = rateLimiters[limiterKey];
  
  if (!limiter) {
    // No Redis configured — allow in development
    return { success: true };
  }

  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") || "unknown";
}
