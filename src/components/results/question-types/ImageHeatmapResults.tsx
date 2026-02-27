"use client";

import { useEffect, useRef } from "react";
import { CHART_THEME } from "@/lib/constants";
import type { ImageHeatmapAggregation } from "@/types";

interface ImageHeatmapResultsProps {
  data: ImageHeatmapAggregation;
}

export function ImageHeatmapResults({ data }: ImageHeatmapResultsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.clicks.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw a placeholder image background (grey with grid)
    ctx.fillStyle = "#F1F5F9";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#E2E8F0";
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Label
    ctx.fillStyle = "#94A3B8";
    ctx.font = "14px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Product Packaging Image", width / 2, height / 2 - 10);
    ctx.fillText("(Heatmap overlay shown below)", width / 2, height / 2 + 14);

    // Draw heatmap using Gaussian-like radial gradients
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = width;
    heatCanvas.height = height;
    const heatCtx = heatCanvas.getContext("2d");
    if (!heatCtx) return;

    const radius = 35;

    data.clicks.forEach((click) => {
      // Convert percentage-based coordinates to pixel coordinates
      const px = (click.x / 100) * width;
      const py = (click.y / 100) * height;

      const gradient = heatCtx.createRadialGradient(
        px,
        py,
        0,
        px,
        py,
        radius
      );
      gradient.addColorStop(0, "rgba(255, 0, 0, 0.15)");
      gradient.addColorStop(0.5, "rgba(255, 165, 0, 0.08)");
      gradient.addColorStop(1, "rgba(0, 128, 0, 0)");

      heatCtx.fillStyle = gradient;
      heatCtx.fillRect(px - radius, py - radius, radius * 2, radius * 2);
    });

    // Apply blur for smooth heatmap
    ctx.filter = "blur(10px)";
    ctx.drawImage(heatCanvas, 0, 0);
    ctx.filter = "none";

    // Draw click dots on top
    data.clicks.forEach((click) => {
      const px = (click.x / 100) * width;
      const py = (click.y / 100) * height;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 38, 38, 0.4)";
      ctx.fill();
    });
  }, [data.clicks]);

  // Group comments by approximate area
  const clusters = groupClicksIntoClusters(data.clicks);

  return (
    <div className="space-y-5">
      {/* Heatmap canvas */}
      <div className="relative rounded-lg overflow-hidden border">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-full h-auto"
        />
      </div>

      {/* Cluster breakdown */}
      {clusters.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Click Clusters</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {clusters.map((cluster, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{cluster.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(cluster.percent)}% of clicks
                  </span>
                </div>
                {cluster.topComments.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    {cluster.topComments.slice(0, 2).map((c, j) => (
                      <p key={j} className="text-xs text-muted-foreground italic">
                        &ldquo;{c}&rdquo;
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-muted-foreground">Total clicks: </span>
          <span className="font-semibold">{data.totalClicks}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Avg per respondent: </span>
          <span className="font-semibold">
            {data.avgClicksPerRespondent.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Respondents: </span>
          <span className="font-semibold">{data.totalResponses}</span>
        </div>
      </div>

      {/* All comments */}
      {data.clicks.some((c) => c.comment) && (
        <div>
          <p className="text-sm font-medium mb-2">Click Comments</p>
          <div className="border rounded-lg max-h-[250px] overflow-y-auto divide-y">
            {data.clicks
              .filter((c) => c.comment)
              .slice(0, 30)
              .map((click, i) => (
                <div key={i} className="px-4 py-2 text-sm flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono w-20">
                    ({click.x}, {click.y})
                  </span>
                  <span>{click.comment}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function groupClicksIntoClusters(
  clicks: Array<{ x: number; y: number; comment?: string }>
) {
  if (clicks.length === 0) return [];

  // Simple k-means-like clustering into 3 groups based on position
  const zones = [
    { label: "Top-left area", minX: 0, maxX: 45, minY: 0, maxY: 40 },
    { label: "Center area", minX: 25, maxX: 75, minY: 25, maxY: 75 },
    { label: "Right area", minX: 50, maxX: 100, minY: 0, maxY: 50 },
  ];

  const total = clicks.length;

  return zones
    .map((zone) => {
      const zoneClicks = clicks.filter(
        (c) =>
          c.x >= zone.minX &&
          c.x <= zone.maxX &&
          c.y >= zone.minY &&
          c.y <= zone.maxY
      );
      const comments = zoneClicks
        .filter((c) => c.comment)
        .map((c) => c.comment!);
      // Deduplicate and count
      const commentCounts: Record<string, number> = {};
      comments.forEach((c) => (commentCounts[c] = (commentCounts[c] || 0) + 1));
      const topComments = Object.entries(commentCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([text]) => text);

      return {
        label: zone.label,
        count: zoneClicks.length,
        percent: total > 0 ? (zoneClicks.length / total) * 100 : 0,
        topComments,
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
}
