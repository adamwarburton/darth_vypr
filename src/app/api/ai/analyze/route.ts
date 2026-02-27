import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { createServerClient } from "@/lib/supabase/server";
import type { AiAnalyzeRequest, ApiError, Question, Project } from "@/types";
import type { Json } from "@/lib/supabase/types";

const SYSTEM_PROMPT = `You are a senior consumer insights analyst specializing in FMCG (Fast-Moving Consumer Goods) research. You have 20 years of experience analyzing consumer data for brands like Unilever, Nestlé, and P&G. You understand behavioral science principles including System 1/System 2 thinking, anchoring effects, and cognitive biases.

Your analysis style is:
- Direct and actionable — lead with the headline finding, not methodology
- Commercially minded — always tie insights back to business decisions
- Specific — use the actual numbers, don't just say "most respondents"
- Candid — flag concerns and risks honestly, don't sugarcoat weak results
- Structured — use clear sections but write in flowing prose, not bullet point lists

When analyzing results, always consider:
- Sample size adequacy (flag if n < 30 for any segment)
- Distribution shape and what it reveals (polarization, consensus, skew)
- Practical significance, not just statistical patterns
- What the data means for the specific FMCG product decision being tested

Always return valid JSON matching the requested structure exactly. Do not wrap in markdown code blocks.`;

const QUESTION_ANALYSIS_FORMAT = `Return a JSON object with this exact structure:
{
  "headline": "One-sentence key finding",
  "summary": "2-3 paragraph detailed analysis in flowing prose",
  "keyMetrics": [
    { "label": "Metric name", "value": "The value", "interpretation": "What this means" }
  ],
  "sentiment": "positive" | "negative" | "mixed" | "neutral",
  "themes": ["Theme 1", "Theme 2"],
  "recommendation": "Clear actionable next step",
  "confidenceNote": "Sample size and reliability caveat"
}`;

const OPEN_TEXT_ANALYSIS_FORMAT = `Return a JSON object with this exact structure:
{
  "headline": "One-sentence key finding",
  "summary": "2-3 paragraph detailed analysis in flowing prose",
  "keyMetrics": [
    { "label": "Metric name", "value": "The value", "interpretation": "What this means" }
  ],
  "sentiment": "positive" | "negative" | "mixed" | "neutral",
  "themes": ["Theme 1", "Theme 2"],
  "sentimentBreakdown": {
    "positive": 45,
    "negative": 25,
    "neutral": 30,
    "responses": [
      { "text": "The actual response text", "sentiment": "positive", "themes": ["Theme"] }
    ]
  },
  "recommendation": "Clear actionable next step",
  "confidenceNote": "Sample size and reliability caveat"
}

IMPORTANT: In the sentimentBreakdown.responses array, include ALL individual text responses with their sentiment classification and theme tags. The percentages should reflect the actual distribution.`;

const PROJECT_ANALYSIS_FORMAT = `Return a JSON object with this exact structure:
{
  "executiveSummary": "2-3 sentence overview of the most important findings across the entire project",
  "keyThemes": [
    { "theme": "Theme name", "evidence": "Which questions and data points support this" }
  ],
  "sentimentOverview": {
    "overall": "positive" | "negative" | "mixed" | "neutral",
    "summary": "Paragraph explaining overall sentiment"
  },
  "notableInsights": [
    { "insight": "Surprising or important finding", "significance": "Why this matters" }
  ],
  "recommendations": [
    { "recommendation": "Actionable next step", "priority": "high" | "medium" | "low", "basedOn": "Which questions drive this" }
  ],
  "methodologyNote": "Brief note on sample size, data quality, and confidence level"
}`;

