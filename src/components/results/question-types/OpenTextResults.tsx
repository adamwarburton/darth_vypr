"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CHART_THEME } from "@/lib/constants";
import type { OpenTextAggregation, QuestionAnalysis } from "@/types";

interface OpenTextResultsProps {
  data: OpenTextAggregation;
  analysis: QuestionAnalysis | null;
}

export function OpenTextResults({ data, analysis }: OpenTextResultsProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Get sentiment data from AI analysis
  const sentimentBreakdown = analysis?.sentimentBreakdown;
  const themes = analysis?.themes || [];

  const sentimentData = sentimentBreakdown
    ? [
        {
          name: "Positive",
          value: sentimentBreakdown.positive,
          color: CHART_THEME.colors.positive,
        },
        {
          name: "Negative",
          value: sentimentBreakdown.negative,
          color: CHART_THEME.colors.negative,
        },
        {
          name: "Neutral",
          value: sentimentBreakdown.neutral,
          color: CHART_THEME.colors.neutral,
        },
      ]
    : null;

  // Get classified responses from AI or show raw
  const classifiedResponses = sentimentBreakdown?.responses || [];

  const filteredResponses = selectedTheme
    ? classifiedResponses.filter((r) =>
        r.themes?.includes(selectedTheme)
      )
    : classifiedResponses;

  const displayResponses =
    classifiedResponses.length > 0
      ? filteredResponses
      : data.responses.map((r) => ({
          text: r.text,
          sentiment: "neutral" as const,
          themes: [] as string[],
        }));

  // Pick key quotes (first 6 unique ones)
  const keyQuotes = classifiedResponses.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Sentiment donut */}
        {sentimentData && (
          <div className="flex-shrink-0">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {sentimentData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-3 justify-center mt-1">
              {sentimentData.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name} {s.value}%
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats + Themes */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{data.totalResponses}</p>
              <p className="text-xs text-muted-foreground">Text responses</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold">{themes.length}</p>
              <p className="text-xs text-muted-foreground">Themes identified</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-2xl font-bold">
                {Math.round(data.avgLength)}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg. response length
              </p>
            </div>
          </div>

          {/* Theme tags */}
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTheme === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedTheme(null)}
              >
                All
              </Badge>
              {themes.map((theme) => (
                <Badge
                  key={theme}
                  variant={selectedTheme === theme ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setSelectedTheme(selectedTheme === theme ? null : theme)
                  }
                >
                  {theme}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Key quotes carousel */}
      {keyQuotes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Key Quotes</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {keyQuotes.map((quote, i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-[280px] bg-muted/30"
              >
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm italic leading-relaxed line-clamp-3">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      className={
                        quote.sentiment === "positive"
                          ? "bg-emerald-100 text-emerald-800"
                          : quote.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {quote.sentiment}
                    </Badge>
                    {quote.themes?.slice(0, 2).map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All responses table */}
      <div>
        <p className="text-sm font-medium mb-2">
          All Responses{" "}
          {selectedTheme && (
            <span className="text-muted-foreground">
              — filtered by &ldquo;{selectedTheme}&rdquo;
            </span>
          )}
        </p>
        <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Response</th>
                <th className="text-left px-4 py-2 font-medium w-24">
                  Sentiment
                </th>
                <th className="text-left px-4 py-2 font-medium w-40">
                  Themes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayResponses.slice(0, 50).map((r, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-4 py-2.5">{r.text}</td>
                  <td className="px-4 py-2.5">
                    <Badge
                      className={
                        r.sentiment === "positive"
                          ? "bg-emerald-100 text-emerald-800"
                          : r.sentiment === "negative"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-700"
                      }
                    >
                      {r.sentiment}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 flex-wrap">
                      {r.themes?.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
