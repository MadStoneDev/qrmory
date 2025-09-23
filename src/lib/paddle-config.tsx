// /lib/paddle-config.ts - Add this new file
export function validatePaddleConfig() {
  const requiredEnvVars = [
    "PADDLE_API_KEY",
    "PADDLE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_SITE_URL",
  ] as const;

  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    apiKey: process.env.PADDLE_API_KEY!,
    webhookSecret: process.env.PADDLE_WEBHOOK_SECRET!,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
    environment:
      process.env.NODE_ENV === "production" ? "production" : "sandbox",
  };
}
