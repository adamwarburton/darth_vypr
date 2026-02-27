import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProjectResultsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectResultsPage({
  params,
}: ProjectResultsPageProps) {
  const { projectId } = await params;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold">
            Vypr
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-xl font-semibold">
          Project Results & Analysis
        </h2>
        <p className="text-muted-foreground">
          Results and AI analysis for project{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            {projectId}
          </code>{" "}
          will be displayed here.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href={`/projects/${projectId}/edit`}>
            <Button variant="outline">Edit Project</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
