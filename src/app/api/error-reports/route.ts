// app/api/error-reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { ErrorReport } from "@/lib/error-reporter";
import { isAdmin } from "@/lib/admin";
import { RateLimiter } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const report: ErrorReport = await request.json();

    // Validate the report
    if (!report.id || !report.message || !report.timestamp) {
      return NextResponse.json(
        { error: "Invalid report format" },
        { status: 400 },
      );
    }

    // Rate limiting for error reports (prevent spam)
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimitResult = await RateLimiter.checkLimit(
      "api_general",
      `error_reports:${clientIp}`,
      { requests: 10, window: 60 },
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Store in database
    const supabase = await createClient();

    // Get user info if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("error_reports").insert({
      id: report.id,
      message: report.message,
      stack: report.stack,
      context: report.context,
      timestamp: new Date(report.timestamp).toISOString(),
      url: report.url,
      user_agent: report.userAgent,
      fingerprint: report.fingerprint,
      user_id: user?.id || null,
      client_ip: clientIp,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to store error report:", error);
      return NextResponse.json({ error: "Storage failed" }, { status: 500 });
    }

    // For critical errors, send immediate alerts
    if (
      report.context.level === "error" &&
      ["payment_processing", "subscription_update"].includes(
        report.context.operation || "",
      )
    ) {
      await sendCriticalErrorAlert(report);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error report processing failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

async function sendCriticalErrorAlert(report: ErrorReport) {
  // Send to monitoring service (Slack, Discord, email, etc.)
  try {
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 Critical Error in QRmory`,
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Error:* ${report.message}\n*Operation:* ${
                  report.context.operation
                }\n*Component:* ${report.context.component}\n*URL:* ${
                  report.url
                }\n*Time:* ${new Date(report.timestamp).toISOString()}`,
              },
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Fingerprint:* ${report.fingerprint}`,
                },
                {
                  type: "mrkdwn",
                  text: `*User Agent:* ${report.userAgent.substring(0, 50)}...`,
                },
              ],
            },
          ],
        }),
      });
    }

    // Also send email alerts for critical errors
    if (process.env.CRITICAL_ERROR_EMAIL && process.env.MAILERSEND_API_KEY) {
      // Implement email notification here
      console.log("Would send critical error email:", report.message);
    }
  } catch (alertError) {
    console.error("Failed to send critical error alert:", alertError);
  }
}

// GET endpoint to retrieve error reports (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is admin (implement your admin check logic)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Check admin access via env-based allowlist
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const operation = url.searchParams.get("operation");

    let query = supabase
      .from("error_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (operation) {
      query = query.eq("context->operation", operation);
    }

    const { data: reports, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch reports" },
        { status: 500 },
      );
    }

    return NextResponse.json({ reports, count: reports?.length || 0 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
