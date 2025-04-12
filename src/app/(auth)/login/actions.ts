"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

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
    const { success: rateLimiter } = await authRateLimiter.limit(
      email.toLowerCase(),
    );

    if (!rateLimiter) {
      return {
        error:
          "Woah! You're faster than post-credit scenes in Marvel movies. Try again in a bit, please?",
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

    revalidatePath("/");

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
