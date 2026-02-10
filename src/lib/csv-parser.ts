// src/lib/csv-parser.ts
// CSV file parsing utilities for batch QR code generation

import Papa from "papaparse";

export interface ParsedRow {
  [key: string]: string;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  errors: string[];
}

export interface ColumnMapping {
  name: string | null; // Column to use for QR code name/title
  value: string | null; // Column to use for QR code value/URL
}

export interface MappedQRCode {
  name: string;
  value: string;
  rowIndex: number;
}

export interface ValidationResult {
  valid: MappedQRCode[];
  invalid: Array<{
    rowIndex: number;
    name: string;
    value: string;
    reason: string;
  }>;
}

// Parse CSV file content
export function parseCSV(content: string): ParseResult {
  const errors: string[] = [];

  const result = Papa.parse<ParsedRow>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    result.errors.forEach((err) => {
      errors.push(`Row ${err.row}: ${err.message}`);
    });
  }

  return {
    headers: result.meta.fields || [],
    rows: result.data,
    errors,
  };
}

// Parse file (CSV only)
export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.toLowerCase().split(".").pop();

  if (extension === "csv") {
    const content = await file.text();
    return parseCSV(content);
  } else {
    return {
      headers: [],
      rows: [],
      errors: [`Unsupported file type: .${extension}. Please use a CSV file.`],
    };
  }
}

// Apply column mapping to parsed rows
export function applyColumnMapping(
  rows: ParsedRow[],
  mapping: ColumnMapping
): MappedQRCode[] {
  if (!mapping.name || !mapping.value) {
    return [];
  }

  return rows.map((row, index) => ({
    name: row[mapping.name!]?.trim() || `QR Code ${index + 1}`,
    value: row[mapping.value!]?.trim() || "",
    rowIndex: index + 1, // 1-indexed for display
  }));
}

// Validate mapped QR codes
export function validateMappedCodes(codes: MappedQRCode[]): ValidationResult {
  const valid: MappedQRCode[] = [];
  const invalid: ValidationResult["invalid"] = [];

  codes.forEach((code) => {
    const reasons: string[] = [];

    // Check if value is empty
    if (!code.value) {
      reasons.push("Value/URL is empty");
    }

    // Check if value is a valid URL (if it looks like a URL)
    if (code.value && code.value.startsWith("http")) {
      try {
        new URL(code.value);
      } catch {
        reasons.push("Invalid URL format");
      }
    }

    // Check name length
    if (code.name.length > 100) {
      reasons.push("Name is too long (max 100 characters)");
    }

    // Check value length
    if (code.value.length > 2000) {
      reasons.push("Value is too long (max 2000 characters)");
    }

    if (reasons.length > 0) {
      invalid.push({
        rowIndex: code.rowIndex,
        name: code.name,
        value: code.value,
        reason: reasons.join("; "),
      });
    } else {
      valid.push(code);
    }
  });

  return { valid, invalid };
}

// Auto-detect column mapping based on common names
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const nameColumns = ["name", "title", "label", "qr name", "qr_name", "qrname"];
  const valueColumns = [
    "url",
    "value",
    "link",
    "destination",
    "target",
    "qr value",
    "qr_value",
    "qrvalue",
    "website",
  ];

  const lowerHeaders = headers.map((h) => h.toLowerCase());

  let nameColumn: string | null = null;
  let valueColumn: string | null = null;

  // Find name column
  for (const col of nameColumns) {
    const index = lowerHeaders.indexOf(col);
    if (index !== -1) {
      nameColumn = headers[index];
      break;
    }
  }

  // Find value column
  for (const col of valueColumns) {
    const index = lowerHeaders.indexOf(col);
    if (index !== -1) {
      valueColumn = headers[index];
      break;
    }
  }

  // If no match, use first two columns
  if (!nameColumn && headers.length >= 1) {
    nameColumn = headers[0];
  }
  if (!valueColumn && headers.length >= 2) {
    valueColumn = headers[1];
  }

  return {
    name: nameColumn,
    value: valueColumn,
  };
}

// Generate sample CSV template content
export function generateSampleCSV(): string {
  const sampleData = [
    { Name: "Product Landing Page", URL: "https://example.com/product-1" },
    { Name: "Menu Table 1", URL: "https://menu.example.com/table/1" },
    { Name: "Contact Card", URL: "https://vcard.example.com/john-doe" },
    { Name: "Event Registration", URL: "https://events.example.com/register" },
    { Name: "Special Offer", URL: "https://shop.example.com/offer/50off" },
  ];

  return Papa.unparse(sampleData);
}

// Download sample template
export function downloadSampleTemplate(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "qrmory-batch-template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
