export function hexToRgba(hex: string, opacity: number = 0.1): string {
  // Ensure the hex value has a # prefix
  const normalizedHex = hex.startsWith("#") ? hex : `#${hex}`;

  // Convert 3-digit hex to 6-digit
  const fullHex =
    normalizedHex.length === 4
      ? `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`
      : normalizedHex;

  // Extract rgb values
  const r = parseInt(fullHex.slice(1, 3), 16);
  const g = parseInt(fullHex.slice(3, 5), 16);
  const b = parseInt(fullHex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function getSoftBgColor(
  brandColor: string,
  opacity: number = 0.15,
): string {
  return hexToRgba(brandColor, opacity);
}
