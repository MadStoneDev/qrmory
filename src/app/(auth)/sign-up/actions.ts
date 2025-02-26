"use server";

import { rateLimit } from "@/utils/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function SignUp(formData: {
  email: string;
  password: string;
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
      return {
        error: "Too many requests. Please try again later.",
        success: false,
      };
    }

    const supabase = await createClient();

    // Check if user already exists
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError) {
      return {
        error: authError.message,
        success: false,
      };
    }

    if (!authData.user) {
      console.log(`No user data returned from sign up`);
      return {
        error: "An unexpected error occurred. Please try again later.",
        success: false,
      };
    }

    revalidatePath(`/`);
    redirect(`/auth/check-email`);
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    return {
      error: "An unexpected error occurred. Please try again later.",
      success: false,
    };
  }
}
