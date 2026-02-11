// lib/recaptcha.ts
// Server-side reCAPTCHA v3 token verification

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const SCORE_THRESHOLD = 0.5;

interface RecaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

interface VerifyResult {
  success: boolean;
  score: number;
  error?: string;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
): Promise<VerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not configured");
    // Fail open in development, fail closed in production
    if (process.env.NODE_ENV === "development") {
      return { success: true, score: 1 };
    }
    return { success: false, score: 0, error: "reCAPTCHA not configured" };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data: RecaptchaVerifyResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        score: 0,
        error: `reCAPTCHA verification failed: ${data["error-codes"]?.join(", ")}`,
      };
    }

    if (data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        error: `reCAPTCHA action mismatch: expected ${expectedAction}, got ${data.action}`,
      };
    }

    if (data.score < SCORE_THRESHOLD) {
      return {
        success: false,
        score: data.score,
        error: "Request flagged as suspicious",
      };
    }

    return { success: true, score: data.score };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, score: 0, error: "reCAPTCHA verification failed" };
  }
}
