// lib/rate-limiter.ts
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

interface RateLimitConfig {
  requests: number;
  window: number; // in seconds
  identifier?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

export class RateLimiter {
  // Different rate limits for different operations
  static readonly configs = {
    qr_generation: { requests: 30, window: 60 }, // 30 QR codes per minute
    qr_save: { requests: 10, window: 60 }, // 10 saves per minute
    shortcode_generation: { requests: 50, window: 60 }, // 50 shortcodes per minute
    webhook: { requests: 100, window: 60 }, // 100 webhook requests per minute
    api_general: { requests: 100, window: 60 }, // General API rate limit
    user_registration: { requests: 3, window: 3600 }, // 3 registrations per hour
  } as const;

  static async checkLimit(
    operation: keyof typeof RateLimiter.configs,
    identifier: string,
    customConfig?: Partial<RateLimitConfig>,
  ): Promise<RateLimitResult> {
    const config = { ...RateLimiter.configs[operation], ...customConfig };
    const key = `rate_limit:${operation}:${identifier}`;

    try {
      // Use individual commands to avoid pipeline response parsing issues
      const currentCount = await redis.incr(key);
      await redis.expire(key, config.window);
      const ttl = await redis.ttl(key);

      const remaining = Math.max(0, config.requests - currentCount);
      const resetTime = Date.now() + ttl * 1000;

      if (currentCount <= config.requests) {
        return {
          success: true,
          remaining,
          resetTime,
        };
      } else {
        return {
          success: false,
          remaining: 0,
          resetTime,
          retryAfter: ttl,
        };
      }
    } catch (error) {
      console.error(`Rate limiting error for ${operation}:`, error);
      // Fail closed - deny request if rate limiter is down to prevent abuse
      return {
        success: false,
        remaining: 0,
        resetTime: Date.now() + config.window * 1000,
        retryAfter: config.window,
      };
    }
  }

  // Enhanced rate limiting with burst allowance
  static async checkBurstLimit(
    operation: keyof typeof RateLimiter.configs,
    identifier: string,
    burstMultiplier = 2,
  ): Promise<RateLimitResult> {
    const baseConfig = RateLimiter.configs[operation];

    // Check short-term burst limit (higher rate for shorter window)
    const burstResult = await this.checkLimit(operation, identifier, {
      requests: Math.floor(baseConfig.requests * burstMultiplier),
      window: Math.floor(baseConfig.window / 4), // Quarter window
    });

    if (!burstResult.success) {
      return burstResult;
    }

    // Check standard rate limit
    return this.checkLimit(operation, identifier);
  }

  // Get client identifier from request
  static getClientIdentifier(request: NextRequest, userId?: string): string {
    if (userId) {
      return `user:${userId}`;
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";

    return `ip:${ip}`;
  }

  // Middleware wrapper for easy integration
  static middleware(operation: keyof typeof RateLimiter.configs) {
    return async (request: NextRequest, userId?: string) => {
      const identifier = this.getClientIdentifier(request, userId);
      const result = await this.checkLimit(operation, identifier);

      if (!result.success) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter: result.retryAfter,
            resetTime: result.resetTime,
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit":
                RateLimiter.configs[operation].requests.toString(),
              "X-RateLimit-Remaining": result.remaining.toString(),
              "X-RateLimit-Reset": Math.ceil(
                result.resetTime / 1000,
              ).toString(),
              "Retry-After": (result.retryAfter || 60).toString(),
            },
          },
        );
      }

      return null; // Continue processing
    };
  }
}

// Enhanced rate limiting for authenticated users
export class UserRateLimiter extends RateLimiter {
  // Subscription-based rate limits
  static readonly subscriptionLimits = {
    0: {
      // Free tier
      qr_generation: { requests: 10, window: 60 },
      qr_save: { requests: 5, window: 60 },
    },
    1: {
      // Explorer
      qr_generation: { requests: 30, window: 60 },
      qr_save: { requests: 15, window: 60 },
    },
    2: {
      // Creator
      qr_generation: { requests: 60, window: 60 },
      qr_save: { requests: 30, window: 60 },
    },
    3: {
      // Champion
      qr_generation: { requests: 120, window: 60 },
      qr_save: { requests: 60, window: 60 },
    },
  } as const;

  static async checkUserLimit(
    operation: keyof (typeof UserRateLimiter.subscriptionLimits)[0],
    userId: string,
    subscriptionLevel: 0 | 1 | 2 | 3 = 0,
  ): Promise<RateLimitResult> {
    const userLimits = UserRateLimiter.subscriptionLimits[subscriptionLevel];
    const config = userLimits[operation];

    return this.checkLimit(operation as any, `user:${userId}`, config);
  }
}
