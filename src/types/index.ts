// ============================================================================
// Vypr — Shared TypeScript Types
// Matches the Supabase database schema
// ============================================================================

// --- Enums ---

export type ProjectStatus = "draft" | "live" | "closed";

export type QuestionType =
  | "multiple_choice"
  | "free_text"
  | "rating_scale"
  | "image_stimulus"
  | "video_stimulus"
  | "video_response"
  | "ranking";

export type AnalysisType =
  | "question_summary"
  | "project_summary"
  | "sentiment"
  | "themes"
  | "recommendations";

export type ChatRole = "user" | "assistant";

// --- Option / Config Types ---

export interface MultipleChoiceOption {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface RatingScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export type QuestionOptions = MultipleChoiceOption[] | RatingScaleConfig | null;

export interface QuestionSettings {
  randomizeOptions?: boolean;
  maxSelections?: number;
  [key: string]: unknown;
}

// --- Answer Value Types ---

export interface MultipleChoiceAnswer {
  selected: string[];
}

export interface FreeTextAnswer {
  text: string;
}

export interface RatingScaleAnswer {
  rating: number;
}

export interface VideoResponseAnswer {
  videoUrl: string;
}

export interface RankingAnswer {
  ranked: string[];
}

export type AnswerValue =
  | MultipleChoiceAnswer
  | FreeTextAnswer
  | RatingScaleAnswer
  | VideoResponseAnswer
  | RankingAnswer;

// --- Database Row Types ---

export interface Project {
  id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
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
  options: QuestionOptions;
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
  content: Record<string, unknown>;
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

// --- Insert Types (omit server-generated fields) ---

export type ProjectInsert = Pick<Project, "title"> &
  Partial<Pick<Project, "description" | "status">>;

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
