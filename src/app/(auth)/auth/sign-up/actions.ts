"use server";

import { rateLimit } from "@/utils/rate-limit";
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
    const { success: rateLimiter } = await rateLimit.limit(
      formData.email.toLowerCase(),
    );

    if (!rateLimiter) {
      console.log("Rate limit reached for email:", formData.email);
      return {
        error: "Too many requests. Please try again later.",
        success: false,
      };
    }

    // Create Supabase client
    try {
      const supabase = await createClient();
      console.log("Supabase client created successfully");

      // Check if user already exists
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email: formData.email,
            password: formData.password,
          },
        );

        if (authError) {
          console.error("Supabase auth error:", authError);
          return {
            error: authError.message,
            success: false,
          };
        }

        if (!authData.user) {
          console.error("No user data returned from sign up");
          return {
            error: "Unable to create account. Please try again later.",
            success: false,
          };
        }

        console.log("User created successfully with ID:", authData.user.id);

        // Successfully created user, now redirect
        try {
          revalidatePath("/");
          console.log("Path revalidated, redirecting to check-email page");
          redirect("/auth/check-email");

          // Note: Code below should not execute due to redirect
          return {
            error: null,
            success: true,
          };
        } catch (redirectError) {
          console.error("Error during redirect:", redirectError);
          return {
            error:
              "Sign up successful but unable to redirect. Please check your email to confirm your account.",
            success: true,
          };
        }
      } catch (signUpError) {
        console.error("Error during sign up process:", signUpError);
        return {
          error: "Unable to complete registration. Please try again later.",
          success: false,
        };
      }
    } catch (supabaseError) {
      console.error("Supabase client creation error:", supabaseError);
      return {
        error: "Unable to connect to our services. Please try again later.",
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
