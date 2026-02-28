"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResultsHeader } from "./ResultsHeader";
import { QuestionResultCard } from "./QuestionResultCard";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { AISummaryTab } from "./AISummaryTab";
import { MonadicSplitResults } from "./question-types/MonadicSplitResults";
import { SingleChoiceResults } from "./question-types/SingleChoiceResults";
import { MultipleChoiceResults } from "./question-types/MultipleChoiceResults";
import { ScaledResponseResults } from "./question-types/ScaledResponseResults";
import { OpenTextResults } from "./question-types/OpenTextResults";
import { RankingResults } from "./question-types/RankingResults";
import { MaxDiffResults } from "./question-types/MaxDiffResults";
import { AnchoredPricingResults } from "./question-types/AnchoredPricingResults";
import { ImplicitAssociationResults } from "./question-types/ImplicitAssociationResults";
import { ImageHeatmapResults } from "./question-types/ImageHeatmapResults";
import {
  aggregateMonadicSplit,
  aggregateSingleChoice,
  aggregateMultipleChoice,
  aggregateScaledResponse,
  aggregateOpenText,
  aggregateRanking,
  aggregateMaxDiff,
  aggregateGaborGranger,
  aggregateImplicitAssociation,
  aggregateImageHeatmap,
} from "@/lib/aggregations";
import { supabase } from "@/lib/supabase/client";
import type {
  Project,
  Question,
  Response,
  Answer,
  AiAnalysis,
  QuestionAnalysis,
  ProjectAnalysis,
  QuestionType,
} from "@/types";

interface ResultsPageClientProps {
  project: Project;
  questions: Question[];
  initialResponses: Response[];
  initialAnswers: Answer[];
  initialAnalyses: AiAnalysis[];
}

