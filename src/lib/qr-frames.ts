// src/lib/qr-frames.ts
// QR Code frame definitions and presets

export type FrameType =
  | "none"
  | "simple"
  | "rounded"
  | "banner-top"
  | "banner-bottom"
  | "full-border";

export interface QRFrameSettings {
  type: FrameType;
  text: string;
  textColor: string;
  frameColor: string;
}

export const DEFAULT_FRAME_SETTINGS: QRFrameSettings = {
  type: "none",
  text: "",
  textColor: "#FFFFFF",
  frameColor: "#2A0B4D",
};

// Frame type definitions with labels for UI
export const FRAME_TYPES: { value: FrameType; label: string; description: string }[] = [
  { value: "none", label: "None", description: "No frame" },
  { value: "simple", label: "Simple", description: "Basic rectangular border" },
  { value: "rounded", label: "Rounded", description: "Rounded corner border" },
  { value: "banner-top", label: "Banner Top", description: "Text banner above QR" },
  { value: "banner-bottom", label: "Banner Bottom", description: "Text banner below QR" },
  { value: "full-border", label: "Full Border", description: "Complete frame with text" },
];

// CTA text presets
export const CTA_PRESETS: string[] = [
  "Scan Me!",
  "View Menu",
  "Order Here",
  "Learn More",
  "Get Discount",
  "Follow Us",
  "Download App",
  "Book Now",
  "Contact Us",
  "Visit Website",
];

// Calculate frame dimensions based on QR size
export function getFrameDimensions(
  qrSize: number,
  frameType: FrameType,
  hasText: boolean
): {
  totalWidth: number;
  totalHeight: number;
  qrX: number;
  qrY: number;
  padding: number;
  bannerHeight: number;
} {
  const basePadding = Math.round(qrSize * 0.08); // 8% of QR size
  const bannerHeight = hasText && (frameType === "banner-top" || frameType === "banner-bottom" || frameType === "full-border")
    ? Math.round(qrSize * 0.18)
    : 0;

  switch (frameType) {
    case "none":
      return {
        totalWidth: qrSize,
        totalHeight: qrSize,
        qrX: 0,
        qrY: 0,
        padding: 0,
        bannerHeight: 0,
      };

    case "simple":
    case "rounded":
      return {
        totalWidth: qrSize + basePadding * 2,
        totalHeight: qrSize + basePadding * 2,
        qrX: basePadding,
        qrY: basePadding,
        padding: basePadding,
        bannerHeight: 0,
      };

    case "banner-top":
      return {
        totalWidth: qrSize + basePadding * 2,
        totalHeight: qrSize + basePadding * 2 + bannerHeight,
        qrX: basePadding,
        qrY: basePadding + bannerHeight,
        padding: basePadding,
        bannerHeight,
      };

    case "banner-bottom":
      return {
        totalWidth: qrSize + basePadding * 2,
        totalHeight: qrSize + basePadding * 2 + bannerHeight,
        qrX: basePadding,
        qrY: basePadding,
        padding: basePadding,
        bannerHeight,
      };

    case "full-border":
      return {
        totalWidth: qrSize + basePadding * 2,
        totalHeight: qrSize + basePadding * 2 + bannerHeight,
        qrX: basePadding,
        qrY: basePadding,
        padding: basePadding,
        bannerHeight,
      };

    default:
      return {
        totalWidth: qrSize,
        totalHeight: qrSize,
        qrX: 0,
        qrY: 0,
        padding: 0,
        bannerHeight: 0,
      };
  }
}

