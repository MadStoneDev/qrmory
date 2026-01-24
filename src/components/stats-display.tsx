// components/stats-display.tsx
// Server component that fetches and displays real stats from the database

import { createClient } from "@/utils/supabase/server";

interface StatsDisplayProps {
  className?: string;
}

/**
 * Format a number into a compact display format
 * Examples: 7 → "5+", 23 → "20+", 156 → "100+", 1234 → "1k+", 56789 → "50k+"
 */
function formatStatNumber(count: number): string {
  if (count < 10) {
    // Round down to nearest 5
    const rounded = Math.floor(count / 5) * 5;
    return rounded > 0 ? `${rounded}+` : "0";
  } else if (count < 100) {
    // Round down to nearest 10
    const rounded = Math.floor(count / 10) * 10;
    return `${rounded}+`;
  } else if (count < 1000) {
    // Round down to nearest 100
    const rounded = Math.floor(count / 100) * 100;
    return `${rounded}+`;
  } else if (count < 10000) {
    // Round down to nearest 1000, show as Xk+
    const rounded = Math.floor(count / 1000);
    return `${rounded}k+`;
  } else if (count < 100000) {
    // Round down to nearest 10000, show as XXk+
    const rounded = Math.floor(count / 10000) * 10;
    return `${rounded}k+`;
  } else {
    // Round down to nearest 100000, show as XXXk+
    const rounded = Math.floor(count / 100000) * 100;
    return `${rounded}k+`;
  }
}

async function fetchStats(): Promise<{
  qrCodes: number;
  users: number;
  qrTypes: number;
}> {
  const supabase = await createClient();

  // Fetch counts in parallel
  const [qrCodesResult, usersResult] = await Promise.all([
    supabase.from("qr_codes").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    qrCodes: qrCodesResult.count || 0,
    users: usersResult.count || 0,
    qrTypes: 26, // Current number of QR types (hardcoded as this doesn't change often)
  };
}

export default async function StatsDisplay({ className = "" }: StatsDisplayProps) {
  const stats = await fetchStats();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${className}`}>
      <div className="text-center">
        <div className="text-3xl font-bold text-qrmory-purple-800">
          {formatStatNumber(stats.qrCodes)}
        </div>
        <div className="text-sm text-neutral-600 font-medium">
          QR Codes Generated
        </div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-qrmory-purple-800">
          {formatStatNumber(stats.users)}
        </div>
        <div className="text-sm text-neutral-600 font-medium">
          Active Users
        </div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-qrmory-purple-800">
          {stats.qrTypes}+
        </div>
        <div className="text-sm text-neutral-600 font-medium">
          QR Code Types
        </div>
      </div>
    </div>
  );
}

// Export the formatter for use elsewhere if needed
export { formatStatNumber };
