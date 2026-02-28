import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@/lib/supabase/server";
import type {
  Question,
  ChoiceOption,
  ApiError,
} from "@/types";

const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const RESPONDENT_COUNT = 500;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(
  projectTitle: string,
  projectDescription: string | null,
  questions: Question[]
): string {
  const questionBlocks = questions.map((q, idx) => {
    const options = (q.options as ChoiceOption[]) || [];
    const settings = q.settings || {};
    const num = idx + 1;

    switch (q.type) {
      case "single_choice":
        return `Q${num} (ID: ${q.id}, Type: single_choice): "${q.title}"
Options: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}${settings.includeNone ? ', none="None of these"' : ""}
→ Return: {"distribution": {"<option_id>": <percentage>, ...}} percentages must sum to 100`;

      case "multiple_choice":
        return `Q${num} (ID: ${q.id}, Type: multiple_choice): "${q.title}"
Options: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}
→ Return: {"selectionRates": {"<option_id>": <percentage_who_select_this>, ...}} each 0-100`;

      case "scaled_response": {
        const scaleMax = settings.scalePoints || 7;
        const labels = settings.scaleLabels || [];
        return `Q${num} (ID: ${q.id}, Type: scaled_response): "${q.title}"
Scale: 1-${scaleMax}${labels.length ? ` (1="${labels[0]}", ${scaleMax}="${labels[labels.length - 1]}")` : ""}
→ Return: {"distribution": {"1": <pct>, "2": <pct>, ... "${scaleMax}": <pct>}} must sum to 100`;
      }

      case "open_text":
        return `Q${num} (ID: ${q.id}, Type: open_text): "${q.title}"
${q.description ? `Description: ${q.description}` : ""}
→ Return: {"responses": ["<response1>", "<response2>", ...]} provide exactly 50 unique, diverse responses from realistic UK consumers. Vary length (20-200 chars), tone, and sentiment. Include positive, negative, and neutral viewpoints.`;

      case "monadic_split": {
        const format = settings.responseFormat || "five_point";
        if (format === "binary") {
          return `Q${num} (ID: ${q.id}, Type: monadic_split, format: binary): "${q.title}"
Variants: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}
→ Return: {"variants": {"${options[0]?.id || "a"}": {"yesPercent": <pct>}, ...}} for each variant`;
        }
        return `Q${num} (ID: ${q.id}, Type: monadic_split, format: five_point): "${q.title}"
Variants: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}
→ Return: {"variants": {"${options[0]?.id || "a"}": {"distribution": {"1": <pct>, "2": <pct>, "3": <pct>, "4": <pct>, "5": <pct>}}, ...}} distributions must sum to 100 each`;
      }

      case "ranking":
        return `Q${num} (ID: ${q.id}, Type: ranking): "${q.title}"
Items: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}
→ Return: {"strengthScores": {"<item_id>": <score>, ...}} higher score (1-100) = more likely to be ranked #1`;

      case "maxdiff":
        return `Q${num} (ID: ${q.id}, Type: maxdiff): "${q.title}"
Items: ${options.map((o) => `${o.id}="${o.label}"`).join(", ")}
→ Return: {"utilityScores": {"<item_id>": <score>, ...}} higher positive = more preferred, negative = less preferred. Range roughly -3 to +3`;

      case "anchored_pricing": {
        const method = settings.pricingMethod || "gabor_granger";
        if (method === "gabor_granger") {
          const prices = settings.pricePoints || [];
          const currency = settings.currency || "£";
          return `Q${num} (ID: ${q.id}, Type: anchored_pricing, method: gabor_granger): "${q.title}"
Price points: ${prices.map((p: number) => `${currency}${p}`).join(", ")}
${settings.referenceProduct ? `Reference: ${settings.referenceProduct.name} at ${currency}${settings.referenceProduct.price}` : ""}
→ Return: {"buyProbabilities": {"${prices[0]}": <pct>, ...}} percentage who would buy at each price. Should decrease as price increases.`;
        }
        const currency = settings.currency || "£";
        return `Q${num} (ID: ${q.id}, Type: anchored_pricing, method: van_westendorp): "${q.title}"
Currency: ${currency}
→ Return: {"medians": {"tooCheap": <price>, "bargain": <price>, "expensive": <price>, "tooExpensive": <price>}, "stdDevs": {"tooCheap": <val>, "bargain": <val>, "expensive": <val>, "tooExpensive": <val>}}`;
      }

      case "implicit_association": {
        const attrs = settings.attributes || [];
        return `Q${num} (ID: ${q.id}, Type: implicit_association): "${q.title}"
Attributes: ${attrs.join(", ")}
→ Return: {"attributes": {"<attribute>": {"fitsPercent": <pct>, "avgReactionMs": <ms>}, ...}} avgReactionMs should be 350-700ms. Higher fitsPercent with lower RT = stronger genuine association.`;
      }

      case "image_heatmap":
        return `Q${num} (ID: ${q.id}, Type: image_heatmap): "${q.title}"
${q.description ? `Description: ${q.description}` : ""}
Max clicks: ${settings.maxClicks || 3}
→ Return: {"hotspots": [{"x": <0-100>, "y": <0-100>, "weight": <0-100>, "radius": <5-20>, "comments": ["comment1", "comment2", ...]}]} provide 3-5 hotspots with 5 sample comments each. Coordinates are percentages (0-100). Weights must sum to 100.`;

      default:
        return `Q${num} (ID: ${q.id}, Type: ${q.type}): "${q.title}"
→ Return: {} (skip this question type)`;
    }
  });

  return `You are simulating a nationally representative survey panel of 500 UK adults responding to a consumer research survey. Consider:
- UK demographics: ages 18-75+, balanced gender, regions across England, Scotland, Wales, Northern Ireland
- Socioeconomic diversity: ABC1 C2 DE social grades
- Typical UK consumer attitudes, preferences, and purchasing behaviors
- Natural survey response patterns: central tendency bias on scales, acquiescence bias, position effects

Provide REALISTIC response distributions. These should reflect genuine UK consumer opinion — not uniform/random.

SURVEY: "${projectTitle}"
${projectDescription ? `Description: ${projectDescription}` : ""}

QUESTIONS:

${questionBlocks.join("\n\n")}

Return ONLY valid JSON (no markdown, no code blocks, no explanation) with this exact structure:
{
  "<question_id>": { /* type-specific data as specified above */ },
  ...
}`;
}

