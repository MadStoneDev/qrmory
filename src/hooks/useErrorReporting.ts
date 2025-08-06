// hooks/useErrorReporting.ts
"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ErrorReporter, ErrorContext } from "@/lib/error-reporter";

export function useErrorReporting() {
  const reporter = ErrorReporter.getInstance();

  const reportError = useCallback(
    (error: Error, context?: ErrorContext) => {
      reporter.reportError(error, context);

      // Show user notification
      showUserNotification(error, context || {}, reporter);
    },
    [reporter],
  );

  const reportQRError = useCallback(
    (error: Error, qrType?: string) => {
      const context: ErrorContext = {
        operation: "qr_generation",
        component: "qr_creator",
        metadata: { qrType },
      };

      reporter.reportQRError(error, qrType);
      showUserNotification(error, context, reporter);
    },
    [reporter],
  );

  const reportSubscriptionError = useCallback(
    (error: Error, subscriptionLevel?: number) => {
      const context: ErrorContext = {
        operation: "subscription_update",
        component: "subscription_manager",
        metadata: { subscriptionLevel },
      };

      reporter.reportSubscriptionError(error, subscriptionLevel);
      showUserNotification(error, context, reporter);
    },
    [reporter],
  );

  const reportPaymentError = useCallback(
    (error: Error, amount?: number) => {
      const context: ErrorContext = {
        operation: "payment_processing",
        component: "stripe_integration",
        metadata: { amount },
        level: "error",
      };

      reporter.reportPaymentError(error, amount);
      showUserNotification(error, context, reporter);
    },
    [reporter],
  );

  return {
    reportError,
    reportQRError,
    reportSubscriptionError,
    reportPaymentError,
  };
}

// Helper function to show user notifications
function showUserNotification(
  error: Error,
  context: ErrorContext,
  reporter: ErrorReporter,
): void {
  const level = context.level || "error";

  if (level === "error") {
    toast("Something went wrong", {
      description: reporter.getUserFriendlyMessage(error, context),
      style: {
        backgroundColor: "rgb(254, 226, 226)",
        color: "rgb(153, 27, 27)",
      },
      action: {
        label: "Report Issue",
        onClick: () => reporter.openReportDialog(error, context),
      },
    });
  } else if (level === "warning") {
    toast("Warning", {
      description: error.message,
      style: {
        backgroundColor: "rgb(254, 243, 199)",
        color: "rgb(146, 64, 14)",
      },
    });
  } else if (level === "info") {
    toast("Info", {
      description: error.message,
      style: {
        backgroundColor: "rgb(239, 246, 255)",
        color: "rgb(30, 64, 175)",
      },
    });
  }
}
