import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import {
  seededRandom,
  buildPrompt,
  generateSingleChoiceAnswers,
  generateMultipleChoiceAnswers,
  generateScaledAnswers,
  generateOpenTextAnswers,
  generateMonadicSplitAnswers,
  generateRankingAnswers,
  generateMaxDiffAnswers,
  generateGaborGrangerAnswers,
  generateVanWestendorpAnswers,
  generateImplicitAssociationAnswers,
  generateImageHeatmapAnswers,
} from "@/lib/ai-panel-generator";
import type { Question, ChoiceOption, ApiError } from "@/types";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const RESPONDENT_COUNT = 500;

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  const { projectId } = await request.json();

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Fetch project
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !projectData) {
    return NextResponse.json(
      { error: "Project not found" } satisfies ApiError,
      { status: 404 }
    );
  }

  const project = projectData as unknown as {
    id: string;
    title: string;
    description: string | null;
    distribution_method: string;
  };

  if (project.distribution_method !== "ai_panel") {
    return NextResponse.json(
      { error: "Project is not configured for AI panel" } satisfies ApiError,
      { status: 400 }
    );
  }

  // Check idempotency — if responses already exist, skip generation
  const { count: existingCount } = await supabase
    .from("responses")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (existingCount && existingCount > 0) {
    return NextResponse.json({
      alreadyGenerated: true,
      responseCount: existingCount,
    });
  }

  // Fetch questions
  const { data: questionsData } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  const questions = (questionsData as unknown as Question[]) || [];

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "Project has no questions" } satisfies ApiError,
      { status: 400 }
    );
  }

  // Build prompt and call Haiku
  const prompt = buildPrompt(project.title, project.description, questions);

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || "",
  });

  let distributions: Record<string, any>;
  try {
    const aiResponse = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });

    const rawContent =
      aiResponse.content[0].type === "text" ? aiResponse.content[0].text : "{}";

    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
    distributions = JSON.parse(jsonStr);
  } catch (err) {
    console.error("Haiku call failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? `AI generation failed: ${err.message}`
            : "AI generation failed",
      } satisfies ApiError,
      { status: 500 }
    );
  }

  // Generate individual response records
  const rand = seededRandom(Date.now());
  const now = new Date();

  const responseRows = Array.from({ length: RESPONDENT_COUNT }, (_, i) => {
    const startOffset = i * 500 + Math.floor(rand() * 300);
    const startTime = new Date(now.getTime() - 3600000 + startOffset);
    const completionTime = new Date(
      startTime.getTime() + 120000 + Math.floor(rand() * 300000)
    );
    const completed = rand() > 0.05;
    return {
      project_id: projectId,
      respondent_id: `ai-panel-${i.toString().padStart(4, "0")}`,
      started_at: startTime.toISOString(),
      completed_at: completed ? completionTime.toISOString() : null,
    };
  });

  const insertedResponses: Array<{ id: string; completed_at: string | null }> =
    [];
  const BATCH_SIZE = 200;
  for (let i = 0; i < responseRows.length; i += BATCH_SIZE) {
    const batch = responseRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from("responses")
      .insert(batch)
      .select("id, completed_at");

    if (error) {
      console.error("Response insert error:", error);
      return NextResponse.json(
        {
          error: `Failed to insert responses: ${error.message}`,
        } satisfies ApiError,
        { status: 500 }
      );
    }
    insertedResponses.push(
      ...(
        (data as unknown as Array<{
          id: string;
          completed_at: string | null;
        }>) || []
      )
    );
  }

  const completedResponses = insertedResponses.filter((r) => r.completed_at);

  const allAnswerRows: Array<{
    response_id: string;
    question_id: string;
    value: any;
  }>[] = [];

  for (const question of questions) {
    const qDist = distributions[question.id];
    if (!qDist) continue;

    const count = completedResponses.length;
    let answers: any[] = [];

    switch (question.type) {
      case "single_choice":
        answers = generateSingleChoiceAnswers(
          qDist.distribution || {},
          count,
          rand
        );
        break;
      case "multiple_choice":
        answers = generateMultipleChoiceAnswers(
          qDist.selectionRates || {},
          count,
          rand
        );
        break;
      case "scaled_response":
        answers = generateScaledAnswers(
          qDist.distribution || {},
          count,
          rand
        );
        break;
      case "open_text":
        answers = generateOpenTextAnswers(qDist.responses || [], count, rand);
        break;
      case "monadic_split": {
        const options = (question.options as ChoiceOption[]) || [];
        const variantIds =
          options.length > 0
            ? options.map((o) => o.id)
            : ["a", "b", "c"].slice(0, question.settings?.variantCount || 2);
        answers = generateMonadicSplitAnswers(
          qDist.variants || {},
          variantIds,
          question.settings?.responseFormat || "five_point",
          count,
          rand
        );
        break;
      }
      case "ranking":
        answers = generateRankingAnswers(
          qDist.strengthScores || {},
          count,
          rand
        );
        break;
      case "maxdiff":
        answers = generateMaxDiffAnswers(
          qDist.utilityScores || {},
          question.settings?.itemsPerSet || 4,
          count,
          rand
        );
        break;
      case "anchored_pricing": {
        const method = question.settings?.pricingMethod || "gabor_granger";
        if (method === "gabor_granger") {
          answers = generateGaborGrangerAnswers(
            qDist.buyProbabilities || {},
            count,
            rand
          );
        } else {
          answers = generateVanWestendorpAnswers(
            qDist.medians || { tooCheap: 0.5, bargain: 1.0, expensive: 2.0, tooExpensive: 3.0 },
            qDist.stdDevs || { tooCheap: 0.2, bargain: 0.3, expensive: 0.4, tooExpensive: 0.5 },
            count,
            rand
          );
        }
        break;
      }
      case "implicit_association":
        answers = generateImplicitAssociationAnswers(
          qDist.attributes || {},
          count,
          rand
        );
        break;
      case "image_heatmap":
        answers = generateImageHeatmapAnswers(
          qDist.hotspots || [],
          question.settings?.maxClicks || 3,
          count,
          rand
        );
        break;
    }

    const answerRows = answers.map((value, idx) => ({
      response_id: completedResponses[idx].id,
      question_id: question.id,
      value,
    }));

    allAnswerRows.push(answerRows);
  }

  const flatAnswers = allAnswerRows.flat();
  for (let i = 0; i < flatAnswers.length; i += BATCH_SIZE) {
    const batch = flatAnswers.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("answers").insert(batch);
    if (error) {
      console.error("Answer insert error:", error);
    }
  }

  return NextResponse.json({
    success: true,
    responseCount: insertedResponses.length,
    answerCount: flatAnswers.length,
  });
}