function buildQuestionContext(question: Question): string {
  const typeDescriptions: Record<string, string> = {
    monadic_split:
      "Monadic Split Test — each respondent sees only ONE variant (A/B/C). Compare results across groups for unbiased evaluation.",
    single_choice:
      "Single Choice — respondents pick ONE favorite from a short list. Includes 'None of these' option.",
    multiple_choice:
      "Multiple Choice — respondents select ALL options that appeal. Percentages can exceed 100% in total.",
    scaled_response:
      "Scaled Response — respondents rate on a numbered scale (Likert/semantic differential).",
    open_text:
      "Open Text — free-form text responses capturing authentic consumer reactions in their own words.",
    ranking:
      "Ranking — respondents drag items into preference order. Lower average rank = more preferred.",
    maxdiff:
      "MaxDiff (Best-Worst Scaling) — respondents see subsets of items and pick best and worst. Produces ratio-scaled preference scores.",
    anchored_pricing:
      "Anchored Pricing — iterative willingness-to-pay testing with reference product framing.",
    implicit_association:
      "Implicit Association — timed rapid-response test. Fast responses (<600ms) reveal genuine System 1 associations.",
    image_heatmap:
      "Image Heatmap — respondents click on areas of an image to show what grabs their attention.",
  };

  return typeDescriptions[question.type] || question.type;
}

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

  // Fetch all questions
  const { data: questionsData } = await supabase
    .from("questions")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  const questions = (questionsData as unknown as Question[]) || [];

  // Fetch responses
  const { data: responsesData } = await supabase
    .from("responses")
    .select("*")
    .eq("project_id", projectId);

  const responseCount = responsesData?.length ?? 0;

  // Fetch answers
  const { data: answersRaw } = await supabase
    .from("answers")
    .select("*, responses!inner(project_id)")
    .eq("responses.project_id", projectId);

  const answers = answersRaw || [];

  // Build the prompt
  let prompt: string;
  let format: string;

  if (questionId && analysisType === "question_summary") {
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" } satisfies ApiError,
        { status: 404 }
      );
    }

    const questionAnswers = answers.filter(
      (a: Record<string, unknown>) =>
        (a as { question_id: string }).question_id === questionId
    );

    const aggregatedSummary = summarizeAnswers(question, questionAnswers);

    prompt = `Analyze responses for this question from the project "${project.title}" (Category: ${project.category || "General"}).

Question: "${question.title}"
Type: ${buildQuestionContext(question)}
${question.description ? `Description: ${question.description}` : ""}

Response Data (${questionAnswers.length} responses out of ${responseCount} total project responses):
${aggregatedSummary}

Provide a comprehensive analysis for this ${question.type} question.`;

    format =
      question.type === "open_text"
        ? OPEN_TEXT_ANALYSIS_FORMAT
        : QUESTION_ANALYSIS_FORMAT;
  } else {
    // Project-level analysis
    const questionSummaries = questions
      .map((q) => {
        const qAnswers = answers.filter(
          (a: Record<string, unknown>) =>
            (a as { question_id: string }).question_id === q.id
        );
        return `Q${q.order_index + 1}: "${q.title}" (${q.type}, ${qAnswers.length} responses)
${summarizeAnswers(q, qAnswers)}`;
      })
      .join("\n\n");

    prompt = `Analyze ALL responses for the project "${project.title}" (Category: ${project.category || "General"}).
${project.description ? `Project description: ${project.description}` : ""}

Total responses: ${responseCount}
Completed: ${responsesData?.filter((r: Record<string, unknown>) => (r as { completed_at: unknown }).completed_at).length ?? 0}

Questions and their results:
${questionSummaries}

Provide a comprehensive project-level analysis covering all questions and their interrelationships.`;

    format = PROJECT_ANALYSIS_FORMAT;
  }

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${prompt}\n\n${format}`,
        },
      ],
    });

    const rawContent =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    let analysisContent: Json;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim();
      analysisContent = JSON.parse(jsonStr);
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
        content: analysisContent as Json,
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

function summarizeAnswers(
  question: Question,
  answers: Record<string, unknown>[]
): string {
  const values = answers.map((a) => a.value as Record<string, unknown>);
  if (values.length === 0) return "No responses yet.";

  switch (question.type) {
    case "monadic_split": {
      const variants: Record<string, unknown[]> = {};
      values.forEach((v) => {
        const variant = v.variant as string;
        if (!variants[variant]) variants[variant] = [];
        variants[variant].push(v.response);
      });
      return Object.entries(variants)
        .map(([key, responses]) => {
          if (typeof responses[0] === "string") {
            const yes = responses.filter((r) => r === "yes").length;
            return `Variant ${key.toUpperCase()}: ${yes}/${responses.length} said Yes (${Math.round((yes / responses.length) * 100)}%)`;
          }
          const ratings = responses as number[];
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          const t2b = ratings.filter((r) => r >= 4).length;
          return `Variant ${key.toUpperCase()}: Mean ${avg.toFixed(1)}/5, Top 2 Box ${Math.round((t2b / ratings.length) * 100)}% (n=${ratings.length})`;
        })
        .join("\n");
    }

    case "single_choice": {
      const counts: Record<string, number> = {};
      values.forEach((v) => {
        const sel = v.selected as string;
        counts[sel] = (counts[sel] || 0) + 1;
      });
      const options =
        (question.options as Array<{ id: string; label: string }>) || [];
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => {
          const label = options.find((o) => o.id === id)?.label || id;
          return `${label}: ${count} (${Math.round((count / values.length) * 100)}%)`;
        })
        .join("\n");
    }

    case "multiple_choice": {
      const counts: Record<string, number> = {};
      values.forEach((v) => {
        ((v.selected as string[]) || []).forEach((s) => {
          counts[s] = (counts[s] || 0) + 1;
        });
      });
      const options =
        (question.options as Array<{ id: string; label: string }>) || [];
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => {
          const label = options.find((o) => o.id === id)?.label || id;
          return `${label}: ${count}/${values.length} (${Math.round((count / values.length) * 100)}%)`;
        })
        .join("\n");
    }

    case "scaled_response": {
      const ratings = values.map((v) => v.rating as number);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      const scaleMax = question.settings?.scalePoints || 7;
      const t2b = ratings.filter((r) => r >= scaleMax - 1).length;
      const b2b = ratings.filter((r) => r <= 2).length;
      const dist: Record<number, number> = {};
      ratings.forEach((r) => (dist[r] = (dist[r] || 0) + 1));
      return `Mean: ${avg.toFixed(1)}/${scaleMax}, Top 2 Box: ${Math.round((t2b / ratings.length) * 100)}%, Bottom 2 Box: ${Math.round((b2b / ratings.length) * 100)}%
