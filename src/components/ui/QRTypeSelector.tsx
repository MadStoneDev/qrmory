// components/ui/QRTypeSelector.tsx
"use client";

import React from "react";
import { qrControls } from "@/lib/qr-control-object";

interface QRTypeSelectorProps {
  activeSelector: string;
  onSelectorChange: (key: string) => void;
  userSubscriptionLevel: number;
  premiumTypes: string[];
}

export function QRTypeSelector({
  activeSelector,
  onSelectorChange,
  userSubscriptionLevel,
  premiumTypes,
}: QRTypeSelectorProps) {
  const canAccessType = (key: string) => {
    if (!premiumTypes.includes(key)) return true;
    return userSubscriptionLevel > 0;
  };

  return (
    <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-neutral-100 transition-all">
      {Object.keys(qrControls).map((key) => {
        const isAccessible = canAccessType(key);
        const isPremium = premiumTypes.includes(key);
        const isActive = activeSelector === key;

        return (
          <article
            className={`flex gap-2 items-center relative ${
              isActive
                ? "bg-qrmory-purple-800 text-white"
                : isAccessible
                  ? "bg-white hover:bg-qrmory-purple-500 border-neutral-400 hover:border-qrmory-purple-500 text-neutral-500 hover:text-white"
                  : "bg-neutral-100 border-neutral-300 text-neutral-400 cursor-not-allowed"
            } qr-selector ${
              isAccessible ? "cursor-pointer" : ""
            } m-1 py-2 px-5 flex justify-center items-center rounded border text-xs lg:text-sm transition-all duration-300`}
            key={`qr-control-${qrControls[key].title.toLowerCase()}`}
            data-selector={key}
            onClick={() => isAccessible && onSelectorChange(key)}
            role="button"
            tabIndex={isAccessible ? 0 : -1}
            onKeyDown={(e) => {
              if (isAccessible && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onSelectorChange(key);
              }
            }}
            aria-pressed={isActive}
            aria-disabled={!isAccessible}
          >
            {qrControls[key].icon}
            {qrControls[key].title}

            {/* Premium badge */}
            {isPremium && !isAccessible && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-qrmory-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
