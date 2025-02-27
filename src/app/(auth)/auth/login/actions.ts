"use server";

import { rateLimit } from "@/utils/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginWithPassword(formData: {
  email: string;
  password: string;
}) {
  try {
    const { success: rateLimiter } = await rateLimit.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimiter) {
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    revalidatePath(`/`);
    redirect(`/dashboard`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      return {
        error: "An unexpected error occurred. Please try again later.",
        success: false,
      };
    }

    console.error("Unexpected error during login:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}

export async function loginWithMagicLink(formData: { email: string }) {
  try {
    const { success: rateLimiter } = await rateLimit.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimiter) {
      return {
        error: "Too many attempts. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    return {
      error: null,
      success: true,
      message: "Check your email for the login link.",
    };
  } catch (error) {
    console.error("Unexpected magic link error:", error);
    return {
      error: "Unable to send login link. Please try again.",
      success: false,
    };
  }
}
