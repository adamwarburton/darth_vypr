"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QUESTION_TYPE_LABELS } from "@/lib/constants";
import {
  Columns,
  CircleDot,
  ListChecks,
  SlidersHorizontal,
  MessageSquareText,
  ArrowUpDown,
  Scale,
  PoundSterling,
  Zap,
  MousePointerClick,
  Bot,
} from "lucide-react";
import type { QuestionType } from "@/types";

const ICONS: Record<QuestionType, React.ElementType> = {
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
};

interface QuestionResultCardProps {
  questionNumber: number;
  questionType: QuestionType;
  questionTitle: string;
  responseCount: number;
  isAiPanel?: boolean;
  children: React.ReactNode;
}

export function QuestionResultCard({
  questionNumber,
  questionType,
  questionTitle,
  responseCount,
  isAiPanel,
  children,
}: QuestionResultCardProps) {
  const Icon = ICONS[questionType] || CircleDot;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  Q{questionNumber} · {QUESTION_TYPE_LABELS[questionType]}
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {questionTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAiPanel && (
              <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 gap-1 text-[10px]">
                <Bot className="h-3 w-3" />
                AI Generated
              </Badge>
            )}
            <Badge variant="secondary">{responseCount} responses</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">{children}</CardContent>
    </Card>
  );
}
