import type {
  Project,
  Question,
  Response,
  Answer,
  ChoiceOption,
  QuestionSettings,
} from "@/types";

// --- Deterministic UUID generation ---
// Uses a fixed namespace to create valid v4-format UUIDs deterministically
function uuid(prefix: string, n: number): string {
  const hex = (v: number, len: number) =>
    v.toString(16).padStart(len, "0");

  // Map prefix to a stable 4-char hex code
  const prefixMap: Record<string, string> = {
    proj: "aa01",
    q: "bb02",
    r: "cc03",
    a: "dd04",
    resp: "ee05",
  };
  const pfx = prefixMap[prefix] || "ff00";

  return `${pfx}${hex(n, 4)}-0000-4000-8000-000000000000`;
}

const PROJECT_ID = uuid("proj", 1);

// --- Demo Project ---
export const demoProject: Project = {
  id: PROJECT_ID,
  title: "Summer Range Taste Test 2025",
  description:
    "Testing consumer reactions to three new summer drink flavours for the UK market",
  category: "Food & Drink",
  status: "live",
  published_at: "2025-06-01T09:00:00Z",
  closed_at: null,
  created_at: "2025-05-28T14:30:00Z",
  updated_at: "2025-06-01T09:00:00Z",
};

// --- Questions ---

const q1Options: ChoiceOption[] = [
  { id: "var_a", label: "Tropical Burst" },
  { id: "var_b", label: "Berry Bliss" },
  { id: "var_c", label: "Citrus Zing" },
];

const q2Options: ChoiceOption[] = [
  { id: "sc_1", label: "Tropical Burst" },
  { id: "sc_2", label: "Berry Bliss" },
  { id: "sc_3", label: "Citrus Zing" },
  { id: "sc_4", label: "Classic Lemon" },
  { id: "sc_5", label: "Mango & Lime" },
];

const q3Options: ChoiceOption[] = [
  { id: "mc_1", label: "Refreshing" },
  { id: "mc_2", label: "Natural tasting" },
  { id: "mc_3", label: "Good value" },
  { id: "mc_4", label: "Premium feel" },
  { id: "mc_5", label: "Eye-catching packaging" },
  { id: "mc_6", label: "Healthy" },
  { id: "mc_7", label: "Unique flavour" },
  { id: "mc_8", label: "Would share with friends" },
];

const rankItems: ChoiceOption[] = [
  { id: "rk_1", label: "Taste" },
  { id: "rk_2", label: "Price" },
  { id: "rk_3", label: "Packaging design" },
  { id: "rk_4", label: "Brand reputation" },
  { id: "rk_5", label: "Ingredients quality" },
];

const maxDiffItems: ChoiceOption[] = [
  { id: "md_1", label: "No added sugar" },
  { id: "md_2", label: "Made with real fruit" },
  { id: "md_3", label: "Recyclable packaging" },
  { id: "md_4", label: "Low calorie" },
  { id: "md_5", label: "Vitamin enriched" },
  { id: "md_6", label: "Locally sourced" },
  { id: "md_7", label: "Great taste guarantee" },
  { id: "md_8", label: "Family size available" },
  { id: "md_9", label: "Limited edition" },
  { id: "md_10", label: "Endorsed by nutritionist" },
];

