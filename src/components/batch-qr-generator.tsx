// src/components/batch-qr-generator.tsx
"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { useQRCode } from "next-qrcode";
import {
  IconLoader2,
  IconDownload,
  IconPlus,
  IconAlertCircle,
  IconCheck,
  IconQrcode,
} from "@tabler/icons-react";
import JSZip from "jszip";

interface BatchPattern {
  pattern: string;
  valuePattern: string;
  rangeStart: number;
  rangeEnd: number;
}

interface CreatedCode {
  id: string;
  name: string;
  shortcode: string;
  value: string;
  url: string;
}

interface BatchQRGeneratorProps {
  suggestedPatterns?: Array<{
    label: string;
    pattern: string;
    valuePattern: string;
    defaultRange: [number, number];
  }>;
  onComplete?: (codes: CreatedCode[]) => void;
}

// Component to render a single QR code for download capture
function QRCodeForDownload({
  url,
  id,
}: {
  url: string;
  id: string;
}) {
  const { SVG } = useQRCode();

  return (
    <div id={id} style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      <SVG
        text={url}
        options={{
          errorCorrectionLevel: "M",
          color: {
            dark: "#2A0B4D",
            light: "#FFFFFF",
          },
          width: 256,
          margin: 2,
        }}
      />
    </div>
  );
}