Distribution: ${Object.entries(dist)
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ")}`;
    }

    case "open_text": {
      const texts = values.map((v) => v.text as string);
      return `${texts.length} text responses:\n${texts.map((t, i) => `${i + 1}. "${t}"`).join("\n")}`;
    }

    case "ranking": {
      const options =
        (question.options as Array<{ id: string; label: string }>) || [];
      const rankSums: Record<string, number[]> = {};
      options.forEach((o) => (rankSums[o.id] = []));
      values.forEach((v) => {
        ((v.ranked as string[]) || []).forEach((id, idx) => {
          if (!rankSums[id]) rankSums[id] = [];
          rankSums[id].push(idx + 1);
        });
      });
      return Object.entries(rankSums)
        .map(([id, ranks]) => {
          const label = options.find((o) => o.id === id)?.label || id;
          const avg = ranks.length > 0
            ? ranks.reduce((a, b) => a + b, 0) / ranks.length
            : 0;
          return { label, avg, first: ranks.filter((r) => r === 1).length };
        })
        .sort((a, b) => a.avg - b.avg)
        .map(
          (item) =>
            `${item.label}: Avg rank ${item.avg.toFixed(1)}, ranked #1 by ${item.first} respondents`
        )
        .join("\n");
    }

    case "maxdiff": {
      const options =
        (question.options as Array<{ id: string; label: string }>) || [];
      const stats: Record<string, { best: number; worst: number; shown: number }> = {};
      options.forEach((o) => (stats[o.id] = { best: 0, worst: 0, shown: 0 }));
      values.forEach((v) => {
        const sets = (v.sets as Array<{ items: string[]; best: string; worst: string }>) || [];
        sets.forEach((set) => {
          set.items.forEach((id) => {
            if (!stats[id]) stats[id] = { best: 0, worst: 0, shown: 0 };
            stats[id].shown++;
          });
          if (stats[set.best]) stats[set.best].best++;
          if (stats[set.worst]) stats[set.worst].worst++;
        });
      });
      return Object.entries(stats)
        .map(([id, s]) => {
          const label = options.find((o) => o.id === id)?.label || id;
          const utility = s.shown > 0 ? ((s.best - s.worst) / s.shown).toFixed(2) : "0";
          return `${label}: Best ${s.best}, Worst ${s.worst}, Shown ${s.shown}, Utility ${utility}`;
        })
        .sort((a, b) => {
          const utilA = parseFloat(a.split("Utility ")[1]);
          const utilB = parseFloat(b.split("Utility ")[1]);
          return utilB - utilA;
        })
        .join("\n");
    }

    case "anchored_pricing": {
      const method = values[0]?.method as string;
      if (method === "gabor_granger") {
        const priceData: Record<number, { yes: number; total: number }> = {};
        values.forEach((v) => {
          const responses = (v.responses as Array<{ price: number; wouldBuy: boolean }>) || [];
          responses.forEach((r) => {
            if (!priceData[r.price]) priceData[r.price] = { yes: 0, total: 0 };
            priceData[r.price].total++;
            if (r.wouldBuy) priceData[r.price].yes++;
          });
        });
        return `Gabor-Granger pricing (${values.length} respondents):\n` +
          Object.entries(priceData)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(
              ([price, data]) =>
                `${price}: ${Math.round((data.yes / data.total) * 100)}% would buy`
            )
            .join("\n");
      }
      return `Van Westendorp pricing (${values.length} respondents)`;
    }

    case "implicit_association": {
      const attrData: Record<string, { fits: number; total: number; rts: number[] }> = {};
      values.forEach((v) => {
        const assocs = (v.associations as Array<{ attribute: string; response: string; reactionTimeMs: number }>) || [];
        assocs.forEach((a) => {
          if (!attrData[a.attribute]) attrData[a.attribute] = { fits: 0, total: 0, rts: [] };
          attrData[a.attribute].total++;
          if (a.response === "fits") attrData[a.attribute].fits++;
          attrData[a.attribute].rts.push(a.reactionTimeMs);
        });
      });
      return Object.entries(attrData)
        .map(([attr, data]) => {
          const avgRT = data.rts.reduce((a, b) => a + b, 0) / data.rts.length;
          return `${attr}: ${Math.round((data.fits / data.total) * 100)}% Fits, avg RT ${Math.round(avgRT)}ms`;
        })
        .sort((a, b) => {
          const pctA = parseInt(a.split(":")[1]);
          const pctB = parseInt(b.split(":")[1]);
          return pctB - pctA;
        })
        .join("\n");
    }

    case "image_heatmap": {
      const allClicks: Array<{ x: number; y: number; comment?: string }> = [];
      values.forEach((v) => {
        const clicks = (v.clicks as Array<{ x: number; y: number; comment?: string }>) || [];
        allClicks.push(...clicks);
      });
      const commentSample = allClicks
        .filter((c) => c.comment)
        .slice(0, 10)
        .map((c) => `"${c.comment}" at (${c.x},${c.y})`)
        .join("\n");
      return `${allClicks.length} total clicks from ${values.length} respondents.\nSample comments:\n${commentSample}`;
    }

    default:
      return `${values.length} responses (raw data available)`;
  }
}
