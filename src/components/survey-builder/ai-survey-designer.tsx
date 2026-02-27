"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  X,
  Wand2,
  ListChecks,
  MessageSquareText,
  Star,
  ArrowUpDown,
  Columns,
  CircleDot,
  SlidersHorizontal,
  Scale,
  PoundSterling,
  Zap,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SurveyQuestion } from "./question-list";
import type {
  AiDesignSurveyResponse,
  AiDesignedQuestion,
} from "@/app/api/ai/design-survey/route";

interface AiSurveyDesignerProps {
  onApplySurvey: (questions: SurveyQuestion[], title?: string) => void;
  projectTitle?: string;
  category?: string;
}

const typeIcons: Record<string, React.ElementType> = {
  monadic_split: Columns,
  single_choice: CircleDot,
  multiple_choice: ListChecks,
  scaled_response: SlidersHorizontal,
  open_text: MessageSquareText,
  ranking: ArrowUpDown,
  maxdiff: Scale,
  anchored_pricing: PoundSterling,
  implicit_association: Zap,
  image_heatmap: MousePointerClick,
  // Fallback mappings for builder types
  rating_scale: Star,
  free_text: MessageSquareText,
};

const typeLabels: Record<string, string> = {
  monadic_split: "Monadic Split Test",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  scaled_response: "Scaled Response",
  open_text: "Open Text",
  ranking: "Ranking",
  maxdiff: "MaxDiff",
  anchored_pricing: "Anchored Pricing",
  implicit_association: "Implicit Association",
  image_heatmap: "Image Heatmap",
};

function convertToSurveyQuestions(
  aiQuestions: AiDesignedQuestion[]
): SurveyQuestion[] {
  return aiQuestions.map((q, index) => ({
    id: `ai-${Date.now()}-${index}`,
    type: q.type,
    title: q.title,
    required: q.required,
  }));
}

export function AiSurveyDesigner({
  onApplySurvey,
  projectTitle,
  category,
}: AiSurveyDesignerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [objective, setObjective] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AiDesignSurveyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleGenerate = async () => {
    if (!objective.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/design-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective: objective.trim(),
          category,
          projectTitle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to design survey");
      }

      const data: AiDesignSurveyResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    const questions = convertToSurveyQuestions(result.questions);
    onApplySurvey(questions, result.suggestedTitle);
    setIsExpanded(false);
    setResult(null);
    setObjective("");
  };

  const handleDismiss = () => {
    setIsExpanded(false);
    setResult(null);
    setError(null);
    setObjective("");
    setIsLoading(false);
  };

  // Collapsed banner state
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="group flex w-full items-center gap-4 rounded-xl border border-vypr-teal/20 bg-gradient-to-r from-vypr-teal/[0.06] to-indigo-500/[0.04] p-4 text-left transition-all hover:border-vypr-teal/40 hover:from-vypr-teal/[0.1] hover:to-indigo-500/[0.06] hover:shadow-[0_0_20px_rgba(0,214,198,0.08)]"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-vypr-teal/15 transition-colors group-hover:bg-vypr-teal/25">
          <Wand2 className="size-5 text-vypr-teal" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            Let me do the heavy lifting&hellip;
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tell me what you&apos;re looking to learn and I&apos;ll design the
            perfect survey for you
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-vypr-teal/10 px-3 py-1.5 text-xs font-semibold text-vypr-teal transition-colors group-hover:bg-vypr-teal/20">
          <Sparkles className="size-3.5" />
          AI Design
        </div>
      </button>
    );
  }

  // Expanded state
  return (
    <div className="overflow-hidden rounded-xl border border-vypr-teal/30 bg-gradient-to-b from-vypr-teal/[0.06] to-transparent shadow-[0_0_24px_rgba(0,214,198,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-vypr-teal/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-vypr-teal/15">
            <Wand2 className="size-4 text-vypr-teal" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              AI Survey Designer
            </p>
            <p className="text-[11px] text-muted-foreground">
              Describe your research goal and I&apos;ll build the survey
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Input area */}
      {!result && (
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g. I want to understand which of 3 new protein bar flavours UK consumers prefer, what price they'd pay, and what packaging design grabs their attention..."
            className="min-h-[100px] resize-none border-white/[0.08] bg-white/[0.03] text-sm placeholder:text-muted-foreground/50 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleGenerate();
              }
            }}
          />

          {error && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">
              {isLoading ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" />
                  Designing your survey&hellip; this takes a few seconds
                </span>
              ) : (
                <span>
                  Press{" "}
                  <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 py-0.5 text-[10px] font-mono">
                    ⌘ Enter
                  </kbd>{" "}
                  to generate
                </span>
              )}
            </p>
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={!objective.trim() || isLoading}
              className="gap-1.5 bg-vypr-teal text-vypr-navy font-semibold hover:bg-vypr-teal/90 text-xs shadow-[0_0_12px_rgba(0,214,198,0.2)] disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {isLoading ? "Designing..." : "Design Survey"}
            </Button>
          </div>
        </div>
      )}

      {/* Results preview */}
      {result && (
        <div className="p-4">
          {/* Title suggestion */}
          {result.suggestedTitle && (
            <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested title
              </p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {result.suggestedTitle}
              </p>
            </div>
          )}

          {/* Questions preview */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {result.questions.length} questions designed
            </p>
            {result.questions.map((q, i) => {
              const Icon = typeIcons[q.type] || ListChecks;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3"
                >
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="flex size-6 items-center justify-center rounded-md bg-vypr-teal/10 text-xs font-semibold text-vypr-teal">
                      {i + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {typeLabels[q.type] || q.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium leading-snug text-foreground">
                      {q.title}
                    </p>
                    {q.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {q.description}
                      </p>
                    )}
                    {q.options && q.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {q.options.slice(0, 5).map((opt, j) => (
                          <span
                            key={j}
                            className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {opt.text}
                          </span>
                        ))}
                        {q.options.length > 5 && (
                          <span className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground">
                            +{q.options.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rationale */}
          {result.rationale && (
            <div className="mt-3 rounded-lg border-l-2 border-vypr-teal/30 bg-vypr-teal/[0.04] px-3 py-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-vypr-teal">
                  Design rationale:
                </span>{" "}
                {result.rationale}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              className="gap-1.5 bg-vypr-teal text-vypr-navy font-semibold hover:bg-vypr-teal/90 text-xs shadow-[0_0_12px_rgba(0,214,198,0.2)]"
            >
              <CheckCircle2 className="size-3.5" />
              Apply to Survey
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResult(null);
              }}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <ArrowRight className="size-3.5" />
              Try Different Approach
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
