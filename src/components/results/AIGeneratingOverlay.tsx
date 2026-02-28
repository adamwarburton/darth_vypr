"use client";

import { Bot, Sparkles, BarChart3, Brain } from "lucide-react";

interface AIGeneratingOverlayProps {
  stage: "generating" | "analyzing";
}

export function AIGeneratingOverlay({ stage }: AIGeneratingOverlayProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Animated icon cluster */}
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-vypr-teal/10 [animation-duration:2s]" />
          <div className="absolute inset-0 -m-3 animate-pulse rounded-full bg-vypr-teal/5 [animation-duration:1.5s]" />

          {/* Main icon container */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-vypr-teal/20 bg-gradient-to-br from-vypr-teal/10 to-indigo-500/10 shadow-[0_0_40px_rgba(0,214,198,0.15)]">
            {stage === "generating" ? (
              <Bot className="h-10 w-10 text-vypr-teal animate-pulse" />
            ) : (
              <Brain className="h-10 w-10 text-indigo-400 animate-pulse" />
            )}
          </div>

          {/* Orbiting icons */}
          <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-vypr-navy border border-white/10 shadow-lg animate-bounce [animation-delay:0.2s] [animation-duration:2s]">
            <Sparkles className="h-4 w-4 text-vypr-teal" />
          </div>
          <div className="absolute -bottom-2 -left-2 flex h-8 w-8 items-center justify-center rounded-lg bg-vypr-navy border border-white/10 shadow-lg animate-bounce [animation-delay:0.8s] [animation-duration:2s]">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            {stage === "generating"
              ? "Generating AI Panel Responses"
              : "Running AI Analysis"}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            {stage === "generating"
              ? "Our AI is simulating 500 nationally representative UK respondents. Each response is carefully modelled to reflect realistic consumer attitudes, demographics, and purchasing behaviours."
              : "Analysing response patterns, identifying key themes, and generating actionable insights across all questions."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-gradient-to-r from-vypr-teal to-indigo-500 animate-[shimmer_2s_ease-in-out_infinite]"
              style={{
                width: stage === "generating" ? "60%" : "90%",
                transition: "width 1s ease-in-out",
              }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {stage === "generating"
              ? "This typically takes 15-30 seconds..."
              : "Almost there..."}
          </p>
        </div>

        {/* Feature highlights */}
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-vypr-teal" />
            500 respondents
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            UK nationally representative
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI-powered insights
          </div>
        </div>
      </div>
    </div>
  );
}
