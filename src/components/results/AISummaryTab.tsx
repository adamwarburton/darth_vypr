"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProjectAnalysis } from "@/types";

interface AISummaryTabProps {
  analysis: ProjectAnalysis | null;
  isLoading: boolean;
  staleCount?: number;
  onRefresh: () => void;
}

export function AISummaryTab({
  analysis,
  isLoading,
  staleCount,
  onRefresh,
}: AISummaryTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-3" />
        <span className="text-muted-foreground">
          Generating project-level AI analysis...
        </span>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Sparkles className="h-10 w-10 text-blue-400" />
        <p className="text-muted-foreground text-center">
          No project-level analysis has been generated yet.
          <br />
          Click below to generate a comprehensive AI analysis.
        </p>
        <Button onClick={onRefresh}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Project Analysis
        </Button>
      </div>
    );
  }

  const sentimentColor =
    analysis.sentimentOverview.overall === "positive"
      ? "bg-emerald-100 text-emerald-800"
      : analysis.sentimentOverview.overall === "negative"
        ? "bg-red-100 text-red-800"
        : analysis.sentimentOverview.overall === "mixed"
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-700";

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {staleCount && staleCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <span>
            {staleCount} new responses since this analysis was generated.
          </span>
          <Button variant="link" size="sm" onClick={onRefresh} className="text-amber-800">
            Refresh analysis
          </Button>
        </div>
      )}

      {/* Executive Summary */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <CardTitle>Executive Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed">{analysis.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Key Themes */}
      <Card>
        <CardHeader>
          <CardTitle>Key Themes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.keyThemes.map((theme, i) => (
            <div key={i} className="border-l-4 border-blue-400 pl-4">
              <p className="font-semibold text-sm">{theme.theme}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {theme.evidence}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sentiment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <CardTitle>Sentiment Overview</CardTitle>
            <Badge className={sentimentColor}>
              {analysis.sentimentOverview.overall}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            {analysis.sentimentOverview.summary}
          </p>
        </CardContent>
      </Card>

      {/* Notable Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Notable Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.notableInsights.map((insight, i) => (
            <div
              key={i}
              className="bg-muted/50 rounded-lg p-4"
            >
              <p className="font-semibold text-sm">{insight.insight}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {insight.significance}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {analysis.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border rounded-lg p-4"
            >
              <Badge className={priorityColors[rec.priority]}>
                {rec.priority}
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-medium">{rec.recommendation}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on: {rec.basedOn}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Methodology Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            {analysis.methodologyNote}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
