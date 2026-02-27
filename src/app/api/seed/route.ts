import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  demoProject,
  demoQuestions,
  demoResponses,
  demoAnswers,
} from "@/lib/seed-demo-data";
import type { ApiError } from "@/types";
import type { Json } from "@/lib/supabase/types";

const BATCH_SIZE = 200;

export async function POST() {
  try {
    const supabase = createServerClient();

    // 1. Clean up existing demo data (cascade should handle children,
    //    but delete explicitly in reverse order for safety)
    const projectId = demoProject.id;

    // Delete answers for this project's responses
    const { data: existingResponses } = await supabase
      .from("responses")
      .select("id")
      .eq("project_id", projectId);

    if (existingResponses && existingResponses.length > 0) {
      const responseIds = existingResponses.map((r) => r.id);
      // Delete in batches to avoid URL length limits
      for (let i = 0; i < responseIds.length; i += 50) {
        const batch = responseIds.slice(i, i + 50);
        await supabase.from("answers").delete().in("response_id", batch);
      }
    }

    // Delete analyses, responses, questions, then project
    await supabase.from("ai_analyses").delete().eq("project_id", projectId);
    await supabase.from("responses").delete().eq("project_id", projectId);
    await supabase.from("questions").delete().eq("project_id", projectId);
    await supabase.from("projects").delete().eq("id", projectId);

    // 2. Insert demo project
    const { error: projectError } = await supabase.from("projects").insert({
      id: demoProject.id,
      title: demoProject.title,
      description: demoProject.description,
      category: demoProject.category ?? null,
      status: demoProject.status,
      published_at: demoProject.published_at,
      closed_at: demoProject.closed_at,
      created_at: demoProject.created_at,
      updated_at: demoProject.updated_at,
    });
    if (projectError) throw projectError;

    // 3. Insert questions
    const questionRows = demoQuestions.map((q) => ({
      id: q.id,
      project_id: q.project_id,
      type: q.type as string,
      title: q.title,
      description: q.description,
      options: q.options as unknown as Json,
      media_url: q.media_url,
      required: q.required,
      order_index: q.order_index,
      settings: q.settings as unknown as Json,
      created_at: q.created_at,
    }));
    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionRows);
    if (questionsError) throw questionsError;

    // 4. Insert responses in batches
    const responseRows = demoResponses.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      respondent_id: r.respondent_id,
      started_at: r.started_at,
      completed_at: r.completed_at,
      created_at: r.created_at,
    }));
    for (let i = 0; i < responseRows.length; i += BATCH_SIZE) {
      const batch = responseRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("responses").insert(batch);
      if (error) throw error;
    }

    // 5. Insert answers in batches
    const answerRows = demoAnswers.map((a) => ({
      id: a.id,
      response_id: a.response_id,
      question_id: a.question_id,
      value: a.value as unknown as Json,
      answered_at: a.answered_at,
    }));
    for (let i = 0; i < answerRows.length; i += BATCH_SIZE) {
      const batch = answerRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from("answers").insert(batch);
      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      seeded: {
        project: 1,
        questions: demoQuestions.length,
        responses: demoResponses.length,
        answers: demoAnswers.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Seed failed: ${message}` } satisfies ApiError,
      { status: 500 }
    );
  }
}
