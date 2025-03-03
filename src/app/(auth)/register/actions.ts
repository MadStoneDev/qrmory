"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/utils/supabase/server";
import { authRateLimiter } from "@/utils/rate-limit";

type SignUpResponse = {
  error: string | null;
  success: boolean;
};

export async function SignUp(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<SignUpResponse> {
  try {
    // Rate Limit Check
    const { success: rateLimiter } = await authRateLimiter.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimiter) {
      return {
        error: "Too many requests. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      console.error("Supabase auth error:", authError);

      if (authError.message.includes("Database error")) {
        return {
          error:
            "There was a problem creating your account. This email might already be registered.",
          success: false,
        };
      }

      // User already exists
      if (authError.message.includes("already registered")) {
        return {
          error: "This email is already registered. Please log in instead.",
          success: false,
        };
      }

      return {
        error: authError.message,
        success: false,
      };
    }

    if (!authData.user) {
      console.error("No user data returned from sign up");
      return {
        error: "User creation failed. Please try again.",
        success: false,
      };
    }

    revalidatePath("/");
    redirect("/auth/check-email");
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
