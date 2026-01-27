// src/components/analytics/export-button.tsx
"use client";

import React, { useState } from "react";
import { IconDownload, IconFileTypeCsv, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  exportToCSV,
  exportSummaryToCSV,
  generateSummaryStats,
  formatDateRange,
} from "@/lib/analytics-export";

interface ExportButtonProps {
  qrCodeId: string;
  qrCodeTitle: string;
  dateRange: "7d" | "30d" | "90d";
}

export function ExportButton({
  qrCodeId,
  qrCodeTitle,
  dateRange,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: "detailed" | "summary") => {
    setIsExporting(true);
    setIsOpen(false);

    try {
      const supabase = createClient();

      // Get the date range
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const rangeStart = new Date(
        Date.now() - days * 24 * 60 * 60 * 1000
      ).toISOString();

      // Fetch scan data
      const { data: scans, error } = await supabase
        .from("qr_code_analytics")
        .select("id, scanned_at, country, city, device_type, browser, os, referrer")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .order("scanned_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch analytics data");
      }

      if (!scans || scans.length === 0) {
        toast("No data to export", {
          description: "There are no scans in the selected date range.",
        });
        return;
      }

      const filename = `${qrCodeTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-analytics`;

      if (type === "detailed") {
        exportToCSV(scans, filename);
        toast("Export complete", {
          description: `Downloaded ${scans.length} scan records as CSV.`,
        });
      } else {
        const stats = generateSummaryStats(scans);
        const topCountry = Object.entries(stats.countryBreakdown).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "N/A";
        const topDevice = Object.entries(stats.deviceBreakdown).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "N/A";
        const topBrowser = Object.entries(stats.browserBreakdown).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "N/A";

        exportSummaryToCSV(
          {
            qrCodeTitle,
            totalScans: scans.length,
            dateRange: formatDateRange(dateRange),
            topCountry,
            topDevice,
            topBrowser,
          },
          stats,
          filename
        );
        toast("Export complete", {
          description: "Downloaded analytics summary as CSV.",
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast("Export failed", {
        description: "There was an error exporting your data. Please try again.",
        style: {
          backgroundColor: "rgb(254, 226, 226)",
          color: "rgb(153, 27, 27)",
        },
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
          ${isExporting
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
          }
        `}
      >
        <IconDownload size={18} />
        <span className="text-sm font-medium">
          {isExporting ? "Exporting..." : "Export"}
        </span>
        <IconChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <button
                onClick={() => handleExport("detailed")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
              >
                <IconFileTypeCsv size={20} className="text-green-600" />
                <div className="text-left">
                  <p className="font-medium">Detailed CSV</p>
                  <p className="text-xs text-neutral-500">All scan records</p>
                </div>
              </button>

              <button
                onClick={() => handleExport("summary")}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-md transition-colors"
              >
                <IconFileTypeCsv size={20} className="text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Summary CSV</p>
                  <p className="text-xs text-neutral-500">Stats breakdown</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ExportButton;
