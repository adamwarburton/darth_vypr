import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ResultsPageClient } from "@/components/results/ResultsPageClient";
import { createServerClient } from "@/lib/supabase/server";
import { getDemoData } from "@/lib/seed-demo-data";
import type { Project, Question, Response, Answer, AiAnalysis } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit3,
  BarChart3,
} from "lucide-react";

interface ProjectResultsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectResultsPage({
  params,
}: ProjectResultsPageProps) {
  const { projectId } = await params;

  // Try to load from Supabase first; fall back to demo data
  let project: Project | null = null;
  let questions: Question[] = [];
  let responses: Response[] = [];
  let answers: Answer[] = [];
  let analyses: AiAnalysis[] = [];

  try {
    const supabase = createServerClient();

    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectData) {
      project = projectData as unknown as Project;

      const [questionsResult, responsesResult, answersResult, analysesResult] =
        await Promise.all([
          supabase
            .from("questions")
            .select("*")
            .eq("project_id", projectId)
            .order("order_index"),
          supabase
            .from("responses")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),
          supabase
            .from("answers")
            .select("*, responses!inner(project_id)")
            .eq("responses.project_id", projectId),
          supabase
            .from("ai_analyses")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false }),
        ]);

      questions = (questionsResult.data as unknown as Question[]) || [];
      responses = (responsesResult.data as unknown as Response[]) || [];
      answers = (answersResult.data as unknown as Answer[]) || [];
      analyses = (analysesResult.data as unknown as AiAnalysis[]) || [];
    }
  } catch {
    // Supabase not available — will use demo data
  }

  // Fall back to demo data if project not found in DB
  if (!project) {
    const demo = getDemoData();
    project = demo.project;
    questions = demo.questions;
    responses = demo.responses;
    answers = demo.answers;
    analyses = [];
  }

  const isLive = project.status === "live";
  const isAiPanel = project.distribution_method === "ai_panel";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-vypr-navy/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">
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
            <div className="flex items-center gap-2.5">
              <BarChart3 className="size-4 text-vypr-teal" />
              <h1 className="font-heading text-sm font-semibold text-foreground">
                {project.title}
              </h1>
              <Badge
                variant="outline"
                className={
                  isLive
                    ? "border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-400"
                    : project.status === "closed"
                      ? "border-slate-500/20 bg-slate-500/10 text-[11px] text-slate-400"
                      : "border-gray-500/20 bg-gray-500/10 text-[11px] text-gray-400"
                }
              >
                {isLive && (
                  <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-emerald-400" />
                )}
                {project.status === "live"
                  ? "Live"
                  : project.status === "closed"
                    ? "Closed"
                    : "Draft"}
              </Badge>
              {isAiPanel && (
                <Badge
                  variant="outline"
                  className="border-indigo-500/20 bg-indigo-500/10 text-[11px] text-indigo-400"
                >
                  AI Panel
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/edit`}>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-white/10 text-xs"
              >
                <Edit3 className="size-3.5" />
                Edit Survey
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <ResultsPageClient
          project={project}
          questions={questions}
          initialResponses={responses}
          initialAnswers={answers}
          initialAnalyses={analyses}
        />
      </main>
    </div>
  );
}
