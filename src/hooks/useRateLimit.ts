// hooks/useRateLimit.ts
"use client";

import { useState, useEffect, useCallback } from "react";

interface RateLimitStatus {
  remaining: number;
  resetTime: number;
  blocked: boolean;
  limit?: number;
  window?: number;
}

export function useRateLimit(operation: string) {
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus>({
    remaining: 100,
    resetTime: Date.now() + 60000,
    blocked: false,
  });

  const [loading, setLoading] = useState(false);

  const checkRateLimit = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/rate-limit-status?operation=${operation}`,
      );
      if (response.ok) {
        const data = await response.json();
        setRateLimitStatus(data);
      }
    } catch (error) {
      console.error("Failed to check rate limit:", error);
    } finally {
      setLoading(false);
    }
  }, [operation]);

  const executeWithRateLimit = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      try {
        const result = await action();
        await checkRateLimit(); // Update status after action
        return result;
      } catch (error) {
        if (error instanceof Response && error.status === 429) {
          const data = await error.json();
          setRateLimitStatus({
            remaining: 0,
            resetTime: data.resetTime,
            blocked: true,
            limit: data.limit,
            window: data.window,
          });
          throw new Error(
            `Rate limit exceeded. Try again in ${data.retryAfter} seconds.`,
          );
        }
        throw error;
      }
    },
    [checkRateLimit],
  );

  useEffect(() => {
    checkRateLimit();

    // Update status every 30 seconds
    const interval = setInterval(checkRateLimit, 30000);
    return () => clearInterval(interval);
  }, [checkRateLimit]);

  return {
    ...rateLimitStatus,
    loading,
    executeWithRateLimit,
    checkRateLimit,
  };
}
