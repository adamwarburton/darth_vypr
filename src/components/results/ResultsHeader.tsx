"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "./StatCard";
import type { Project, Response } from "@/types";
import {
  Share2,
  RefreshCw,
  XCircle,
  Download,
} from "lucide-react";
import { useState } from "react";

interface ResultsHeaderProps {
  project: Project;
  responses: Response[];
  onRerunAnalysis: () => void;
  onCloseProject: () => void;
  isAnalyzing: boolean;
}

export function ResultsHeader({
  project,
  responses,
  onRerunAnalysis,
  onCloseProject,
  isAnalyzing,
}: ResultsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const totalResponses = responses.length;
  const completedResponses = responses.filter((r) => r.completed_at).length;
  const completionRate =
    totalResponses > 0
      ? Math.round((completedResponses / totalResponses) * 100)
      : 0;

  // Average completion time
  const completionTimes = responses
    .filter((r) => r.completed_at && r.started_at)
    .map(
      (r) =>
        (new Date(r.completed_at!).getTime() - new Date(r.started_at).getTime()) / 1000
    );
  const avgCompletionTime =
    completionTimes.length > 0
      ? Math.round(
          completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
        )
      : 0;

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  function handleShareSurvey() {
    const url = `${window.location.origin}/survey/${project.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isLive = project.status === "live";

  const statusColor =
    project.status === "live"
      ? "bg-emerald-100 text-emerald-800"
      : project.status === "closed"
        ? "bg-slate-100 text-slate-700"
        : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {project.title}
            </h1>
            <Badge className={statusColor}>
              {isLive && (
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
              {project.status === "live"
                ? "Live"
                : project.status === "closed"
                  ? "Closed"
                  : "Draft"}
            </Badge>
            {project.category && (
              <Badge variant="outline">{project.category}</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isLive && (
            <Button variant="outline" size="sm" onClick={handleShareSurvey}>
              <Share2 className="h-4 w-4 mr-1.5" />
              {copied ? "Copied!" : "Share Survey"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRerunAnalysis}
            disabled={isAnalyzing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1.5 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            {isAnalyzing ? "Analyzing..." : "Re-run AI Analysis"}
          </Button>
          {isLive && (
            <Button variant="outline" size="sm" onClick={onCloseProject}>
              <XCircle className="h-4 w-4 mr-1.5" />
              Close Project
            </Button>
          )}
          <Button variant="outline" size="sm" disabled title="Coming soon">
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <StatCard
          label="Total Responses"
          value={totalResponses}
          pulse={isLive}
        />
        <StatCard
          label="Completed"
          value={completedResponses}
          subtext={`${completionRate}% completion rate`}
        />
        <StatCard
          label="Avg. Completion Time"
          value={formatDuration(avgCompletionTime)}
        />
        <StatCard
          label="Response Rate"
          value={`${Math.round(totalResponses / Math.max(1, Math.ceil((Date.now() - new Date(project.published_at || project.created_at).getTime()) / 86400000)))} / day`}
          subtext={`Since ${new Date(project.published_at || project.created_at).toLocaleDateString()}`}
        />
      </div>
    </div>
  );
}
