// src/components/qr-create/frame-selector.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  FrameType,
  QRFrameSettings,
  FRAME_TYPES,
  CTA_PRESETS,
  generateFramePreview,
  DEFAULT_FRAME_SETTINGS,
} from "@/lib/qr-frames";

interface FrameSelectorProps {
  settings: QRFrameSettings;
  onChange: (settings: QRFrameSettings) => void;
  disabled?: boolean;
}

interface FrameOptionProps {
  value: FrameType;
  label: string;
  description: string;
  selected: boolean;
  previewSvg: string;
  onClick: () => void;
  disabled?: boolean;
}

function FrameOption({
  value,
  label,
  selected,
  previewSvg,
  onClick,
  disabled,
}: FrameOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center p-2 rounded-lg border-2 transition-all
        ${selected
          ? "border-qrmory-purple-600 bg-qrmory-purple-50"
          : "border-neutral-200 hover:border-neutral-300 bg-white"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      title={label}
    >
      <div
        className="w-14 h-14 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />
      <span className="text-[10px] text-neutral-600 mt-1 text-center leading-tight">
        {label}
      </span>
    </button>
  );
}

export function FrameSelector({
  settings,
  onChange,
  disabled = false,
}: FrameSelectorProps) {
  const [showPresets, setShowPresets] = useState(false);

  // Memoize frame previews
  const framePreviews = useMemo(
    () =>
      FRAME_TYPES.map((frame) => ({
        ...frame,
        preview: generateFramePreview(frame.value, frame.value !== "none", 60),
      })),
    []
  );

  const handleFrameTypeChange = (type: FrameType) => {
    onChange({ ...settings, type });
  };

  const handleTextChange = (text: string) => {
    onChange({ ...settings, text });
  };

  const handleTextColorChange = (color: string) => {
    onChange({ ...settings, textColor: color });
  };

  const handleFrameColorChange = (color: string) => {
    onChange({ ...settings, frameColor: color });
  };

  const handlePresetSelect = (preset: string) => {
    onChange({ ...settings, text: preset });
    setShowPresets(false);
  };

  const showTextOptions = settings.type !== "none" && settings.type !== "simple" && settings.type !== "rounded";

  return (
    <div className="space-y-4">
      {/* Frame Type Selection */}
      <div>
        <label className="text-xs font-medium text-neutral-700 mb-2 block">
          Frame Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {framePreviews.map((frame) => (
            <FrameOption
              key={frame.value}
              value={frame.value}
              label={frame.label}
              description={frame.description}
              selected={settings.type === frame.value}
              previewSvg={frame.preview}
              onClick={() => handleFrameTypeChange(frame.value)}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      {/* Frame Colour (only for frames with visible colour) */}
      {settings.type !== "none" && (
        <div className="flex items-center justify-between">
          <label className="text-xs text-neutral-600">Frame Colour:</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={settings.frameColor}
              onChange={(e) => handleFrameColorChange(e.target.value)}
              disabled={disabled}
              className="w-8 h-8 rounded border border-neutral-300 cursor-pointer disabled:opacity-50"
            />
            <input
              type="text"
              value={settings.frameColor}
              onChange={(e) => handleFrameColorChange(e.target.value)}
              disabled={disabled}
              className="w-20 text-sm px-2 py-2 border rounded border-neutral-300 disabled:opacity-50"
              maxLength={7}
            />
          </div>
        </div>
      )}

      {/* Text Options (only for frames with text capability) */}
      {showTextOptions && (
        <>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-2 block">
              Call to Action Text
            </label>
            <div className="relative">
              <input
                type="text"
                value={settings.text}
                onChange={(e) => handleTextChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter text or select a preset..."
                className="w-full text-sm px-3 py-2 border rounded border-neutral-300 disabled:opacity-50"
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                disabled={disabled}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-qrmory-purple-600 hover:text-qrmory-purple-800 disabled:opacity-50"
              >
                Presets
              </button>
            </div>

            {/* Preset Dropdown */}
            {showPresets && (
              <div className="mt-2 p-2 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-2 gap-1">
                  {CTA_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className="text-xs px-2 py-1.5 text-left hover:bg-qrmory-purple-50 rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Colour */}
          {settings.text && (
            <div className="flex items-center justify-between">
              <label className="text-xs text-neutral-600">Text Colour:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer disabled:opacity-50"
                />
                <input
                  type="text"
                  value={settings.textColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  disabled={disabled}
                  className="w-20 text-sm px-2 py-2 border rounded border-neutral-300 disabled:opacity-50"
                  maxLength={7}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Reset Button */}
      <button
        type="button"
        onClick={() => onChange(DEFAULT_FRAME_SETTINGS)}
        disabled={disabled}
        className="w-full text-xs text-neutral-600 hover:text-neutral-800 underline disabled:opacity-50"
      >
        Reset frame settings
      </button>
    </div>
  );
}

export default FrameSelector;
