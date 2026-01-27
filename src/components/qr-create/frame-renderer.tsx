// src/components/qr-create/frame-renderer.tsx
"use client";

import React, { useMemo } from "react";
import {
  QRFrameSettings,
  getFrameDimensions,
} from "@/lib/qr-frames";

interface FrameRendererProps {
  frameSettings: QRFrameSettings;
  qrSize: number;
  children: React.ReactNode;
}

// Helper function to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function FrameRenderer({
  frameSettings,
  qrSize,
  children,
}: FrameRendererProps) {
  const { type, text, textColor, frameColor } = frameSettings;

  // If no frame, just render the QR code
  if (type === "none") {
    return <>{children}</>;
  }

  const hasText = text.trim().length > 0;
  const dims = useMemo(
    () => getFrameDimensions(qrSize, type, hasText),
    [qrSize, type, hasText]
  );

  const { totalWidth, totalHeight, qrX, qrY, padding, bannerHeight } = dims;
  const cornerRadius = type === "rounded" ? Math.round(padding * 0.8) : 0;
  const fontSize = hasText ? Math.round(bannerHeight * 0.5) : 0;

  return (
    <div
      className="relative inline-block"
      style={{
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* Frame SVG Background */}
      <svg
        className="absolute inset-0"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width={totalWidth}
        height={totalHeight}
      >
        {/* Render frame based on type */}
        {type === "simple" && (
          <>
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              fill={frameColor}
            />
            <rect
              x={padding / 2}
              y={padding / 2}
              width={totalWidth - padding}
              height={totalHeight - padding}
              fill="white"
            />
          </>
        )}

        {type === "rounded" && (
          <>
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              fill={frameColor}
              rx={cornerRadius}
            />
            <rect
              x={padding / 2}
              y={padding / 2}
              width={totalWidth - padding}
              height={totalHeight - padding}
              fill="white"
              rx={cornerRadius * 0.6}
            />
          </>
        )}

        {type === "banner-top" && (
          <>
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              fill="white"
            />
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={bannerHeight + padding / 2}
              fill={frameColor}
            />
            {hasText && (
              <text
                x={totalWidth / 2}
                y={bannerHeight / 2 + padding / 4}
                fontFamily="Arial, sans-serif"
                fontSize={fontSize}
                fontWeight="bold"
                fill={textColor}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {escapeXml(text)}
              </text>
            )}
          </>
        )}

        {type === "banner-bottom" && (
          <>
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              fill="white"
            />
            <rect
              x="0"
              y={totalHeight - bannerHeight - padding / 2}
              width={totalWidth}
              height={bannerHeight + padding / 2}
              fill={frameColor}
            />
            {hasText && (
              <text
                x={totalWidth / 2}
                y={totalHeight - bannerHeight / 2 - padding / 4}
                fontFamily="Arial, sans-serif"
                fontSize={fontSize}
                fontWeight="bold"
                fill={textColor}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {escapeXml(text)}
              </text>
            )}
          </>
        )}

        {type === "full-border" && (
          <>
            <rect
              x="0"
              y="0"
              width={totalWidth}
              height={totalHeight}
              fill={frameColor}
              rx={cornerRadius}
            />
            <rect
              x={padding / 2}
              y={padding / 2}
              width={totalWidth - padding}
              height={qrSize + padding}
              fill="white"
              rx={cornerRadius * 0.6}
            />
            {hasText && (
              <text
                x={totalWidth / 2}
                y={qrSize + padding + bannerHeight / 2 + padding / 4}
                fontFamily="Arial, sans-serif"
                fontSize={fontSize}
                fontWeight="bold"
                fill={textColor}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {escapeXml(text)}
              </text>
            )}
          </>
        )}
      </svg>

      {/* QR Code positioned within frame */}
      <div
        className="absolute"
        style={{
          left: qrX,
          top: qrY,
          width: qrSize,
          height: qrSize,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default FrameRenderer;
