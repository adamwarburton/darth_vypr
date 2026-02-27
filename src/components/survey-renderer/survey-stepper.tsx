"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { QuestionDisplay } from "./question-display";
import { ArrowLeft, ArrowRight, Check, Shield } from "lucide-react";

const DEMO_SURVEY = [
  {
    id: "q1",
    type: "multiple_choice",
    title:
      "Which of these snack bar flavours would you be most likely to purchase?",
    description:
      "Select the single flavour that appeals to you most. Think about what you'd genuinely pick up from the shelf.",
    required: true,
  },
  {
    id: "q2",
    type: "rating_scale",
    title:
      "How appealing is the concept of a high-protein snack bar with plant-based ingredients?",
    description: "Rate your overall appeal on a scale of 1 to 10.",
    required: true,
  },
  {
    id: "q3",
    type: "image_stimulus",
    title:
      "Looking at the packaging design below, what are your first impressions?",
    required: true,
  },
  {
    id: "q4",
    type: "free_text",
    title:
      "What would make you choose this product over your current go-to snack?",
    description:
      "Be as specific as you can — think about taste, price, ingredients, brand, or anything else.",
    required: false,
  },
  {
    id: "q5",
    type: "ranking",
    title:
      "Rank the following product attributes in order of importance to you.",
    description: "Drag to reorder. #1 is most important.",
    required: true,
  },
];

export function SurveyStepper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = DEMO_SURVEY.length;
  const current = DEMO_SURVEY[currentIndex];
  const progress = ((currentIndex + 1) / total) * 100;
  const isLast = currentIndex === total - 1;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-vypr-navy/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <Image
            src="/logo.png"
            alt="Vypr"
            width={80}
            height={20}
            className="h-5 w-auto opacity-70"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="size-3" />
            <span>Responses are anonymous</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-vypr-teal to-vypr-teal-dim transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Question counter */}
          <div className="mb-6 flex items-center gap-2">
            <span className="rounded-full bg-vypr-teal/10 px-2.5 py-1 text-xs font-semibold text-vypr-teal">
              {currentIndex + 1} of {total}
            </span>
          </div>

          <QuestionDisplay
            type={current.type}
            title={current.title}
            description={current.description}
            required={current.required}
          />
        </div>
      </div>

      {/* Navigation footer */}
      <div className="border-t border-white/[0.06] bg-vypr-navy/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            className="gap-1.5 text-muted-foreground disabled:opacity-30"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <div className="flex items-center gap-1.5">
            {DEMO_SURVEY.map((_, i) => (
              <div
                key={i}
                className={`size-1.5 rounded-full transition-all ${
                  i === currentIndex
                    ? "w-4 bg-vypr-teal"
                    : i < currentIndex
                      ? "bg-vypr-teal/40"
                      : "bg-white/10"
                }`}
              />
            ))}
          </div>

          <Button
            size="sm"
            onClick={() =>
              setCurrentIndex((i) => Math.min(total - 1, i + 1))
            }
            className="gap-1.5 bg-vypr-teal font-semibold text-vypr-navy hover:bg-vypr-teal/90 shadow-[0_0_12px_rgba(0,214,198,0.15)]"
          >
            {isLast ? (
              <>
                <Check className="size-4" />
                Submit
              </>
            ) : (
              <>
                Next
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
