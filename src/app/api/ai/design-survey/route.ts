import { NextRequest, NextResponse } from "next/server";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import type { ApiError } from "@/types";

export interface AiDesignSurveyRequest {
  objective: string;
  category?: string;
  projectTitle?: string;
}

export interface AiDesignedQuestion {
  type: string;
  title: string;
  description: string;
  required: boolean;
  options?: Array<{ text: string; image?: null }>;
  settings?: Record<string, unknown>;
}

export interface AiDesignSurveyResponse {
  suggestedTitle: string;
  questions: AiDesignedQuestion[];
  rationale: string;
}

const SURVEY_DESIGN_SYSTEM_PROMPT = `You are an expert consumer research methodologist and survey designer working within Vypr, an FMCG consumer insights platform grounded in behavioral science.

Your task is to design a complete multi-question survey based on the user's research objective. You must return ONLY valid JSON (no markdown, no explanation outside JSON).

## Available Question Types

You have exactly 10 question types to choose from. Here is each type with its constraints, use cases, and configuration options:

### 1. monadic_split — Monadic Split Test
- **What it does**: Shows each respondent ONE variant only. Compares results across groups. The gold standard for unbiased evaluation — simulates real shopping where consumers encounter products one at a time.
- **Best for**: Concept testing, packaging A/B testing, naming tests, unbiased variant evaluation
- **When to use**: When you need to compare 2-3 variants without comparison bias. Each respondent only sees one variant.
- **Settings**:
  - variantCount: 2 or 3
  - responseFormat: "binary" (Yes/No — fast System 1 responses) or "five_point" (5-point purchase intent scale — more granularity)
  - samplePerVariant: 100-500 (recommend 150+ for statistical significance)
- **Options**: Provide the variant labels as options (e.g., "Design A — Blue packaging", "Design B — Red packaging")
- **Constraints**: Must have exactly 2 or 3 variants

### 2. single_choice — Single Choice
- **What it does**: Pick one favourite from a short list. Forces genuine preference.
- **Best for**: Final preference selection, head-to-head comparisons, picking a winner
- **When to use**: When you need respondents to commit to one preferred option. Always includes "None of these" to prevent false positives.
- **Settings**:
  - includeNone: true (recommended — prevents forced false preferences)
  - randomizeOptions: true (recommended — prevents primacy bias)
- **Options**: 2-5 text options (decision quality drops sharply above 5)
- **Constraints**: Min 2, Max 5 options

### 3. multiple_choice — Multiple Choice
- **What it does**: Select ALL that appeal from a longer list. Ideal for screening.
- **Best for**: Early screening, feature exploration, identifying which items resonate from a longer list
- **When to use**: When exploring which items from a broader set resonate, before narrowing down with other methods.
- **Settings**:
  - maxSelections: optional number (set to force discrimination, e.g., "Choose up to 3")
  - randomizeOptions: true (recommended)
- **Options**: 4-10 text options
- **Constraints**: Min 4, Max 10 options. Beyond 10, respondents scan rather than evaluate.

### 4. scaled_response — Scaled Response (Likert / Semantic Differential)
- **What it does**: Rate on a numbered scale. Captures intensity of opinion.
- **Best for**: Concept evaluation, claims testing, brand tracking, measuring agreement/appeal/intent
- **When to use**: When you need to measure how strongly people feel, not just what they prefer.
- **Settings**:
  - scaleType: "agreement" | "purchase_intent" | "appeal" | "custom"
    - agreement: "Strongly disagree" → "Strongly agree"
    - purchase_intent: "Definitely would not buy" → "Definitely would buy"
    - appeal: "Not at all appealing" → "Extremely appealing"
  - scalePoints: 5 or 7 (7 recommended for bipolar scales, 5 for simple unipolar)
  - scaleLabels: string[] (only needed for "custom" — one label per scale point)
- **Constraints**: Every point must be labelled. 7-point is the empirically validated sweet spot.

### 5. open_text — Open Text (with AI sentiment analysis)
- **What it does**: Free-form text response. AI automatically classifies sentiment and extracts themes.
- **Best for**: Capturing authentic consumer language, concept diagnostics, understanding "why"
- **When to use**: When you need qualitative depth — what consumers think in their own words.
- **Settings**:
  - charMin: 10-100 (default 20 — prevents throwaway responses)
  - charMax: 100-1000 (default 500 — long enough for substance, short enough to prevent over-rationalisation)
- **Constraints**: Keep prompts open and non-leading. AVOID "Why?" questions — they trigger post-rationalisation (System 2 thinking). Prefer "What do you think about...?", "How does this make you feel?", "What's your first reaction to...?"

### 6. ranking — Ranking
- **What it does**: Drag items into preference order. Forces genuine trade-offs.
- **Best for**: Short-list prioritisation, feature ordering, identifying what matters most
- **When to use**: When you need to know not just what people like, but the relative order of preference.
- **Settings**:
  - randomizeOptions: true (essential — respondents are biased toward keeping the initial order)
- **Options**: 3-7 items to rank
- **Constraints**: Min 3, Max 7 items. Beyond 7, people rank the top 2-3 carefully and guess the rest. For 8+ items, use maxdiff instead.

### 7. maxdiff — MaxDiff (Best-Worst Scaling)
- **What it does**: Respondents see small subsets and pick the best and worst in each set. Produces ratio-scaled preference scores.
- **Best for**: Claims testing, feature prioritisation, screening 10-30 items, large-scale preference ranking
- **When to use**: When you have a long list (10-30 items) and need to know true relative priorities without the "everything is important" problem of rating scales.
- **Settings**:
  - itemsPerSet: 4 or 5 (4 is standard, never more than half total items)
  - bestLabel: "Most appealing" (default, customisable)
  - worstLabel: "Least appealing" (default, customisable)
- **Options**: 6-30 items (text only)
- **Constraints**: Min 6, Max 30 items. If total items < 8 and itemsPerSet is 5, it won't work well.

### 8. anchored_pricing — Anchored Pricing
- **What it does**: Tests willingness to pay, anchored against a reference product. Mimics real shopping.
- **Best for**: Launch pricing, price sensitivity testing, competitive benchmarking
- **When to use**: When you need to determine optimal price or price sensitivity for a product.
- **Settings**:
  - pricingMethod: "gabor_granger" (test specific price points) or "van_westendorp" (identify acceptable price range)
  - currency: "GBP" | "EUR" | "USD" | "AUD"
  - pricePoints: array of 5 prices in ascending order (Gabor-Granger only)
- **Constraints**: Gabor-Granger needs exactly 5 price points in ascending order with equal intervals. Van Westendorp uses 4 fixed open-ended questions.

### 9. implicit_association — Implicit Association (Timed Response)
- **What it does**: Timed rapid-response test measuring subconscious brand/product associations. Captures System 1 (instinctive) reactions.
- **Best for**: Brand positioning, packaging testing, claims believability, uncovering true associations
- **When to use**: When you suspect claimed attitudes differ from genuine associations. Fast responses reveal truth.
- **Settings**:
  - stimulusType: "brand_logo" | "product_packaging" | "concept_image" | "advertising_creative"
  - practiceRounds: 2-5 (default 3, warm-up rounds)
  - attributes: 8-15 single-word attributes (e.g., "Premium", "Trustworthy", "Modern", "Natural")
- **Constraints**: Min 8, Max 15 attributes. Each max 20 chars. Responses under 200ms excluded (too fast), over 800ms flagged as deliberation.

### 10. image_heatmap — Image Heatmap
- **What it does**: Respondents click on areas of an image to show what grabs attention. Creates heat map of visual hotspots.
- **Best for**: Packaging optimisation, ad creative testing, shelf display evaluation
- **When to use**: When you need to understand which visual elements draw attention and why. Cost-effective proxy for eye-tracking.
- **Settings**:
  - clickMode: "attention" | "like" | "change" | "custom"
  - maxClicks: 1-5 (default 3)
  - requireComment: true (recommended — ensures clicks are meaningful)
- **Constraints**: Requires a stimulus image. Consumers evaluate packaging in 3-5 seconds.

## Survey Design Best Practices

1. **Question order matters**: Start broad (screening/exploration), then narrow (evaluation/preference), end with open-ended or low-effort questions.
2. **3-5 questions is optimal** for completion rates. More than 7 risks survey fatigue.
3. **Mix methodologies**: Combine quantitative (scaled, choice) with qualitative (open text) for richer insights.
4. **Avoid leading questions**: Phrase neutrally. "What do you think?" not "Don't you love this?"
5. **Each question should serve a distinct purpose**: No redundancy.
6. **Use behavioral science principles**: System 1 (fast, instinctive) measures early, System 2 (deliberate, rational) questions later.

## Response Format

Return ONLY this JSON structure (no markdown fences, no extra text):

{
  "suggestedTitle": "A concise project title (max 80 chars)",
  "questions": [
    {
      "type": "one of the 10 type keys above",
      "title": "The question text shown to respondents (max 120 chars)",
      "description": "Additional context for respondents (max 100 chars, or empty string)",
      "required": true or false,
      "options": [{"text": "Option label"}],
      "settings": { ... type-specific settings as described above ... }
    }
  ],
  "rationale": "A brief (2-3 sentence) explanation of why you designed the survey this way and what insights it will yield."
}

IMPORTANT:
- Use ONLY the 10 question type keys listed above (monadic_split, single_choice, multiple_choice, scaled_response, open_text, ranking, maxdiff, anchored_pricing, implicit_association, image_heatmap)
- Respect all min/max constraints for each type
- Design 3-5 questions unless the objective clearly demands more
- Include appropriate settings for each question type
- Make question text specific to the user's stated objective — never generic
- For options/items, provide realistic, relevant choices based on the research context`;

export async function POST(request: NextRequest) {
  let body: AiDesignSurveyRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" } satisfies ApiError,
      { status: 400 }
    );
  }

  const { objective, category, projectTitle } = body;

  if (!objective?.trim()) {
    return NextResponse.json(
      { error: "objective is required" } satisfies ApiError,
      { status: 400 }
    );
  }

  const userMessage = [
    `Research objective: ${objective.trim()}`,
    category ? `Category: ${category}` : null,
    projectTitle ? `Project title (for context): ${projectTitle}` : null,
    "",
    "Design a complete survey to address this research objective. Return ONLY valid JSON.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      system: SURVEY_DESIGN_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON response — handle potential markdown fences
    let jsonText = rawText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let parsed: AiDesignSurveyResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON. Please try again.",
          details: rawText.slice(0, 200),
        } as ApiError,
        { status: 502 }
      );
    }

    // Basic validation
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return NextResponse.json(
        { error: "AI returned no questions. Please try again." } satisfies ApiError,
        { status: 502 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    const errMessage =
      err instanceof Error ? err.message : "AI request failed";
    return NextResponse.json(
      { error: errMessage } satisfies ApiError,
      { status: 500 }
    );
  }
}
