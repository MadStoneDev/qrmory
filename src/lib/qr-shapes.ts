// src/lib/qr-shapes.ts
// QR Code shape definitions and SVG path generators

export type DotStyle =
  | "square"
  | "rounded"
  | "dots"
  | "classy"
  | "classy-rounded"
  | "extra-rounded";

export type CornerStyle = "square" | "dot" | "extra-rounded";

export type CornerDotStyle = "square" | "dot";

export interface QRShapeSettings {
  dotStyle: DotStyle;
  cornerStyle: CornerStyle;
  cornerDotStyle: CornerDotStyle;
}

export const DEFAULT_SHAPE_SETTINGS: QRShapeSettings = {
  dotStyle: "square",
  cornerStyle: "square",
  cornerDotStyle: "square",
};

// Shape definitions with labels for UI
export const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

export const CORNER_STYLES: { value: CornerStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

export const CORNER_DOT_STYLES: { value: CornerDotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

// SVG path generators for each dot style
export function getDotPath(
  x: number,
  y: number,
  size: number,
  style: DotStyle
): string {
  const halfSize = size / 2;

  switch (style) {
    case "square":
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;

    case "rounded": {
      const r = size * 0.25;
      return `M ${x + r} ${y}
              h ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${-r} ${r}
              h ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${-r} ${-r}
              v ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
    }

    case "dots":
      return `M ${x + halfSize} ${y}
              a ${halfSize} ${halfSize} 0 1 1 0 ${size}
              a ${halfSize} ${halfSize} 0 1 1 0 ${-size} Z`;

    case "classy": {
      // Square with one rounded corner (top-right)
      const r = size * 0.4;
      return `M ${x} ${y}
              h ${size - r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - r}
              h ${-size}
              Z`;
    }

    case "classy-rounded": {
      // All corners rounded except bottom-left
      const r = size * 0.4;
      return `M ${x + r} ${y}
              h ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${-r} ${r}
              h ${-(size - r)}
              v ${-size}
              a ${r} ${r} 0 0 1 ${r} 0 Z`;
    }

    case "extra-rounded": {
      // Very rounded, almost circular
      const r = size * 0.45;
      return `M ${x + r} ${y}
              h ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${-r} ${r}
              h ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${-r} ${-r}
              v ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
    }

    default:
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
  }
}

// SVG path for corner finder patterns (outer square)
export function getCornerPath(
  x: number,
  y: number,
  size: number,
  style: CornerStyle
): string {
  switch (style) {
    case "square":
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;

    case "dot": {
      const r = size * 0.2;
      return `M ${x + r} ${y}
              h ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${-r} ${r}
              h ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${-r} ${-r}
              v ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
    }

    case "extra-rounded": {
      const r = size * 0.35;
      return `M ${x + r} ${y}
              h ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${r} ${r}
              v ${size - 2 * r}
              a ${r} ${r} 0 0 1 ${-r} ${r}
              h ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${-r} ${-r}
              v ${-(size - 2 * r)}
              a ${r} ${r} 0 0 1 ${r} ${-r} Z`;
    }

    default:
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
  }
}

// SVG path for corner finder inner dot
export function getCornerDotPath(
  x: number,
  y: number,
  size: number,
  style: CornerDotStyle
): string {
  const halfSize = size / 2;

  switch (style) {
    case "square":
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;

    case "dot":
      return `M ${x + halfSize} ${y}
              a ${halfSize} ${halfSize} 0 1 1 0 ${size}
              a ${halfSize} ${halfSize} 0 1 1 0 ${-size} Z`;

    default:
      return `M ${x} ${y} h ${size} v ${size} h ${-size} Z`;
  }
}

// Check if a position is part of a finder pattern
export function isFinderPattern(
  row: number,
  col: number,
  moduleCount: number
): boolean {
  // Top-left finder pattern
  if (row < 7 && col < 7) return true;
  // Top-right finder pattern
  if (row < 7 && col >= moduleCount - 7) return true;
  // Bottom-left finder pattern
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}

// Check if position is the outer ring of finder pattern
export function isFinderOuterRing(
  row: number,
  col: number,
  moduleCount: number
): boolean {
  // Top-left
  if (
    (row === 0 || row === 6) &&
    col >= 0 &&
    col <= 6 &&
    row < 7 &&
    col < 7
  ) {
    return true;
  }
  if (
    (col === 0 || col === 6) &&
    row >= 0 &&
    row <= 6 &&
    row < 7 &&
    col < 7
  ) {
    return true;
  }

  // Top-right
  if (
    (row === 0 || row === 6) &&
    col >= moduleCount - 7 &&
    col <= moduleCount - 1
  ) {
    return true;
  }
  if (
    (col === moduleCount - 7 || col === moduleCount - 1) &&
    row >= 0 &&
    row <= 6
  ) {
    return true;
  }

  // Bottom-left
  if (
    (row === moduleCount - 7 || row === moduleCount - 1) &&
    col >= 0 &&
    col <= 6
  ) {
    return true;
  }
  if (
    (col === 0 || col === 6) &&
    row >= moduleCount - 7 &&
    row <= moduleCount - 1
  ) {
    return true;
  }

  return false;
}

// Check if position is the inner dot of finder pattern (3x3 center)
export function isFinderInnerDot(
  row: number,
  col: number,
  moduleCount: number
): boolean {
  // Top-left center (3x3)
  if (row >= 2 && row <= 4 && col >= 2 && col <= 4) return true;
  // Top-right center (3x3)
  if (row >= 2 && row <= 4 && col >= moduleCount - 5 && col <= moduleCount - 3)
    return true;
  // Bottom-left center (3x3)
  if (row >= moduleCount - 5 && row <= moduleCount - 3 && col >= 2 && col <= 4)
    return true;

  return false;
}

// Get the finder pattern position (for rendering complete finder patterns)
export type FinderPosition = "top-left" | "top-right" | "bottom-left";

export function getFinderPatterns(moduleCount: number): {
  position: FinderPosition;
  x: number;
  y: number;
}[] {
  return [
    { position: "top-left", x: 0, y: 0 },
    { position: "top-right", x: moduleCount - 7, y: 0 },
    { position: "bottom-left", x: 0, y: moduleCount - 7 },
  ];
}
