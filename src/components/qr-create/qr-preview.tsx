"use client";

import React, {
  useRef,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useQRCode } from "next-qrcode";
import { toast } from "sonner";
import d3ToPng from "d3-svg-to-png";
import { UserSettings } from "@/lib/default-settings";
import { useErrorReporting } from "@/hooks/useErrorReporting";
import { ErrorBoundary } from "@/components/error-boundary";
import { User } from "@supabase/auth-js";

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
  user: User | null;
  userSettings: UserSettings;
  qrColors: { foreground: string; background: string };
}

interface QRSizes {
  [key: string]: number;
}

function QRPreviewContent({
  qrState,
  displayValue,
  shadow,
  user,
  userSettings,
  qrColors,
}: Props) {
  const { SVG } = useQRCode();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const { reportError } = useErrorReporting();

  const [originalErrorLevel, setOriginalErrorLevel] = useState(
    userSettings.qrErrorCorrectionLevel,
  );

  // Logo state
  const [showLogo, setShowLogo] = useState(false);
  const [logoCheckTimestamp, setLogoCheckTimestamp] = useState(Date.now());

  // Check if user has logo and error correction is sufficient
  const hasLogo = useMemo(() => {
    return userSettings.logoUrl && userSettings.logoUrl.trim().length > 0;
  }, [userSettings.logoUrl, logoCheckTimestamp]);

  const errorCorrectionSufficient = useMemo(() => {
    const level = userSettings.qrErrorCorrectionLevel;
    // M, Q, H are sufficient for 15% logo coverage
    return ["M", "Q", "H"].includes(level);
  }, [userSettings.qrErrorCorrectionLevel]);

  const logoRecommendation = useMemo(() => {
    if (!hasLogo) return null;
    if (errorCorrectionSufficient) return "safe";
    return userSettings.qrErrorCorrectionLevel === "L" ? "warning" : "safe";
  }, [hasLogo, errorCorrectionSufficient, userSettings.qrErrorCorrectionLevel]);

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

  // Logo refresh handler
  const handleLogoRefresh = useCallback(() => {
    setLogoCheckTimestamp(Date.now());
    if (hasLogo) {
      toast("Logo found!", {
        description: "You can now toggle logo display on your QR code.",
      });
    } else {
      toast("No logo found", {
        description: "Please upload a logo in your settings first.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    }
  }, [hasLogo]);

  // Enhanced download handler with logo support
  const handleDownload = useCallback(
    async (format: "svg" | "png" | "jpg") => {
      const startTime = Date.now();
      const shouldIncludeLogo = showLogo && hasLogo;

      try {
        if (!qrContainerRef.current) {
          throw new Error("QR code container not found");
        }

        const svgElement = qrContainerRef.current.querySelector("svg");
        if (!svgElement) {
          throw new Error("QR code SVG element not found");
        }

        const filename = qrState.title || "qrmory-qr-code";
        const cacheKey = `${filename}_${format}_${currentSize}_${
          qrState.value
        }_${shouldIncludeLogo ? userSettings.logoUrl : "no-logo"}`;

        // Check cache first
        if (downloadCache.current.has(cacheKey)) {
          const cached = downloadCache.current.get(cacheKey)!;
          downloadFile(cached.url, `${filename}.${format}`);

          toast(`${format.toUpperCase()} downloaded successfully!`, {
            description: `Downloaded cached version`,
          });
          return;
        }

        // Create a properly sized clone
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

        // Add logo if enabled and available
        if (shouldIncludeLogo) {
          try {
            const logoGroup = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "g",
            );

            // Calculate logo size and position (20% of QR code size, centered)
            const viewBox = svgElement.getAttribute("viewBox") || "0 0 29 29";
            const [, , viewWidth, viewHeight] = viewBox.split(" ").map(Number);
            const logoSize =
              Math.max(viewWidth, viewHeight) * (shouldIncludeLogo ? 0.2 : 0);
            const logoX = (viewWidth - logoSize) / 2;
            const logoY = (viewHeight - logoSize) / 2;

            // Create white background circle for logo
            const bgCircle = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "circle",
            );
            bgCircle.setAttribute("cx", (viewWidth / 2).toString());
            bgCircle.setAttribute("cy", (viewHeight / 2).toString());
            bgCircle.setAttribute("r", (logoSize / 2 + 0.5).toString());
            bgCircle.setAttribute("fill", "white");
            bgCircle.setAttribute("stroke", "#000");
            bgCircle.setAttribute("stroke-width", "0.2");
            logoGroup.appendChild(bgCircle);

            // Create image element for logo
            const logoImage = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "image",
            );
            logoImage.setAttribute("x", logoX.toString());
            logoImage.setAttribute("y", logoY.toString());
            logoImage.setAttribute("width", logoSize.toString());
            logoImage.setAttribute("height", logoSize.toString());
            logoImage.setAttribute("href", userSettings.logoUrl || "");
            logoImage.setAttribute("preserveAspectRatio", "xMidYMid meet");
            logoGroup.appendChild(logoImage);

            clonedSvg.appendChild(logoGroup);
          } catch (logoError) {
            console.warn("Failed to add logo to QR code:", logoError);
            // Continue without logo
          }
        }

        if (format === "svg") {
          const svgData = new XMLSerializer().serializeToString(clonedSvg);
          const svgBlob = new Blob([svgData], {
            type: "image/svg+xml;charset=utf-8",
          });
          const svgUrl = URL.createObjectURL(svgBlob);

          // Cache the result
          downloadCache.current.set(cacheKey, { blob: svgBlob, url: svgUrl });

          downloadFile(svgUrl, `${filename}.svg`);

          toast("SVG downloaded successfully!", {
            description: `Downloaded as ${filename}.svg${
              shouldIncludeLogo ? " with logo" : ""
            }`,
          });
          return;
        }

        // For PNG/JPG, create temporary container for conversion
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
            description: `Downloaded as ${filename}.${format} (${
              userSettings.qrSize
            } size)${
              shouldIncludeLogo ? " with logo" : ""
            } in ${processingTime}ms`,
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
            hasLogo: !!userSettings.logoUrl,
            logoEnabled: showLogo,
          },
        });

        console.error(`Error downloading ${format.toUpperCase()}:`, error);

        let errorMessage =
          "Please try again or contact support if the issue persists.";
        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            errorMessage =
              "QR code not ready. Please generate the QR code first.";
          } else if (error.message.includes("size")) {
            errorMessage =
              "Invalid size settings. Please try a different size.";
          } else if (error.message.includes("logo")) {
            errorMessage =
              "Logo could not be added. Download will continue without logo.";
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
      userSettings.logoUrl,
      showLogo,
      hasLogo,
      errorCorrectionSufficient,
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

  const effectiveErrorCorrectionLevel = useMemo(() => {
    if (!showLogo || !hasLogo) {
      return userSettings.qrErrorCorrectionLevel;
    }

    // When logo is on, ensure minimum Q level
    const currentLevel = userSettings.qrErrorCorrectionLevel;
    if (currentLevel === "L" || currentLevel === "M") {
      return "Q"; // Force Q level for logo compatibility
    }

    return currentLevel; // Keep Q or H as is
  }, [showLogo, hasLogo, userSettings.qrErrorCorrectionLevel]);

  // Sticky behavior
  useEffect(() => {
    const content = contentRef.current;
    const container = articleRef.current;
    if (!content || !container) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const contentHeight = content.offsetHeight;
      const containerHeight = container.offsetHeight;

      // Only apply sticky behavior if content is shorter than container
      if (contentHeight >= containerHeight) {
        content.style.position = "static";
        content.style.top = "auto";
        content.style.transform = "translateY(0)";
        return;
      }

      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const stickyOffset = 20; // 1rem

      // Calculate available space for movement
      const moveableSpace = containerHeight - contentHeight;

      if (containerTop > stickyOffset) {
        // Article hasn't reached sticky position yet - content at top
        content.style.position = "static";
        content.style.top = "auto";
        content.style.transform = "translateY(0)";
      } else {
        // Article top has passed sticky position
        // Check if making content sticky would cause it to overflow bottom
        const stickyBottomPosition = stickyOffset + contentHeight;

        if (stickyBottomPosition <= containerBottom) {
          // Content can stick without overflowing - make it sticky
          content.style.position = "sticky";
          content.style.top = `${stickyOffset}px`;
          content.style.transform = "translateY(0)";
          container.style.justifyContent = "flex-start";
        } else {
          // Content would overflow if sticky - position it at bottom of container
          content.style.position = "static";
          content.style.top = "auto";

          container.style.justifyContent = "flex-end";
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showLogo) {
      setOriginalErrorLevel(userSettings.qrErrorCorrectionLevel);
    }
  }, [userSettings.qrErrorCorrectionLevel, showLogo]);

  // Cleanup cache on component unmount
  useEffect(() => {
    return () => {
      downloadCache.current.forEach(({ url }) => {
        URL.revokeObjectURL(url);
      });
      downloadCache.current.clear();
    };
  }, []);

  // Calculate preview logo size (20% of 180px display size)
  const previewLogoSize = useMemo(() => {
    if (!qrContainerRef.current) return 36; // fallback for 20%

    const svgElement = qrContainerRef.current.querySelector("svg");
    if (!svgElement) return 36;

    const viewBox = svgElement.getAttribute("viewBox") || "0 0 29 29";
    const [, , viewWidth, viewHeight] = viewBox.split(" ").map(Number);
    const logoSizeInViewBox = Math.max(viewWidth, viewHeight) * 0.2; // 20% instead of 15%

    const displayWidth = 180;
    const scaleRatio = displayWidth / Math.max(viewWidth, viewHeight);

    return Math.floor(logoSizeInViewBox * scaleRatio);
  }, [displayValue, qrState.value]);

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
      ref={articleRef}
      className={`mx-auto p-4 lg:pt-8 lg:pb-10 lg:px-10 flex flex-col lg:w-qr-preview w-full sm:max-w-xs bg-white ${
        shadow
          ? "rounded-3xl shadow-xl shadow-neutral-300/50"
          : "lg:rounded-3xl lg:shadow-xl lg:shadow-neutral-300/50"
      } text-center relative`}
    >
      <div
        ref={contentRef}
        className="transition-all duration-150 ease-out"
        style={{ willChange: "transform" }}
      >
        <header className="w-full">
          <h4 className="text-xs text-neutral-400">Your QR Code Title</h4>
          <h5 className="text-base text-qrmory-purple-800 font-bold">
            {qrState.title || "Untitled QR Code"}
          </h5>
        </header>

        <div
          ref={qrContainerRef}
          className="my-6 lg:my-16 lg:mx-auto grid place-content-center text-neutral-600 dark:text-neutral-600 text-sm relative"
          role="img"
          aria-label={`QR code for ${qrState.title || "content"}`}
        >
          <SVG
            text={displayValue}
            options={{
              errorCorrectionLevel: effectiveErrorCorrectionLevel,
              color: {
                dark: qrState.changed
                  ? "#78716c"
                  : qrColors?.foreground || "#000000",
                light: qrColors?.background || "#0000",
              },
              width: 180,
              margin: 1,
            }}
          />

          {/* Logo overlay for preview */}
          {showLogo && hasLogo && !qrState.changed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="bg-white rounded-full shadow-sm flex items-center justify-center"
                style={{
                  width: `${previewLogoSize}px`,
                  height: `${previewLogoSize}px`,
                  padding: "2px",
                }}
              >
                <img
                  src={userSettings.logoUrl || ""}
                  alt="QR Logo"
                  className="rounded-full object-contain"
                  style={{
                    width: `${previewLogoSize - 4}px`,
                    height: `${previewLogoSize - 4}px`,
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {qrState.changed && (
            <div className="text-center mt-2 text-neutral-500 text-sm font-medium">
              Click "Generate QR" to update
            </div>
          )}
        </div>

        {/* Logo Controls */}
        {user && (
          <div className="mb-4 p-3 bg-neutral-50 rounded-lg border">
            <h6 className="text-xs font-medium text-neutral-700 mb-2">
              Logo Settings
            </h6>

            {!hasLogo ? (
              <div className="text-center">
                <p className="text-xs text-neutral-600 mb-2">
                  No logo found in your settings
                </p>
                <a
                  href="/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs px-3 py-1.5 bg-qrmory-purple-600 text-white rounded hover:bg-qrmory-purple-700 transition-colors"
                >
                  Upload Logo in Settings
                </a>
                <button
                  onClick={handleLogoRefresh}
                  className="block mx-auto mt-2 text-xs text-qrmory-purple-600 hover:text-qrmory-purple-800 underline"
                >
                  I've added my logo - check again
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">
                    Show logo on QR
                  </span>
                  <button
                    onClick={() => setShowLogo(!showLogo)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      showLogo ? "bg-qrmory-purple-600" : "bg-neutral-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        showLogo ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {logoRecommendation === "safe" &&
                  showLogo &&
                  hasLogo &&
                  (userSettings.qrErrorCorrectionLevel === "L" ||
                    userSettings.qrErrorCorrectionLevel === "M") && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <p className="text-blue-800">
                        ℹ️ Error correction temporarily upgraded to Q level for
                        logo compatibility.
                      </p>
                    </div>
                  )}

                <button
                  onClick={handleLogoRefresh}
                  className="w-full text-xs text-neutral-600 hover:text-neutral-800 underline"
                >
                  Refresh logo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings indicator */}
        <div className="mb-4 text-xs text-neutral-400 space-y-1">
          <div>
            Size: {userSettings.qrSize} • Error Level:{" "}
            {showLogo &&
            (userSettings.qrErrorCorrectionLevel === "L" ||
              userSettings.qrErrorCorrectionLevel === "M")
              ? "Q"
              : userSettings.qrErrorCorrectionLevel || "M"}
          </div>
        </div>

        {downloadButtons}
      </div>
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
