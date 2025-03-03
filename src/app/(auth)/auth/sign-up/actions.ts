"use server";

import { authRateLimiter } from "@/utils/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function SignUp(formData: {
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{
  error: string | null;
  success: boolean;
}> {
  try {
    // Rate Limit Check
    try {
      const { success: rateLimiter } = await authRateLimiter.limit(
        formData.email.toLowerCase(),
      );

      if (!rateLimiter) {
        return {
          error: "Too many requests. Please try again later.",
          success: false,
        };
      }
    } catch (rateLimitError) {
      console.error("Rate limit error:", rateLimitError);
      // Continue with signup despite rate limit issues
    }

    // Create Supabase client
    const supabase = await createClient();

    // Attempt signup
    try {
      console.log("Attempting to sign up user:", formData.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error("Supabase auth error:", authError);

        // Handle specific errors
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

      console.log("User created successfully with ID:", authData.user.id);

      // Handle email confirmation flow
      try {
        revalidatePath("/");
        redirect("/auth/check-email");

        // This should not execute due to redirect
        return {
          error: null,
          success: true,
        };
      } catch (redirectError) {
        console.error("Error during redirect:", redirectError);
        return {
          error:
            "Sign up successful but unable to redirect. Please check your email.",
          success: true,
        };
      }
    } catch (signUpError) {
      console.error("Supabase signup error:", signUpError);
      return {
        error: "Error during registration. Please try again later.",
        success: false,
      };
    }
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
