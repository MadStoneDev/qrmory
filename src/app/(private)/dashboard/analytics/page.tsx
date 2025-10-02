// src/app/(private)/dashboard/analytics/page.tsx
import { createClient } from "@/utils/supabase/server";
import {
  IconEye,
  IconTrendingUp,
  IconMapPin,
  IconDevices,
  IconCalendar,
  IconQrcode,
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
                href="/create"
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

  return (
      <div className="flex flex-col w-full space-y-6">
        <h1 className="mb-4 text-xl font-bold">Analytics</h1>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconEye className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Total Scans
                </p>
                <p className="text-2xl font-bold text-neutral-800">
                  {totalScansCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <IconTrendingUp className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">
                  Last 30 Days
                </p>
                <p className="text-2xl font-bold text-neutral-800">
                  {recentScansCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <IconQrcode className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">QR Codes</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {qrCodes.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <IconCalendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Avg Daily</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {recentScansCount > 0 ? Math.round(recentScansCount / 30) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Countries */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconMapPin className="text-neutral-600" size={20} />
              <h3 className="font-semibold text-neutral-800">Top Countries</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.countryBreakdown || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([country, count]) => (
                      <div
                          key={country}
                          className="flex justify-between items-center"
                      >
                        <span className="text-sm text-neutral-700">{country}</span>
                        <span className="text-sm font-medium text-neutral-800">
                    {count as number}
                  </span>
                      </div>
                  ))}
              {Object.keys(analytics?.countryBreakdown || {}).length === 0 && (
                  <p className="text-sm text-neutral-500">No data yet</p>
              )}
            </div>
          </div>

          {/* Devices */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconDevices className="text-neutral-600" size={20} />
              <h3 className="font-semibold text-neutral-800">Device Types</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.deviceBreakdown || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([device, count]) => (
                      <div key={device} className="flex justify-between items-center">
                  <span className="text-sm text-neutral-700 capitalize">
                    {device}
                  </span>
                        <span className="text-sm font-medium text-neutral-800">
                    {count as number}
                  </span>
                      </div>
                  ))}
              {Object.keys(analytics?.deviceBreakdown || {}).length === 0 && (
                  <p className="text-sm text-neutral-500">No data yet</p>
              )}
            </div>
          </div>

          {/* Browsers */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconEye className="text-neutral-600" size={20} />
              <h3 className="font-semibold text-neutral-800">Top Browsers</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(analytics?.browserBreakdown || {})
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .slice(0, 5)
                  .map(([browser, count]) => (
                      <div
                          key={browser}
                          className="flex justify-between items-center"
                      >
                        <span className="text-sm text-neutral-700">{browser}</span>
                        <span className="text-sm font-medium text-neutral-800">
                    {count as number}
                  </span>
                      </div>
                  ))}
              {Object.keys(analytics?.browserBreakdown || {}).length === 0 && (
                  <p className="text-sm text-neutral-500">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Recent Scans</h3>
          {analytics?.recentScans && analytics.recentScans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Device
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Browser
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                  {analytics.recentScans
                      .slice(0, 10)
                      .map((scan: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                              {new Date(scan.scanned_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {scan.country || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 capitalize">
                              {scan.device_type || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                              {scan.browser || "Unknown"}
                            </td>
                          </tr>
                      ))}
                  </tbody>
                </table>
              </div>
          ) : (
              <div className="text-center py-8">
                <IconEye className="mx-auto mb-4 text-neutral-400" size={48} />
                <p className="text-neutral-600">No scan data available yet.</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Analytics will appear here once people start scanning your QR
                  codes.
                </p>
              </div>
          )}
        </div>

        {/* QR Codes List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-neutral-800 mb-4">Your QR Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrCodes.map((qr: any) => (
                <div
                    key={qr.id}
                    className="border border-neutral-200 rounded-lg p-4 hover:border-qrmory-purple-300 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconQrcode className="text-qrmory-purple-600" size={16} />
                    <h4 className="font-medium text-neutral-800 truncate">
                      {qr.title}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-500 mb-2">
                    Created {new Date(qr.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        qr.type === "dynamic"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                >
                  {qr.type}
                </span>
                    <Link
                        href={`/qr-codes/${qr.id}`}
                        className="text-xs text-qrmory-purple-600 hover:text-qrmory-purple-800 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>
  );
}
