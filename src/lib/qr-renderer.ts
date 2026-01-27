// src/lib/qr-renderer.ts
// Custom QR code renderer with shape support

import qrcode from "qrcode-generator";
import {
  QRShapeSettings,
  getDotPath,
  getCornerPath,
  getCornerDotPath,
  isFinderPattern,
  getFinderPatterns,
} from "./qr-shapes";

export interface QRRenderOptions {
  text: string;
  size: number;
  margin: number;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  foregroundColor: string;
  backgroundColor: string;
  shapeSettings: QRShapeSettings;
}

export interface QRRenderResult {
  svg: string;
  moduleCount: number;
}

// Error correction level type for qrcode-generator
type ErrorCorrectionLevelCode = "L" | "M" | "Q" | "H";

export function renderQRCode(options: QRRenderOptions): QRRenderResult {
  const {
    text,
    size,
    margin,
    errorCorrectionLevel,
    foregroundColor,
    backgroundColor,
    shapeSettings,
  } = options;

  // Generate QR code matrix using qrcode-generator
  // TypeNumber 0 = auto-detect, ErrorCorrectionLevel is passed as string
  const qr = qrcode(0, errorCorrectionLevel as ErrorCorrectionLevelCode);
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const totalSize = size;
  const marginSize = margin;
  const qrSize = totalSize - marginSize * 2;
  const moduleSize = qrSize / moduleCount;

  // Build SVG paths
  const paths: string[] = [];
  const finderPositions = getFinderPatterns(moduleCount);

  // Render regular data modules (excluding finder patterns)
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) continue;

      // Skip finder pattern areas - we'll render them separately
      if (isFinderPattern(row, col, moduleCount)) continue;

      const x = marginSize + col * moduleSize;
      const y = marginSize + row * moduleSize;

      paths.push(getDotPath(x, y, moduleSize, shapeSettings.dotStyle));
    }
  }

  // Render finder patterns with custom styles
  for (const finder of finderPositions) {
    const baseX = marginSize + finder.x * moduleSize;
    const baseY = marginSize + finder.y * moduleSize;
    const finderSize = 7 * moduleSize;

    // Outer ring (7x7)
    const outerPath = getCornerPath(
      baseX,
      baseY,
      finderSize,
      shapeSettings.cornerStyle
    );

    // Inner white ring (5x5) - we create a cutout
    const innerWhiteX = baseX + moduleSize;
    const innerWhiteY = baseY + moduleSize;
    const innerWhiteSize = 5 * moduleSize;

    // Inner dark square (3x3)
    const innerDarkX = baseX + 2 * moduleSize;
    const innerDarkY = baseY + 2 * moduleSize;
    const innerDarkSize = 3 * moduleSize;

    // Build the finder pattern with proper layering
    // Outer border
    paths.push(
      `M ${baseX} ${baseY} h ${finderSize} v ${finderSize} h ${-finderSize} Z ` +
        `M ${innerWhiteX} ${innerWhiteY} v ${innerWhiteSize} h ${innerWhiteSize} v ${-innerWhiteSize} Z`
    );

    // Inner dot
    paths.push(
      getCornerDotPath(
        innerDarkX,
        innerDarkY,
        innerDarkSize,
        shapeSettings.cornerDotStyle
      )
    );
  }

  // Combine all paths
  const combinedPath = paths.join(" ");

  // Create SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <rect x="0" y="0" width="${totalSize}" height="${totalSize}" fill="${backgroundColor}"/>
  <path d="${combinedPath}" fill="${foregroundColor}" fill-rule="evenodd"/>
</svg>`;

  return {
    svg,
    moduleCount,
  };
}

// Alternative renderer that returns separate elements for more control
export function renderQRCodeElements(options: QRRenderOptions): {
  background: string;
  dataDots: string;
  finderPatterns: string;
  moduleCount: number;
  viewBox: string;
} {
  const {
    text,
    size,
    margin,
    errorCorrectionLevel,
    foregroundColor,
    backgroundColor,
    shapeSettings,
  } = options;

  // Generate QR code matrix
  const qr = qrcode(0, errorCorrectionLevel as ErrorCorrectionLevelCode);
  qr.addData(text);
  qr.make();

  const moduleCount = qr.getModuleCount();
  const totalSize = size;
  const marginSize = margin;
  const qrSize = totalSize - marginSize * 2;
  const moduleSize = qrSize / moduleCount;

  // Build paths
  const dataPaths: string[] = [];
  const finderPaths: string[] = [];
  const finderPositions = getFinderPatterns(moduleCount);

  // Render regular data modules
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!qr.isDark(row, col)) continue;
      if (isFinderPattern(row, col, moduleCount)) continue;

      const x = marginSize + col * moduleSize;
      const y = marginSize + row * moduleSize;

      dataPaths.push(getDotPath(x, y, moduleSize, shapeSettings.dotStyle));
    }
  }

  // Render finder patterns
  for (const finder of finderPositions) {
    const baseX = marginSize + finder.x * moduleSize;
    const baseY = marginSize + finder.y * moduleSize;
    const finderSize = 7 * moduleSize;
    const innerWhiteX = baseX + moduleSize;
    const innerWhiteY = baseY + moduleSize;
    const innerWhiteSize = 5 * moduleSize;
    const innerDarkX = baseX + 2 * moduleSize;
    const innerDarkY = baseY + 2 * moduleSize;
    const innerDarkSize = 3 * moduleSize;

    // Outer with cutout
    finderPaths.push(
      `M ${baseX} ${baseY} h ${finderSize} v ${finderSize} h ${-finderSize} Z ` +
        `M ${innerWhiteX} ${innerWhiteY} v ${innerWhiteSize} h ${innerWhiteSize} v ${-innerWhiteSize} Z`
    );

    // Inner dot
    finderPaths.push(
      getCornerDotPath(
        innerDarkX,
        innerDarkY,
        innerDarkSize,
        shapeSettings.cornerDotStyle
      )
    );
  }

  return {
    background: `<rect x="0" y="0" width="${totalSize}" height="${totalSize}" fill="${backgroundColor}"/>`,
    dataDots: `<path d="${dataPaths.join(" ")}" fill="${foregroundColor}"/>`,
    finderPatterns: `<path d="${finderPaths.join(" ")}" fill="${foregroundColor}" fill-rule="evenodd"/>`,
    moduleCount,
    viewBox: `0 0 ${totalSize} ${totalSize}`,
  };
}

// Generate a mini preview for shape selection UI
export function renderShapePreview(
  style: "dot" | "corner" | "cornerDot",
  value: string,
  size: number = 40
): string {
  const padding = 2;
  const innerSize = size - padding * 2;

  let path: string;

  switch (style) {
    case "dot":
      path = getDotPath(padding, padding, innerSize, value as any);
      break;
    case "corner":
      path = getCornerPath(padding, padding, innerSize, value as any);
      break;
    case "cornerDot":
      path = getCornerDotPath(padding, padding, innerSize, value as any);
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" fill="white" rx="4"/>
    <path d="${path}" fill="#2A0B4D"/>
  </svg>`;
}
