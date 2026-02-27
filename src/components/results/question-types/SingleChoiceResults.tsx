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
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CHART_THEME } from "@/lib/constants";
import type { SingleChoiceAggregation } from "@/types";

interface SingleChoiceResultsProps {
  data: SingleChoiceAggregation;
}

export function SingleChoiceResults({ data }: SingleChoiceResultsProps) {
  const allOptions = [
    ...data.options,
    ...(data.noneCount > 0
      ? [
          {
            id: "none",
            label: "None of these",
            count: data.noneCount,
            percent: data.nonePercent,
          },
        ]
      : []),
  ];

  const chartData = allOptions.map((o, i) => ({
    name: o.label,
    count: o.count,
    percent: Math.round(o.percent * 10) / 10,
    isWinner: i === 0 && o.id !== "none",
    isNone: o.id === "none",
  }));

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={Math.max(200, allOptions.length * 48)}>
        <BarChart data={chartData} layout="vertical" barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
          />
          <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.isNone && entry.percent > 15
                    ? CHART_THEME.colors.warning
                    : entry.isWinner
                      ? CHART_THEME.colors.primary
                      : "#93C5FD"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 flex-wrap">
        {data.clearWinner && (
          <Badge className="bg-emerald-100 text-emerald-800">
            Clear preference ({data.options[0]?.label})
          </Badge>
        )}
        {data.closeContest && (
          <Badge className="bg-amber-100 text-amber-800">Close contest</Badge>
        )}
        {data.nonePercent > 10 && (
          <Badge className="bg-red-100 text-red-800">
            &quot;None of these&quot; at {Math.round(data.nonePercent)}% — needs attention
          </Badge>
        )}
        <span className="text-sm text-muted-foreground">
          {data.totalResponses} total respondents
        </span>
      </div>
    </div>
  );
}
