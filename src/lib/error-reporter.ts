// lib/error-reporter.ts
import LogRocket from "logrocket";

export interface ErrorContext {
  userId?: string;
  operation?: string;
  component?: string;
  metadata?: Record<string, any>;
  level?: "error" | "warning" | "info";
  logRocketSessionURL?: string; // Add LogRocket session URL
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: number;
  url: string;
  userAgent: string;
  fingerprint: string;
}

export class ErrorReporter {
  private static instance: ErrorReporter;
  private reports: ErrorReport[] = [];
  private maxReports = 100;
  private reportEndpoint = "/api/error-reports";

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  private constructor() {
    // Set up global error handlers only in browser
    if (typeof window !== "undefined") {
      this.setupGlobalHandlers();
    }
  }

  private setupGlobalHandlers() {
    // Unhandled JavaScript errors
    window.addEventListener("error", (event) => {
      this.reportError(event.error || new Error(event.message), {
        operation: "global_error",
        component: "window",
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.reportError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        {
          operation: "unhandled_rejection",
          component: "promise",
        },
      );
    });

    // Make available globally for React error boundaries
    (window as any).__ERROR_REPORTER__ = this;
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    const components = [
      error.name,
      error.message,
      context.component,
      context.operation,
    ].filter(Boolean);

    return btoa(components.join("|")).substring(0, 16);
  }

  private shouldReport(fingerprint: string): boolean {
    // Check if we've already reported this error recently (within 5 minutes)
    const recentReports = this.reports.filter(
      (report) =>
        report.fingerprint === fingerprint &&
        Date.now() - report.timestamp < 5 * 60 * 1000,
    );

    return recentReports.length === 0;
  }

  reportError(error: Error, context: ErrorContext = {}): void {
    // Only proceed if in browser environment
    if (typeof window === "undefined") {
      console.error("Server-side error:", error, context);
      return;
    }

    const fingerprint = this.generateFingerprint(error, context);

    if (!this.shouldReport(fingerprint)) {
      return; // Skip duplicate errors
    }

    // Capture LogRocket session URL if available
    if (
      typeof LogRocket !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      LogRocket.captureException(error);
      LogRocket.getSessionURL((sessionURL) => {
        context.logRocketSessionURL = sessionURL;
        this.sendErrorReport(error, context, fingerprint);
      });
    } else {
      this.sendErrorReport(error, context, fingerprint);
    }
  }

  private sendErrorReport(
    error: Error,
    context: ErrorContext,
    fingerprint: string,
  ): void {
    const report: ErrorReport = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      fingerprint,
    };

    // Add to local storage for offline support
    this.reports.push(report);
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    // Send to server
    this.sendReport(report);
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    try {
      await fetch(this.reportEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(report),
      });
    } catch (sendError) {
      console.error("Failed to send error report:", sendError);
      // Store for retry
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          `error_report_${report.id}`,
          JSON.stringify(report),
        );
      }
    }
  }

  getUserFriendlyMessage(error: Error, context: ErrorContext): string {
    const operation = context.operation;

    const messages: Record<string, string> = {
      qr_generation: "Failed to generate QR code. Please try again.",
      qr_save:
        "Failed to save QR code. Please check your connection and try again.",
      shortcode_generation:
        "Failed to create dynamic QR code. Please try again.",
      subscription_update:
        "Failed to update subscription. Please contact support.",
      payment_processing:
        "Payment processing error. Please try again or contact support.",
      file_upload:
        "Failed to upload file. Please check the file size and format.",
    };

    return (
      messages[operation || ""] ||
      "An unexpected error occurred. Please try again."
    );
  }

  openReportDialog(error: Error, context: ErrorContext): void {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams({
        error: error.message,
        context: JSON.stringify(context),
      });

      // Include LogRocket session URL if available
      if (context.logRocketSessionURL) {
        params.append("logRocketSession", context.logRocketSessionURL);
      }

      window.open(`/feedback?${params.toString()}`, "_blank");
    }
  }

  // Public methods for manual error reporting with LogRocket integration
  reportQRError(error: Error, qrType?: string): void {
    if (
      typeof LogRocket !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      LogRocket.track("QR Generation Error", {
        qrType,
        error: error.message,
      });
    }

    this.reportError(error, {
      operation: "qr_generation",
      component: "qr_creator",
      metadata: { qrType },
    });
  }

  reportSubscriptionError(error: Error, subscriptionLevel?: number): void {
    if (
      typeof LogRocket !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      LogRocket.track("Subscription Error", {
        subscriptionLevel,
        error: error.message,
      });
    }

    this.reportError(error, {
      operation: "subscription_update",
      component: "subscription_manager",
      metadata: { subscriptionLevel },
    });
  }

  reportPaymentError(error: Error, amount?: number): void {
    if (
      typeof LogRocket !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      LogRocket.track("Payment Error", {
        amount,
        error: error.message,
      });
    }

    this.reportError(error, {
      operation: "payment_processing",
      component: "stripe_integration",
      metadata: { amount },
      level: "error",
    });
  }

  // Track custom events
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (
      typeof LogRocket !== "undefined" &&
      process.env.NODE_ENV === "production"
    ) {
      LogRocket.track(eventName, properties);
    }
  }

  // Retry failed reports
  async retryFailedReports(): Promise<void> {
    if (typeof localStorage === "undefined") return;

    const failedReports: ErrorReport[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("error_report_")) {
        try {
          const report = JSON.parse(localStorage.getItem(key) || "");
          failedReports.push(report);
        } catch (e) {
          localStorage.removeItem(key);
        }
      }
    }

    for (const report of failedReports) {
      try {
        await this.sendReport(report);
        localStorage.removeItem(`error_report_${report.id}`);
      } catch (e) {
        // Keep in localStorage for next retry
      }
    }
  }
}
