// src/components/batch-csv-importer.tsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  IconUpload,
  IconFileTypeCsv,
  IconLoader2,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconDownload,
  IconRefresh,
} from "@tabler/icons-react";
import {
  parseFile,
  applyColumnMapping,
  validateMappedCodes,
  autoDetectMapping,
  downloadSampleTemplate,
  ParseResult,
  ColumnMapping,
  MappedQRCode,
  ValidationResult,
} from "@/lib/csv-parser";

interface BatchCSVImporterProps {
  onImport: (codes: MappedQRCode[]) => void;
  maxRows?: number;
}

type Step = "upload" | "mapping" | "preview" | "processing";

export default function BatchCSVImporter({
  onImport,
  maxRows = 100,
}: BatchCSVImporterProps) {
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: null,
    value: null,
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setFileName(file.name);

      try {
        const result = await parseFile(file);

        if (result.errors.length > 0 && result.rows.length === 0) {
          toast("Failed to parse file", {
            description: result.errors[0],
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          });
          return;
        }

        if (result.rows.length === 0) {
          toast("Empty file", {
            description: "The file contains no data rows.",
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          });
          return;
        }

        if (result.rows.length > maxRows) {
          toast("File too large", {
            description: `Maximum ${maxRows} rows allowed. Your file has ${result.rows.length} rows.`,
            style: {
              backgroundColor: "rgb(254, 226, 226)",
              color: "rgb(153, 27, 27)",
            },
          });
          return;
        }

        setParseResult(result);

        // Auto-detect column mapping
        const autoMapping = autoDetectMapping(result.headers);
        setColumnMapping(autoMapping);

        setStep("mapping");
      } catch (error) {
        console.error("File parse error:", error);
        toast("Failed to read file", {
          description: "Please make sure the file is a valid CSV file.",
          style: {
            backgroundColor: "rgb(254, 226, 226)",
            color: "rgb(153, 27, 27)",
          },
        });
      }
    },
    [maxRows]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleMappingConfirm = useCallback(() => {
    if (!parseResult || !columnMapping.name || !columnMapping.value) {
      toast("Please select columns", {
        description: "Both Name and Value columns must be selected.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    const mappedCodes = applyColumnMapping(parseResult.rows, columnMapping);
    const validation = validateMappedCodes(mappedCodes);

    setValidationResult(validation);
    setStep("preview");
  }, [parseResult, columnMapping]);

  const handleImport = useCallback(() => {
    if (!validationResult || validationResult.valid.length === 0) {
      toast("No valid codes", {
        description: "There are no valid QR codes to import.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
      return;
    }

    onImport(validationResult.valid);
  }, [validationResult, onImport]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setParseResult(null);
    setColumnMapping({ name: null, value: null });
    setValidationResult(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Upload step
  if (step === "upload") {
    return (
      <div className="space-y-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragging
              ? "border-qrmory-purple-500 bg-qrmory-purple-50"
              : "border-neutral-300 hover:border-qrmory-purple-400 hover:bg-neutral-50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex justify-center gap-4 mb-4">
            <IconFileTypeCsv size={40} className="text-green-600" />
          </div>

          <p className="text-neutral-700 font-medium mb-1">
            Drop your CSV file here
          </p>
          <p className="text-sm text-neutral-500 mb-4">or click to browse</p>

          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 bg-qrmory-purple-100 text-qrmory-purple-800 rounded-lg font-medium hover:bg-qrmory-purple-200 transition-colors"
          >
            <IconUpload size={18} />
            Select File
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">
            Supported: CSV (max {maxRows} rows)
          </span>
          <button
            onClick={downloadSampleTemplate}
            className="text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium flex items-center gap-1"
          >
            <IconDownload size={16} />
            Download Template
          </button>
        </div>
      </div>
    );
  }

  // Mapping step
  if (step === "mapping" && parseResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-800">Map Columns</h3>
            <p className="text-sm text-neutral-500">
              {fileName} - {parseResult.rows.length} rows found
            </p>
          </div>
          <button
            onClick={handleReset}
            className="text-sm text-neutral-600 hover:text-neutral-800 flex items-center gap-1"
          >
            <IconRefresh size={16} />
            Start Over
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Name Column <span className="text-red-500">*</span>
            </label>
            <select
              value={columnMapping.name || ""}
              onChange={(e) =>
                setColumnMapping((prev) => ({ ...prev, name: e.target.value || null }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
            >
              <option value="">Select column...</option>
              {parseResult.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              Used as the QR code title/name
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Value/URL Column <span className="text-red-500">*</span>
            </label>
            <select
              value={columnMapping.value || ""}
              onChange={(e) =>
                setColumnMapping((prev) => ({ ...prev, value: e.target.value || null }))
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-qrmory-purple-500 focus:border-transparent"
            >
              <option value="">Select column...</option>
              {parseResult.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1">
              The URL or value encoded in the QR code
            </p>
          </div>
        </div>

        {/* Preview of first few rows */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200">
            <span className="text-sm font-medium text-neutral-700">Data Preview</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-neutral-200">
                  {parseResult.headers.slice(0, 5).map((header) => (
                    <th
                      key={header}
                      className={`px-3 py-2 text-left font-medium ${
                        header === columnMapping.name || header === columnMapping.value
                          ? "text-qrmory-purple-700 bg-qrmory-purple-50"
                          : "text-neutral-600"
                      }`}
                    >
                      {header}
                      {header === columnMapping.name && (
                        <span className="ml-1 text-xs">(Name)</span>
                      )}
                      {header === columnMapping.value && (
                        <span className="ml-1 text-xs">(Value)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parseResult.rows.slice(0, 3).map((row, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {parseResult.headers.slice(0, 5).map((header) => (
                      <td
                        key={header}
                        className={`px-3 py-2 truncate max-w-xs ${
                          header === columnMapping.name || header === columnMapping.value
                            ? "bg-qrmory-purple-50"
                            : ""
                        }`}
                      >
                        {row[header] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleMappingConfirm}
            disabled={!columnMapping.name || !columnMapping.value}
            className="px-6 py-2 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Preview step
  if (step === "preview" && validationResult) {
    const { valid, invalid } = validationResult;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-neutral-800">Review Import</h3>
            <p className="text-sm text-neutral-500">
              {valid.length} valid, {invalid.length} invalid
            </p>
          </div>
          <button
            onClick={() => setStep("mapping")}
            className="text-sm text-neutral-600 hover:text-neutral-800 flex items-center gap-1"
          >
            <IconRefresh size={16} />
            Change Mapping
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <IconCheck size={20} className="text-green-600" />
              <span className="font-semibold text-green-800">{valid.length}</span>
            </div>
            <p className="text-sm text-green-600">Valid QR codes</p>
          </div>
          {invalid.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <IconAlertTriangle size={20} className="text-amber-600" />
                <span className="font-semibold text-amber-800">{invalid.length}</span>
              </div>
              <p className="text-sm text-amber-600">Will be skipped</p>
            </div>
          )}
        </div>

        {/* Invalid rows warning */}
        {invalid.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-medium text-amber-800 mb-2">Rows with issues:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {invalid.slice(0, 5).map((row) => (
                <p key={row.rowIndex} className="text-sm text-amber-700">
                  Row {row.rowIndex}: {row.reason}
                </p>
              ))}
              {invalid.length > 5 && (
                <p className="text-sm text-amber-600">
                  ...and {invalid.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}

        {/* Valid codes preview */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-2 bg-neutral-100 border-b border-neutral-200">
            <span className="text-sm font-medium text-neutral-700">
              QR Codes to Create ({valid.length})
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100">
            {valid.slice(0, 10).map((code) => (
              <div key={code.rowIndex} className="px-4 py-2 flex items-center justify-between">
                <span className="font-medium text-neutral-800">{code.name}</span>
                <span className="text-sm text-neutral-500 truncate max-w-xs">
                  {code.value}
                </span>
              </div>
            ))}
            {valid.length > 10 && (
              <div className="px-4 py-2 text-sm text-neutral-500 text-center">
                ...and {valid.length - 10} more
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={valid.length === 0}
            className="px-6 py-2 bg-qrmory-purple-800 text-white rounded-lg hover:bg-qrmory-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <IconCheck size={18} />
            Import {valid.length} QR Codes
          </button>
        </div>
      </div>
    );
  }

  return null;
}
