// src/components/qr-create/template-save-dialog.tsx
"use client";

import React, { useState } from "react";
import {
  IconX,
  IconBookmark,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  QRTemplateConfig,
  TemplateCategory,
  TEMPLATE_CATEGORIES,
} from "@/lib/qr-templates";

interface TemplateSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, category: TemplateCategory) => Promise<void>;
  currentConfig: QRTemplateConfig;
}

// Mini preview component
function ConfigPreview({ config }: { config: QRTemplateConfig }) {
  const { foreground, background } = config.colors;
  const { dotStyle } = config.shapeSettings;

  const dotRadius = dotStyle === "dots" || dotStyle === "extra-rounded" ? "50%" :
                    dotStyle === "rounded" || dotStyle === "classy-rounded" ? "20%" : "0%";

  return (
    <div
      className="w-20 h-20 rounded-lg overflow-hidden border border-neutral-200"
      style={{ backgroundColor: background }}
    >
      <svg width="80" height="80" viewBox="0 0 48 48">
        {/* Simplified QR pattern */}
        <rect x="4" y="4" width="12" height="12" fill={foreground} rx={dotRadius} />
        <rect x="6" y="6" width="8" height="8" fill={background} />
        <rect x="8" y="8" width="4" height="4" fill={foreground} rx={dotRadius} />

        <rect x="32" y="4" width="12" height="12" fill={foreground} rx={dotRadius} />
        <rect x="34" y="6" width="8" height="8" fill={background} />
        <rect x="36" y="8" width="4" height="4" fill={foreground} rx={dotRadius} />

        <rect x="4" y="32" width="12" height="12" fill={foreground} rx={dotRadius} />
        <rect x="6" y="34" width="8" height="8" fill={background} />
        <rect x="8" y="36" width="4" height="4" fill={foreground} rx={dotRadius} />

        {[
          [20, 8], [24, 12], [28, 8],
          [20, 20], [24, 24], [28, 20],
          [20, 32], [24, 36], [28, 40],
          [32, 32], [36, 36], [40, 40],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="4" height="4" fill={foreground} rx={dotRadius} />
        ))}
      </svg>
    </div>
  );
}

export default function TemplateSaveDialog({
  isOpen,
  onClose,
  onSave,
  currentConfig,
}: TemplateSaveDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("custom");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast("Name required", {
        description: "Please enter a name for your template.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    if (name.length > 50) {
      toast("Name too long", {
        description: "Template name must be 50 characters or less.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(name.trim(), description.trim(), category);
      toast("Template saved", {
        description: `"${name}" has been saved to your templates.`,
      });
      // Reset form
      setName("");
      setDescription("");
      setCategory("custom");
      onClose();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast("Save failed", {
        description: "Could not save template. Please try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setName("");
      setDescription("");
      setCategory("custom");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-qrmory-purple-100 rounded-full flex items-center justify-center">
              <IconBookmark className="w-5 h-5 text-qrmory-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Save Template</h2>
              <p className="text-sm text-neutral-500">Save your current design for reuse</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <IconX size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
          <ConfigPreview config={currentConfig} />
          <div className="flex-1 text-sm">
            <p className="text-neutral-500 mb-1">Current design</p>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded border border-neutral-200"
                style={{ backgroundColor: currentConfig.colors.foreground }}
              />
              <span className="text-neutral-700">{currentConfig.colors.foreground}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-4 h-4 rounded border border-neutral-200"
                style={{ backgroundColor: currentConfig.colors.background }}
              />
              <span className="text-neutral-700">{currentConfig.colors.background}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Brand Style"
              maxLength={50}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              maxLength={200}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent resize-none"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
              disabled={isSaving}
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 px-4 py-2.5 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <IconBookmark size={18} />
                Save Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
