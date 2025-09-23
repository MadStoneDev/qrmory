// components/colour-picker.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";

interface ColourPickerProps {
  colors: {
    foreground: string;
    background: string;
  };
  onChange: (colors: { foreground?: string; background?: string }) => void;
  showReset?: boolean;
  showContrastWarning?: boolean;
  className?: string;
}

// Validate hex color format
const isValidHexColour = (hex: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
};

// Calculate contrast ratio
function getContrastRatio(colour1: string, colour2: string): number {
  // Don't warn if colors are the same
  if (colour1.toLowerCase() === colour2.toLowerCase()) {
    return 21; // Perfect contrast for identical colors (don't show warning)
  }

  const getLuminance = (hex: string) => {
    // Validate hex format first
    if (!hex || !hex.startsWith("#") || hex.length !== 7) {
      return 0;
    }

    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(colour1);
  const lum2 = getLuminance(colour2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

export function ColorPicker({
  colors,
  onChange,
  showReset = true,
  showContrastWarning = true,
  className = "",
}: ColourPickerProps) {
  // Local state for text inputs (prevents crashes while typing)
  const [colorInputs, setColorInputs] = useState({
    foreground: colors.foreground,
    background: colors.background,
  });

  // Handle text input changes (local state only)
  const handleColorInputChange = useCallback(
    (colorType: "foreground" | "background", value: string) => {
      setColorInputs((prev) => ({
        ...prev,
        [colorType]: value,
      }));
    },
    [],
  );

  // Apply color when valid (onBlur or Enter key)
  const applyColorFromInput = useCallback(
    (colorType: "foreground" | "background") => {
      const inputValue = colorInputs[colorType];
      if (isValidHexColour(inputValue)) {
        onChange({ [colorType]: inputValue });
      } else {
        // Reset invalid input to current valid color
        setColorInputs((prev) => ({
          ...prev,
          [colorType]: colors[colorType],
        }));
      }
    },
    [colorInputs, colors, onChange],
  );

  // Handle color picker changes (immediate)
  const handleColorChange = useCallback(
    (colorType: "foreground" | "background", color: string) => {
      onChange({ [colorType]: color });
      // Sync text input
      setColorInputs((prev) => ({
        ...prev,
        [colorType]: color,
      }));
    },
    [onChange],
  );

  // Sync local inputs when parent colors change
  useEffect(() => {
    setColorInputs({
      foreground: colors.foreground,
      background: colors.background,
    });
  }, [colors]);

  // Check if we should show contrast warning
  const shouldShowContrastWarning =
    showContrastWarning &&
    isValidHexColour(colors.foreground) &&
    isValidHexColour(colors.background) &&
    getContrastRatio(colors.foreground, colors.background) < 2.5;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Foreground Color */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-neutral-600">
          Foreground (QR Pattern):
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colors.foreground}
            onChange={(e) => handleColorChange("foreground", e.target.value)}
            className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
            title="Choose foreground color"
          />
          <input
            type="text"
            value={colorInputs.foreground}
            onChange={(e) =>
              handleColorInputChange("foreground", e.target.value)
            }
            onBlur={() => applyColorFromInput("foreground")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyColorFromInput("foreground");
              }
            }}
            className={`w-20 text-sm px-2 py-2 border rounded ${
              isValidHexColour(colorInputs.foreground)
                ? "border-neutral-300"
                : "border-red-300 bg-red-50"
            }`}
            placeholder="#2A0B4D"
            maxLength={7}
          />
        </div>
      </div>

      {/* Background Color */}
      <div className="flex items-center justify-between">
        <label className="text-xs text-neutral-600">Background:</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colors.background}
            onChange={(e) => handleColorChange("background", e.target.value)}
            className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
            title="Choose background color"
          />
          <input
            type="text"
            value={colorInputs.background}
            onChange={(e) =>
              handleColorInputChange("background", e.target.value)
            }
            onBlur={() => applyColorFromInput("background")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyColorFromInput("background");
              }
            }}
            className={`w-20 text-sm px-2 py-2 border rounded ${
              isValidHexColour(colorInputs.background)
                ? "border-neutral-300"
                : "border-red-300 bg-red-50"
            }`}
            placeholder="#FFFFFF"
            maxLength={7}
          />
        </div>
      </div>

      {/* Reset Colors Button */}
      {showReset && (
        <button
          onClick={() => {
            onChange({ foreground: "#2A0B4D", background: "#FFFFFF" });
          }}
          className="w-full text-xs text-neutral-600 hover:text-neutral-800 underline"
        >
          Reset to default colors
        </button>
      )}

      {/* Color Contrast Warning */}
      {shouldShowContrastWarning && (
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="text-yellow-800">
            ⚠️ Low contrast detected. QR codes may be difficult to scan with
            these colors.
          </p>
        </div>
      )}
    </div>
  );
}
