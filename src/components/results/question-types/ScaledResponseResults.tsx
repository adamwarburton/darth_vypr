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
import type { ScaledResponseAggregation } from "@/types";

interface ScaledResponseResultsProps {
  data: ScaledResponseAggregation;
}

export function ScaledResponseResults({ data }: ScaledResponseResultsProps) {
  const colors =
    data.scaleMax === 7 ? CHART_THEME.colors.scale7 : CHART_THEME.colors.scale5;

  const chartData = data.distribution.map((d) => ({
    name: d.label,
    percent: Math.round(d.percent * 10) / 10,
    count: d.count,
    point: d.point,
  }));

  return (
    <div className="space-y-5">
      {/* Large mean score */}
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-4xl font-bold tracking-tight">
            {data.mean.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">
            / {data.scaleMax} mean score
          </p>
        </div>
        <div className="h-14 w-px bg-border" />
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-lg font-semibold text-emerald-600">
              {Math.round(data.top2Box)}%
            </p>
            <p className="text-xs text-muted-foreground">
              Top 2 Box ({data.scaleMax - 1}–{data.scaleMax})
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-600">
              {Math.round(data.bottom2Box)}%
            </p>
            <p className="text-xs text-muted-foreground">Bottom 2 Box (1–2)</p>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {data.netScore > 0 ? "+" : ""}
              {Math.round(data.netScore)}
            </p>
            <p className="text-xs text-muted-foreground">Net Score</p>
          </div>
        </div>
      </div>

      {/* Distribution chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} barSize={48}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={data.scaleMax === 7 ? -20 : 0}
            textAnchor={data.scaleMax === 7 ? "end" : "middle"}
            height={data.scaleMax === 7 ? 60 : 40}
          />
          <YAxis tickFormatter={(v) => `${v}%`} />
          <Tooltip
            formatter={(value) => [`${value}%`, "Responses"]}
          />
          <ReferenceLine
            x={chartData.find(
              (d) => d.point === Math.round(data.mean)
            )?.name}
            stroke={CHART_THEME.colors.primary}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Mean: ${data.mean.toFixed(1)}`,
              position: "top",
              fill: CHART_THEME.colors.primary,
              fontSize: 12,
            }}
          />
          <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground">
        Standard deviation: {data.stdDev.toFixed(2)} · {data.totalResponses}{" "}
        total responses
      </p>
    </div>
  );
}
