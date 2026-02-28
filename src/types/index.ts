// ============================================================================
// Vypr — Shared TypeScript Types
// Matches the Supabase database schema + Results Viewer types
// ============================================================================

// --- Enums ---

export type ProjectStatus = "draft" | "live" | "closed";

export type DistributionMethod = "url" | "vypr_panel" | "ai_panel";

export type QuestionType =
  | "monadic_split"
  | "single_choice"
  | "multiple_choice"
  | "scaled_response"
  | "open_text"
  | "ranking"
  | "maxdiff"
  | "anchored_pricing"
  | "implicit_association"
  | "image_heatmap";

export type AnalysisType =
  | "question_summary"
  | "project_summary"
  | "sentiment"
  | "themes"
  | "recommendations";

export type ChatRole = "user" | "assistant";

// --- Option / Config Types ---

export interface ChoiceOption {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface QuestionSettings {
  randomizeOptions?: boolean;
  maxSelections?: number;
  includeNone?: boolean;
  scaleType?: string;
  scalePoints?: 5 | 7;
  scaleLabels?: string[];
  charMin?: number;
  charMax?: number;
  variantCount?: 2 | 3;
  responseFormat?: "binary" | "five_point";
  samplePerVariant?: number;
  pricingMethod?: "gabor_granger" | "van_westendorp";
  currency?: string;
  pricePoints?: number[];
  referenceProduct?: { name: string; price: number; imageUrl?: string };
  stimulusType?: string;
  attributes?: string[];
  practiceRounds?: number;
  clickMode?: string;
  maxClicks?: number;
  requireComment?: boolean;
  bestLabel?: string;
  worstLabel?: string;
  itemsPerSet?: 4 | 5;
  [key: string]: unknown;
}

// --- Answer Value Types (per question type) ---

export interface MonadicSplitAnswer {
  variant: "a" | "b" | "c";
  response: "yes" | "no" | 1 | 2 | 3 | 4 | 5;
}

export interface SingleChoiceAnswer {
  selected: string;
}

export interface MultipleChoiceAnswer {
  selected: string[];
}

export interface ScaledResponseAnswer {
  rating: number;
}

export interface OpenTextAnswer {
  text: string;
}

export interface RankingAnswer {
  ranked: string[];
}

export interface MaxDiffAnswer {
  sets: Array<{ items: string[]; best: string; worst: string }>;
}

export interface GaborGrangerAnswer {
  method: "gabor_granger";
  responses: Array<{ price: number; wouldBuy: boolean }>;
}

export interface VanWestendorpAnswer {
  method: "van_westendorp";
  tooCheap: number;
  bargain: number;
  expensive: number;
  tooExpensive: number;
}

export type AnchoredPricingAnswer = GaborGrangerAnswer | VanWestendorpAnswer;

export interface ImplicitAssociationAnswer {
  associations: Array<{
    attribute: string;
    response: "fits" | "doesnt_fit";
    reactionTimeMs: number;
  }>;
}

export interface ImageHeatmapAnswer {
  clicks: Array<{ x: number; y: number; comment?: string }>;
}

export type AnswerValue =
  | MonadicSplitAnswer
  | SingleChoiceAnswer
  | MultipleChoiceAnswer
  | ScaledResponseAnswer
  | OpenTextAnswer
  | RankingAnswer
  | MaxDiffAnswer
  | AnchoredPricingAnswer
  | ImplicitAssociationAnswer
  | ImageHeatmapAnswer;

// --- Database Row Types ---

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category?: string;
  status: ProjectStatus;
  distribution_method?: DistributionMethod;
  published_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  project_id: string;
  type: QuestionType;
  title: string;
  description: string | null;
  options: ChoiceOption[] | null;
  media_url: string | null;
  required: boolean;
  order_index: number;
  settings: QuestionSettings | null;
  created_at: string;
}

export interface Response {
  id: string;
  project_id: string;
  respondent_id: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  value: AnswerValue;
  answered_at: string;
}

export interface AiAnalysis {
  id: string;
  project_id: string;
  question_id: string | null;
  analysis_type: AnalysisType;
  content: QuestionAnalysis | ProjectAnalysis | Record<string, unknown>;
  response_count_at_generation: number;
  model: string;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  project_id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

// --- AI Analysis Structured Output Types ---

export interface QuestionAnalysis {
  headline: string;
  summary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    interpretation: string;
  }>;
  sentiment?: "positive" | "negative" | "mixed" | "neutral";
  themes?: string[];
  sentimentBreakdown?: {
    positive: number;
    negative: number;
    neutral: number;
    responses: Array<{
      text: string;
      sentiment: "positive" | "negative" | "neutral";
      themes: string[];
    }>;
  };
  recommendation: string;
  confidenceNote: string;
}