export const demoQuestions: Question[] = [
  {
    id: uuid("q", 1),
    project_id: PROJECT_ID,
    type: "monadic_split",
    title: "Would you buy this drink based on the packaging?",
    description: "Each respondent sees one variant only",
    options: q1Options,
    media_url: null,
    required: true,
    order_index: 0,
    settings: {
      variantCount: 3,
      responseFormat: "five_point",
      samplePerVariant: 200,
    } as QuestionSettings,
    created_at: "2025-05-28T14:35:00Z",
  },
  {
    id: uuid("q", 2),
    project_id: PROJECT_ID,
    type: "single_choice",
    title: "Which flavour would you most like to try?",
    description: "Pick your top choice",
    options: q2Options,
    media_url: null,
    required: true,
    order_index: 1,
    settings: { includeNone: true, randomizeOptions: true } as QuestionSettings,
    created_at: "2025-05-28T14:40:00Z",
  },
  {
    id: uuid("q", 3),
    project_id: PROJECT_ID,
    type: "multiple_choice",
    title: "Which of these words describe your impression of the product range?",
    description: "Select all that apply",
    options: q3Options,
    media_url: null,
    required: true,
    order_index: 2,
    settings: { randomizeOptions: true } as QuestionSettings,
    created_at: "2025-05-28T14:45:00Z",
  },
  {
    id: uuid("q", 4),
    project_id: PROJECT_ID,
    type: "scaled_response",
    title: "How appealing is this product concept overall?",
    description: null,
    options: null,
    media_url: null,
    required: true,
    order_index: 3,
    settings: {
      scaleType: "appeal",
      scalePoints: 7,
      scaleLabels: [
        "Not at all appealing",
        "Slightly appealing",
        "Somewhat appealing",
        "Neutral",
        "Moderately appealing",
        "Very appealing",
        "Extremely appealing",
      ],
    } as QuestionSettings,
    created_at: "2025-05-28T14:50:00Z",
  },
  {
    id: uuid("q", 5),
    project_id: PROJECT_ID,
    type: "open_text",
    title: "What is your first reaction to this product?",
    description: "Share your honest, instinctive thoughts",
    options: null,
    media_url: null,
    required: true,
    order_index: 4,
    settings: { charMin: 20, charMax: 500 } as QuestionSettings,
    created_at: "2025-05-28T14:55:00Z",
  },
  {
    id: uuid("q", 6),
    project_id: PROJECT_ID,
    type: "ranking",
    title: "Rank these factors by importance when choosing a new drink",
    description: "Drag into your preferred order",
    options: rankItems,
    media_url: null,
    required: true,
    order_index: 5,
    settings: { randomizeOptions: true } as QuestionSettings,
    created_at: "2025-05-28T15:00:00Z",
  },
  {
    id: uuid("q", 7),
    project_id: PROJECT_ID,
    type: "maxdiff",
    title: "Which product claims matter most to you?",
    description: "Pick the most and least appealing in each set",
    options: maxDiffItems,
    media_url: null,
    required: true,
    order_index: 6,
    settings: {
      itemsPerSet: 4,
      bestLabel: "Most appealing",
      worstLabel: "Least appealing",
    } as QuestionSettings,
    created_at: "2025-05-28T15:05:00Z",
  },
  {
    id: uuid("q", 8),
    project_id: PROJECT_ID,
    type: "anchored_pricing",
    title: "How much would you pay for this drink?",
    description: "Compared to similar products on shelf",
    options: null,
    media_url: null,
    required: true,
    order_index: 7,
    settings: {
      pricingMethod: "gabor_granger",
      currency: "£",
      pricePoints: [0.99, 1.29, 1.59, 1.89, 2.19],
      referenceProduct: {
        name: "Innocent Smoothie 250ml",
        price: 1.75,
      },
    } as QuestionSettings,
    created_at: "2025-05-28T15:10:00Z",
  },
  {
    id: uuid("q", 9),
    project_id: PROJECT_ID,
    type: "implicit_association",
    title: "Quick — does this word fit the product?",
    description: "React as fast as you can",
    options: null,
    media_url: "/stimulus-bottle.jpg",
    required: true,
    order_index: 8,
    settings: {
      stimulusType: "Product packaging",
      attributes: [
        "Premium",
        "Natural",
        "Fun",
        "Healthy",
        "Refreshing",
        "Affordable",
        "Modern",
        "Trustworthy",
        "Bold",
        "Traditional",
      ],
      practiceRounds: 3,
    } as QuestionSettings,
    created_at: "2025-05-28T15:15:00Z",
  },
  {
    id: uuid("q", 10),
    project_id: PROJECT_ID,
    type: "image_heatmap",
    title: "What catches your eye first on this packaging?",
    description: "Tap up to 3 areas",
    options: null,
    media_url: "/packaging-front.jpg",
    required: true,
    order_index: 9,
    settings: {
      clickMode: "What draws your attention?",
      maxClicks: 3,
      requireComment: true,
    } as QuestionSettings,
    created_at: "2025-05-28T15:20:00Z",
  },
];

