// components/ErrorBoundary.tsx
"use client";

import React from "react";
import { ErrorReporter } from "@/lib/error-reporter";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const reporter = ErrorReporter.getInstance();
    reporter.reportError(error, {
      operation: "react_error",
      component: errorInfo.componentStack?.split("\n")[1]?.trim(),
      metadata: {
        componentStack: errorInfo.componentStack,
      },
      level: "error",
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-neutral-600 mb-6">
          We've been notified about this error and are working to fix it.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-qrmory-purple-800 text-white py-2 px-4 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full border border-neutral-300 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Go Back
          </button>
        </div>
        {process.env.NODE_ENV === "development" && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-neutral-500">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// Specialized error boundaries for different parts of the app
export function QRErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={QRErrorFallback}
      onError={(error, errorInfo) => {
        console.error("QR Component Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function QRErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="p-6 bg-white rounded-lg border border-red-200">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-900 mb-2">QR Code Error</h3>
        <p className="text-sm text-red-700 mb-4">
          Unable to load the QR code component. Please refresh the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Subscription-specific error boundary
export function SubscriptionErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={SubscriptionErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Subscription Component Error:", error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function SubscriptionErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="p-6 bg-white rounded-lg border border-amber-200">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-amber-900 mb-2">
          Subscription Loading Error
        </h3>
        <p className="text-sm text-amber-700 mb-4">
          Unable to load subscription information. Please try refreshing the
          page.
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Refresh Page
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full border border-amber-300 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
