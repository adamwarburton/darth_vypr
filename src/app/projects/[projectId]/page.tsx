import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ResultsPageClient } from "@/components/results/ResultsPageClient";
import { createServerClient } from "@/lib/supabase/server";
import { getDemoData } from "@/lib/seed-demo-data";
import type { Project, Question, Response, Answer, AiAnalysis } from "@/types";
import { ArrowLeft } from "lucide-react";

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
    // Use demo data for the demo project ID or any unknown projectId
    project = demo.project;
    questions = demo.questions;
    responses = demo.responses;
    answers = demo.answers;
    analyses = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <Image
                src="/logo.png"
                alt="Darth Vypr"
                width={120}
                height={30}
                className="h-8 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/edit`}>
              <Button variant="outline" size="sm">
                Edit Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
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
