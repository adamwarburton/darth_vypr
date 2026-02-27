interface SurveyPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { projectId } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="w-full max-w-lg px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Survey</h1>
        <p className="text-muted-foreground">
          The public survey experience for project{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-sm">
            {projectId}
          </code>{" "}
          will be rendered here.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Respondents will see one question at a time with a progress bar.
        </p>
      </main>
    </div>
  );
}