// --- Simulated Responses (75 respondents) ---

const RESPONDENT_COUNT = 75;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Open text responses — realistic FMCG consumer feedback
const openTextResponses = [
  "Love the look of this! Really fresh and summery. Would definitely pick it up off the shelf.",
  "Looks nice but I'm concerned about the sugar content. Can't see nutritional info clearly.",
  "The tropical flavour sounds amazing. Perfect for a hot day!",
  "Not sure about the price. Seems a bit expensive for what it is.",
  "Really like the packaging design — feels premium but not pretentious.",
  "Would buy this for my kids, looks healthy and fun.",
  "Reminds me of similar products I've seen but cheaper alternatives exist.",
  "The colour scheme is attractive. Makes me think of a beach holiday.",
  "Concerned this is just another sugary drink with a healthy-looking label.",
  "First impression is positive — would want to taste test before committing.",
  "The brand name doesn't mean much to me. Would need more info about ingredients.",
  "This looks like something I'd grab from Waitrose. Premium feel.",
  "Not my thing — I prefer plain water. But the packaging is nice.",
  "Excited about the berry flavour! The others don't appeal as much.",
  "Packaging looks cheap compared to Innocent or Naked. Needs work.",
  "Would be great for picnics and BBQs this summer.",
  "Too many options — hard to choose between three similar flavours.",
  "Love that it looks natural. The green tones work really well.",
  "Skeptical. Every new drink brand claims to be healthy these days.",
  "The citrus one looks most refreshing. Would buy that one first.",
  "Great concept but worried about taste. Looks can be deceiving.",
  "Would need to see it next to competitors on shelf to judge properly.",
  "My first thought is 'another overpriced fruit drink'. Prove me wrong.",
  "Really appealing! The flavour combinations are interesting and different.",
  "I like that it feels British and not trying to copy American brands.",
  "The bottle shape is unique. Would stand out on the shelf.",
  "Concerned about portion size — 250ml feels small for the likely price.",
  "This ticks all the boxes for me — fresh, natural, interesting flavours.",
  "Not convinced by the 'tropical' claim. Real tropical fruits or flavourings?",
  "Would definitely pick this up as an impulse buy at the checkout.",
  "The branding feels a bit generic. Needs more personality.",
  "Love the sustainability angle if the packaging is actually recyclable.",
  "Looks good but I'd want to know where the fruit is sourced from.",
  "My kids would love the bright colours. Parent-approved look too.",
  "Feels like it's trying too hard to be trendy. Just give me good taste.",
  "First reaction: want to try the mango one immediately!",
  "The design looks professional. Would trust this brand.",
  "Not different enough from what's already on the market.",
  "Appealing for a health-conscious shopper. I'd give it a try.",
  "The fruit imagery makes it look appetizing. Well designed.",
  "Would need a deal or promotion to switch from my usual brand.",
  "Looks like a proper artisan product. Willing to pay a bit more.",
  "Too colourful — looks like it's marketed at children, not adults.",
  "Really fresh concept. UK market needs more options like this.",
  "Packaging is good but I always read the back label first.",
  "Reminds me of a holiday drink. Nostalgic and appealing.",
  "Would recommend to friends if the taste matches the look.",
  "Bit worried it might be all style and no substance.",
  "Perfect for the gym bag. Looks healthy and convenient.",
  "The flavour options are smart — something for everyone.",
];

