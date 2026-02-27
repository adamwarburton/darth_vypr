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
  ScatterChart,
  Scatter,
  ZAxis,
  Label,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CHART_THEME } from "@/lib/constants";
import type { ImplicitAssociationAggregation } from "@/types";

interface ImplicitAssociationResultsProps {
  data: ImplicitAssociationAggregation;
}

export function ImplicitAssociationResults({
  data,
}: ImplicitAssociationResultsProps) {
  // Diverging bar chart data
  const barData = data.attributes.map((attr) => ({
    name: attr.attribute,
    fits: Math.round(attr.fitsPercent),
    doesntFit: -Math.round(attr.doesntFitPercent),
    avgRT: Math.round(attr.avgReactionTimeMs),
    opacity: Math.max(0.3, 1 - (attr.avgReactionTimeMs - 300) / 700),
  }));

  // Scatter plot data — 4 quadrants
  const scatterData = data.attributes.map((attr) => ({
    x: attr.fitsPercent,
    y: attr.avgReactionTimeMs,
    name: attr.attribute,
    z: attr.totalResponses,
  }));

  return (
    <div className="space-y-6">
      {/* Diverging bar chart */}
      <ResponsiveContainer
        width="100%"
        height={Math.max(300, data.attributes.length * 36)}
      >
        <BarChart data={barData} layout="vertical" barSize={22}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[-100, 100]}
            tickFormatter={(v) => `${Math.abs(v)}%`}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={120}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-emerald-600">
                    Fits: {d.fits}%
                  </p>
                  <p className="text-red-600">
                    Doesn&apos;t fit: {Math.abs(d.doesntFit)}%
                  </p>
                  <p className="text-muted-foreground">
                    Avg reaction: {d.avgRT}ms
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
          <Bar dataKey="fits" radius={[0, 4, 4, 0]}>
            {barData.map((entry, i) => (
              <Cell
                key={i}
                fill={CHART_THEME.colors.positive}
                opacity={entry.opacity}
              />
            ))}
          </Bar>
          <Bar dataKey="doesntFit" radius={[4, 0, 0, 4]}>
            {barData.map((entry, i) => (
              <Cell
                key={i}
                fill={CHART_THEME.colors.negative}
                opacity={entry.opacity}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-600" /> Fits (left = more
          saturated = faster response)
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-600" /> Doesn&apos;t fit
        </div>
      </div>

      {/* Reaction time scatter plot */}
      <div>
        <p className="text-sm font-medium mb-3">
          Reaction Time vs Association Strength
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              type="number"
              dataKey="x"
              domain={[0, 100]}
              name="Fits %"
              tickFormatter={(v) => `${v}%`}
            >
              <Label value="% who said 'Fits'" offset={-5} position="insideBottom" />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={[200, 900]}
              name="Avg RT (ms)"
            >
              <Label
                value="Avg reaction time (ms)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ textAnchor: "middle" }}
              />
            </YAxis>
            <ZAxis dataKey="z" range={[60, 300]} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border rounded-lg shadow-md p-3 text-sm">
                    <p className="font-semibold">{d.name}</p>
                    <p>Fits: {Math.round(d.x)}%</p>
                    <p>Avg RT: {Math.round(d.y)}ms</p>
                  </div>
                );
              }}
            />
            {/* Quadrant lines */}
            <ReferenceLine x={50} stroke="#94A3B8" strokeDasharray="3 3" />
            <ReferenceLine y={600} stroke="#94A3B8" strokeDasharray="3 3" />
            <Scatter data={scatterData} fill={CHART_THEME.colors.primary}>
              {scatterData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.x > 50 && entry.y < 600
                      ? CHART_THEME.colors.positive
                      : entry.x > 50
                        ? CHART_THEME.colors.primaryLight
                        : entry.y < 600
                          ? CHART_THEME.colors.negative
                          : CHART_THEME.colors.neutral
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant labels */}
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
          <div className="text-right pr-4">
            <span className="font-medium text-red-600">Uncertain rejection</span>
            <br />Doesn&apos;t fit + slow
          </div>
          <div>
            <span className="font-medium text-blue-600">Conscious association</span>
            <br />Fits but slow (may not hold)
          </div>
          <div className="text-right pr-4">
            <span className="font-medium text-red-800">Genuine rejection</span>
            <br />Doesn&apos;t fit + fast
          </div>
          <div>
            <span className="font-medium text-emerald-600">Genuine association</span>
            <br />Fits + fast (strongest signal)
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Avg reaction time: </span>
          <span className="font-semibold">
            {Math.round(data.avgReactionTimeMs)}ms
          </span>
          <span className="text-xs text-muted-foreground ml-1">
            ({data.avgReactionTimeMs < 600 ? "System 1" : "System 2"} processing)
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Excluded (&lt;200ms): </span>
          <span className="font-semibold">{data.excludedTooFast}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Flagged slow (&gt;800ms): </span>
          <span className="font-semibold">{data.flaggedTooSlow}</span>
        </div>
      </div>
    </div>
  );
}
