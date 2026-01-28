// src/app/(private)/dashboard/analytics/page.tsx
import { createClient } from "@/utils/supabase/server";
import {
  IconEye,
  IconTrendingUp,
  IconMapPin,
  IconDevices,
  IconCalendar,
  IconQrcode,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";
import { getUserAnalytics } from "@/utils/supabase/queries";

export const metadata = {
  title: "Analytics | QRmory",
  description: "View detailed analytics for your QR codes.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const data = await getUserAnalytics(supabase);

  if (!data) {
    return (
      <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
        <h3 className="text-xl font-semibold mb-2">Please Log In</h3>
        <p className="text-neutral-600 mb-4">
          You need to be logged in to view analytics.
        </p>
        <Link
          href="/login"
          className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  const { qrCodes, analytics } = data;

  if (!qrCodes.length) {
    return (
      <div className="flex flex-col w-full">
        <h1 className="mb-4 text-xl font-bold">Analytics</h1>
        <div className="text-center my-10 p-8 bg-neutral-50 rounded-xl">
          <IconQrcode className="mx-auto mb-4 text-neutral-400" size={48} />
          <h3 className="text-xl font-semibold mb-2">No QR Codes Yet</h3>
          <p className="text-neutral-600 mb-4">
            Create your first QR code to start seeing analytics data.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-block bg-qrmory-purple-800 text-white px-4 py-2 rounded-lg hover:bg-qrmory-purple-700 transition-colors"
          >
            Create QR Code
          </Link>
        </div>
      </div>
    );
  }

  const recentScansCount = analytics?.recentScans?.length || 0;
  const totalScansCount = analytics?.totalScans || 0;
  const avgDaily = recentScansCount > 0 ? Math.round(recentScansCount / 30) : 0;

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-sm text-neutral-500">Last 30 days</p>
      </div>

      {/* Key Metrics - Clean horizontal layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Total Scans</p>
          <p className="text-3xl font-bold text-neutral-900">
            {totalScansCount}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Last 30 Days</p>
          <p className="text-3xl font-bold text-neutral-900">
            {recentScansCount}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Avg Daily</p>
          <p className="text-3xl font-bold text-neutral-900">{avgDaily}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <p className="text-sm text-neutral-500 mb-1">Active Codes</p>
          <p className="text-3xl font-bold text-neutral-900">
            {qrCodes.length}
          </p>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Top Countries</h3>
          {Object.keys(analytics?.countryBreakdown || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics?.countryBreakdown || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([country, count]) => {
                  const percentage = recentScansCount > 0
                    ? Math.round(((count as number) / recentScansCount) * 100)
                    : 0;
                  return (
                    <div key={country}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700">
                          {country || "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count as number} ({percentage}%)
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
          <h3 className="font-semibold text-neutral-800 mb-4">Devices</h3>
          {Object.keys(analytics?.deviceBreakdown || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics?.deviceBreakdown || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([device, count]) => {
                  const percentage = recentScansCount > 0
                    ? Math.round(((count as number) / recentScansCount) * 100)
                    : 0;
                  return (
                    <div key={device}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700 capitalize">
                          {device || "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count as number} ({percentage}%)
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

        {/* Top Browsers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Browsers</h3>
          {Object.keys(analytics?.browserBreakdown || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics?.browserBreakdown || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([browser, count]) => {
                  const percentage = recentScansCount > 0
                    ? Math.round(((count as number) / recentScansCount) * 100)
                    : 0;
                  return (
                    <div key={browser}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-neutral-700">
                          {browser || "Unknown"}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">
                          {count as number} ({percentage}%)
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
        {analytics?.recentScans && analytics.recentScans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">
                    Date
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
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {analytics.recentScans
                  .slice(0, 10)
                  .map((scan: any, index: number) => (
                    <tr key={index} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-900">
                        {new Date(scan.scanned_at).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {scan.country || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 capitalize">
                        {scan.device_type || "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600">
                        {scan.browser || "Unknown"}
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
              Analytics will appear once your QR codes are scanned
            </p>
          </div>
        )}
      </div>

      {/* QR Codes */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-800">Your QR Codes</h3>
          <Link
            href="/dashboard/my-codes"
            className="text-sm text-qrmory-purple-800 hover:text-qrmory-purple-700 font-medium flex items-center gap-1"
          >
            View all
            <IconChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {qrCodes.slice(0, 6).map((qr: any) => (
            <Link
              key={qr.id}
              href={`/dashboard/analytics/${qr.id}`}
              className="border border-neutral-200 rounded-lg p-4 hover:border-qrmory-purple-300 hover:bg-neutral-50 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-neutral-900 truncate flex-1">
                  {qr.title}
                </h4>
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                    qr.type === "dynamic"
                      ? "bg-qrmory-purple-100 text-qrmory-purple-800"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {qr.type}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Created {new Date(qr.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-qrmory-purple-600 mt-1 font-medium">
                View analytics →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
