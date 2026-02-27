"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { CHART_THEME } from "@/lib/constants";
import type { MonadicSplitAggregation } from "@/types";

interface MonadicSplitResultsProps {
  data: MonadicSplitAggregation;
}

export function MonadicSplitResults({ data }: MonadicSplitResultsProps) {
  if (data.responseFormat === "binary") {
    const chartData = data.variants.map((v) => ({
      name: v.label,
      "Yes %": Math.round(v.yesPercent ?? 0),
      "No %": Math.round(100 - (v.yesPercent ?? 0)),
      n: v.sampleSize,
      isWinner: v.key === data.winnerKey,
    }));

    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <YAxis
              dataKey="name"
              type="category"
              width={120}
              tick={{ fontSize: 13 }}
            />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="Yes %" stackId="a" fill={CHART_THEME.colors.positive} radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.isWinner ? CHART_THEME.colors.positive : "#34D399"}
                />
              ))}
            </Bar>
            <Bar dataKey="No %" stackId="a" fill="#E2E8F0" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <VariantBadges data={data} />
      </div>
    );
  }

  // Five-point scale view
  const chartData = data.variants.map((v) => ({
    name: v.label,
    "Top 2 Box": Math.round(v.top2Box ?? 0),
    n: v.sampleSize,
    isWinner: v.key === data.winnerKey,
  }));

  const scaleLabels = [
    "Definitely would not buy",
    "Probably would not buy",
    "Might or might not buy",
    "Probably would buy",
    "Definitely would buy",
  ];

  return (
    <div className="space-y-4">
      {/* Stacked horizontal bars showing distribution */}
      <div className="space-y-3">
        {data.variants.map((v) => {
          const dist = v.distribution || {};
          const total = v.sampleSize || 1;
          return (
            <div key={v.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{v.label}</span>
                  {v.key === data.winnerKey && (
                    <Badge className="bg-amber-100 text-amber-800 gap-1">
                      <Crown className="h-3 w-3" /> Leading
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">
                    {Math.round(v.top2Box ?? 0)}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Top 2 Box (n={v.sampleSize})
                  </span>
                </div>
              </div>
              <div className="flex h-8 rounded-lg overflow-hidden">
                {[1, 2, 3, 4, 5].map((point) => {
                  const count = dist[point] || 0;
                  const pct = (count / total) * 100;
                  if (pct < 1) return null;
                  return (
                    <div
                      key={point}
                      className="flex items-center justify-center text-xs font-medium text-white transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: CHART_THEME.colors.scale5[point - 1],
                        minWidth: pct > 3 ? undefined : 0,
                      }}
                      title={`${scaleLabels[point - 1]}: ${Math.round(pct)}%`}
                    >
                      {pct > 8 ? `${Math.round(pct)}%` : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale legend */}
      <div className="flex items-center gap-2 flex-wrap">
        {scaleLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: CHART_THEME.colors.scale5[i] }}
            />
            {label}
          </div>
        ))}
      </div>

      <VariantBadges data={data} />
    </div>
  );
}

function VariantBadges({ data }: { data: MonadicSplitAggregation }) {
  const winner = data.variants.find((v) => v.key === data.winnerKey);
  const others = data.variants.filter((v) => v.key !== data.winnerKey);

  if (!winner) return null;

  const metric = data.responseFormat === "binary" ? "yesPercent" : "top2Box";
  const winnerVal = Math.round((winner as Record<string, unknown>)[metric] as number ?? 0);
  const gaps = others.map((o) => {
    const otherVal = Math.round((o as Record<string, unknown>)[metric] as number ?? 0);
    return winnerVal - otherVal;
  });
  const maxGap = Math.max(...gaps);
  const minSample = Math.min(...data.variants.map((v) => v.sampleSize));
  const significant = maxGap > 5 && minSample > 50;

  return (
    <div className="bg-muted/50 rounded-lg p-3 text-sm">
      {significant ? (
        <p className="text-emerald-700">
          ✓ Statistically significant difference detected ({winner.label} leads
          by {maxGap} percentage points)
        </p>
      ) : (
        <p className="text-amber-700">
          ⚠ Difference not statistically significant — consider increasing
          sample size
        </p>
      )}
    </div>
  );
}
