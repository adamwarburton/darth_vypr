"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ListChecks,
  MessageSquareText,
  Star,
  Image as ImageIcon,
  Video,
  Mic,
  ArrowUpDown,
  Plus,
  Trash2,
  GripVertical,
  Settings2,
  ToggleLeft,
} from "lucide-react";
import type { SurveyQuestion } from "./question-list";

interface QuestionEditorProps {
  question: SurveyQuestion | null;
  onUpdate: (id: string, updates: Partial<SurveyQuestion>) => void;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  multiple_choice: {
    icon: ListChecks,
    label: "Multiple Choice",
    color: "text-vypr-teal",
  },
  free_text: {
    icon: MessageSquareText,
    label: "Free Text",
    color: "text-indigo-400",
  },
  rating_scale: { icon: Star, label: "Rating Scale", color: "text-amber-400" },
  image_stimulus: {
    icon: ImageIcon,
    label: "Image Stimulus",
    color: "text-pink-400",
  },
  video_stimulus: {
    icon: Video,
    label: "Video Stimulus",
    color: "text-purple-400",
  },
  video_response: {
    icon: Mic,
    label: "Video Response",
    color: "text-rose-400",
  },
  ranking: {
    icon: ArrowUpDown,
    label: "Ranking",
    color: "text-emerald-400",
  },
};

const demoOptions = ["Option A", "Option B", "Option C", "Option D"];

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  if (!question) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-white/[0.04]">
          <Settings2 className="size-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-foreground">
          No question selected
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Select a question from the left panel to edit its properties, or add a
          new question to get started.
        </p>
      </div>
    );
  }

  const config = typeConfig[question.type] || typeConfig.multiple_choice;
  const Icon = config.icon;

  return (
    <div className="flex h-full flex-col">
      {/* Editor header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-lg bg-white/[0.06] ${config.color}`}
          >
            <Icon className="size-4" />
          </div>
          <div>
            <Badge
              variant="outline"
              className="mb-0.5 border-white/10 text-[11px] text-muted-foreground"
            >
              {config.label}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Edit question properties below
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
            <ToggleLeft className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              Required
            </span>
            <button
              onClick={() =>
                onUpdate(question.id, { required: !question.required })
              }
              className={`relative h-5 w-9 rounded-full transition-colors ${
                question.required ? "bg-vypr-teal" : "bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform ${
                  question.required ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="space-y-6">
          {/* Question title */}
          <div>
            <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question Title
            </Label>
            <Input
              value={question.title}
              onChange={(e) =>
                onUpdate(question.id, { title: e.target.value })
              }
              placeholder="Enter your question..."
              className="border-white/[0.08] bg-white/[0.03] text-base font-medium placeholder:text-muted-foreground/50 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description (optional)
            </Label>
            <Textarea
              placeholder="Add context or instructions for respondents..."
              className="min-h-[80px] border-white/[0.08] bg-white/[0.03] placeholder:text-muted-foreground/50 focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
            />
          </div>

          {/* Type-specific config */}
          {(question.type === "multiple_choice" ||
            question.type === "ranking") && (
            <div>
              <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Options
              </Label>
              <div className="space-y-2">
                {demoOptions.map((opt, i) => (
                  <div key={i} className="group flex items-center gap-2">
                    <GripVertical className="size-3.5 cursor-grab text-muted-foreground/30" />
                    <div className="flex size-6 items-center justify-center rounded-md bg-vypr-teal/10 text-xs font-semibold text-vypr-teal">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <Input
                      defaultValue={opt}
                      className="flex-1 border-white/[0.06] bg-white/[0.02] text-sm focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 w-full gap-1.5 border border-dashed border-white/[0.06] text-xs text-muted-foreground hover:border-vypr-teal/20 hover:text-vypr-teal"
                >
                  <Plus className="size-3" />
                  Add option
                </Button>
              </div>
            </div>
          )}

          {question.type === "rating_scale" && (
            <div>
              <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Scale Configuration
              </Label>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">
                      Min value
                    </Label>
                    <Input
                      type="number"
                      defaultValue="1"
                      className="border-white/[0.06] bg-white/[0.02] focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">
                      Max value
                    </Label>
                    <Input
                      type="number"
                      defaultValue="10"
                      className="border-white/[0.06] bg-white/[0.02] focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">
                      Min label
                    </Label>
                    <Input
                      defaultValue="Not at all likely"
                      className="border-white/[0.06] bg-white/[0.02] focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs text-muted-foreground">
                      Max label
                    </Label>
                    <Input
                      defaultValue="Extremely likely"
                      className="border-white/[0.06] bg-white/[0.02] focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                    />
                  </div>
                </div>
                {/* Preview */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Preview
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    {Array.from({ length: 10 }, (_, i) => (
                      <button
                        key={i}
                        className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-xs font-medium text-muted-foreground transition-colors hover:border-vypr-teal/40 hover:bg-vypr-teal/10 hover:text-vypr-teal"
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Not at all likely
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Extremely likely
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {question.type === "free_text" && (
            <div>
              <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Response Preview
              </Label>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <Textarea
                  disabled
                  placeholder="Respondent will type their answer here..."
                  className="min-h-[100px] border-white/[0.06] bg-white/[0.02] text-muted-foreground"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Open-ended responses will be analysed by AI for themes and
                  sentiment.
                </p>
              </div>
            </div>
          )}

          {(question.type === "image_stimulus" ||
            question.type === "video_stimulus") && (
            <div>
              <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Media Upload
              </Label>
              <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
                {question.type === "image_stimulus" ? (
                  <ImageIcon className="mb-3 size-8 text-muted-foreground/40" />
                ) : (
                  <Video className="mb-3 size-8 text-muted-foreground/40" />
                )}
                <p className="text-sm font-medium text-foreground">
                  Drop your{" "}
                  {question.type === "image_stimulus" ? "image" : "video"} here
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  or click to browse files
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 border-white/10 text-xs"
                >
                  Choose file
                </Button>
              </div>
            </div>
          )}

          {/* Settings section */}
          <div>
            <Label className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Settings
            </Label>
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              {question.type === "multiple_choice" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Randomise options
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Shuffle option order for each respondent
                    </p>
                  </div>
                  <button className="relative h-5 w-9 rounded-full bg-white/10 transition-colors">
                    <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white" />
                  </button>
                </div>
              )}
              {question.type === "multiple_choice" && (
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Max selections
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Limit how many options can be selected
                    </p>
                  </div>
                  <Input
                    type="number"
                    defaultValue="1"
                    className="w-16 border-white/[0.06] bg-white/[0.02] text-center text-sm focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
                  />
                </div>
              )}
              <div
                className={`flex items-center justify-between ${question.type === "multiple_choice" ? "border-t border-white/[0.06] pt-3" : ""}`}
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    AI analysis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Auto-generate insights when responses come in
                  </p>
                </div>
                <button className="relative h-5 w-9 rounded-full bg-vypr-teal transition-colors">
                  <span className="absolute top-0.5 left-0.5 size-4 translate-x-4 rounded-full bg-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
