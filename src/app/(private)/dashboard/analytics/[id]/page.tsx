// src/app/(private)/dashboard/analytics/[id]/page.tsx
import { createClient } from "@/utils/supabase/server";
import { getQRCodeAnalytics } from "@/utils/supabase/qr-analytics-queries";
import {
  IconArrowLeft,
  IconQrcode,
  IconEye,
  IconCalendar,
  IconMapPin,
  IconDevices,
  IconBrowser,
  IconExternalLink,
} from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanChart } from "@/components/analytics/scan-chart";
import { ExportButton } from "@/components/analytics/export-button";

export const metadata = {
  title: "QR Code Analytics | QRmory",
  description: "View detailed analytics for your QR code.",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ range?: string }>;
}

export default async function QRAnalyticsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { range = "30d" } = await searchParams;

  const supabase = await createClient();
  const dateRange = (["7d", "30d", "90d"].includes(range) ? range : "30d") as "7d" | "30d" | "90d";

  const analytics = await getQRCodeAnalytics(supabase, id, dateRange);

  if (!analytics) {
    notFound();
  }

  const { qrCode, totalScans, scansInRange, recentScans, countryBreakdown, deviceBreakdown, browserBreakdown, timeSeries } = analytics;

  const avgDaily = scansInRange > 0 ? Math.round(scansInRange / (dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90)) : 0;

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
          >
            <IconArrowLeft size={16} />
            Back to Analytics
          </Link>
          <h1 className="text-xl font-bold text-neutral-900">{qrCode.title}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                qrCode.type === "dynamic"
                  ? "bg-qrmory-purple-100 text-qrmory-purple-800"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              {qrCode.type}
            </span>
            {qrCode.shortcode && (
              <a
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/${qrCode.shortcode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-qrmory-purple-600 hover:text-qrmory-purple-800 flex items-center gap-1"
              >
                /{qrCode.shortcode}
                <IconExternalLink size={12} />
              </a>
            )}
            <span className="text-xs text-neutral-500">
              Created {new Date(qrCode.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <Link
                key={r}
                href={`/dashboard/analytics/${id}?range=${r}`}
                className={`px-3 py-1 text-sm rounded ${
                  dateRange === r
                    ? "bg-white shadow-sm text-neutral-900 font-medium"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "90 days"}
              </Link>
            ))}
          </div>

          {/* Export Button */}
          <ExportButton
            qrCodeId={id}
            qrCodeTitle={qrCode.title}
            dateRange={dateRange}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Total Scans</p>
          <p className="text-3xl font-bold text-neutral-900">{totalScans}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">
            {dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : "Last 90 Days"}
          </p>
          <p className="text-3xl font-bold text-neutral-900">{scansInRange}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Avg Daily</p>
          <p className="text-3xl font-bold text-neutral-900">{avgDaily}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Status</p>
          <p className={`text-lg font-bold ${qrCode.is_active ? "text-green-600" : "text-neutral-400"}`}>
            {qrCode.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* Scan Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-neutral-800 mb-4">Scan Trends</h3>
        <ScanChart data={timeSeries} />
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconMapPin size={20} className="text-neutral-400" />
            <h3 className="font-semibold text-neutral-800">Top Countries</h3>
          </div>
          {Object.keys(countryBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(countryBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => {
                  const percentage = Math.round((count / scansInRange) * 100);
                  return (
                    <div key={country}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700">{country}</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div
                          className="bg-qrmory-purple-800 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No scan data yet</p>
          )}
        </div>

        {/* Device Types */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconDevices size={20} className="text-neutral-400" />
            <h3 className="font-semibold text-neutral-800">Devices</h3>
          </div>
          {Object.keys(deviceBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(deviceBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => {
                  const percentage = Math.round((count / scansInRange) * 100);
                  return (
                    <div key={device}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700 capitalize">{device}</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div
                          className="bg-qrmory-purple-800 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No scan data yet</p>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <IconBrowser size={20} className="text-neutral-400" />
            <h3 className="font-semibold text-neutral-800">Browsers</h3>
          </div>
          {Object.keys(browserBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(browserBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]) => {
                  const percentage = Math.round((count / scansInRange) * 100);
                  return (
                    <div key={browser}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700">{browser}</span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5">
                        <div
                          className="bg-qrmory-purple-800 h-1.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No scan data yet</p>
          )}
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="font-semibold text-neutral-800 mb-4">Recent Scans</h3>
        {recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Device
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Browser
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    OS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentScans.slice(0, 20).map((scan) => (
                  <tr key={scan.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-sm text-neutral-900">
                      {new Date(scan.scanned_at).toLocaleDateString("en-AU", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {scan.city ? `${scan.city}, ${scan.country}` : scan.country || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600 capitalize">
                      {scan.device_type || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {scan.browser || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {scan.os || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <IconEye className="mx-auto mb-3 text-neutral-300" size={48} />
            <p className="text-neutral-600 font-medium">No scans yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              Analytics will appear once this QR code is scanned
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
