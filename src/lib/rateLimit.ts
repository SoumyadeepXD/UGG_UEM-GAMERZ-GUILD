/**
 * Serverless-compatible Rate Limiting for Next.js Route Handlers and Server Actions.
 * 
 * Supports:
 * 1. Upstash Redis REST API when UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set.
 * 2. Sliding-window in-memory fallback for local development or unconfigured Redis.
 * 3. Extraction of Vercel trusted client-IP headers (x-vercel-forwarded-for, x-real-ip).
 */

export interface RateLimitOptions {
  windowMs: number; // Window size in milliseconds
  max: number; // Max requests allowed per window
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// In-memory sliding window fallback store
interface MemoryRecord {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryRecord>();

// Periodic in-memory cleanup to prevent memory leaks in dev
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 300000);
      if (record.timestamps.length === 0) {
        memoryStore.delete(key);
      }
    }
  }, 300000);
}

function memoryRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  let record = memoryStore.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(identifier, record);
  }

  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= options.max) {
    const oldestTimestamp = record.timestamps[0] || now;
    const reset = Math.ceil((oldestTimestamp + options.windowMs - now) / 1000);
    return {
      success: false,
      limit: options.max,
      remaining: 0,
      reset: Math.max(1, reset),
    };
  }

  record.timestamps.push(now);
  const remaining = options.max - record.timestamps.length;
  const reset = Math.ceil(options.windowMs / 1000);

  return {
    success: true,
    limit: options.max,
    remaining,
    reset,
  };
}

/**
 * Async rate limiter with Upstash Redis serverless support and local memory fallback.
 */
export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, max: 30 }
): Promise<RateLimitResult> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const windowSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
      const key = `ugg:ratelimit:${identifier}:${Math.floor(Date.now() / options.windowMs)}`;

      // Upstash REST Pipeline: INCR + EXPIRE
      const pipelineRes = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, windowSeconds],
        ]),
        cache: "no-store",
      });

      if (pipelineRes.ok) {
        const results = await pipelineRes.json();
        const count = typeof results[0]?.result === "number" ? results[0].result : 1;
        const success = count <= options.max;
        const remaining = Math.max(0, options.max - count);

        return {
          success,
          limit: options.max,
          remaining,
          reset: windowSeconds,
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limit request failed; falling back to memory:", err);
    }
  }

  // Graceful fallback to memory store
  return memoryRateLimit(identifier, options);
}

/**
 * Extracts the trusted client IP from request headers.
 * Prioritizes Vercel's trusted headers over general forwarded-for.
 */
export function getClientIp(headers: Headers): string {
  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}
