// components/ui/QRTypeSelector.tsx
"use client";

import React from "react";
import { qrControls } from "@/lib/qr-control-object";

interface QRTypeSelectorProps {
  activeSelector: string;
  onSelectorChange: (key: string) => void;
}

export function QRTypeSelector({
  activeSelector,
  onSelectorChange,
}: QRTypeSelectorProps) {
  return (
    <div className="mb-4 pb-4 flex flex-row flex-wrap justify-start items-center content-end self-start border-b-2 border-neutral-100 transition-all">
      {Object.keys(qrControls).map((key) => (
        <article
          className={`flex gap-2 items-center ${
            activeSelector === key
              ? "bg-qrmory-purple-800 text-white"
              : "bg-white hover:bg-qrmory-purple-500 border-neutral-400 hover:border-qrmory-purple-500 text-neutral-500 hover:text-white"
          } qr-selector cursor-pointer m-1 py-2 px-5 flex justify-center items-center rounded border text-xs lg:text-sm transition-all duration-300`}
          key={`qr-control-${qrControls[key].title.toLowerCase()}`}
          data-selector={key}
          onClick={() => onSelectorChange(key)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectorChange(key);
            }
          }}
          aria-pressed={activeSelector === key}
        >
          {qrControls[key].icon}
          {qrControls[key].title}
        </article>
      ))}
      <p className="m-2 inline text-black text-sm italic">more coming soon</p>
    </div>
  );
}
