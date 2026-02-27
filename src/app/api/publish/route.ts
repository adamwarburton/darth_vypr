import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { ApiError } from "@/types";

export async function POST(request: NextRequest) {
  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Check that the project exists and is in draft status
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (fetchError || !project) {
    return NextResponse.json(
      { error: "Project not found" } satisfies ApiError,
      { status: 404 }
    );
  }

  const projectRow = project as unknown as { status: string };
  if (projectRow.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft projects can be published" } satisfies ApiError,
      { status: 400 }
    );
  }

  // Check that the project has at least one question
  const { count } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (!count || count === 0) {
    return NextResponse.json(
      {
        error: "Project must have at least one question to publish",
      } satisfies ApiError,
      { status: 400 }
    );
  }

  // Publish the project
  const { data: updatedProject, error: updateError } = await supabase
    .from("projects")
    .update({
      status: "live",
      published_at: new Date().toISOString(),
    })
    .eq("id", projectId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message } satisfies ApiError,
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const surveyUrl = `${appUrl}/survey/${projectId}`;

  return NextResponse.json({
    project: updatedProject,
    surveyUrl,
  });
}
