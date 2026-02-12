// lib/recaptcha.ts
// Server-side Cloudflare Turnstile token verification
// Used for non-Supabase endpoints (contact form, etc.)
// Supabase auth endpoints use Turnstile natively via dashboard config.

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

interface VerifyResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstileToken(
  token: string,
): Promise<VerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    if (process.env.NODE_ENV === "development") {
      return { success: true };
    }
    return { success: false, error: "CAPTCHA not configured" };
  }

  if (!token) {
    return { success: false, error: "No CAPTCHA token provided" };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: `CAPTCHA verification failed: ${data["error-codes"]?.join(", ")}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { success: false, error: "CAPTCHA verification failed" };
  }
}

// Keep old name as alias for backwards compat during migration
export const verifyRecaptchaToken = verifyTurnstileToken;
