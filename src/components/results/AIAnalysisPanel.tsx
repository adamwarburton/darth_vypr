"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import type { QuestionAnalysis } from "@/types";

interface AIAnalysisPanelProps {
  analysis: QuestionAnalysis | null;
  isLoading: boolean;
  staleCount?: number;
  onRefresh: () => void;
}

export function AIAnalysisPanel({
  analysis,
  isLoading,
  staleCount,
  onRefresh,
}: AIAnalysisPanelProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-700">
            Generating AI analysis...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-dashed border-blue-200 bg-blue-50/30">
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <Sparkles className="h-6 w-6 text-blue-400" />
          <p className="text-sm text-muted-foreground">
            AI analysis not yet generated
          </p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Generate Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sentimentColor =
    analysis.sentiment === "positive"
      ? "bg-emerald-100 text-emerald-800"
      : analysis.sentiment === "negative"
        ? "bg-red-100 text-red-800"
        : analysis.sentiment === "mixed"
          ? "bg-amber-100 text-amber-800"
          : "bg-gray-100 text-gray-700";

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-semibold text-blue-900">
              AI Analysis
            </CardTitle>
            {analysis.sentiment && (
              <Badge className={sentimentColor}>{analysis.sentiment}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        {staleCount && staleCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5 mt-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            {staleCount} new responses since this analysis was generated
            <Button
              variant="link"
              size="sm"
              onClick={onRefresh}
              className="text-amber-800 h-auto p-0 ml-1"
            >
              Refresh
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-sm text-foreground">
            {analysis.headline}
          </p>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {analysis.summary}
        </div>

        {analysis.keyMetrics && analysis.keyMetrics.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {analysis.keyMetrics.map((metric, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border p-3"
              >
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-semibold text-sm">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {metric.interpretation}
                </p>
              </div>
            ))}
          </div>
        )}

        {analysis.themes && analysis.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {analysis.themes.map((theme, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {theme}
              </Badge>
            ))}
          </div>
        )}

        <div className="border-t pt-3">
          <p className="text-sm font-medium text-foreground">Recommendation</p>
          <p className="text-sm text-muted-foreground mt-1">
            {analysis.recommendation}
          </p>
        </div>

        <p className="text-xs text-muted-foreground italic">
          {analysis.confidenceNote}
        </p>
      </CardContent>
    </Card>
  );
}