export default function BatchQRGenerator({
  suggestedPatterns = [],
  onComplete,
}: BatchQRGeneratorProps) {
  const [batchConfig, setBatchConfig] = useState<BatchPattern>({
    pattern: suggestedPatterns[0]?.pattern || "Item {n}",
    valuePattern: suggestedPatterns[0]?.valuePattern || "https://example.com/{n}",
    rangeStart: suggestedPatterns[0]?.defaultRange?.[0] || 1,
    rangeEnd: suggestedPatterns[0]?.defaultRange?.[1] || 10,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [createdCodes, setCreatedCodes] = useState<CreatedCode[]>([]);
  const [errors, setErrors] = useState<Array<{ name: string; error: string }>>([]);
  const [renderingForDownload, setRenderingForDownload] = useState(false);
  const downloadContainerRef = useRef<HTMLDivElement>(null);

  // Preview items
  const previewItems = useMemo(() => {
    const items: Array<{ name: string; value: string }> = [];
    const count = Math.min(batchConfig.rangeEnd - batchConfig.rangeStart, 5);

    for (let i = 0; i < count; i++) {
      const n = batchConfig.rangeStart + i;
      items.push({
        name: batchConfig.pattern.replace(/\{n\}/g, n.toString()),
        value: batchConfig.valuePattern.replace(/\{n\}/g, n.toString()),
      });
    }

    return items;
  }, [batchConfig]);

  const totalCount = batchConfig.rangeEnd - batchConfig.rangeStart;

  const handlePatternSelect = useCallback(
    (index: number) => {
      const selected = suggestedPatterns[index];
      if (selected) {
        setBatchConfig({
          pattern: selected.pattern,
          valuePattern: selected.valuePattern,
          rangeStart: selected.defaultRange[0],
          rangeEnd: selected.defaultRange[1],
        });
      }
    },
    [suggestedPatterns]
  );

  const handleGenerate = useCallback(async () => {
    if (totalCount <= 0) {
      toast("Invalid range", {
        description: "Range end must be greater than range start.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    setIsGenerating(true);
    setErrors([]);

    try {
      const response = await fetch("/api/batch-generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchConfig),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          toast("Upgrade Required", {
            description: data.error,
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
            action: {
              label: "Upgrade",
              onClick: () => {
                window.location.href = "/dashboard/subscription";
              },
            },
          });
        } else {
          toast("Generation Failed", {
            description: data.error,
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          });
        }
        return;
      }

      setCreatedCodes(data.codes);
      if (data.errors) {
        setErrors(data.errors);
      }

      toast("Batch Generation Complete", {
        description: `Successfully created ${data.created} of ${data.total} QR codes.`,
      });

      if (onComplete) {
        onComplete(data.codes);
      }
    } catch (error) {
      console.error("Batch generation error:", error);
      toast("Generation Failed", {
        description: "An unexpected error occurred. Please try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsGenerating(false);
    }
  }, [batchConfig, totalCount, onComplete]);

  const handleDownloadAll = useCallback(async () => {
    if (createdCodes.length === 0) return;

    setIsDownloading(true);
    setRenderingForDownload(true);

    // Small delay to allow QR codes to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const zip = new JSZip();
      const folder = zip.folder("qr-codes");

      if (!folder) {
        throw new Error("Failed to create zip folder");
      }

      // Capture SVGs from rendered elements
      for (const code of createdCodes) {
        const container = document.getElementById(`qr-download-${code.id}`);
        if (!container) {
          console.warn(`Container not found for ${code.name}`);
          continue;
        }

        const svgElement = container.querySelector("svg");
        if (!svgElement) {
          console.warn(`SVG not found for ${code.name}`);
          continue;
        }

        // Clone and prepare SVG
        const clonedSvg = svgElement.cloneNode(true) as SVGElement;
        clonedSvg.setAttribute("width", "256");
        clonedSvg.setAttribute("height", "256");

        // Serialize to string
        const svgString = new XMLSerializer().serializeToString(clonedSvg);
        const completeSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

        // Sanitize filename
        const safeFilename = code.name
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();

        folder.file(`${safeFilename}.svg`, completeSvg);
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-codes-batch-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast("Download Complete", {
        description: `Downloaded ${createdCodes.length} QR codes.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast("Download Failed", {
        description: "Failed to create zip file. Please try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsDownloading(false);
      setRenderingForDownload(false);
    }
  }, [createdCodes]);

  const handleReset = useCallback(() => {
    setCreatedCodes([]);
    setErrors([]);
  }, []);

  // Show results view if codes have been created
  if (createdCodes.length > 0) {
    return (
      <div className="space-y-6">
        {/* Hidden QR codes for download */}
        {renderingForDownload && (
          <div ref={downloadContainerRef} style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
            {createdCodes.map((code) => (
              <QRCodeForDownload
                key={code.id}
                url={code.url}
                id={`qr-download-${code.id}`}
              />
            ))}
          </div>
        )}

        {/* Success header */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            {createdCodes.length} QR Codes Created!
          </h3>
          <p className="text-green-600 mb-4">
            Your batch QR codes are ready to download.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isDownloading ? (
                <IconLoader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <IconDownload className="w-5 h-5 mr-2" />
              )}
              Download All (ZIP)
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              <IconPlus className="w-5 h-5 mr-2" />
              Create More
            </button>
          </div>
        </div>

        {/* Errors if any */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <IconAlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">
                {errors.length} Failed
              </h4>
            </div>
            <ul className="text-sm text-red-600 space-y-1">
              {errors.map((err, i) => (
                <li key={i}>
                  {err.name}: {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Created codes list */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
            <h4 className="font-semibold text-neutral-800">Created QR Codes</h4>
          </div>
          <div className="divide-y divide-neutral-200 max-h-96 overflow-y-auto">
            {createdCodes.map((code) => (
              <div
                key={code.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-qrmory-purple-100 rounded-lg flex items-center justify-center">
                    <IconQrcode className="w-5 h-5 text-qrmory-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{code.name}</p>
                    <p className="text-xs text-neutral-500 truncate max-w-xs">
                      {code.url}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code.url);
                    toast("URL Copied", { description: code.url });
                  }}
                  className="text-sm text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium"
                >
                  Copy URL
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Suggested patterns */}
      {suggestedPatterns.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedPatterns.map((sp, index) => (
              <button
                key={index}
                onClick={() => handlePatternSelect(index)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  batchConfig.pattern === sp.pattern
                    ? "bg-qrmory-purple-100 border-qrmory-purple-300 text-qrmory-purple-800"
                    : "bg-white border-neutral-200 text-neutral-600 hover:border-qrmory-purple-200"
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pattern configuration */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Name Pattern
          </label>
          <input
            type="text"
            value={batchConfig.pattern}
            onChange={(e) =>
              setBatchConfig((prev) => ({ ...prev, pattern: e.target.value }))
            }
            placeholder="e.g., Table {n}"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Use {"{n}"} for the number
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            URL/Value Pattern
          </label>
          <input
            type="text"
            value={batchConfig.valuePattern}
            onChange={(e) =>
              setBatchConfig((prev) => ({
                ...prev,
                valuePattern: e.target.value,
              }))
            }
            placeholder="e.g., https://menu.example.com/table/{n}"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Use {"{n}"} for the number
          </p>
        </div>
      </div>

      {/* Range configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Start Number
          </label>
          <input
            type="number"
            value={batchConfig.rangeStart}
            onChange={(e) =>
              setBatchConfig((prev) => ({
                ...prev,
                rangeStart: parseInt(e.target.value) || 0,
              }))
            }
            min={0}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            End Number
          </label>
          <input
            type="number"
            value={batchConfig.rangeEnd}
            onChange={(e) =>
              setBatchConfig((prev) => ({
                ...prev,
                rangeEnd: parseInt(e.target.value) || 0,
              }))
            }
            min={1}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-neutral-700">Preview</h4>
          <span className="text-xs bg-qrmory-purple-100 text-qrmory-purple-700 px-2 py-1 rounded-full">
            {totalCount} codes
          </span>
        </div>
        <div className="space-y-2">
          {previewItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-neutral-100"
            >
              <span className="font-medium text-neutral-800">{item.name}</span>
              <span className="text-neutral-500 text-xs truncate max-w-48">
                {item.value}
              </span>
            </div>
          ))}
          {totalCount > 5 && (
            <p className="text-xs text-neutral-500 text-center pt-2">
              ... and {totalCount - 5} more
            </p>
          )}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || totalCount <= 0}
        className="w-full py-3 bg-qrmory-purple-800 text-white font-semibold rounded-xl hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <IconLoader2 className="w-5 h-5 animate-spin" />
            Generating {totalCount} QR Codes...
          </>
        ) : (
          <>
            <IconQrcode className="w-5 h-5" />
            Generate {totalCount} QR Codes
          </>
        )}
      </button>

      <p className="text-xs text-neutral-500 text-center">
        Batch generation requires Explorer plan or higher
      </p>
    </div>
  );
}
