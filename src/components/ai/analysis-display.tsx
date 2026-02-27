"use client";

import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
} from "lucide-react";

export function AnalysisDisplay() {
  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.04] to-purple-500/[0.04] p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Sparkles className="size-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">
            AI-Generated Insights
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Based on 1,247 responses &middot; Updated 2 hours ago
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <Target className="mt-0.5 size-4 shrink-0 text-vypr-teal" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-vypr-teal">
              Key Finding
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Salted Caramel has a clear lead (27%) but the gap with Dark
              Chocolate & Sea Salt (23%) is within the margin of error at 95%
              confidence. Consider further testing between these two.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <TrendingUp className="mt-0.5 size-4 shrink-0 text-emerald-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Opportunity
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Consumers strongly associate plant-based protein with premium
              positioning. Mean score of 6.8/10 on appeal suggests strong
              product-market fit with the health-conscious segment.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Risk
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Portion size emerged as a negative theme (12% of free-text
              mentions). Address this before launch to avoid early negative
              reviews undermining trial.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-purple-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Recommendation
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              Proceed with Salted Caramel and Dark Chocolate variants for
              launch. Run a follow-up study on portion size sensitivity with a
              conjoint design to optimise price-per-gram positioning.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
