// utils/shortcode-manager.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Optimized character set for better readability (removed confusing chars)
const CHARS = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CHAR_LENGTH = CHARS.length;

// Pre-computed collision statistics
interface CollisionStats {
  totalAttempts: number;
  successfulGenerations: number;
  averageAttempts: number;
  maxCollisions: number;
}

export class ShortcodeManager {
  private static collisionStats: CollisionStats = {
    totalAttempts: 0,
    successfulGenerations: 0,
    averageAttempts: 1,
    maxCollisions: 0,
  };

  // Optimized generation with dynamic length adjustment
  static async generateOptimized(
    userId?: string,
    maxAttempts = 10,
  ): Promise<string> {
    const startTime = Date.now();
    let attempts = 0;
    let shortcode = "";

    // Dynamic length based on collision rate
    let codeLength = this.getOptimalLength();

    while (attempts < maxAttempts) {
      attempts++;
      shortcode = this.generateCode(codeLength);

      // Batch check: Redis + probable database collision
      const isAvailable = await this.isShortcodeAvailable(shortcode);

      if (isAvailable) {
        // Reserve immediately to prevent race conditions
        await this.reserveShortcode(shortcode, userId);

        // Update statistics
        this.updateStats(attempts, true);

        // Log performance metrics
        const generationTime = Date.now() - startTime;
        if (generationTime > 100 || attempts > 3) {
          console.warn(
            `Shortcode generation took ${generationTime}ms with ${attempts} attempts`,
          );
        }

        return shortcode;
      }

      // Increase length if too many collisions
      if (attempts > 5) {
        codeLength = Math.min(codeLength + 1, 12);
      }
    }

    this.updateStats(attempts, false);
    throw new ShortcodeError(
      `Failed to generate unique shortcode after ${attempts} attempts`,
      "GENERATION_FAILED",
    );
  }

  // Optimized character generation with better distribution
  private static generateCode(length: number): string {
    const result = new Array(length);
    const crypto = globalThis.crypto || require("crypto").webcrypto;

    // Use crypto.getRandomValues for better randomness
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);

    for (let i = 0; i < length; i++) {
      result[i] = CHARS[randomBytes[i] % CHAR_LENGTH];
    }

    // Ensure good character distribution (avoid all numbers/letters)
    return this.ensureGoodDistribution(result.join(""));
  }

  private static ensureGoodDistribution(code: string): string {
    const numbers = code.match(/[0-9]/g)?.length || 0;
    const letters = code.length - numbers;

    // If too skewed, regenerate with forced distribution
    if (
      numbers === 0 ||
      numbers === code.length ||
      numbers / code.length > 0.6
    ) {
      return this.generateBalancedCode(code.length);
    }

    return code;
  }

  private static generateBalancedCode(length: number): string {
    const targetNumbers = Math.floor(length * 0.3); // 30% numbers
    const result = [];

    // Add required numbers
    for (let i = 0; i < targetNumbers; i++) {
      result.push(CHARS[Math.floor(Math.random() * 8) + 50]); // Numbers part of CHARS
    }

    // Fill with letters
    while (result.length < length) {
      result.push(CHARS[Math.floor(Math.random() * 42)]); // Letters part of CHARS
    }

    // Shuffle using Fisher-Yates
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result.join("");
  }

  // Optimal length calculation based on collision stats
  private static getOptimalLength(): number {
    const { averageAttempts } = this.collisionStats;

    if (averageAttempts > 3) return 9;
    if (averageAttempts > 1.5) return 8;
    return 7;
  }

  // Enhanced availability check with batching
  private static async isShortcodeAvailable(
    shortcode: string,
  ): Promise<boolean> {
    try {
      // Check Redis reservation first (fastest)
      const isReserved = await redis.exists(`reserved:${shortcode}`);
      if (isReserved) return false;

      // Check if it's in our bloom filter (if implemented)
      // const isInBloomFilter = await redis.bf.exists('shortcodes', shortcode);
      // if (isInBloomFilter) return false;

      // Final check against database would happen in the API endpoint
      // This method assumes Redis check is sufficient for most cases
      return true;
    } catch (error) {
      console.error("Error checking shortcode availability:", error);
      // Fail safe: assume unavailable if we can't check
      return false;
    }
  }

  // Enhanced reservation with metadata
  static async reserveShortcode(
    shortcode: string,
    userId?: string,
    ttlSeconds = 300,
  ): Promise<void> {
    const reservationData = {
      userId: userId || "anonymous",
      reservedAt: Date.now(),
      origin: "generation",
    };

    await redis.setex(
      `reserved:${shortcode}`,
      ttlSeconds,
      JSON.stringify(reservationData),
    );

    // Optional: Add to bloom filter for faster future checks
    // await redis.bf.add('shortcodes', shortcode);
  }

  static async releaseShortcode(shortcode: string): Promise<void> {
    await redis.del(`reserved:${shortcode}`);
  }

  // Statistics tracking for optimization
  private static updateStats(attempts: number, success: boolean): void {
    this.collisionStats.totalAttempts += attempts;

    if (success) {
      this.collisionStats.successfulGenerations++;
      this.collisionStats.averageAttempts =
        this.collisionStats.totalAttempts /
        this.collisionStats.successfulGenerations;
    }

    this.collisionStats.maxCollisions = Math.max(
      this.collisionStats.maxCollisions,
      attempts,
    );

    // Log stats periodically
    if (this.collisionStats.successfulGenerations % 100 === 0) {
      console.log("Shortcode generation stats:", this.collisionStats);
    }
  }

  static getStats(): CollisionStats {
    return { ...this.collisionStats };
  }
}

// Custom error class for better error handling
export class ShortcodeError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable = false,
  ) {
    super(message);
    this.name = "ShortcodeError";
  }
}

// React hook for shortcode management
export function useShortcodeManager() {
  const generateShortcode = async (userId?: string): Promise<string> => {
    try {
      const response = await fetch("/api/generate-shortcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.shortcode;
    } catch (error) {
      if (error instanceof ShortcodeError && error.retryable) {
        // Implement exponential backoff retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return generateShortcode(userId);
      }
      throw error;
    }
  };

  const reserveShortcode = async (
    shortcode: string,
    userId?: string,
  ): Promise<void> => {
    const response = await fetch("/api/reserve-shortcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shortcode, userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to reserve shortcode: ${response.statusText}`);
    }
  };

  const releaseShortcode = async (shortcode: string): Promise<void> => {
    try {
      await fetch("/api/release-shortcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortcode }),
      });
    } catch (error) {
      console.error("Failed to release shortcode:", error);
      // Don't throw - this is cleanup
    }
  };

  return {
    generateShortcode,
    reserveShortcode,
    releaseShortcode,
  };
}
