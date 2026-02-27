"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Check, GripVertical } from "lucide-react";

interface QuestionDisplayProps {
  type: string;
  title: string;
  description?: string;
  required?: boolean;
}

const mcOptions = [
  "Salted Caramel",
  "Dark Chocolate & Sea Salt",
  "Peanut Butter Crunch",
  "Mango & Coconut",
  "Berry Blast",
  "Matcha Green Tea",
];

export function QuestionDisplay({
  type,
  title,
  description,
  required,
}: QuestionDisplayProps) {
  const [selectedMc, setSelectedMc] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number | null>(null);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold leading-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {required && (
          <p className="mt-2 text-xs font-medium text-vypr-teal">
            * Required
          </p>
        )}
      </div>

      {type === "multiple_choice" && (
        <div className="space-y-2.5">
          {mcOptions.map((opt) => {
            const isSelected = selectedMc === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedMc(opt)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                  isSelected
                    ? "border-vypr-teal bg-vypr-teal/[0.06] shadow-[0_0_16px_rgba(0,214,198,0.08)]"
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? "border-vypr-teal bg-vypr-teal"
                      : "border-white/20"
                  )}
                >
                  {isSelected && <Check className="size-3.5 text-vypr-navy" />}
                </div>
                <span
                  className={cn(
                    "text-[15px] font-medium",
                    isSelected ? "text-foreground" : "text-foreground/80"
                  )}
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {type === "rating_scale" && (
        <div>
          <div className="flex items-center justify-center gap-1.5 md:gap-2">
            {Array.from({ length: 10 }, (_, i) => {
              const val = i + 1;
              const isSelected = ratingValue === val;
              return (
                <button
                  key={val}
                  onClick={() => setRatingValue(val)}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl border text-sm font-semibold transition-all md:size-12 md:text-base",
                    isSelected
                      ? "border-vypr-teal bg-vypr-teal text-vypr-navy shadow-[0_0_12px_rgba(0,214,198,0.2)]"
                      : "border-white/[0.08] bg-white/[0.02] text-foreground/70 hover:border-vypr-teal/30 hover:bg-vypr-teal/[0.06] hover:text-foreground"
                  )}
                >
                  {val}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 flex justify-between px-1">
            <span className="text-xs text-muted-foreground">
              Not at all likely
            </span>
            <span className="text-xs text-muted-foreground">
              Extremely likely
            </span>
          </div>
        </div>
      )}

      {type === "free_text" && (
        <Textarea
          placeholder="Type your answer here..."
          className="min-h-[140px] border-white/[0.08] bg-white/[0.03] text-base placeholder:text-muted-foreground/40 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
        />
      )}

      {type === "ranking" && (
        <div className="space-y-2">
          {[
            "Taste",
            "Price",
            "Nutritional value",
            "Brand reputation",
            "Packaging design",
            "Availability",
          ].map((item, i) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/[0.12]"
            >
              <GripVertical className="size-4 cursor-grab text-muted-foreground/40" />
              <span className="flex size-7 items-center justify-center rounded-lg bg-vypr-teal/10 text-xs font-bold text-vypr-teal">
                {i + 1}
              </span>
              <span className="text-[15px] font-medium text-foreground">
                {item}
              </span>
            </div>
          ))}
        </div>
      )}

      {type === "image_stimulus" && (
        <div>
          <div className="mb-4 flex aspect-video items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-center">
              <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-white/[0.04]">
                <svg
                  className="size-6 text-muted-foreground/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                Stimulus image would appear here
              </p>
            </div>
          </div>
          <Textarea
            placeholder="Share your first impressions..."
            className="min-h-[100px] border-white/[0.08] bg-white/[0.03] text-base placeholder:text-muted-foreground/40 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
          />
        </div>
      )}
    </div>
  );
}