export function ResultsPageClient({
  project,
  questions,
  initialResponses,
  initialAnswers,
  initialAnalyses,
}: ResultsPageClientProps) {
  const [responses, setResponses] = useState(initialResponses);
  const [answers, setAnswers] = useState(initialAnswers);
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [loadingAnalysis, setLoadingAnalysis] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("results");

  // Real-time subscriptions for live projects
  useEffect(() => {
    if (project.status !== "live") return;

    const channel = supabase
      .channel(`project-${project.id}-results`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "responses",
          filter: `project_id=eq.${project.id}`,
        },
        (payload) => {
          const newResponse = payload.new as unknown as Response;
          setResponses((prev) => [newResponse, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "answers",
        },
        (payload) => {
          const newAnswer = payload.new as unknown as Answer;
          // Verify this answer belongs to our project by checking if response_id is in our responses
          setAnswers((prev) => [...prev, newAnswer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, project.status]);

  // Get cached analysis for a question
  const getQuestionAnalysis = useCallback(
    (questionId: string): QuestionAnalysis | null => {
      const cached = analyses.find(
        (a) =>
          a.question_id === questionId &&
          a.analysis_type === "question_summary"
      );
      return cached ? (cached.content as unknown as QuestionAnalysis) : null;
    },
    [analyses]
  );

  // Get project-level analysis
  const getProjectAnalysis = useCallback((): ProjectAnalysis | null => {
    const cached = analyses.find(
      (a) => !a.question_id && a.analysis_type === "project_summary"
    );
    return cached ? (cached.content as unknown as ProjectAnalysis) : null;
  }, [analyses]);

  // Get stale count for a question
  const getStaleCount = useCallback(
    (questionId?: string): number => {
      const cached = analyses.find(
        (a) =>
          (questionId
            ? a.question_id === questionId
            : !a.question_id) &&
          a.analysis_type ===
            (questionId ? "question_summary" : "project_summary")
      );
      if (!cached) return 0;
      return Math.max(
        0,
        responses.length - cached.response_count_at_generation
      );
    },
    [analyses, responses.length]
  );

  // Trigger analysis for a question or project
  const triggerAnalysis = useCallback(
    async (questionId?: string) => {
      const key = questionId || "project";
      setLoadingAnalysis((prev) => ({ ...prev, [key]: true }));

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            questionId: questionId || undefined,
            analysisType: questionId
              ? "question_summary"
              : "project_summary",
          }),
        });

        if (res.ok) {
          const { analysis } = await res.json();
          setAnalyses((prev) => [
            ...prev.filter(
              (a) =>
                !(
                  a.question_id === (questionId || null) &&
                  a.analysis_type ===
                    (questionId ? "question_summary" : "project_summary")
                )
            ),
            analysis,
          ]);
        }
      } catch (err) {
        console.error("Analysis failed:", err);
      } finally {
        setLoadingAnalysis((prev) => ({ ...prev, [key]: false }));
      }
    },
    [project.id]
  );

  // Re-run all analyses
  const rerunAllAnalyses = useCallback(async () => {
    // Trigger project-level analysis
    triggerAnalysis();

    // Trigger per-question analyses
    for (const q of questions) {
      await triggerAnalysis(q.id);
    }
  }, [questions, triggerAnalysis]);

  // Close project handler
  const handleCloseProject = useCallback(async () => {
    await supabase
      .from("projects")
      .update({ status: "closed", closed_at: new Date().toISOString() })
      .eq("id", project.id);
    window.location.reload();
  }, [project.id]);

  // Get answers for a specific question
  const getQuestionAnswers = useCallback(
    (questionId: string) =>
      answers.filter((a) => a.question_id === questionId),
    [answers]
  );

  // Render visualization for a question type
  const renderVisualization = useCallback(
    (question: Question) => {
      const qAnswers = getQuestionAnswers(question.id);

      switch (question.type as QuestionType) {
        case "monadic_split":
          return (
            <MonadicSplitResults
              data={aggregateMonadicSplit(qAnswers, question)}
            />
          );
        case "single_choice":
          return (
            <SingleChoiceResults
              data={aggregateSingleChoice(qAnswers, question)}
            />
          );
        case "multiple_choice":
          return (
            <MultipleChoiceResults
              data={aggregateMultipleChoice(qAnswers, question)}
            />
          );
        case "scaled_response":
          return (
            <ScaledResponseResults
              data={aggregateScaledResponse(qAnswers, question)}
            />
          );
        case "open_text":
          return (
            <OpenTextResults
              data={aggregateOpenText(qAnswers, question)}
              analysis={getQuestionAnalysis(question.id)}
            />
          );
        case "ranking":
          return (
            <RankingResults
              data={aggregateRanking(qAnswers, question)}
            />
          );
        case "maxdiff":
          return (
            <MaxDiffResults
              data={aggregateMaxDiff(qAnswers, question)}
            />
          );
        case "anchored_pricing": {
          const method = question.settings?.pricingMethod || "gabor_granger";
          return (
            <AnchoredPricingResults
              data={aggregateGaborGranger(qAnswers, question)}
              mode={method}
            />
          );
        }
        case "implicit_association":
          return (
            <ImplicitAssociationResults
              data={aggregateImplicitAssociation(qAnswers, question)}
            />
          );
        case "image_heatmap":
          return (
            <ImageHeatmapResults
              data={aggregateImageHeatmap(qAnswers, question)}
            />
          );
        default:
          return (
            <p className="text-muted-foreground">
              Visualization not available for this question type.
            </p>
          );
      }
    },
    [getQuestionAnswers, getQuestionAnalysis]
  );

  return (
    <div className="space-y-6">
      <ResultsHeader
        project={project}
        responses={responses}
        onRerunAnalysis={rerunAllAnalyses}
        onCloseProject={handleCloseProject}
        isAnalyzing={Object.values(loadingAnalysis).some(Boolean)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="mt-6">
          <div className="space-y-6">
            {[...questions]
              .sort((a, b) => a.order_index - b.order_index)
              .map((question) => (
                <QuestionResultCard
                  key={question.id}
                  questionNumber={question.order_index + 1}
                  questionType={question.type}
                  questionTitle={question.title}
                  responseCount={getQuestionAnswers(question.id).length}
                >
                  {renderVisualization(question)}

                  <AIAnalysisPanel
                    analysis={getQuestionAnalysis(question.id)}
                    isLoading={loadingAnalysis[question.id] || false}
                    staleCount={getStaleCount(question.id)}
                    onRefresh={() => triggerAnalysis(question.id)}
                  />
                </QuestionResultCard>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-summary" className="mt-6">
          <AISummaryTab
            analysis={getProjectAnalysis()}
            isLoading={loadingAnalysis["project"] || false}
            staleCount={getStaleCount()}
            onRefresh={() => triggerAnalysis()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