export interface ProjectAnalysis {
  executiveSummary: string;
  keyThemes: Array<{
    theme: string;
    evidence: string;
  }>;
  sentimentOverview: {
    overall: "positive" | "negative" | "mixed" | "neutral";
    summary: string;
  };
  notableInsights: Array<{
    insight: string;
    significance: string;
  }>;
  recommendations: Array<{
    recommendation: string;
    priority: "high" | "medium" | "low";
    basedOn: string;
  }>;
  methodologyNote: string;
}

// --- Insert Types ---

export type ProjectInsert = Pick<Project, "title"> &
  Partial<Pick<Project, "description" | "status" | "category">>;

export type QuestionInsert = Omit<Question, "id" | "created_at">;

export type ResponseInsert = Pick<Response, "project_id" | "respondent_id"> &
  Partial<Pick<Response, "started_at">>;

export type AnswerInsert = Pick<Answer, "response_id" | "question_id" | "value">;

export type AiAnalysisInsert = Omit<AiAnalysis, "id" | "created_at">;

export type AiChatMessageInsert = Pick<
  AiChatMessage,
  "project_id" | "role" | "content"
>;

// --- API Request/Response Types ---

export interface ApiError {
  error: string;
  details?: string;
}

export interface PublishResponse {
  project: Project;
  surveyUrl: string;
}

export interface AiAssistRequest {
  projectId: string;
  message: string;
  context?: {
    title?: string;
    description?: string;
    questions?: Question[];
  };
}

export interface AiAssistResponse {
  reply: string;
  messageId: string;
}

export interface AiAnalyzeRequest {
  projectId: string;
  questionId?: string;
  analysisType: AnalysisType;
}

export interface AiAnalyzeResponse {
  analysis: AiAnalysis;
}

// --- Aggregation Result Types ---

export interface MonadicSplitAggregation {
  variants: Array<{
    key: string;
    label: string;
    sampleSize: number;
    yesPercent?: number;
    distribution?: Record<number, number>;
    top2Box?: number;
  }>;
  responseFormat: "binary" | "five_point";
  totalResponses: number;
  winnerKey: string;
}

export interface SingleChoiceAggregation {
  options: Array<{
    id: string;
    label: string;
    count: number;
    percent: number;
  }>;
  totalResponses: number;
  noneCount: number;
  nonePercent: number;
  clearWinner: boolean;
  closeContest: boolean;
}

export interface MultipleChoiceAggregation {
  options: Array<{
    id: string;
    label: string;
    count: number;
    percent: number;
  }>;
  totalResponses: number;
  avgSelectionsPerRespondent: number;
  cutLineIndex: number | null;
}

export interface ScaledResponseAggregation {
  distribution: Array<{ point: number; label: string; count: number; percent: number }>;
  mean: number;
  stdDev: number;
  scaleMax: number;
  top2Box: number;
  bottom2Box: number;
  netScore: number;
  totalResponses: number;
}

export interface OpenTextAggregation {
  totalResponses: number;
  avgLength: number;
  responses: Array<{ text: string; respondentId?: string; answeredAt: string }>;
}

export interface RankingAggregation {
  items: Array<{
    id: string;
    label: string;
    avgRank: number;
    stdDev: number;
    firstPlacePercent: number;
    rankFrequency: Record<number, number>;
  }>;
  totalResponses: number;
  consensusLevel: "high" | "medium" | "low";
}

export interface MaxDiffAggregation {
  items: Array<{
    id: string;
    label: string;
    bestCount: number;
    worstCount: number;
    shownCount: number;
    utility: number;
    preferenceShare: number;
  }>;
  totalSets: number;
  totalResponses: number;
}

export interface GaborGrangerAggregation {
  pricePoints: Array<{
    price: number;
    wouldBuyPercent: number;
    revenueIndex: number;
  }>;
  optimalPrice: number;
  priceCeiling: number;
  totalResponses: number;
  currency: string;
}

export interface VanWestendorpAggregation {
  priceRange: number[];
  curves: {
    tooCheap: Array<{ price: number; cumPercent: number }>;
    bargain: Array<{ price: number; cumPercent: number }>;
    expensive: Array<{ price: number; cumPercent: number }>;
    tooExpensive: Array<{ price: number; cumPercent: number }>;
  };
  opp: number;
  idp: number;
  pmc: number;
  pme: number;
  totalResponses: number;
  currency: string;
}

export interface ImplicitAssociationAggregation {
  attributes: Array<{
    attribute: string;
    fitsPercent: number;
    doesntFitPercent: number;
    avgReactionTimeMs: number;
    totalResponses: number;
  }>;
  avgReactionTimeMs: number;
  excludedTooFast: number;
  flaggedTooSlow: number;
  totalResponses: number;
}

export interface ImageHeatmapAggregation {
  clicks: Array<{ x: number; y: number; comment?: string }>;
  totalClicks: number;
  avgClicksPerRespondent: number;
  totalResponses: number;
  imageUrl: string | null;
}
