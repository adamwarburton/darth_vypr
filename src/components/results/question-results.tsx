"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  ListChecks,
  MessageSquareText,
  Star,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  Quote,
} from "lucide-react";

const CHART_COLORS = [
  "#00D6C6",
  "#6366F1",
  "#F59E0B",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
];

const barData = [
  { name: "Salted Caramel", value: 342, pct: 27 },
  { name: "Dark Choc & Sea Salt", value: 289, pct: 23 },
  { name: "Peanut Butter Crunch", value: 254, pct: 20 },
  { name: "Mango & Coconut", value: 198, pct: 16 },
  { name: "Berry Blast", value: 112, pct: 9 },
  { name: "Matcha Green Tea", value: 52, pct: 4 },
];

const ratingData = [
  { score: "1", count: 12 },
  { score: "2", count: 28 },
  { score: "3", count: 67 },
  { score: "4", count: 134 },
  { score: "5", count: 189 },
  { score: "6", count: 234 },
  { score: "7", count: 287 },
  { score: "8", count: 156 },
  { score: "9", count: 89 },
  { score: "10", count: 51 },
];

const radarData = [
  { attribute: "Taste", value: 92 },
  { attribute: "Price", value: 78 },
  { attribute: "Nutrition", value: 85 },
  { attribute: "Brand Trust", value: 71 },
  { attribute: "Packaging", value: 68 },
  { attribute: "Availability", value: 82 },
];

const trendData = Array.from({ length: 14 }, (_, i) => ({
  day: `Feb ${i + 14}`,
  responses: Math.floor(40 + Math.random() * 80 + i * 5),
}));

const themes = [
  {
    label: "Flavour quality",
    pct: 42,
    sentiment: "positive",
    color: "#00D6C6",
  },
  {
    label: "Value for money",
    pct: 28,
    sentiment: "mixed",
    color: "#F59E0B",
  },
  {
    label: "Ingredient transparency",
    pct: 18,
    sentiment: "positive",
    color: "#6366F1",
  },
  { label: "Portion size", pct: 12, sentiment: "negative", color: "#EC4899" },
];

const sentimentMap = {
  positive: "text-emerald-400",
  mixed: "text-amber-400",
  negative: "text-red-400",
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#1C2240] px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-vypr-teal">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export function QuestionResults() {
  return (
    <div className="space-y-8">
      {/* Q1: Multiple Choice - Horizontal Bar */}
      <div className="rounded-xl border border-white/[0.06] bg-[#141933] p-6">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-vypr-teal/10 text-vypr-teal">
              <ListChecks className="size-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Q1 &middot; Multiple Choice
              </span>
              <h3 className="mt-0.5 text-[15px] font-semibold text-foreground leading-snug">
                Which of these snack bar flavours would you be most likely to
                purchase?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                1,247 responses &middot; Single select
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20">
            <Sparkles className="size-3" />
            AI Analysis
          </button>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid
                horizontal={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                type="number"
                tick={{ fill: "#8B92A5", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#D1D5DB", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={160}
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                {barData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentage breakdown pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {barData.map((d, i) => (
            <div
              key={d.name}
              className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    CHART_COLORS[i % CHART_COLORS.length],
                }}
              />
              <span className="text-xs text-muted-foreground">{d.name}</span>
              <span className="text-xs font-semibold text-foreground">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Q2: Rating Scale - Distribution */}
      <div className="rounded-xl border border-white/[0.06] bg-[#141933] p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Star className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Q2 &middot; Rating Scale
            </span>
            <h3 className="mt-0.5 text-[15px] font-semibold text-foreground leading-snug">
              How appealing is the concept of a high-protein snack bar with
              plant-based ingredients?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              1,247 responses &middot; Scale 1-10
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-6">
          <div className="rounded-xl border border-vypr-teal/20 bg-vypr-teal/[0.05] px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Mean Score
            </p>
            <p className="font-heading text-3xl font-bold text-vypr-teal">
              6.8
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Median
            </p>
            <p className="font-heading text-3xl font-bold text-foreground">
              7
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">NPS</p>
            <p className="font-heading text-3xl font-bold text-emerald-400">
              +32
            </p>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ratingData}
              margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D6C6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00D6C6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="score"
                tick={{ fill: "#8B92A5", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B92A5", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00D6C6"
                strokeWidth={2}
                fill="url(#ratingGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Q4: Free text - AI Themes */}
      <div className="rounded-xl border border-white/[0.06] bg-[#141933] p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
            <MessageSquareText className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Q4 &middot; Free Text
            </span>
            <h3 className="mt-0.5 text-[15px] font-semibold text-foreground leading-snug">
              What would make you choose this product over your current go-to
              snack?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              1,089 responses &middot; AI analysed
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Theme breakdown */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key Themes
            </p>
            <div className="space-y-3">
              {themes.map((theme) => (
                <div key={theme.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {theme.label}
                      </span>
                      <span
                        className={`text-[11px] font-medium capitalize ${sentimentMap[theme.sentiment as keyof typeof sentimentMap]}`}
                      >
                        {theme.sentiment}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {theme.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${theme.pct}%`,
                        backgroundColor: theme.color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notable quotes */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notable Quotes
            </p>
            <div className="space-y-3">
              {[
                '"The salted caramel flavour was genuinely surprising — it tasted premium, not artificial."',
                '"I need to see better nutritional labelling. The protein content needs to be front and centre."',
                "\"If the price point was under £2, I'd switch from my current brand immediately.\"",
              ].map((quote, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                  <Quote className="mb-1 size-3.5 text-vypr-teal/40" />
                  <p className="text-[13px] italic leading-relaxed text-muted-foreground">
                    {quote}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Q5: Ranking - Radar Chart */}
      <div className="rounded-xl border border-white/[0.06] bg-[#141933] p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ArrowUpDown className="size-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Q5 &middot; Ranking
            </span>
            <h3 className="mt-0.5 text-[15px] font-semibold text-foreground leading-snug">
              Rank the following product attributes in order of importance
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              1,247 responses &middot; Weighted score
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="attribute"
                  tick={{ fill: "#D1D5DB", fontSize: 12 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#00D6C6"
                  fill="#00D6C6"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ranked Results
            </p>
            <div className="space-y-2">
              {radarData
                .sort((a, b) => b.value - a.value)
                .map((item, i) => (
                  <div
                    key={item.attribute}
                    className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2.5"
                  >
                    <span
                      className={`flex size-7 items-center justify-center rounded-lg text-xs font-bold ${
                        i === 0
                          ? "bg-vypr-teal/20 text-vypr-teal"
                          : "bg-white/[0.06] text-muted-foreground"
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {item.attribute}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-vypr-teal/60"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-muted-foreground">
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Response Trend */}
      <div className="rounded-xl border border-white/[0.06] bg-[#141933] p-6">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-vypr-teal/10 text-vypr-teal">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Collection Trend
              </span>
              <h3 className="mt-0.5 text-[15px] font-semibold text-foreground">
                Responses over time
              </h3>
            </div>
          </div>
        </div>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#8B92A5", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B92A5", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="responses"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#trendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
