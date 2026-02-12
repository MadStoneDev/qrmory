/**
 * API Retry Utility
 * Provides automatic retry functionality for failed API calls with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
}

interface RetryResult<T> {
  data: T | null;
  error: Error | null;
  attempts: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: unknown, attempt: number) => {
    // By default, retry on network errors and 5xx server errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return true; // Network error
    }
    if (error instanceof Response) {
      return error.status >= 500 && error.status < 600;
    }
    return attempt < 3;
  },
};

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  // Add jitter (random factor between 0.5 and 1.5)
  const jitter = 0.5 + Math.random();
  const delay = exponentialDelay * jitter;
  // Cap at max delay
  return Math.min(delay, maxDelay);
}

/**
 * Execute a function with automatic retry on failure
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await fn();
      return {
        data: result,
        error: null,
        attempts: attempt + 1,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const isLastAttempt = attempt === opts.maxRetries;
      const shouldRetry = !isLastAttempt && opts.shouldRetry(error, attempt);

      if (!shouldRetry) {
        break;
      }

      // Wait before retrying
      const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
      // Retrying after delay
      await sleep(delay);
    }
  }

  return {
    data: null,
    error: lastError,
    attempts: opts.maxRetries + 1,
  };
}

/**
 * Fetch with automatic retry
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  const result = await withRetry(async () => {
    const response = await fetch(url, options);
    if (!response.ok && response.status >= 500) {
      throw response; // Will be caught and retried
    }
    return response;
  }, retryOptions);

  if (result.error) {
    throw result.error;
  }

  return result.data!;
}

/**
 * POST JSON with automatic retry
 */
export async function postJsonWithRetry<T>(
  url: string,
  data: unknown,
  retryOptions?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(
    url,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
    retryOptions
  );

  return response.json();
}
