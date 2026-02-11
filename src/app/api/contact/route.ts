import { NextRequest, NextResponse } from "next/server";
import {
  sendContactFormThankYouEmail,
  sendContactFormNotificationEmail,
} from "@/lib/email/send-email";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { RateLimiter } from "@/lib/rate-limiter";

interface ContactFormRequest {
  name: string;
  email: string;
  message: string;
  recaptchaToken?: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ContactFormRequest = await request.json();

    // Rate limit by IP: 5 submissions per 10 minutes
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = await RateLimiter.checkLimit(
      "api_general",
      `contact:${ip}`,
      { requests: 5, window: 600 },
    );

    if (!rateLimitResult.success) {
      // Return success to not reveal rate limiting to spammers
      return NextResponse.json({ success: true });
    }

    // Verify reCAPTCHA token
    if (body.recaptchaToken) {
      const recaptchaResult = await verifyRecaptchaToken(
        body.recaptchaToken,
        "contact_form",
      );

      if (!recaptchaResult.success) {
        // Silently reject bots but return success
        console.warn("reCAPTCHA failed for contact form:", recaptchaResult.error);
        return NextResponse.json({ success: true });
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, require reCAPTCHA token
      console.warn("Contact form submitted without reCAPTCHA token");
      return NextResponse.json({ success: true });
    }

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (body.name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (body.message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    // Basic spam protection - check for common spam patterns
    const spamPatterns = [
      /\[url=/i,
      /\[link=/i,
      /<a\s+href=/i,
      /viagra|cialis|casino|lottery|winner/i,
    ];

    if (spamPatterns.some((pattern) => pattern.test(body.message))) {
      // Silently reject spam but return success to not give feedback to spammers
      console.warn("Spam detected in contact form:", body.email);
      return NextResponse.json({ success: true });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: body.name.trim().slice(0, 100),
      email: body.email.trim().toLowerCase().slice(0, 255),
      message: body.message.trim().slice(0, 5000),
    };

    // Send both emails in parallel
    const [thankYouResult, notificationResult] = await Promise.all([
      sendContactFormThankYouEmail(sanitizedData),
      sendContactFormNotificationEmail(sanitizedData),
    ]);

    if (!thankYouResult || !notificationResult) {
      console.error("Failed to send contact emails:", {
        thankYou: thankYouResult,
        notification: notificationResult,
      });

      // Even if one fails, don't show error to user if at least one succeeded
      if (!thankYouResult && !notificationResult) {
        return NextResponse.json(
          { success: false, error: "Failed to send message. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
