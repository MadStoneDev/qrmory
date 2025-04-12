﻿"use client";

import React, { useMemo } from "react";
import { useQRCode } from "next-qrcode";
import { downloadToSVG } from "@/utils/qr-save";
import d3ToPng from "d3-svg-to-png";
import { UserSettings } from "@/lib/default-settings";

interface Props {
  qrTitle: string;
  qrValue: string;
  qrChanged: boolean;
  qrShortCode: string;
  shadow?: boolean;
  user: any;
  userSettings: UserSettings;
}

export default function QRPreview({
  qrTitle,
  qrValue,
  qrChanged,
  qrShortCode,
  shadow,
  user,
  userSettings,
}: Props) {
  const { SVG } = useQRCode();

  // Determine which value to use for the QR code
  const displayValue = useMemo(() => {
    return qrShortCode || qrValue;
  }, [qrShortCode, qrValue]);

  const handleDownload = (format: "png" | "jpg") => {
    const svgData = document.querySelector("#final-qr div svg");
    if (!svgData) return;

    d3ToPng(`#final-qr div svg`, qrTitle || "qrmory-qr-code", {
      format: format,
    }).then(() => console.log(`Downloaded ${format} file`));
  };

  return (
    <article
      className={`mx-auto p-4 lg:pt-8 lg:pb-10 lg:px-10 self-start lg:self-auto flex flex-col lg:w-qr-preview w-full sm:max-w-xs bg-white ${
        shadow
          ? "rounded-3xl shadow-xl shadow-stone-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-stone-300/50"
      } text-center`}
    >
      <div className="w-full">
        <h4 className="text-xs text-stone-400">Your QR Code Title</h4>
        <h5 className="text-base text-qrmory-purple-800 font-bold">
          {qrTitle || "Untitled QR Code"}
        </h5>
      </div>

      <div
        id={`final-qr`}
        className="my-6 lg:my-16 lg:mx-auto grid place-content-center text-gray-600 dark:text-gray-600 text-sm"
      >
        <SVG
          text={displayValue}
          options={{
            errorCorrectionLevel: userSettings.qrErrorCorrectionLevel,
            color: {
              dark: qrChanged ? "#78716c" : "#000000",
              light: "#0000",
            },
            width: 180,
            margin: 1,
          }}
        />
        {qrChanged && (
          <div className="text-center mt-2 text-stone-500 text-sm font-medium">
            Click "Generate QR" to update
          </div>
        )}
      </div>

      <button
        className={`mx-auto py-2.5 px-4 grow w-full max-h-12 rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
          qrChanged
            ? "bg-stone-300 text-white"
            : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
        }`}
        onClick={() => {
          const svgData = document.querySelector("#final-qr div svg");
          downloadToSVG(svgData, qrTitle || "qrmory-qr-code");
        }}
        disabled={qrChanged}
      >
        Download SVG
      </button>

      <div className="my-2 flex flex-row flex-nowrap gap-2 items-center w-full">
        <button
          className={`py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
            qrChanged
              ? "bg-stone-300 text-white"
              : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
          }`}
          onClick={() => handleDownload("png")}
          disabled={qrChanged}
        >
          png
        </button>

        <button
          className={`py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
            qrChanged
              ? "bg-stone-300 text-white"
              : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
          }`}
          onClick={() => handleDownload("jpg")}
          disabled={qrChanged}
        >
          jpg
        </button>
      </div>
    </article>
  );
}
