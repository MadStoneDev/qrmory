// hooks/useShortcodeManager.ts
"use client";

import { useCallback } from "react";

export function useShortcodeManager(user: any) {
  const createDynamicQR = useCallback(async (): Promise<string> => {
    if (!user?.id) {
      throw new Error("User authentication required");
    }

    try {
      const response = await fetch("/api/generate-shortcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();
      return data.shortcode;
    } catch (error) {
      console.error("Failed to create dynamic QR:", error);
      throw new Error("Unable to generate unique shortcode. Please try again.");
    }
  }, [user?.id]);

  const reserveShortcode = useCallback(
    async (shortcode: string): Promise<void> => {
      const response = await fetch("/api/reserve-shortcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortcode,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            `Failed to reserve shortcode: ${response.statusText}`,
        );
      }
    },
    [user?.id],
  );

  const releaseShortcode = useCallback(
    async (shortcode: string): Promise<void> => {
      try {
        await fetch("/api/release-shortcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shortcode,
            saved: false,
          }),
        });
      } catch (error) {
        console.error("Failed to release shortcode:", error);
        // Don't throw - this is cleanup
      }
    },
    [],
  );

  return {
    createDynamicQR,
    reserveShortcode,
    releaseShortcode,
  };
}
