"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  GripVertical,
  ListChecks,
  MessageSquareText,
  Star,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowUpDown,
  Trash2,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SurveyQuestion {
  id: string;
  type: string;
  title: string;
  required: boolean;
}

interface QuestionListProps {
  questions: SurveyQuestion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (type: string) => void;
  onDelete: (id: string) => void;
  showTypeSelector: boolean;
  onToggleTypeSelector: () => void;
}

const typeIcons: Record<string, React.ElementType> = {
  multiple_choice: ListChecks,
  free_text: MessageSquareText,
  rating_scale: Star,
  image_stimulus: ImageIcon,
  video_stimulus: Video,
  video_response: Mic,
  ranking: ArrowUpDown,
};

const typeLabels: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  free_text: "Free Text",
  rating_scale: "Rating Scale",
  image_stimulus: "Image Stimulus",
  video_stimulus: "Video Stimulus",
  video_response: "Video Response",
  ranking: "Ranking",
};

const questionTypes = [
  {
    type: "multiple_choice",
    icon: ListChecks,
    label: "Multiple Choice",
    description: "Single or multi-select from a list of options",
  },
  {
    type: "free_text",
    icon: MessageSquareText,
    label: "Free Text",
    description: "Open-ended text response from respondent",
  },
  {
    type: "rating_scale",
    icon: Star,
    label: "Rating Scale",
    description: "Numeric scale with labelled endpoints",
  },
  {
    type: "image_stimulus",
    icon: ImageIcon,
    label: "Image Stimulus",
    description: "Show an image and ask for a reaction",
  },
  {
    type: "video_stimulus",
    icon: Video,
    label: "Video Stimulus",
    description: "Show a video and capture feedback",
  },
  {
    type: "video_response",
    icon: Mic,
    label: "Video Response",
    description: "Respondent records a video answer",
  },
  {
    type: "ranking",
    icon: ArrowUpDown,
    label: "Ranking",
    description: "Drag to rank items in order of preference",
  },
];

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  showTypeSelector,
  onToggleTypeSelector,
}: QuestionListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div>
          <h3 className="font-heading text-sm font-semibold text-foreground">
            Questions
          </h3>
          <p className="text-xs text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onToggleTypeSelector}
          className="gap-1.5 bg-vypr-teal text-vypr-navy font-semibold hover:bg-vypr-teal/90 text-xs"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>

      {/* Question type selector */}
      {showTypeSelector && (
        <div className="border-b border-white/[0.06] bg-[#1C2240] p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Choose question type
          </p>
          <div className="grid grid-cols-1 gap-2">
            {questionTypes.map((qt) => {
              const Icon = qt.icon;
              return (
                <button
                  key={qt.type}
                  onClick={() => {
                    onAdd(qt.type);
                    onToggleTypeSelector();
                  }}
                  className="group flex items-start gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] p-3 text-left transition-all hover:border-vypr-teal/30 hover:bg-vypr-teal/[0.04]"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-vypr-teal/10 text-vypr-teal transition-colors group-hover:bg-vypr-teal/20">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {qt.label}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {qt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Question list */}
      <ScrollArea className="flex-1">
        <div className="space-y-1.5 p-3">
          {questions.map((q, index) => {
            const Icon = typeIcons[q.type] || ListChecks;
            const isSelected = q.id === selectedId;
            return (
              <button
                key={q.id}
                onClick={() => onSelect(q.id)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
                  isSelected
                    ? "border-vypr-teal/30 bg-vypr-teal/[0.06] shadow-[0_0_12px_rgba(0,214,198,0.05)]"
                    : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.02]"
                )}
              >
                <div className="flex items-center gap-2 pt-0.5">
                  <GripVertical className="size-3.5 cursor-grab text-muted-foreground/40" />
                  <span className="flex size-6 items-center justify-center rounded-md bg-white/[0.06] text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {typeLabels[q.type]}
                    </span>
                    {q.required && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-400"
                      >
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground">
                    {q.title || "Untitled question"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="rounded-md p-1 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground">
                    <Copy className="size-3" />
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(q.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onDelete(q.id);
                      }
                    }}
                    className="rounded-md p-1 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="size-3" />
                  </span>
                </div>
              </button>
            );
          })}

          {questions.length === 0 && !showTypeSelector && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-vypr-teal/10">
                <Plus className="size-5 text-vypr-teal" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No questions yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click &quot;Add&quot; to create your first question
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
