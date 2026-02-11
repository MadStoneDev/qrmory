"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createClient } from "@/utils/supabase/server";
import { RateLimiter } from "@/lib/rate-limiter";

type AuthResponse = {
  error: string | null;
  success: boolean;
  redirectTo?: string;
};

export async function handleAuth(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      error: "Oops! No email? Do you go to the movies and watch the side wall?",
      success: false,
    };
  }

  try {
    // Server-side rate limiting: 5 OTP sends per 5 minutes per email
    const rateLimitResult = await RateLimiter.checkLimit(
      "user_registration",
      `otp_send:${email.toLowerCase()}`,
      { requests: 5, window: 300 },
    );

    if (!rateLimitResult.success) {
      return {
        error:
          "You're sending emails faster than John Wick reloads! Please wait a few minutes before trying again.",
        success: false,
      };
    }

    // Also rate limit by IP to prevent enumeration across emails
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") || "unknown";

    const ipRateLimitResult = await RateLimiter.checkLimit(
      "user_registration",
      `otp_send_ip:${ip}`,
      { requests: 10, window: 300 },
    );

    if (!ipRateLimitResult.success) {
      return {
        error:
          "Too many login attempts from this location. Please wait a few minutes before trying again.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);

      if (authError.message.includes("Invalid email")) {
        return {
          error:
            "That email looks more fictional than Wakanda. Please enter a real email address!",
          success: false,
        };
      }

      if (authError.message.includes("rate limit")) {
        return {
          error:
            "You're sending emails faster than John Wick reloads! Please wait a few minutes before trying again.",
          success: false,
        };
      }

      return {
        error:
          "Plot twist! Something went wrong with our authentication system. Try again in a bit?",
        success: false,
      };
    }

    // Redirect to dashboard
    revalidatePath("/dashboard");

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error during authentication:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}

export async function verifyOtp(formData: FormData): Promise<AuthResponse> {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return {
      error: "Missing email or verification code",
      success: false,
    };
  }

  try {
    // Rate limit OTP verification: 10 attempts per 5 minutes per email
    const rateLimitResult = await RateLimiter.checkLimit(
      "user_registration",
      `otp_verify:${email.toLowerCase()}`,
      { requests: 10, window: 300 },
    );

    if (!rateLimitResult.success) {
      return {
        error: "Too many verification attempts. Please wait a few minutes and try again.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      console.error("OTP verification error:", error);

      if (error.message.includes("Invalid OTP")) {
        return {
          error: "That code isn't right. Double-check and try again.",
          success: false,
        };
      }

      if (error.message.includes("expired")) {
        return {
          error: "This code has expired. Please request a new one.",
          success: false,
        };
      }

      return {
        error: "Verification failed. Please try again.",
        success: false,
      };
    }

    revalidatePath("/");

    // Redirect to user profile after successful verification
    return {
      error: null,
      success: true,
      redirectTo: "/dashboard",
    };
  } catch (error) {
    console.error("Unexpected error during OTP verification:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
