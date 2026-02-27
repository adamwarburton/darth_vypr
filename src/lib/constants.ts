export const APP_NAME = "Vypr";

export const APP_DESCRIPTION =
  "AI-native insights platform for consumer research and surveys";

export const QUESTION_TYPE_LABELS: Record<string, string> = {
  monadic_split: "Monadic Split Test",
  single_choice: "Single Choice",
  multiple_choice: "Multiple Choice",
  scaled_response: "Scaled Response",
  open_text: "Open Text",
  ranking: "Ranking",
  maxdiff: "MaxDiff",
  anchored_pricing: "Anchored Pricing",
  implicit_association: "Implicit Association",
  image_heatmap: "Image Heatmap",
};

export const QUESTION_TYPE_ICONS: Record<string, string> = {
  monadic_split: "Columns",
  single_choice: "CircleDot",
  multiple_choice: "ListChecks",
  scaled_response: "SlidersHorizontal",
  open_text: "MessageSquareText",
  ranking: "ArrowUpDown",
  maxdiff: "Scale",
  anchored_pricing: "PoundSterling",
  implicit_association: "Zap",
  image_heatmap: "MousePointerClick",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  live: "Live",
  closed: "Closed",
};

export const CHART_THEME = {
  colors: {
    primary: "#1E40AF",
    primaryLight: "#3B82F6",
    positive: "#059669",
    negative: "#DC2626",
    neutral: "#94A3B8",
    warning: "#D97706",
    scale5: ["#DC2626", "#F59E0B", "#94A3B8", "#34D399", "#059669"],
    scale7: ["#DC2626", "#EF4444", "#F59E0B", "#94A3B8", "#34D399", "#10B981", "#059669"],
  },
  font: "Inter, system-ui, sans-serif",
  fontSize: {
    tick: 12,
    label: 14,
    title: 16,
  },
};
