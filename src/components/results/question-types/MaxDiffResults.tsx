"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { CHART_THEME } from "@/lib/constants";
import type { MaxDiffAggregation } from "@/types";

interface MaxDiffResultsProps {
  data: MaxDiffAggregation;
}

export function MaxDiffResults({ data }: MaxDiffResultsProps) {
  const chartData = data.items.map((item) => ({
    name: item.label,
    utility: Math.round(item.utility * 100) / 100,
    preferenceShare: Math.round(item.preferenceShare * 10) / 10,
    bestCount: item.bestCount,
    worstCount: item.worstCount,
    shownCount: item.shownCount,
  }));

  return (
    <div className="space-y-5">
      {/* Utility score chart — diverging from zero */}
      <ResponsiveContainer
        width="100%"
        height={Math.max(300, data.items.length * 38)}
      >
        <BarChart data={chartData} layout="vertical" barSize={24}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[-1, 1]}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={180}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
                  <p className="font-semibold">{d.name}</p>
                  <p>
                    Utility: {d.utility > 0 ? "+" : ""}
                    {d.utility}
                  </p>
                  <p>Preference share: {d.preferenceShare}%</p>
                  <p>
                    Best: {d.bestCount} · Worst: {d.worstCount} · Shown:{" "}
                    {d.shownCount}
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
          <Bar dataKey="utility" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.utility >= 0
                    ? CHART_THEME.colors.positive
                    : CHART_THEME.colors.negative
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Table with raw counts */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Item</th>
              <th className="text-right px-4 py-2 font-medium">Best</th>
              <th className="text-right px-4 py-2 font-medium">Worst</th>
              <th className="text-right px-4 py-2 font-medium">Shown</th>
              <th className="text-right px-4 py-2 font-medium">Utility</th>
              <th className="text-right px-4 py-2 font-medium">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.items.map((item, i) => (
              <tr key={item.id} className="hover:bg-muted/20">
                <td className="px-4 py-2 font-medium">
                  {i < 3 && (
                    <span className="text-xs text-emerald-600 mr-1">
                      #{i + 1}
                    </span>
                  )}
                  {item.label}
                </td>
                <td className="text-right px-4 py-2 text-emerald-600">
                  {item.bestCount}
                </td>
                <td className="text-right px-4 py-2 text-red-600">
                  {item.worstCount}
                </td>
                <td className="text-right px-4 py-2 text-muted-foreground">
                  {item.shownCount}
                </td>
                <td className="text-right px-4 py-2 font-mono">
                  {item.utility > 0 ? "+" : ""}
                  {item.utility.toFixed(2)}
                </td>
                <td className="text-right px-4 py-2">
                  {item.preferenceShare.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {data.totalSets} total sets evaluated across {data.totalResponses}{" "}
        respondents. Utility = (Best − Worst) / Shown.
      </p>
    </div>
  );
}
