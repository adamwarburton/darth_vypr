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
import type { RankingAggregation } from "@/types";

interface RankingResultsProps {
  data: RankingAggregation;
}

export function RankingResults({ data }: RankingResultsProps) {
  const chartData = data.items.map((item, i) => ({
    name: item.label,
    avgRank: Math.round(item.avgRank * 10) / 10,
    firstPlacePercent: Math.round(item.firstPlacePercent),
    inverseRank:
      data.items.length + 1 - item.avgRank,
  }));

  const maxRank = data.items.length;
  const opacityStep = 0.8 / maxRank;

  return (
    <div className="space-y-5">
      {/* Bar chart — inverse of avg rank so top item has longest bar */}
      <ResponsiveContainer
        width="100%"
        height={Math.max(200, data.items.length * 50)}
      >
        <BarChart data={chartData} layout="vertical" barSize={28}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, maxRank]}
            hide
          />
          <YAxis
            dataKey="name"
            type="category"
            width={160}
            tick={{ fontSize: 13 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = data.items.find(
                (i) => i.label === payload[0]?.payload?.name
              );
              if (!item) return null;
              return (
                <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
                  <p className="font-semibold">{item.label}</p>
                  <p>Avg rank: {item.avgRank.toFixed(1)}</p>
                  <p>Ranked #1 by {Math.round(item.firstPlacePercent)}%</p>
                  <p>Std dev: {item.stdDev.toFixed(2)}</p>
                </div>
              );
            }}
          />
          <Bar dataKey="inverseRank" radius={[0, 6, 6, 0]}>
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={CHART_THEME.colors.primary}
                opacity={1 - index * opacityStep}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Rank labels */}
      <div className="space-y-1">
        {data.items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-muted/30"
          >
            <span className="font-medium">
              #{i + 1} {item.label}
            </span>
            <span className="text-muted-foreground">
              Avg rank: {item.avgRank.toFixed(1)} · Ranked #1 by{" "}
              {Math.round(item.firstPlacePercent)}%
            </span>
          </div>
        ))}
      </div>

      {/* Rank frequency heatmap */}
      <div>
        <p className="text-sm font-medium mb-2">Rank Distribution Heatmap</p>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr>
                <th className="text-left px-2 py-1 font-medium">Item</th>
                {Array.from({ length: maxRank }, (_, i) => (
                  <th key={i} className="text-center px-2 py-1 font-medium">
                    #{i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-2 py-1 font-medium truncate max-w-[120px]">
                    {item.label}
                  </td>
                  {Array.from({ length: maxRank }, (_, rank) => {
                    const count = item.rankFrequency[rank + 1] || 0;
                    const pct =
                      data.totalResponses > 0
                        ? count / data.totalResponses
                        : 0;
                    return (
                      <td key={rank} className="text-center px-2 py-1">
                        <div
                          className="w-full h-7 rounded flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: `rgba(30, 64, 175, ${pct})`,
                            color: pct > 0.4 ? "white" : "inherit",
                          }}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Consensus:{" "}
          <Badge
            variant="secondary"
            className={
              data.consensusLevel === "high"
                ? "bg-emerald-100 text-emerald-800"
                : data.consensusLevel === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
            }
          >
            {data.consensusLevel}
          </Badge>
        </span>
        <span>{data.totalResponses} respondents</span>
      </div>
    </div>
  );
}
