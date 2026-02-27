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
import { CHART_THEME } from "@/lib/constants";
import type { MultipleChoiceAggregation } from "@/types";

interface MultipleChoiceResultsProps {
  data: MultipleChoiceAggregation;
}

export function MultipleChoiceResults({ data }: MultipleChoiceResultsProps) {
  const chartData = data.options.map((o, i) => ({
    name: o.label,
    percent: Math.round(o.percent * 10) / 10,
    count: o.count,
    aboveCutLine: data.cutLineIndex !== null ? i <= data.cutLineIndex : true,
  }));

  const cutLineY =
    data.cutLineIndex !== null && data.cutLineIndex < data.options.length - 1
      ? (data.options[data.cutLineIndex].percent +
          data.options[data.cutLineIndex + 1].percent) /
        2
      : null;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={Math.max(250, data.options.length * 40)}>
        <BarChart data={chartData} layout="vertical" barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis
            dataKey="name"
            type="category"
            width={180}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Selected by"]}
          />
          <Bar dataKey="percent" radius={[0, 6, 6, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={
                  entry.aboveCutLine
                    ? CHART_THEME.colors.primary
                    : "#93C5FD"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
        <p>
          Respondents could select multiple options. Percentages reflect the
          proportion who selected each.
        </p>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">
            Avg. selections per respondent:{" "}
          </span>
          <span className="font-semibold">
            {data.avgSelectionsPerRespondent.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Top 3: </span>
          <span className="font-semibold">
            {data.options
              .slice(0, 3)
              .map((o) => o.label)
              .join(", ")}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Total respondents: </span>
          <span className="font-semibold">{data.totalResponses}</span>
        </div>
      </div>
    </div>
  );
}
