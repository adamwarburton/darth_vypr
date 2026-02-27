"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResizablePanel } from "@/components/survey-builder/resizable-panel";
import { QuestionList } from "@/components/survey-builder/question-list";
import { QuestionEditor } from "@/components/survey-builder/question-editor";
import { AiSurveyDesigner } from "@/components/survey-builder/ai-survey-designer";
import type { SurveyQuestion } from "@/components/survey-builder/question-list";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Sparkles,
  FileText,
} from "lucide-react";

const INITIAL_QUESTIONS: SurveyQuestion[] = [
  {
    id: "q1",
    type: "multiple_choice",
    title: "Which of these snack bar flavours would you be most likely to purchase?",
    required: true,
  },
  {
    id: "q2",
    type: "rating_scale",
    title: "How appealing is the concept of a high-protein snack bar with plant-based ingredients?",
    required: true,
  },
  {
    id: "q3",
    type: "image_stimulus",
    title: "Looking at the packaging design below, what are your first impressions?",
    required: true,
  },
  {
    id: "q4",
    type: "free_text",
    title: "What would make you choose this product over your current go-to snack?",
    required: false,
  },
  {
    id: "q5",
    type: "ranking",
    title: "Rank the following product attributes in order of importance to you.",
    required: true,
  },
];

export default function NewProjectPage() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(INITIAL_QUESTIONS);
  const [selectedId, setSelectedId] = useState<string | null>("q1");
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [projectTitle, setProjectTitle] = useState("Snack Bar Flavour Preferences UK 2025");

  const selectedQuestion = questions.find((q) => q.id === selectedId) || null;

  const handleAdd = useCallback(
    (type: string) => {
      const newQ: SurveyQuestion = {
        id: `q${Date.now()}`,
        type,
        title: "",
        required: false,
      };
      setQuestions((prev) => [...prev, newQ]);
      setSelectedId(newQ.id);
    },
    []
  );

  const handleDelete = useCallback(
    (id: string) => {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [selectedId]
  );

  const handleUpdate = useCallback(
    (id: string, updates: Partial<SurveyQuestion>) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
      );
    },
    []
  );

  const handleApplyAiSurvey = useCallback(
    (aiQuestions: SurveyQuestion[], title?: string) => {
      setQuestions(aiQuestions);
      if (title) {
        setProjectTitle(title);
      }
      if (aiQuestions.length > 0) {
        setSelectedId(aiQuestions[0].id);
      }
    },
    []
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Compact header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-vypr-navy/95 px-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <Image
              src="/logo.png"
              alt="Vypr"
              width={80}
              height={20}
              className="h-5 w-auto"
            />
          </Link>
          <div className="h-5 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="h-8 w-[320px] border-transparent bg-transparent text-sm font-semibold text-foreground hover:border-white/[0.08] focus-visible:border-vypr-teal/40 focus-visible:ring-vypr-teal/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3.5" />
            AI Assist
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-white/10 text-xs"
          >
            <Save className="size-3.5" />
            Save Draft
          </Button>
          <Button
            size="sm"
            className="gap-1.5 bg-vypr-teal text-vypr-navy font-semibold hover:bg-vypr-teal/90 text-xs shadow-[0_0_12px_rgba(0,214,198,0.2)]"
          >
            <Send className="size-3.5" />
            Publish
          </Button>
        </div>
      </header>

      {/* Main builder area — resizable split panel */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanel
          defaultLeftPercent={40}
          minLeftPercent={25}
          maxLeftPercent={60}
          left={
            <div className="flex h-full flex-col border-r border-white/[0.04] bg-[#0E1229]">
              <div className="shrink-0 border-b border-white/[0.04] p-3">
                <AiSurveyDesigner
                  onApplySurvey={handleApplyAiSurvey}
                  projectTitle={projectTitle}
                />
              </div>
              <div className="min-h-0 flex-1">
                <QuestionList
                  questions={questions}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  showTypeSelector={showTypeSelector}
                  onToggleTypeSelector={() =>
                    setShowTypeSelector((prev) => !prev)
                  }
                />
              </div>
            </div>
          }
          right={
            <div className="h-full bg-[#0B0F25]">
              <QuestionEditor
                question={selectedQuestion}
                onUpdate={handleUpdate}
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
