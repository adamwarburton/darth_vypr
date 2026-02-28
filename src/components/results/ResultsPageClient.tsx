"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResultsHeader } from "./ResultsHeader";
import { QuestionResultCard } from "./QuestionResultCard";
import { AIAnalysisPanel } from "./AIAnalysisPanel";
import { AISummaryTab } from "./AISummaryTab";
import { AIGeneratingOverlay } from "./AIGeneratingOverlay";
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

  // AI Panel generation state
  const isAiPanel = project.distribution_method === "ai_panel";
  const [aiGenerationStage, setAiGenerationStage] = useState<
    "idle" | "generating" | "analyzing" | "done" | "error"
  >("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Internal analysis trigger that returns the analysis directly
  const triggerAnalysisInternal = useCallback(
    async (questionId?: string): Promise<AiAnalysis | null> => {
      const key = questionId || "project";
      setLoadingAnalysis((prev) => ({ ...prev, [key]: true }));

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            questionId: questionId || undefined,
            analysisType: questionId ? "question_summary" : "project_summary",
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
          return analysis;
        }
      } catch (err) {
        console.error("Analysis failed:", err);
      } finally {
        setLoadingAnalysis((prev) => ({ ...prev, [key]: false }));
      }
      return null;
    },
    [project.id]
  );

  // AI panel generation flow
  const runAiPanelGeneration = useCallback(async () => {
    setAiGenerationStage("generating");
    setGenerationError(null);

    try {
      // Step 1: Generate responses via Haiku
      const genRes = await fetch("/api/ai/generate-responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      if (!genRes.ok) {
        const err = await genRes.json();
        throw new Error(err.error || "Failed to generate responses");
      }

      const genData = await genRes.json();

      // If already generated (idempotent), just reload
      if (genData.alreadyGenerated) {
        window.location.reload();
        return;
      }

      // Refetch data from Supabase after generation
      const [respResult, ansResult] = await Promise.all([
        supabase
          .from("responses")
          .select("*")
          .eq("project_id", project.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("answers")
          .select("*, responses!inner(project_id)")
          .eq("responses.project_id", project.id),
      ]);

      const newResponses = (respResult.data as unknown as Response[]) || [];
      const newAnswers = (ansResult.data as unknown as Answer[]) || [];

      setResponses(newResponses);
      setAnswers(newAnswers);

      // Step 2: Run AI analyses in parallel
      setAiGenerationStage("analyzing");

      const analysisPromises = [
        triggerAnalysisInternal(),
        ...questions.map((q) => triggerAnalysisInternal(q.id)),
      ];

      await Promise.allSettled(analysisPromises);

      setAiGenerationStage("done");
    } catch (err) {
      console.error("AI panel generation failed:", err);
      setGenerationError(
        err instanceof Error ? err.message : "Generation failed"
      );
      setAiGenerationStage("error");
    }
  }, [project.id, questions, triggerAnalysisInternal]);

  // Detect AI panel project needing generation
  useEffect(() => {
    if (
      isAiPanel &&
      initialResponses.length === 0 &&
      aiGenerationStage === "idle"
    ) {
      runAiPanelGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time subscriptions for live projects
  useEffect(() => {
    if (project.status !== "live") return;
    if (aiGenerationStage === "generating" || aiGenerationStage === "analyzing")
      return;

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
          setAnswers((prev) => [...prev, newAnswer]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, project.status, aiGenerationStage]);

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

  // Re-run all analyses
  const rerunAllAnalyses = useCallback(async () => {
    const promises = [
      triggerAnalysisInternal(),
      ...questions.map((q) => triggerAnalysisInternal(q.id)),
    ];
    await Promise.allSettled(promises);
  }, [questions, triggerAnalysisInternal]);

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

  // Show overlay while AI panel is generating
  if (
    aiGenerationStage === "generating" ||
    aiGenerationStage === "analyzing"
  ) {
    return (
      <AIGeneratingOverlay
        stage={aiGenerationStage === "generating" ? "generating" : "analyzing"}
      />
    );
  }

  // Show error state
  if (aiGenerationStage === "error") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <span className="text-2xl text-red-400">!</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Generation Failed
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {generationError ||
              "Something went wrong while generating AI panel responses."}
          </p>
          <button
            onClick={runAiPanelGeneration}
            className="mt-2 rounded-lg bg-vypr-teal px-4 py-2 text-sm font-semibold text-vypr-navy hover:bg-vypr-teal/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResultsHeader
        project={project}
        responses={responses}
        onRerunAnalysis={rerunAllAnalyses}
        onCloseProject={handleCloseProject}
        isAnalyzing={Object.values(loadingAnalysis).some(Boolean)}
      />

      {/* AI Panel disclaimer banner */}
      {isAiPanel && responses.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">
            i
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-indigo-400">
              AI-Generated Responses
            </span>
            {" — "}
            These results were generated by an AI model simulating 500 nationally
            representative UK respondents. They represent estimated consumer
            attitudes and should be validated with real panel data before making
            business decisions.
          </div>
        </div>
      )}

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
                  isAiPanel={isAiPanel}
                >
                  {renderVisualization(question)}

                  <AIAnalysisPanel
                    analysis={getQuestionAnalysis(question.id)}
                    isLoading={loadingAnalysis[question.id] || false}
                    staleCount={getStaleCount(question.id)}
                    onRefresh={() => triggerAnalysisInternal(question.id)}
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
            onRefresh={() => triggerAnalysisInternal()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
