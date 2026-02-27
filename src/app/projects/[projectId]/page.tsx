import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultsOverview } from "@/components/results/results-overview";
import { QuestionResults } from "@/components/results/question-results";
import { AnalysisDisplay } from "@/components/ai/analysis-display";
import { AiChatPanel } from "@/components/ai/ai-chat-panel";
import {
  ArrowLeft,
  Edit3,
  Download,
  Share2,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface ProjectResultsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectResultsPage({
  params,
}: ProjectResultsPageProps) {
  const { projectId } = await params;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
                Snack Bar Flavour Preferences UK 2025
              </h1>
              <Badge
                variant="outline"
                className="border-emerald-500/20 bg-emerald-500/10 text-[11px] text-emerald-400"
              >
                <span className="mr-1 inline-block size-1.5 animate-pulse rounded-full bg-emerald-400" />
                Live
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Download className="size-3.5" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <Share2 className="size-3.5" />
              Share
            </Button>
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
        {/* Stats overview */}
        <div className="mb-8">
          <ResultsOverview />
        </div>

        {/* AI Insights banner */}
        <div className="mb-8">
          <AnalysisDisplay />
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
          {/* Charts column */}
          <div>
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="size-4 text-vypr-teal" />
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Question Results
              </h2>
            </div>
            <QuestionResults />
          </div>

          {/* AI Chat column */}
          <div className="hidden xl:block">
            <div className="sticky top-20">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-4 text-indigo-400" />
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  AI Assistant
                </h2>
              </div>
              <div className="h-[600px]">
                <AiChatPanel />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
