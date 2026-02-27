import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { createServerClient } from "@/lib/supabase/server";
import type { AiAnalyzeRequest, ApiError, Question, Project } from "@/types";
import type { Json } from "@/lib/supabase/types";

const SYSTEM_PROMPT = `You are a senior consumer insights analyst working within Vypr, an AI-native insights platform. Analyze survey response data like an experienced researcher:

- Go beyond describing data — interpret patterns, identify themes, and suggest actionable insights
- Highlight sentiment trends, notable segments, and divergent opinions
- For free-text responses, extract key themes and representative quotes
- For quantitative data, note distributions, outliers, and statistical patterns
- Provide clear, concise recommendations based on the data

Always return your analysis as valid JSON with the following structure:
{
  "summary": "Brief overall summary",
  "themes": ["Theme 1", "Theme 2"],
  "sentiment": { "positive": 0.0, "neutral": 0.0, "negative": 0.0 },
  "keyFindings": ["Finding 1", "Finding 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "quotes": ["Notable quote 1", "Notable quote 2"]
}`;

export async function POST(request: NextRequest) {
  const body: AiAnalyzeRequest = await request.json();
  const { projectId, questionId, analysisType } = body;

  if (!projectId || !analysisType) {
    return NextResponse.json(
      { error: "projectId and analysisType are required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Fetch project
  const { data: projectData } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  const project = projectData as unknown as Project | null;

  if (!project) {
    return NextResponse.json(
      { error: "Project not found" } satisfies ApiError,
      { status: 404 }
    );
  }

  // Fetch responses and answers
  const { data: responses } = await supabase
    .from("responses")
    .select("*, answers(*)")
    .eq("project_id", projectId);

  const responseCount = responses?.length ?? 0;

  // Build the prompt based on analysis type
  let prompt: string;
  if (questionId) {
    const { data: questionData } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    const question = questionData as unknown as Question | null;

    prompt = `Analyze responses for this question:\n\nQuestion: "${question?.title}" (Type: ${question?.type})\n\nResponses (${responseCount} total):\n${JSON.stringify(responses, null, 2)}\n\nProvide a ${analysisType} analysis.`;
  } else {
    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index");

    const questions = questionsData as unknown as Question[] | null;

    prompt = `Analyze all responses for the project "${project.title}".\n\nQuestions:\n${JSON.stringify(questions, null, 2)}\n\nAll responses (${responseCount} total):\n${JSON.stringify(responses, null, 2)}\n\nProvide a ${analysisType} analysis.`;
  }

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let analysisContent: Json;
    try {
      analysisContent = JSON.parse(rawContent);
    } catch {
      analysisContent = { summary: rawContent };
    }

    // Store the analysis
    const { data: analysis, error } = await supabase
      .from("ai_analyses")
      .insert({
        project_id: projectId,
        question_id: questionId ?? null,
        analysis_type: analysisType,
        content: analysisContent,
        response_count_at_generation: responseCount,
        model: AI_MODEL,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message } satisfies ApiError,
        { status: 500 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI analysis failed";
    return NextResponse.json(
      { error: message } satisfies ApiError,
      { status: 500 }
    );
  }
}
