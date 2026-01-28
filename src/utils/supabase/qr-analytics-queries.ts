// src/utils/supabase/qr-analytics-queries.ts
// Query functions for individual QR code analytics

import { cache } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "./queries";

export interface QRCodeDetails {
  id: string;
  title: string;
  type: "static" | "dynamic";
  shortcode: string | null;
  qr_value: string;
  created_at: string;
  is_active: boolean;
  content: any;
}

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

export interface AnalyticsBreakdown {
  [key: string]: number;
}

export interface TimeSeriesData {
  date: string;
  scans: number;
}

export interface QRAnalyticsData {
  qrCode: QRCodeDetails;
  totalScans: number;
  scansInRange: number;
  recentScans: ScanRecord[];
  countryBreakdown: AnalyticsBreakdown;
  deviceBreakdown: AnalyticsBreakdown;
  browserBreakdown: AnalyticsBreakdown;
  timeSeries: TimeSeriesData[];
}

export type DateRange = "7d" | "30d" | "90d" | "custom";

function getDateRangeStart(range: DateRange, customStart?: string): string {
  if (range === "custom" && customStart) {
    return customStart;
  }

  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// Get a single QR code with ownership verification
export const getQRCodeById = cache(
  async (
    supabase: SupabaseClient,
    qrCodeId: string
  ): Promise<QRCodeDetails | null> => {
    const user = await getUser(supabase);
    if (!user) return null;

    const { data, error } = await supabase
      .from("qr_codes")
      .select("id, title, type, shortcode, qr_value, created_at, is_active, content")
      .eq("id", qrCodeId)
      .eq("user_id", user.id)
      .single();

    if (error || !data) return null;
    return data as QRCodeDetails;
  }
);

// Get analytics for a specific QR code
export const getQRCodeAnalytics = cache(
  async (
    supabase: SupabaseClient,
    qrCodeId: string,
    dateRange: DateRange = "30d",
    customStartDate?: string,
    customEndDate?: string
  ): Promise<QRAnalyticsData | null> => {
    const user = await getUser(supabase);
    if (!user) return null;

    // Get QR code with ownership check
    const qrCode = await getQRCodeById(supabase, qrCodeId);
    if (!qrCode) return null;

    const rangeStart = getDateRangeStart(dateRange, customStartDate);
    const rangeEnd = customEndDate || new Date().toISOString();

    // Fetch all analytics data in parallel
    const [
      { count: totalScans },
      { data: rangeScans },
      { data: countryData },
      { data: deviceData },
      { data: browserData },
      { data: timeSeriesData },
    ] = await Promise.all([
      // Total all-time scans
      supabase
        .from("qr_code_analytics")
        .select("*", { count: "exact", head: true })
        .eq("qr_code_id", qrCodeId),

      // Scans within date range (for recent scans table)
      supabase
        .from("qr_code_analytics")
        .select("id, scanned_at, country, city, device_type, browser, os, referrer")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .lte("scanned_at", rangeEnd)
        .order("scanned_at", { ascending: false })
        .limit(100),

      // Country breakdown
      supabase
        .from("qr_code_analytics")
        .select("country")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .lte("scanned_at", rangeEnd),

      // Device breakdown
      supabase
        .from("qr_code_analytics")
        .select("device_type")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .lte("scanned_at", rangeEnd),

      // Browser breakdown
      supabase
        .from("qr_code_analytics")
        .select("browser")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .lte("scanned_at", rangeEnd),

      // Time series data
      supabase
        .from("qr_code_analytics")
        .select("scanned_at")
        .eq("qr_code_id", qrCodeId)
        .gte("scanned_at", rangeStart)
        .lte("scanned_at", rangeEnd)
        .order("scanned_at", { ascending: true }),
    ]);

    // Process breakdowns
    const countryBreakdown = processBreakdown(countryData, "country");
    const deviceBreakdown = processBreakdown(deviceData, "device_type");
    const browserBreakdown = processBreakdown(browserData, "browser");

    // Process time series
    const timeSeries = processTimeSeries(timeSeriesData || [], dateRange);

    return {
      qrCode,
      totalScans: totalScans || 0,
      scansInRange: rangeScans?.length || 0,
      recentScans: (rangeScans as ScanRecord[]) || [],
      countryBreakdown,
      deviceBreakdown,
      browserBreakdown,
      timeSeries,
    };
  }
);

// Helper function to process breakdown data
function processBreakdown(
  data: any[] | null,
  field: string
): AnalyticsBreakdown {
  if (!data || !data.length) return {};

  return data.reduce((acc: AnalyticsBreakdown, item: any) => {
    // Handle null, undefined, or empty string values
    const rawKey = item[field];
    const key = rawKey && rawKey.trim() ? rawKey.trim() : "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

// Helper function to process time series data
function processTimeSeries(
  data: any[],
  dateRange: DateRange
): TimeSeriesData[] {
  if (!data.length) return [];

  // Determine granularity based on date range
  const dailyData: { [key: string]: number } = {};

  data.forEach((item) => {
    const date = new Date(item.scanned_at).toISOString().split("T")[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  });

  // Fill in missing dates
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
  const result: TimeSeriesData[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    result.push({
      date,
      scans: dailyData[date] || 0,
    });
  }

  return result;
}

// Get all analytics data for export
export const getQRCodeAnalyticsForExport = async (
  supabase: SupabaseClient,
  qrCodeId: string,
  dateRange: DateRange = "30d",
  customStartDate?: string,
  customEndDate?: string
): Promise<ScanRecord[] | null> => {
  const user = await getUser(supabase);
  if (!user) return null;

  // Verify ownership
  const qrCode = await getQRCodeById(supabase, qrCodeId);
  if (!qrCode) return null;

  const rangeStart = getDateRangeStart(dateRange, customStartDate);
  const rangeEnd = customEndDate || new Date().toISOString();

  const { data, error } = await supabase
    .from("qr_code_analytics")
    .select("id, scanned_at, country, city, device_type, browser, os, referrer")
    .eq("qr_code_id", qrCodeId)
    .gte("scanned_at", rangeStart)
    .lte("scanned_at", rangeEnd)
    .order("scanned_at", { ascending: false });

  if (error) return null;
  return data as ScanRecord[];
};

// Get chart data for time-series visualization
export const getChartData = cache(
  async (
    supabase: SupabaseClient,
    qrCodeIds: string[],
    dateRange: DateRange = "30d"
  ): Promise<TimeSeriesData[]> => {
    const user = await getUser(supabase);
    if (!user || !qrCodeIds.length) return [];

    const rangeStart = getDateRangeStart(dateRange);

    const { data, error } = await supabase
      .from("qr_code_analytics")
      .select("scanned_at")
      .in("qr_code_id", qrCodeIds)
      .gte("scanned_at", rangeStart)
      .order("scanned_at", { ascending: true });

    if (error || !data) return [];

    return processTimeSeries(data, dateRange);
  }
);
