// src/components/qr-create/template-selector.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  IconPalette,
  IconCheck,
  IconBookmark,
  IconChevronDown,
} from "@tabler/icons-react";
import {
  QRTemplate,
  QRTemplateConfig,
  TemplateCategory,
  SYSTEM_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "@/lib/qr-templates";

interface TemplateSelectorProps {
  userTemplates?: QRTemplate[];
  selectedTemplateId?: string | null;
  onSelect: (template: QRTemplate) => void;
  onSaveTemplate?: () => void;
  compact?: boolean;
}

// Mini QR preview for template cards
function TemplatePreview({
  config,
  size = 48,
}: {
  config: QRTemplateConfig;
  size?: number;
}) {
  const { foreground, background } = config.colors;
  const { dotStyle, cornerStyle } = config.shapeSettings;

  // Simplified QR pattern for preview
  const dotRadius = dotStyle === "dots" || dotStyle === "extra-rounded" ? "50%" :
                    dotStyle === "rounded" || dotStyle === "classy-rounded" ? "20%" : "0%";

  const cornerRadius = cornerStyle === "extra-rounded" ? "30%" :
                       cornerStyle === "dot" ? "15%" : "0%";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: background,
        borderRadius: 4,
      }}
    >
      {/* Simplified QR pattern */}
      <svg width={size} height={size} viewBox="0 0 48 48">
        {/* Top-left finder */}
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          fill={foreground}
          rx={cornerRadius}
        />
        <rect
          x="6"
          y="6"
          width="8"
          height="8"
          fill={background}
          rx={cornerRadius}
        />
        <rect
          x="8"
          y="8"
          width="4"
          height="4"
          fill={foreground}
          rx={dotRadius}
        />

        {/* Top-right finder */}
        <rect
          x="32"
          y="4"
          width="12"
          height="12"
          fill={foreground}
          rx={cornerRadius}
        />
        <rect
          x="34"
          y="6"
          width="8"
          height="8"
          fill={background}
          rx={cornerRadius}
        />
        <rect
          x="36"
          y="8"
          width="4"
          height="4"
          fill={foreground}
          rx={dotRadius}
        />

        {/* Bottom-left finder */}
        <rect
          x="4"
          y="32"
          width="12"
          height="12"
          fill={foreground}
          rx={cornerRadius}
        />
        <rect
          x="6"
          y="34"
          width="8"
          height="8"
          fill={background}
          rx={cornerRadius}
        />
        <rect
          x="8"
          y="36"
          width="4"
          height="4"
          fill={foreground}
          rx={dotRadius}
        />

        {/* Data dots */}
        {[
          [20, 8], [24, 8], [28, 8],
          [20, 12], [28, 12],
          [4, 20], [8, 20], [12, 20], [20, 20], [24, 20], [28, 20], [32, 20], [36, 20], [40, 20],
          [8, 24], [16, 24], [24, 24], [32, 24], [40, 24],
          [4, 28], [12, 28], [20, 28], [28, 28], [36, 28], [40, 28],
          [20, 32], [24, 32], [28, 32], [32, 32], [40, 32],
          [20, 36], [28, 36], [32, 36], [36, 36],
          [20, 40], [24, 40], [32, 40], [40, 40],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x}
            y={y}
            width="4"
            height="4"
            fill={foreground}
            rx={dotRadius}
          />
        ))}
      </svg>

      {/* Frame indicator if has frame */}
      {config.frameSettings.type !== "none" && (
        <div
          className="absolute inset-0 border-2"
          style={{ borderColor: config.frameSettings.frameColor }}
        />
      )}
    </div>
  );
}

// Template card component
function TemplateCard({
  template,
  isSelected,
  onClick,
}: {
  template: QRTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
        hover:shadow-md hover:scale-[1.02]
        ${isSelected
          ? "border-qrmory-purple-500 bg-qrmory-purple-50 shadow-md"
          : "border-neutral-200 bg-white hover:border-qrmory-purple-200"
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-qrmory-purple-600 rounded-full flex items-center justify-center">
          <IconCheck size={12} className="text-white" />
        </div>
      )}

      {/* System badge */}
      {template.isSystem && (
        <div className="absolute top-1 left-1">
          <div className="w-4 h-4 bg-neutral-100 rounded-full flex items-center justify-center" title="System template">
            <IconPalette size={10} className="text-neutral-500" />
          </div>
        </div>
      )}

      {/* Preview */}
      <TemplatePreview config={template.config} size={56} />

      {/* Name */}
      <span className="text-xs font-medium text-neutral-700 text-center line-clamp-1 w-full">
        {template.name}
      </span>
    </button>
  );
}

export default function TemplateSelector({
  userTemplates = [],
  selectedTemplateId,
  onSelect,
  onSaveTemplate,
  compact = false,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all" | "saved">("all");
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Combine and filter templates
  const filteredTemplates = useMemo(() => {
    let templates: QRTemplate[] = [];

    if (selectedCategory === "saved") {
      templates = userTemplates;
    } else if (selectedCategory === "all") {
      templates = [...SYSTEM_TEMPLATES, ...userTemplates];
    } else {
      templates = [
        ...SYSTEM_TEMPLATES.filter((t) => t.category === selectedCategory),
        ...userTemplates.filter((t) => t.category === selectedCategory),
      ];
    }

    return templates;
  }, [selectedCategory, userTemplates]);

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-qrmory-purple-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <IconPalette size={18} className="text-qrmory-purple-600" />
          <span className="text-sm font-medium text-neutral-700">Design Templates</span>
        </div>
        <IconChevronDown size={18} className="text-neutral-400" />
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconPalette size={18} className="text-qrmory-purple-600" />
          <span className="text-sm font-medium text-neutral-700">Templates</span>
        </div>
        {onSaveTemplate && (
          <button
            onClick={onSaveTemplate}
            className="text-xs text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium flex items-center gap-1"
          >
            <IconBookmark size={14} />
            Save Current
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
            selectedCategory === "all"
              ? "bg-qrmory-purple-600 text-white"
              : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          All
        </button>
        {TEMPLATE_CATEGORIES.filter(c => c.value !== "custom").map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === cat.value
                ? "bg-qrmory-purple-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
        {userTemplates.length > 0 && (
          <button
            onClick={() => setSelectedCategory("saved")}
            className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === "saved"
                ? "bg-qrmory-purple-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Saved ({userTemplates.length})
          </button>
        )}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplateId === template.id}
            onClick={() => onSelect(template)}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-6 text-neutral-500 text-sm">
          {selectedCategory === "saved"
            ? "No saved templates yet. Save your current design to reuse it later."
            : "No templates found in this category."}
        </div>
      )}

      {/* Collapse button for compact mode */}
      {compact && (
        <button
          onClick={() => setIsExpanded(false)}
          className="w-full text-center text-xs text-neutral-500 hover:text-neutral-700 py-1"
        >
          Collapse
        </button>
      )}
    </div>
  );
}
