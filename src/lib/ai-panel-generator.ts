/**
 * AI Panel Response Generator
 *
 * Pure functions for generating synthetic survey responses from
 * LLM-provided distributions. Used by the /api/ai/generate-responses route.
 */

import type { Question, ChoiceOption } from "@/types";

// ---------------------------------------------------------------------------
// Random helpers
// ---------------------------------------------------------------------------

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function pickWeighted<T>(
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

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalRandom(
  mean: number,
  stdDev: number,
  rand: () => number
): number {
  const u1 = rand();
  const u2 = rand();
  const z =
    Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

// ---------------------------------------------------------------------------
// Response generators per question type
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

export function generateSingleChoiceAnswers(
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

export function generateMultipleChoiceAnswers(
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

export function generateScaledAnswers(
  dist: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ rating: number }> {
  const points = Object.keys(dist)
    .map(Number)
    .sort((a, b) => a - b);
  const weights = points.map((p) => dist[String(p)] || 0);
  return Array.from({ length: count }, () => ({
    rating: pickWeighted(points, weights, rand),
  }));
}

export function generateOpenTextAnswers(
  responses: string[],
  count: number,
  rand: () => number
): Array<{ text: string }> {
  if (responses.length === 0)
    return Array.from({ length: count }, () => ({ text: "No response" }));
  return Array.from({ length: count }, () => ({
    text: responses[Math.floor(rand() * responses.length)],
  }));
}

export function generateMonadicSplitAnswers(
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

export function generateRankingAnswers(
  strengthScores: Record<string, number>,
  count: number,
  rand: () => number
): Array<{ ranked: string[] }> {
  const ids = Object.keys(strengthScores);
  return Array.from({ length: count }, () => {
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

export function generateMaxDiffAnswers(
  utilityScores: Record<string, number>,
  itemsPerSet: number,
  count: number,
  rand: () => number
): Array<{
  sets: Array<{ items: string[]; best: string; worst: string }>;
}> {
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

export function generateGaborGrangerAnswers(
  buyProbabilities: Record<string, number>,
  count: number,
  rand: () => number
): Array<{
  method: "gabor_granger";
  responses: Array<{ price: number; wouldBuy: boolean }>;
}> {
  const prices = Object.keys(buyProbabilities)
    .map(Number)
    .sort((a, b) => a - b);
  return Array.from({ length: count }, () => {
    const sensitivity = (rand() - 0.5) * 20;
    const responses = prices.map((price) => ({
      price,
      wouldBuy:
        rand() * 100 < (buyProbabilities[String(price)] || 50) + sensitivity,
    }));
    return { method: "gabor_granger" as const, responses };
  });
}

export function generateVanWestendorpAnswers(
  medians: {
    tooCheap: number;
    bargain: number;
    expensive: number;
    tooExpensive: number;
  },
  stdDevs: {
    tooCheap: number;
    bargain: number;
    expensive: number;
    tooExpensive: number;
  },
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

export function generateImplicitAssociationAnswers(
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

export function generateImageHeatmapAnswers(
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
// Prompt builder
// ---------------------------------------------------------------------------

export function buildPrompt(
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
