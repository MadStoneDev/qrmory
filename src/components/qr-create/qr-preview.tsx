"use client";

import React, { useRef, useCallback, useMemo } from "react";
import { useQRCode } from "next-qrcode";
import { toast } from "sonner";
import d3ToPng from "d3-svg-to-png";
import { UserSettings } from "@/lib/default-settings";
import { useErrorReporting } from "@/hooks/useErrorReporting";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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

interface Props {
  qrState: QRState;
  displayValue: string;
  shadow?: boolean;
  userSettings: UserSettings;
}

interface QRSizes {
  [key: string]: number;
}

function QRPreviewContent({
  qrState,
  displayValue,
  shadow,
  userSettings,
}: Props) {
  const { SVG } = useQRCode();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const { reportError } = useErrorReporting();

  // Define size lookup based on user settings
  const qrSizeLookup: QRSizes = useMemo(
    () => ({
      small: 120,
      medium: 250,
      large: 500,
    }),
    [],
  );

  // Get current size from user settings
  const currentSize = useMemo(
    () => qrSizeLookup[userSettings.qrSize] || 250,
    [qrSizeLookup, userSettings.qrSize],
  );

  // Cached download elements to prevent recreating
  const downloadCache = useRef<Map<string, { blob: Blob; url: string }>>(
    new Map(),
  );

  // Enhanced download handler with better error handling and caching
  const handleDownload = useCallback(
    async (format: "svg" | "png" | "jpg") => {
      const startTime = Date.now();

      try {
        if (!qrContainerRef.current) {
          throw new Error("QR code container not found");
        }

        const svgElement = qrContainerRef.current.querySelector("svg");
        if (!svgElement) {
          throw new Error("QR code SVG element not found");
        }

        const filename = qrState.title || "qrmory-qr-code";
        const cacheKey = `${filename}_${format}_${currentSize}_${qrState.value}`;

        // Check cache first
        if (downloadCache.current.has(cacheKey)) {
          const cached = downloadCache.current.get(cacheKey)!;
          downloadFile(cached.url, `${filename}.${format}`);

          toast(`${format.toUpperCase()} downloaded successfully!`, {
            description: `Downloaded cached version`,
          });
          return;
        }

        if (format === "svg") {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          const svgUrl = URL.createObjectURL(svgBlob);

          // Cache the result
          downloadCache.current.set(cacheKey, { blob: svgBlob, url: svgUrl });

          downloadFile(svgUrl, `${filename}.svg`);

          toast("SVG downloaded successfully!", {
            description: `Downloaded as ${filename}.svg`,
          });
          return;
        }

        // For PNG/JPG, create a properly sized clone
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;

        // Set dimensions and viewBox
        clonedSvg.setAttribute("width", `${currentSize}`);
        clonedSvg.setAttribute("height", `${currentSize}`);
        clonedSvg.setAttribute(
          "viewBox",
          svgElement.getAttribute("viewBox") || "0 0 29 29",
        );

        // For JPG format, ensure proper contrast
        if (format === "jpg") {
          // Add white background
          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
          );
          rect.setAttribute("width", "100%");
          rect.setAttribute("height", "100%");
          rect.setAttribute("fill", "white");
          clonedSvg.insertBefore(rect, clonedSvg.firstChild);

          // Ensure QR elements are black
          const qrElements = clonedSvg.querySelectorAll(
            "path, rect:not(:first-child), circle, polygon, polyline",
          );
          qrElements.forEach((el) => {
            el.setAttribute("fill", "black");
          });
        }

        // Create temporary container for conversion
        const tempContainer = document.createElement("div");
        const tempId = `temp-qr-container-${Date.now()}`;
        tempContainer.id = tempId;
        tempContainer.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          opacity: 0;
          pointer-events: none;
        `;
        tempContainer.appendChild(clonedSvg);
        document.body.appendChild(tempContainer);

        try {
          await d3ToPng(`#${tempId} svg`, filename, { format });

          const processingTime = Date.now() - startTime;
          toast(`${format.toUpperCase()} downloaded successfully!`, {
            description: `Downloaded as ${filename}.${format} (${userSettings.qrSize} size) in ${processingTime}ms`,
          });
        } finally {
          // Ensure cleanup always happens
          if (document.body.contains(tempContainer)) {
            document.body.removeChild(tempContainer);
          }
        }
      } catch (error) {
        const processingTime = Date.now() - startTime;

        reportError(error as Error, {
          operation: "qr_download",
          component: "qr_preview",
          metadata: {
            format,
            filename: qrState.title,
            size: currentSize,
            processingTime,
          },
        });

        console.error(`Error downloading ${format.toUpperCase()}:`, error);

        // Provide specific error messages
        let errorMessage =
          "Please try again or contact support if the issue persists.";
        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            errorMessage =
              "QR code not ready. Please generate the QR code first.";
          } else if (error.message.includes("size")) {
            errorMessage =
              "Invalid size settings. Please try a different size.";
          }
        }

        toast(`Failed to download ${format.toUpperCase()}`, {
          description: errorMessage,
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
          action: {
            label: "Retry",
            onClick: () => handleDownload(format),
          },
        });
      }
    },
    [
      qrState.title,
      qrState.value,
      currentSize,
      userSettings.qrSize,
      reportError,
    ],
  );

  // Helper function to trigger download
  const downloadFile = useCallback((url: string, filename: string) => {
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }, []);

  // Cleanup cache on component unmount
  React.useEffect(() => {
    return () => {
      downloadCache.current.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
      downloadCache.current.clear();
    };
  }, []);

  // Memoized download buttons to prevent unnecessary re-renders
  const downloadButtons = useMemo(
    () => (
      <>
        <button
          className={`mx-auto py-2.5 px-4 grow w-full max-h-12 rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
            qrState.changed
              ? "bg-neutral-300 text-white cursor-not-allowed"
              : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-800 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
          }`}
          onClick={() => handleDownload("svg")}
          disabled={qrState.changed}
          aria-label="Download QR code as SVG"
        >
          Download SVG
        </button>

        <div className="my-2 flex flex-row flex-nowrap gap-2 items-center w-full">
          <button
            className={`py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
              qrState.changed
                ? "bg-neutral-300 text-white cursor-not-allowed"
                : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
            }`}
            onClick={() => handleDownload("png")}
            disabled={qrState.changed}
            aria-label="Download QR code as PNG"
          >
            PNG
          </button>

          <button
            className={`py-2.5 px-4 grow rounded uppercase font-bold text-xs lg:text-base transition-all duration-300 ${
              qrState.changed
                ? "bg-neutral-300 text-white cursor-not-allowed"
                : "cursor-pointer bg-white hover:bg-qrmory-purple-400 border border-qrmory-purple-500 text-qrmory-purple-800 hover:text-white hover:-translate-y-1 hover:translate-x-1"
            }`}
            onClick={() => handleDownload("jpg")}
            disabled={qrState.changed}
            aria-label="Download QR code as JPG"
          >
            JPG
          </button>
        </div>
      </>
    ),
    [qrState.changed, handleDownload],
  );

  return (
    <article
      className={`mx-auto p-4 lg:pt-8 lg:pb-10 lg:px-10 self-start lg:self-auto flex flex-col lg:w-qr-preview w-full sm:max-w-xs bg-white ${
        shadow
          ? "rounded-3xl shadow-xl shadow-neutral-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50"
      } text-center`}
    >
      <header className="w-full">
        <h4 className="text-xs text-neutral-400">Your QR Code Title</h4>
        <h5 className="text-base text-qrmory-purple-800 font-bold">
          {qrState.title || "Untitled QR Code"}
        </h5>
      </header>

      <div
        ref={qrContainerRef}
        className="my-6 lg:my-16 lg:mx-auto grid place-content-center text-neutral-600 dark:text-neutral-600 text-sm"
        role="img"
        aria-label={`QR code for ${qrState.title || "content"}`}
      >
        <SVG
          text={displayValue}
          options={{
            errorCorrectionLevel: userSettings.qrErrorCorrectionLevel,
            color: {
              dark: qrState.changed ? "#78716c" : "#000000",
              light: "#0000",
            },
            width: 180,
            margin: 1,
          }}
        />
        {qrState.changed && (
          <div className="text-center mt-2 text-neutral-500 text-sm font-medium">
            Click "Generate QR" to update
          </div>
        )}
      </div>

      {downloadButtons}
    </article>
  );
}

// Export the enhanced component with error boundary
export default function QRPreviewEnhanced(props: Props) {
  return (
    <ErrorBoundary fallback={QRPreviewErrorFallback}>
      <QRPreviewContent {...props} />
    </ErrorBoundary>
  );
}

function QRPreviewErrorFallback({ error }: { error?: Error }) {
  return (
    <article className="mx-auto p-4 lg:pt-8 lg:pb-10 lg:px-10 self-start lg:self-auto flex flex-col lg:w-qr-preview w-full sm:max-w-xs bg-white lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50 text-center">
      <div className="my-6 lg:my-16 lg:mx-auto grid place-content-center text-neutral-600 text-sm">
        <div className="w-40 h-40 bg-neutral-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-neutral-400"
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
            <p className="text-sm text-neutral-500">QR Preview Error</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mx-auto py-2.5 px-4 w-full max-h-12 rounded uppercase font-bold text-xs lg:text-base bg-qrmory-purple-800 text-white hover:bg-qrmory-purple-700 transition-colors"
      >
        Reload Preview
      </button>
    </article>
  );
}
