// src/lib/analytics-export.ts
// Analytics export utilities for CSV and PDF

import Papa from "papaparse";

export interface ScanRecord {
  id: string;
  scanned_at: string;
  country: string;
  city: string | null;
  device_type: string;
  browser: string;
  os: string | null;
  referrer: string | null;
}

export interface ExportSummary {
  qrCodeTitle: string;
  totalScans: number;
  dateRange: string;
  topCountry: string;
  topDevice: string;
  topBrowser: string;
}

// Convert scan records to CSV format
export function exportToCSV(
  scans: ScanRecord[],
  filename: string
): void {
  const csvData = scans.map((scan) => ({
    "Date & Time": new Date(scan.scanned_at).toLocaleString("en-AU"),
    Country: scan.country || "Unknown",
    City: scan.city || "Unknown",
    "Device Type": scan.device_type || "Unknown",
    Browser: scan.browser || "Unknown",
    "Operating System": scan.os || "Unknown",
    Referrer: scan.referrer || "Direct",
  }));

  const csv = Papa.unparse(csvData);
  downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
}

// Generate summary statistics for export
export function generateSummaryStats(
  scans: ScanRecord[]
): {
  countryBreakdown: { [key: string]: number };
  deviceBreakdown: { [key: string]: number };
  browserBreakdown: { [key: string]: number };
  dailyBreakdown: { [key: string]: number };
} {
  const countryBreakdown: { [key: string]: number } = {};
  const deviceBreakdown: { [key: string]: number } = {};
  const browserBreakdown: { [key: string]: number } = {};
  const dailyBreakdown: { [key: string]: number } = {};

  scans.forEach((scan) => {
    // Country
    const country = scan.country || "Unknown";
    countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;

    // Device
    const device = scan.device_type || "Unknown";
    deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;

    // Browser
    const browser = scan.browser || "Unknown";
    browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;

    // Daily
    const date = new Date(scan.scanned_at).toISOString().split("T")[0];
    dailyBreakdown[date] = (dailyBreakdown[date] || 0) + 1;
  });

  return {
    countryBreakdown,
    deviceBreakdown,
    browserBreakdown,
    dailyBreakdown,
  };
}

// Export summary as CSV
export function exportSummaryToCSV(
  summary: ExportSummary,
  stats: ReturnType<typeof generateSummaryStats>,
  filename: string
): void {
  const sections: string[] = [];

  // Summary section
  sections.push("QR Code Analytics Summary");
  sections.push(`QR Code: ${summary.qrCodeTitle}`);
  sections.push(`Date Range: ${summary.dateRange}`);
  sections.push(`Total Scans: ${summary.totalScans}`);
  sections.push("");

  // Country breakdown
  sections.push("Country Breakdown");
  sections.push(Papa.unparse(
    Object.entries(stats.countryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([country, count]) => ({ Country: country, Scans: count }))
  ));
  sections.push("");

  // Device breakdown
  sections.push("Device Breakdown");
  sections.push(Papa.unparse(
    Object.entries(stats.deviceBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({ Device: device, Scans: count }))
  ));
  sections.push("");

  // Browser breakdown
  sections.push("Browser Breakdown");
  sections.push(Papa.unparse(
    Object.entries(stats.browserBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([browser, count]) => ({ Browser: browser, Scans: count }))
  ));
  sections.push("");

  // Daily breakdown
  sections.push("Daily Scans");
  sections.push(Papa.unparse(
    Object.entries(stats.dailyBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ Date: date, Scans: count }))
  ));

  const csv = sections.join("\n");
  downloadFile(csv, `${filename}-summary.csv`, "text/csv;charset=utf-8");
}

// Helper function to download a file
function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Format date range for display
export function formatDateRange(range: "7d" | "30d" | "90d"): string {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const endDate = new Date();
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}
