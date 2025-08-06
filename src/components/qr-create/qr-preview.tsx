"use client";

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

interface QRSizes {
  [key: string]: number;
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

  // Define size lookup based on user settings
  const qrSizeLookup: QRSizes = {
    small: 120,
    medium: 250,
    large: 500,
  };

  // Determine which value to use for the QR code
  const displayValue = useMemo(() => {
    // If we have a shortcode, use the full dynamic URL
    if (qrShortCode) {
      return `${process.env.NEXT_PUBLIC_SITE_URL}/${qrShortCode}`;
    }
    // Otherwise use the regular QR value
    return qrValue;
  }, [qrShortCode, qrValue]);

  const handleDownload = (format: "svg" | "png" | "jpg") => {
    const svgSelector = "#final-qr div svg";
    const originalSvg = document.querySelector(svgSelector);

    if (!originalSvg) {
      console.error("QR code element not found");
      return;
    }

    // Get the size from user settings
    const size = qrSizeLookup[userSettings.qrSize] || 250;

    if (format === "svg") {
      // For SVG, download directly
      downloadToSVG(originalSvg, qrTitle || "qrmory-qr-code");
      console.log(`Downloaded SVG file (${userSettings.qrSize} size)`);
    } else {
      // For PNG/JPG, clone and resize before download
      const clonedSvg = originalSvg.cloneNode(true) as SVGElement;

      // Set the dimensions
      clonedSvg.setAttribute("width", `${size}`);
      clonedSvg.setAttribute("height", `${size}`);
      clonedSvg.setAttribute(
        "viewBox",
        originalSvg.getAttribute("viewBox") || "0 0 29 29",
      );

      // If format is JPG, ensure white background and black foreground
      if (format === "jpg") {
        // Add a white background rectangle
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");

        // Insert the background rect as the first child
        clonedSvg.insertBefore(rect, clonedSvg.firstChild);

        // Ensure all elements that make up the QR code are black
        const elements = clonedSvg.querySelectorAll(
          "path, rect:not(:first-child), circle, polygon, polyline",
        );
        elements.forEach((el) => {
          el.setAttribute("fill", "black");
        });
      }

      // Create a temporary container
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.opacity = "0";
      tempContainer.style.pointerEvents = "none";
      tempContainer.id = "temp-qr-container";
      tempContainer.appendChild(clonedSvg);
      document.body.appendChild(tempContainer);

      // Use d3ToPng with the temporary container
      d3ToPng("#temp-qr-container svg", qrTitle || "qrmory-qr-code", {
        format: format,
      })
        .then(() => {
          console.log(
            `Downloaded ${format.toUpperCase()} file (${
              userSettings.qrSize
            } size)`,
          );
          document.body.removeChild(tempContainer);
        })
        .catch((err) => {
          console.error("Error downloading QR code:", err);
          document.body.removeChild(tempContainer);
        });
    }
  };

  return (
    <article
      className={`mx-auto p-4 lg:pt-8 lg:pb-10 lg:px-10 self-start lg:self-auto flex flex-col lg:w-qr-preview w-full sm:max-w-xs bg-white ${
        shadow
          ? "rounded-3xl shadow-xl shadow-neutral-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50"
      } text-center`}
    >
      <div className="w-full">
        <h4 className="text-xs text-neutral-400">Your QR Code Title</h4>
        <h5 className="text-base text-qrmory-purple-800 font-bold">
          {qrTitle || "Untitled QR Code"}
        </h5>
      </div>

      <div
        id={`final-qr`}
        className="my-6 lg:my-16 lg:mx-auto grid place-content-center text-neutral-600 dark:text-neutral-600 text-sm"
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
          <div className="text-center mt-2 text-neutral-500 text-sm font-medium">
            Click "Generate QR" to update
          </div>
        )}
      </div>

      <button
        className={`mx-auto py-2.5 px-4 grow w-full max-h-12 rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
          qrChanged
            ? "bg-neutral-300 text-white"
            : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
        }`}
        onClick={() => handleDownload("svg")}
        disabled={qrChanged}
      >
        Download SVG
      </button>

      <div className="my-2 flex flex-row flex-nowrap gap-2 items-center w-full">
        <button
          className={`py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
            qrChanged
              ? "bg-neutral-300 text-white"
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
              ? "bg-neutral-300 text-white"
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
