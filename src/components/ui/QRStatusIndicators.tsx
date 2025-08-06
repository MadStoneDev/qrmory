// components/ui/QRStatusIndicators.tsx
import React from "react";
import { IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";
import { QuotaInfo } from "@/utils/quota-validation";

interface QRState {
  title: string;
  value: string;
  textValue: string;
  changed: boolean;
  shortCode: string;
  activeSelector: string;
  isDynamic: boolean;
  isShortcodeSaved: boolean;
  saveData: any;
}

interface QuotaStatus {
  hasReachedQuota: boolean;
  isNearQuota: boolean;
}

interface QRStatusIndicatorsProps {
  qrState: QRState;
  user: any;
  quotaStatus: QuotaStatus;
  quotaInfo: QuotaInfo;
}

export function QRStatusIndicators({
  qrState,
  user,
  quotaStatus,
  quotaInfo,
}: QRStatusIndicatorsProps) {
  return (
    <>
      {/* Dynamic QR Status */}
      {qrState.isDynamic && (
        <section className="mt-4">
          <p className="text-sm">
            Your Dynamic Code will be:{" "}
            <span className="font-bold font-mono">
              {process.env.NEXT_PUBLIC_SITE_URL}/{qrState.shortCode}
            </span>
          </p>
          <p
            className={`text-sm ${
              qrState.isShortcodeSaved ? "text-green-600" : "text-amber-600"
            }`}
          >
            {qrState.isShortcodeSaved
              ? "✅ Your dynamic QR code has been saved."
              : "⚠️ Save your QR code to secure this URL."}
          </p>
        </section>
      )}

      {/* Quota Warning */}
      {user && quotaStatus.isNearQuota && (
        <section className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <IconInfoCircle className="text-amber-600" size={16} />
            <p className="text-sm text-amber-800">
              {quotaStatus.hasReachedQuota
                ? `You've reached your limit of ${quotaInfo.maxQuota} dynamic QR codes.`
                : `You have ${
                    quotaInfo.maxQuota - quotaInfo.currentCount
                  } dynamic QR codes remaining.`}{" "}
              <Link
                href="/subscription"
                className="text-amber-900 underline hover:text-amber-700"
              >
                Upgrade your plan
              </Link>{" "}
              to create more.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