// ---------------------------------------------------------------------------
// Random helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pickWeighted<T>(
  items: T[],
  weights: number[],
  rand: () => number
): T {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total === 0) return items[Math.floor(rand() * items.length)];
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalRandom(mean: number, stdDev: number, rand: () => number): number {
  // Box-Muller transform
  const u1 = rand();
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

// ---------------------------------------------------------------------------
// Response generators per question type
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

function generateSingleChoiceAnswers(
  dist: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ selected: string }> {
  const ids = Object.keys(dist);
  const weights = ids.map((id) => dist[id]);
  return Array.from({ length: count }, () => ({
    selected: pickWeighted(ids, weights, rand),
  }));
}

function generateMultipleChoiceAnswers(
  rates: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ selected: string[] }> {
  const ids = Object.keys(rates);
  return Array.from({ length: count }, () => {
    const selected = ids.filter((id) => rand() * 100 < rates[id]);
    if (selected.length === 0) selected.push(ids[0]);
    return { selected };
  });
}

function generateScaledAnswers(
  dist: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ rating: number }> {
  const points = Object.keys(dist).map(Number).sort((a, b) => a - b);
  const weights = points.map((p) => dist[String(p)] || 0);
  return Array.from({ length: count }, () => ({
    rating: pickWeighted(points, weights, rand),
  }));
}

function generateOpenTextAnswers(
  responses: string[],
  count: number,
  rand: () => number
): Array<{ text: string }> {
  if (responses.length === 0) return Array.from({ length: count }, () => ({ text: "No response" }));
  return Array.from({ length: count }, () => ({
    text: responses[Math.floor(rand() * responses.length)],
  }));
}

function generateMonadicSplitAnswers(
  variantData: Record<string, any>,
  variantIds: string[],
  responseFormat: string,
  count: number,
  rand: () => number
): Array<{ variant: string; response: any }> {
  return Array.from({ length: count }, () => {
    const variant = variantIds[Math.floor(rand() * variantIds.length)];
    const vData = variantData[variant];
    if (!vData) {
      return { variant, response: responseFormat === "binary" ? "yes" : 3 };
    }
    if (responseFormat === "binary") {
      const yp = vData.yesPercent ?? 50;
      return { variant, response: rand() * 100 < yp ? "yes" : "no" };
    }
    const dist = vData.distribution || {};
    const points = [1, 2, 3, 4, 5];
    const weights = points.map((p) => dist[String(p)] || 20);
    return { variant, response: pickWeighted(points, weights, rand) };
  });
}

function generateRankingAnswers(
  strengthScores: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ ranked: string[] }> {
  const ids = Object.keys(strengthScores);
  return Array.from({ length: count }, () => {
    // Plackett-Luce ranking model
    const remaining = [...ids];
    const ranked: string[] = [];
    while (remaining.length > 0) {
      const weights = remaining.map(
        (id) => Math.max(1, strengthScores[id] || 50) + rand() * 10
      );
      const chosen = pickWeighted(remaining, weights, rand);
      ranked.push(chosen);
      remaining.splice(remaining.indexOf(chosen), 1);
    }
    return { ranked };
  });
}

function generateMaxDiffAnswers(
  utilityScores: Record<string, number>,
  itemsPerSet: number,
  count: number,
  rand: () => number
): Array<{ sets: Array<{ items: string[]; best: string; worst: string }> }> {
  const itemIds = Object.keys(utilityScores);
  const numSets = Math.ceil((3 * itemIds.length) / itemsPerSet);

  return Array.from({ length: count }, () => {
    const shuffled = shuffle(itemIds, rand);
    const sets: Array<{ items: string[]; best: string; worst: string }> = [];
    for (let s = 0; s < numSets; s++) {
      const setItems: string[] = [];
      for (let k = 0; k < itemsPerSet; k++) {
        setItems.push(shuffled[(s * itemsPerSet + k) % itemIds.length]);
      }
      // Choose best (highest utility + noise) and worst (lowest utility + noise)
      const scored = setItems.map((id) => ({
        id,
        score: (utilityScores[id] || 0) + (rand() - 0.5) * 1.5,
      }));
      scored.sort((a, b) => b.score - a.score);
      sets.push({
        items: setItems,
        best: scored[0].id,
        worst: scored[scored.length - 1].id,
      });
    }
    return { sets };
  });
}

function generateGaborGrangerAnswers(
  buyProbabilities: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ method: "gabor_granger"; responses: Array<{ price: number; wouldBuy: boolean }> }> {
  const prices = Object.keys(buyProbabilities)
    .map(Number)
    .sort((a, b) => a - b);
  return Array.from({ length: count }, () => {
    // Each respondent has a personal price sensitivity offset
    const sensitivity = (rand() - 0.5) * 20;
    const responses = prices.map((price) => ({
      price,
      wouldBuy: rand() * 100 < (buyProbabilities[String(price)] || 50) + sensitivity,
    }));
    return { method: "gabor_granger" as const, responses };
  });
}

function generateVanWestendorpAnswers(
  medians: { tooCheap: number; bargain: number; expensive: number; tooExpensive: number },
  stdDevs: { tooCheap: number; bargain: number; expensive: number; tooExpensive: number },
  count: number,
  rand: () => number
): Array<{
  method: "van_westendorp";
  tooCheap: number;
  bargain: number;
  expensive: number;
  tooExpensive: number;
}> {
  return Array.from({ length: count }, () => {
    let tc = normalRandom(medians.tooCheap, stdDevs.tooCheap, rand);
    let bg = normalRandom(medians.bargain, stdDevs.bargain, rand);
    let ex = normalRandom(medians.expensive, stdDevs.expensive, rand);
    let te = normalRandom(medians.tooExpensive, stdDevs.tooExpensive, rand);
    // Ensure logical ordering: tooCheap < bargain < expensive < tooExpensive
    tc = Math.max(0.01, tc);
    bg = Math.max(tc + 0.01, bg);
    ex = Math.max(bg + 0.01, ex);
    te = Math.max(ex + 0.01, te);
    return {
      method: "van_westendorp" as const,
      tooCheap: Math.round(tc * 100) / 100,
      bargain: Math.round(bg * 100) / 100,
      expensive: Math.round(ex * 100) / 100,
      tooExpensive: Math.round(te * 100) / 100,
    };
  });
}

function generateImplicitAssociationAnswers(
  attrData: Record<string, { fitsPercent: number; avgReactionMs: number }>,
  count: number,
  rand: () => number
): Array<{
  associations: Array<{
    attribute: string;
    response: "fits" | "doesnt_fit";
    reactionTimeMs: number;
  }>;
}> {
  const attrs = Object.keys(attrData);
  return Array.from({ length: count }, () => ({
    associations: attrs.map((attribute) => {
      const data = attrData[attribute];
      const fits = rand() * 100 < data.fitsPercent;
      const baseRT = data.avgReactionMs;
      const rt = Math.round(
        Math.max(200, normalRandom(baseRT, baseRT * 0.25, rand))
      );
      return {
        attribute,
        response: (fits ? "fits" : "doesnt_fit") as "fits" | "doesnt_fit",
        reactionTimeMs: rt,
      };
    }),
  }));
}

function generateImageHeatmapAnswers(
  hotspots: Array<{
    x: number;
    y: number;
    weight: number;
    radius: number;
    comments: string[];
  }>,
  maxClicks: number,
  count: number,
  rand: () => number
): Array<{ clicks: Array<{ x: number; y: number; comment?: string }> }> {
  const hsWeights = hotspots.map((h) => h.weight);
  return Array.from({ length: count }, () => {
    const numClicks = Math.floor(rand() * maxClicks) + 1;
    const clicks = Array.from({ length: numClicks }, () => {
      const spot = pickWeighted(hotspots, hsWeights, rand);
      const x = Math.round(
        Math.max(0, Math.min(100, normalRandom(spot.x, spot.radius, rand)))
      );
      const y = Math.round(
        Math.max(0, Math.min(100, normalRandom(spot.y, spot.radius, rand)))
      );
      const comment =
        spot.comments && spot.comments.length > 0
          ? spot.comments[Math.floor(rand() * spot.comments.length)]
          : undefined;
      return { x, y, ...(comment ? { comment } : {}) };
    });
    return { clicks };
  });
}

// ---------------------------------------------------------------------------
// Main route handler
// ---------------------------------------------------------------------------

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
    return NextResponse.json({ alreadyGenerated: true, responseCount: existingCount });
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

    // Extract JSON — handle potential markdown wrapping
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

  // Create response rows
  const responseRows = Array.from({ length: RESPONDENT_COUNT }, (_, i) => {
    const startOffset = i * 500 + Math.floor(rand() * 300);
    const startTime = new Date(now.getTime() - 3600000 + startOffset);
    const completionTime = new Date(
      startTime.getTime() + 120000 + Math.floor(rand() * 300000)
    );
    const completed = rand() > 0.05; // 95% completion rate
    return {
      project_id: projectId,
      respondent_id: `ai-panel-${i.toString().padStart(4, "0")}`,
      started_at: startTime.toISOString(),
      completed_at: completed ? completionTime.toISOString() : null,
    };
  });

  // Batch insert responses
  const insertedResponses: Array<{ id: string; completed_at: string | null }> = [];
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
        { error: `Failed to insert responses: ${error.message}` } satisfies ApiError,
        { status: 500 }
      );
    }
    insertedResponses.push(...((data as unknown as Array<{ id: string; completed_at: string | null }>) || []));
  }

  // Filter to only completed responses for answer generation
  const completedResponses = insertedResponses.filter((r) => r.completed_at);

  // Generate answers for each question
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
        answers = generateOpenTextAnswers(
          qDist.responses || [],
          count,
          rand
        );
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
            qDist.medians || {
              tooCheap: 0.5,
              bargain: 1.0,
              expensive: 2.0,
              tooExpensive: 3.0,
            },
            qDist.stdDevs || {
              tooCheap: 0.2,
              bargain: 0.3,
              expensive: 0.4,
              tooExpensive: 0.5,
            },
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

    // Map answers to database rows
    const answerRows = answers.map((value, idx) => ({
      response_id: completedResponses[idx].id,
      question_id: question.id,
      value,
    }));

    allAnswerRows.push(answerRows);
  }

  // Flatten and batch insert answers
  const flatAnswers = allAnswerRows.flat();
  for (let i = 0; i < flatAnswers.length; i += BATCH_SIZE) {
    const batch = flatAnswers.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("answers").insert(batch);
    if (error) {
      console.error("Answer insert error:", error);
      // Continue — partial data is better than none
    }
  }

  return NextResponse.json({
    success: true,
    responseCount: insertedResponses.length,
    answerCount: flatAnswers.length,
  });
}