function generateResponses(): { responses: Response[]; answers: Answer[] } {
  const responses: Response[] = [];
  const answers: Answer[] = [];
  let answerIndex = 0;

  for (let i = 0; i < RESPONDENT_COUNT; i++) {
    const respondentId = uuid("resp", i);
    const startTime = new Date(
      Date.parse("2025-06-01T10:00:00Z") + i * 300000 + Math.floor(rand() * 600000)
    );
    const completionTime = new Date(
      startTime.getTime() + 180000 + Math.floor(rand() * 420000)
    );
    const completed = rand() > 0.08; // 92% completion rate

    responses.push({
      id: uuid("r", i),
      project_id: PROJECT_ID,
      respondent_id: respondentId,
      started_at: startTime.toISOString(),
      completed_at: completed ? completionTime.toISOString() : null,
      created_at: startTime.toISOString(),
    });

    if (!completed) continue;

    // Q1: Monadic Split (5-point) — Variant B (Berry Bliss) should win
    const variant = pick(["a", "b", "c"] as const);
    const monadicWeights: Record<string, number[]> =
      { a: [3, 8, 20, 35, 34], b: [2, 5, 12, 38, 43], c: [5, 10, 25, 35, 25] };
    const rating = pickWeighted([1, 2, 3, 4, 5], monadicWeights[variant]);
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 1),
      value: { variant, response: rating as 1 | 2 | 3 | 4 | 5 },
      answered_at: new Date(startTime.getTime() + 20000).toISOString(),
    });

    // Q2: Single Choice — Tropical Burst slightly leads
    const scChoice = pickWeighted(
      ["sc_1", "sc_2", "sc_3", "sc_4", "sc_5", "none"],
      [28, 22, 18, 15, 12, 5]
    );
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 2),
      value: { selected: scChoice },
      answered_at: new Date(startTime.getTime() + 40000).toISOString(),
    });

    // Q3: Multiple Choice — Refreshing and Natural tasting dominate
    const mcWeights = [75, 62, 48, 35, 42, 55, 38, 28];
    const selected = q3Options
      .filter((_, j) => rand() * 100 < mcWeights[j])
      .map((o) => o.id);
    if (selected.length === 0) selected.push("mc_1");
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 3),
      value: { selected },
      answered_at: new Date(startTime.getTime() + 60000).toISOString(),
    });

    // Q4: Scaled Response (7-point) — Skewed positive (mean ~5.2)
    const scaledRating = pickWeighted([1, 2, 3, 4, 5, 6, 7], [2, 4, 8, 15, 25, 28, 18]);
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 4),
      value: { rating: scaledRating },
      answered_at: new Date(startTime.getTime() + 80000).toISOString(),
    });

    // Q5: Open Text
    const textResponse = openTextResponses[i % openTextResponses.length];
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 5),
      value: { text: textResponse },
      answered_at: new Date(startTime.getTime() + 120000).toISOString(),
    });

    // Q6: Ranking — Taste consistently #1, Price #2
    const baseOrder = ["rk_1", "rk_5", "rk_2", "rk_3", "rk_4"];
    const ranked = [...baseOrder];
    if (rand() > 0.6) {
      const swapIdx = Math.floor(rand() * 3) + 1;
      [ranked[swapIdx], ranked[swapIdx + 1]] = [ranked[swapIdx + 1], ranked[swapIdx]];
    }
    if (rand() > 0.8) {
      [ranked[0], ranked[1]] = [ranked[1], ranked[0]];
    }
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 6),
      value: { ranked },
      answered_at: new Date(startTime.getTime() + 150000).toISOString(),
    });

    // Q7: MaxDiff — "Made with real fruit" and "No added sugar" win
    const mdItemIds = maxDiffItems.map((o) => o.id);
    const sets: Array<{ items: string[]; best: string; worst: string }> = [];
    const shuffledItems = shuffle(mdItemIds);
    for (let s = 0; s < 8; s++) {
      const setItems: string[] = [];
      for (let k = 0; k < 4; k++) {
        setItems.push(shuffledItems[(s * 4 + k) % mdItemIds.length]);
      }
      const bestWeights = setItems.map((item) => {
        const idx = mdItemIds.indexOf(item);
        return [10, 9, 7, 6, 5, 4, 3, 3, 2, 1][idx] || 3;
      });
      const worstWeights = setItems.map((item) => {
        const idx = mdItemIds.indexOf(item);
        return [1, 2, 3, 3, 4, 5, 6, 7, 8, 10][idx] || 5;
      });
      const best = pickWeighted(setItems, bestWeights);
      const remaining = setItems.filter((x) => x !== best);
      const worstRemaining = remaining.map((item) => {
        const idx = setItems.indexOf(item);
        return worstWeights[idx];
      });
      const worst = pickWeighted(remaining, worstRemaining);
      sets.push({ items: setItems, best, worst });
    }
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 7),
      value: { sets },
      answered_at: new Date(startTime.getTime() + 200000).toISOString(),
    });

    // Q8: Anchored Pricing (Gabor-Granger)
    const pricePoints = [0.99, 1.29, 1.59, 1.89, 2.19];
    const priceResponses = pricePoints.map((price) => {
      const buyProb = Math.max(0, 95 - (price - 0.99) * 50 + (rand() * 20 - 10));
      return { price, wouldBuy: rand() * 100 < buyProb };
    });
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 8),
      value: { method: "gabor_granger" as const, responses: priceResponses },
      answered_at: new Date(startTime.getTime() + 240000).toISOString(),
    });

    // Q9: Implicit Association
    const attrs = [
      "Premium", "Natural", "Fun", "Healthy", "Refreshing",
      "Affordable", "Modern", "Trustworthy", "Bold", "Traditional",
    ];
    const fitProbs: Record<string, number> = {
      Premium: 45, Natural: 78, Fun: 65, Healthy: 72, Refreshing: 88,
      Affordable: 35, Modern: 70, Trustworthy: 55, Bold: 40, Traditional: 20,
    };
    const associations = attrs.map((attribute) => {
      const fits = rand() * 100 < (fitProbs[attribute] || 50);
      const baseRT = fits ? 420 : 520;
      const reactionTimeMs = Math.round(
        baseRT + rand() * 300 + (rand() > 0.95 ? 400 : 0)
      );
      return {
        attribute,
        response: (fits ? "fits" : "doesnt_fit") as "fits" | "doesnt_fit",
        reactionTimeMs,
      };
    });
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 9),
      value: { associations },
      answered_at: new Date(startTime.getTime() + 300000).toISOString(),
    });

    // Q10: Image Heatmap
    const clickCount = Math.floor(rand() * 3) + 1;
    const heatmapComments = [
      "The logo stands out",
      "Love the fruit imagery",
      "Price is visible here",
      "Nutrition info",
      "Bright colour catches my eye",
      "The flavour name",
      "Interesting texture",
      "Brand name area",
    ];
    const hotspots = [
      { x: 30, y: 20, weight: 0.4 },
      { x: 50, y: 50, weight: 0.35 },
      { x: 70, y: 30, weight: 0.25 },
    ];
    const clicks = Array.from({ length: clickCount }, () => {
      const spot = pickWeighted(hotspots, hotspots.map((h) => h.weight));
      return {
        x: Math.round(spot.x + (rand() - 0.5) * 20),
        y: Math.round(spot.y + (rand() - 0.5) * 15),
        comment: pick(heatmapComments),
      };
    });
    answers.push({
      id: uuid("a", answerIndex++),
      response_id: uuid("r", i),
      question_id: uuid("q", 10),
      value: { clicks },
      answered_at: new Date(startTime.getTime() + 340000).toISOString(),
    });
  }

  return { responses, answers };
}

const generated = generateResponses();

export const demoResponses: Response[] = generated.responses;
export const demoAnswers: Answer[] = generated.answers;

export function getDemoData() {
  return {
    project: demoProject,
    questions: demoQuestions,
    responses: demoResponses,
    answers: demoAnswers,
  };
}
