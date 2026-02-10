import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { ProcessWebhook } from "@/utils/paddle/process-webhook";
import { getPaddleInstance } from "@/utils/paddle/get-paddle-instance";

const webhookProcessor = new ProcessWebhook();

// Redis instance for idempotency tracking
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  enableAutoPipelining: false,
});

// Time to keep processed event IDs (24 hours in seconds)
const IDEMPOTENCY_TTL = 86400;

/**
 * Check if an event has already been processed
 * Returns true if event is new, false if already processed
 */
async function checkAndMarkEventProcessed(eventId: string): Promise<boolean> {
  const key = `paddle_webhook:${eventId}`;

  try {
    // Use SETNX (set if not exists) for atomic check-and-set
    const wasSet = await redis.setnx(key, Date.now().toString());

    if (wasSet) {
      // Event is new, set expiry
      await redis.expire(key, IDEMPOTENCY_TTL);
      return true;
    }

    // Event was already processed
    return false;
  } catch (error) {
    console.error("Redis idempotency check failed:", error);
    // Fail open - process the event if Redis is unavailable
    return true;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("paddle-signature") || "";
  const rawRequestBody = await request.text();
  const privateKey = process.env["PADDLE_NOTIFICATION_WEBHOOK_SECRET"] || "";

  try {
    if (!signature || !rawRequestBody) {
      return Response.json(
        { error: "Missing signature from header" },
        { status: 400 },
      );
    }

    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(
      rawRequestBody,
      privateKey,
      signature,
    );
    const eventName = eventData?.eventType ?? "Unknown event";
    const eventId = eventData?.eventId;

    if (!eventData) {
      return Response.json(
        { error: "Failed to parse webhook event" },
        { status: 400 },
      );
    }

    // Check idempotency - skip if event was already processed
    if (eventId) {
      const isNewEvent = await checkAndMarkEventProcessed(eventId);

      if (!isNewEvent) {
        console.log(`Webhook event ${eventId} already processed, skipping`);
        return Response.json({
          status: 200,
          eventName,
          skipped: true,
          reason: "Event already processed"
        });
      }
    }

    // Process the event
    await webhookProcessor.processEvent(eventData);

    console.log(`Successfully processed webhook event: ${eventId} (${eventName})`);
    return Response.json({ status: 200, eventName, eventId });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("Webhook processing error:", error.message);

    // Return 500 to tell Paddle to retry
    return Response.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
