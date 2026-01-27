// src/components/analytics/scan-chart.tsx
"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TimeSeriesData {
  date: string;
  scans: number;
}

interface ScanChartProps {
  data: TimeSeriesData[];
  height?: number;
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const date = new Date(label);
    const formattedDate = date.toLocaleDateString("en-AU", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return (
      <div className="bg-white border border-neutral-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-neutral-900">{formattedDate}</p>
        <p className="text-sm text-qrmory-purple-600">
          {payload[0].value} scan{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
}

export function ScanChart({ data, height = 300 }: ScanChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-neutral-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-neutral-500">No scan data available</p>
      </div>
    );
  }

  // Format date labels for X axis
  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
    });
  };

  // Calculate Y axis domain
  const maxScans = Math.max(...data.map((d) => d.scans));
  const yAxisMax = Math.max(5, Math.ceil(maxScans * 1.2)); // At least 5, or 20% more than max

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6B21A8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6B21A8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={false}
          axisLine={{ stroke: "#E5E5E5" }}
          interval="preserveStartEnd"
          minTickGap={50}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#737373" }}
          tickLine={false}
          axisLine={false}
          domain={[0, yAxisMax]}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="scans"
          stroke="#6B21A8"
          strokeWidth={2}
          fill="url(#scanGradient)"
          dot={false}
          activeDot={{
            r: 6,
            fill: "#6B21A8",
            stroke: "#fff",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default ScanChart;
