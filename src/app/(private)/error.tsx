"use client";

import Link from "next/link";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="max-w-md text-center">
        <h1 className="font-header text-2xl sm:text-3xl text-qrmory-purple-800">
          Something went wrong
        </h1>

        <p className="mt-4 font-serif text-sm sm:text-base text-qrmory-purple-400">
          We hit a snag loading this page. Give it another shot, or head back to
          your dashboard.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-2 border border-qrmory-purple-400 text-qrmory-purple-800 rounded-lg hover:bg-qrmory-purple-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