// Generate SVG frame markup
export function generateFrameSVG(
  frameSettings: QRFrameSettings,
  qrSize: number,
  qrSvgContent: string
): string {
  if (frameSettings.type === "none") {
    return qrSvgContent;
  }

  const hasText = frameSettings.text.trim().length > 0;
  const dims = getFrameDimensions(qrSize, frameSettings.type, hasText);
  const { totalWidth, totalHeight, qrX, qrY, padding, bannerHeight } = dims;

  const cornerRadius = frameSettings.type === "rounded" ? Math.round(padding * 0.8) : 0;

  // Calculate font size based on banner height
  const fontSize = hasText ? Math.round(bannerHeight * 0.5) : 0;

  let frameElements = "";
  let textElement = "";

  // Frame background
  switch (frameSettings.type) {
    case "simple":
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}"
              fill="${frameSettings.frameColor}" />
        <rect x="${padding / 2}" y="${padding / 2}"
              width="${totalWidth - padding}" height="${totalHeight - padding}"
              fill="white" />
      `;
      break;

    case "rounded":
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}"
              fill="${frameSettings.frameColor}" rx="${cornerRadius}" />
        <rect x="${padding / 2}" y="${padding / 2}"
              width="${totalWidth - padding}" height="${totalHeight - padding}"
              fill="white" rx="${cornerRadius * 0.6}" />
      `;
      break;

    case "banner-top":
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="white" />
        <rect x="0" y="0" width="${totalWidth}" height="${bannerHeight + padding / 2}"
              fill="${frameSettings.frameColor}" />
      `;
      if (hasText) {
        textElement = `
          <text x="${totalWidth / 2}" y="${bannerHeight / 2 + padding / 4}"
                font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold"
                fill="${frameSettings.textColor}" text-anchor="middle" dominant-baseline="middle">
            ${escapeXml(frameSettings.text)}
          </text>
        `;
      }
      break;

    case "banner-bottom":
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="white" />
        <rect x="0" y="${totalHeight - bannerHeight - padding / 2}"
              width="${totalWidth}" height="${bannerHeight + padding / 2}"
              fill="${frameSettings.frameColor}" />
      `;
      if (hasText) {
        textElement = `
          <text x="${totalWidth / 2}" y="${totalHeight - bannerHeight / 2 - padding / 4}"
                font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold"
                fill="${frameSettings.textColor}" text-anchor="middle" dominant-baseline="middle">
            ${escapeXml(frameSettings.text)}
          </text>
        `;
      }
      break;

    case "full-border":
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}"
              fill="${frameSettings.frameColor}" rx="${cornerRadius}" />
        <rect x="${padding / 2}" y="${padding / 2}"
              width="${totalWidth - padding}" height="${qrSize + padding}"
              fill="white" rx="${cornerRadius * 0.6}" />
      `;
      if (hasText) {
        textElement = `
          <text x="${totalWidth / 2}" y="${qrSize + padding + bannerHeight / 2 + padding / 4}"
                font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold"
                fill="${frameSettings.textColor}" text-anchor="middle" dominant-baseline="middle">
            ${escapeXml(frameSettings.text)}
          </text>
        `;
      }
      break;
  }

  // Wrap the QR SVG content in a group positioned correctly
  const qrWrapper = `
    <g transform="translate(${qrX}, ${qrY})">
      ${qrSvgContent}
    </g>
  `;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    ${frameElements}
    ${qrWrapper}
    ${textElement}
  </svg>`;
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

// Generate a mini preview for frame selection UI
export function generateFramePreview(
  frameType: FrameType,
  hasText: boolean = true,
  size: number = 60
): string {
  const previewSettings: QRFrameSettings = {
    type: frameType,
    text: hasText ? "SCAN" : "",
    textColor: "#FFFFFF",
    frameColor: "#2A0B4D",
  };

  const qrSize = frameType === "none" ? size : Math.round(size * 0.7);
  const dims = getFrameDimensions(qrSize, frameType, hasText);

  // Simple placeholder for QR code in preview
  const qrPlaceholder = `
    <rect x="0" y="0" width="${qrSize}" height="${qrSize}" fill="white" />
    <rect x="${qrSize * 0.1}" y="${qrSize * 0.1}" width="${qrSize * 0.25}" height="${qrSize * 0.25}" fill="#2A0B4D" />
    <rect x="${qrSize * 0.65}" y="${qrSize * 0.1}" width="${qrSize * 0.25}" height="${qrSize * 0.25}" fill="#2A0B4D" />
    <rect x="${qrSize * 0.1}" y="${qrSize * 0.65}" width="${qrSize * 0.25}" height="${qrSize * 0.25}" fill="#2A0B4D" />
    <rect x="${qrSize * 0.4}" y="${qrSize * 0.4}" width="${qrSize * 0.2}" height="${qrSize * 0.2}" fill="#2A0B4D" />
  `;

  if (frameType === "none") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect x="0" y="0" width="${size}" height="${size}" fill="white" rx="4" />
      ${qrPlaceholder}
    </svg>`;
  }

  return generateFrameSVG(previewSettings, qrSize, qrPlaceholder);
}
