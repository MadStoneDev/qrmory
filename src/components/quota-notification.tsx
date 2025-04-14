"use client";

import { useState } from "react";
import { IconAlertCircle, IconInfoCircle, IconX } from "@tabler/icons-react";
import Link from "next/link";

interface QuotaLimitNotificationProps {
  currentCount: number;
  maxQuota: number;
  subscriptionLevel: string;
}

export default function QuotaLimitNotification({
  currentCount,
  maxQuota,
  subscriptionLevel,
}: QuotaLimitNotificationProps) {
  const [dismissed, setDismissed] = useState(false);

  // If user has dismissed the notification or has plenty of quota left, don't show anything
  if (dismissed || currentCount < maxQuota - 2) {
    return null;
  }

  // Check if quota is exceeded or nearly exceeded
  const hasReachedQuota = currentCount >= maxQuota;
  const isNearQuota = currentCount >= maxQuota - 2;

  return (
    <div
      className={`mb-6 rounded-lg border ${
        hasReachedQuota
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <div className="px-4 py-3 flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {hasReachedQuota ? (
            <IconAlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <IconInfoCircle className="h-5 w-5 text-amber-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3
            className={`text-sm font-medium ${
              hasReachedQuota ? "text-red-800" : "text-amber-800"
            }`}
          >
            {hasReachedQuota
              ? "Dynamic QR code quota reached"
              : "Dynamic QR code quota almost reached"}
          </h3>
          <div
            className={`mt-1 text-sm ${
              hasReachedQuota ? "text-red-700" : "text-amber-700"
            }`}
          >
            <p>
              {hasReachedQuota
                ? `You've used all ${maxQuota} dynamic QR codes available on your ${subscriptionLevel} plan.`
                : `You've used ${currentCount} out of ${maxQuota} dynamic QR codes available on your ${subscriptionLevel} plan.`}
            </p>
            <div className="mt-2">
              <Link
                href="/subscription"
                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ${
                  hasReachedQuota
                    ? "bg-red-600 text-white hover:bg-red-500"
                    : "bg-amber-600 text-white hover:bg-amber-500"
                } shadow-sm transition-colors`}
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className={`inline-flex rounded-md p-1.5 ${
                hasReachedQuota
                  ? "text-red-500 hover:bg-red-100"
                  : "text-amber-500 hover:bg-amber-100"
              }`}
            >
              <span className="sr-only">Dismiss</span>
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
