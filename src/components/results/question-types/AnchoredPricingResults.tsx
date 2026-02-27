"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { CHART_THEME } from "@/lib/constants";
import type {
  GaborGrangerAggregation,
  VanWestendorpAggregation,
} from "@/types";

interface AnchoredPricingResultsProps {
  data: GaborGrangerAggregation | VanWestendorpAggregation;
  mode: "gabor_granger" | "van_westendorp";
}

export function AnchoredPricingResults({
  data,
  mode,
}: AnchoredPricingResultsProps) {
  if (mode === "gabor_granger") {
    return <GaborGrangerView data={data as GaborGrangerAggregation} />;
  }
  return <VanWestendorpView data={data as VanWestendorpAggregation} />;
}

function GaborGrangerView({ data }: { data: GaborGrangerAggregation }) {
  const chartData = data.pricePoints.map((p) => ({
    price: `${data.currency}${p.price.toFixed(2)}`,
    priceNum: p.price,
    "Would Buy %": Math.round(p.wouldBuyPercent),
    "Revenue Index": Math.round(p.revenueIndex),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Optimal Price</p>
          <p className="text-3xl font-bold text-emerald-600">
            {data.currency}
            {data.optimalPrice.toFixed(2)}
          </p>
        </div>
        <div className="h-12 w-px bg-border" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Price Ceiling (&gt;50% buy)</p>
          <p className="text-2xl font-bold">
            {data.currency}
            {data.priceCeiling.toFixed(2)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="price" tick={{ fontSize: 12 }} />
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis yAxisId="right" orientation="right" domain={[0, 100]} hide />
          <Tooltip />
          <Legend />
          <ReferenceLine
            x={`${data.currency}${data.optimalPrice.toFixed(2)}`}
            yAxisId="left"
            stroke={CHART_THEME.colors.positive}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: "Optimal",
              position: "top",
              fill: CHART_THEME.colors.positive,
              fontSize: 11,
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="Would Buy %"
            stroke={CHART_THEME.colors.primary}
            strokeWidth={2}
            dot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="Revenue Index"
            stroke={CHART_THEME.colors.warning}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Price point table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Price</th>
              <th className="text-right px-4 py-2 font-medium">Would Buy</th>
              <th className="text-right px-4 py-2 font-medium">
                Revenue Index
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.pricePoints.map((p) => (
              <tr
                key={p.price}
                className={
                  p.price === data.optimalPrice
                    ? "bg-emerald-50"
                    : "hover:bg-muted/20"
                }
              >
                <td className="px-4 py-2 font-medium">
                  {data.currency}
                  {p.price.toFixed(2)}
                  {p.price === data.optimalPrice && (
                    <Badge className="ml-2 bg-emerald-100 text-emerald-800">
                      Optimal
                    </Badge>
                  )}
                </td>
                <td className="text-right px-4 py-2">
                  {Math.round(p.wouldBuyPercent)}%
                </td>
                <td className="text-right px-4 py-2">
                  {Math.round(p.revenueIndex)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        {data.totalResponses} respondents · Gabor-Granger iterative pricing
      </p>
    </div>
  );
}

function VanWestendorpView({ data }: { data: VanWestendorpAggregation }) {
  const chartData = data.priceRange.map((price, i) => ({
    price: price.toFixed(2),
    priceNum: price,
    "Too Cheap": Math.round(data.curves.tooCheap[i]?.cumPercent ?? 0),
    Bargain: Math.round(data.curves.bargain[i]?.cumPercent ?? 0),
    Expensive: Math.round(data.curves.expensive[i]?.cumPercent ?? 0),
    "Too Expensive": Math.round(data.curves.tooExpensive[i]?.cumPercent ?? 0),
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Optimal Price (OPP)</p>
          <p className="text-2xl font-bold text-emerald-600">
            {data.currency}
            {data.opp.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Indifference (IDP)
          </p>
          <p className="text-xl font-bold">
            {data.currency}
            {data.idp.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Acceptable Range
          </p>
          <p className="text-xl font-bold">
            {data.currency}
            {data.pmc.toFixed(2)} – {data.currency}
            {data.pme.toFixed(2)}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="price"
            tick={{ fontSize: 11 }}
            label={{
              value: `Price (${data.currency})`,
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="Too Cheap"
            stroke="#DC2626"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Bargain"
            stroke={CHART_THEME.colors.positive}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Expensive"
            stroke={CHART_THEME.colors.warning}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Too Expensive"
            stroke="#991B1B"
            strokeWidth={2}
            dot={false}
          />
          <ReferenceLine
            x={data.opp.toFixed(2)}
            stroke={CHART_THEME.colors.positive}
            strokeDasharray="5 5"
            label={{
              value: "OPP",
              position: "top",
              fill: CHART_THEME.colors.positive,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-muted-foreground">
        {data.totalResponses} respondents · Van Westendorp Price Sensitivity
        Meter
      </p>
    </div>
  );
}
