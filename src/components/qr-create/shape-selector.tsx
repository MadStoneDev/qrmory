// src/components/qr-create/shape-selector.tsx
"use client";

import React, { useMemo } from "react";
import {
  DotStyle,
  CornerStyle,
  CornerDotStyle,
  DOT_STYLES,
  CORNER_STYLES,
  CORNER_DOT_STYLES,
  QRShapeSettings,
} from "@/lib/qr-shapes";
import { renderShapePreview } from "@/lib/qr-renderer";

interface ShapeSelectorProps {
  settings: QRShapeSettings;
  onChange: (settings: QRShapeSettings) => void;
  disabled?: boolean;
}

interface ShapeOptionProps {
  value: string;
  label: string;
  selected: boolean;
  previewSvg: string;
  onClick: () => void;
  disabled?: boolean;
}

function ShapeOption({
  value,
  label,
  selected,
  previewSvg,
  onClick,
  disabled,
}: ShapeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 transition-all
        ${selected
          ? "border-qrmory-purple-600 bg-qrmory-purple-50"
          : "border-neutral-200 hover:border-neutral-300 bg-white"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      title={label}
    >
      <div
        className="w-10 h-10"
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />
      <span className="text-[10px] text-neutral-600 mt-1 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

export function ShapeSelector({
  settings,
  onChange,
  disabled = false,
}: ShapeSelectorProps) {
  // Memoize preview SVGs to avoid regenerating on each render
  const dotPreviews = useMemo(
    () =>
      DOT_STYLES.map((style) => ({
        ...style,
        preview: renderShapePreview("dot", style.value, 40),
      })),
    []
  );

  const cornerPreviews = useMemo(
    () =>
      CORNER_STYLES.map((style) => ({
        ...style,
        preview: renderShapePreview("corner", style.value, 40),
      })),
    []
  );

  const cornerDotPreviews = useMemo(
    () =>
      CORNER_DOT_STYLES.map((style) => ({
        ...style,
        preview: renderShapePreview("cornerDot", style.value, 40),
      })),
    []
  );

  const handleDotStyleChange = (value: DotStyle) => {
    onChange({ ...settings, dotStyle: value });
  };

  const handleCornerStyleChange = (value: CornerStyle) => {
    onChange({ ...settings, cornerStyle: value });
  };

  const handleCornerDotStyleChange = (value: CornerDotStyle) => {
    onChange({ ...settings, cornerDotStyle: value });
  };

  return (
    <div className="space-y-4">
      {/* Dot Style */}
      <div>
        <label className="text-xs font-medium text-neutral-700 mb-2 block">
          Dot Pattern
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {dotPreviews.map((style) => (
            <ShapeOption
              key={style.value}
              value={style.value}
              label={style.label}
              selected={settings.dotStyle === style.value}
              previewSvg={style.preview}
              onClick={() => handleDotStyleChange(style.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Corner Style */}
      <div>
        <label className="text-xs font-medium text-neutral-700 mb-2 block">
          Corner Squares
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
          {cornerPreviews.map((style) => (
            <ShapeOption
              key={style.value}
              value={style.value}
              label={style.label}
              selected={settings.cornerStyle === style.value}
              previewSvg={style.preview}
              onClick={() => handleCornerStyleChange(style.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Corner Dot Style */}
      <div>
        <label className="text-xs font-medium text-neutral-700 mb-2 block">
          Corner Dots
        </label>
        <div className="grid grid-cols-2 gap-2">
          {cornerDotPreviews.map((style) => (
            <ShapeOption
              key={style.value}
              value={style.value}
              label={style.label}
              selected={settings.cornerDotStyle === style.value}
              previewSvg={style.preview}
              onClick={() => handleCornerDotStyleChange(style.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={() =>
          onChange({
            dotStyle: "square",
            cornerStyle: "square",
            cornerDotStyle: "square",
          })
        }
        disabled={disabled}
        className="w-full text-xs text-neutral-600 hover:text-neutral-800 underline disabled:opacity-50"
      >
        Reset to default shapes
      </button>
    </div>
  );
}

export default ShapeSelector;
