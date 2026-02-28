import type { SurveyQuestion } from "@/components/survey-builder/question-list";

interface DemoProject {
  title: string;
  questions: SurveyQuestion[];
}

const DEMO_PROJECT_DATA: Record<string, DemoProject> = {
  "proj-1": {
    title: "Snack Bar Flavour Preferences UK 2025",
    questions: [
      { id: "q1", type: "multiple_choice", title: "Which of these snack bar flavours would you be most likely to purchase?", required: true },
      { id: "q2", type: "rating_scale", title: "How appealing is the concept of a high-protein snack bar with plant-based ingredients?", required: true },
      { id: "q3", type: "image_stimulus", title: "Looking at the packaging design below, what are your first impressions?", required: true },
      { id: "q4", type: "free_text", title: "What would make you choose this product over your current go-to snack?", required: false },
      { id: "q5", type: "ranking", title: "Rank the following product attributes in order of importance to you.", required: true },
      { id: "q6", type: "multiple_choice", title: "Which snacking occasions would you consider this product for?", required: true },
      { id: "q7", type: "rating_scale", title: "How likely are you to recommend this product to a friend or family member?", required: true },
      { id: "q8", type: "free_text", title: "What flavour combinations would you like to see in future?", required: false },
      { id: "q9", type: "multiple_choice", title: "Where would you expect to find this product on the shelf?", required: true },
      { id: "q10", type: "rating_scale", title: "How does this product compare to your current favourite snack bar?", required: true },
      { id: "q11", type: "multiple_choice", title: "What pack size would you prefer for this product?", required: true },
      { id: "q12", type: "free_text", title: "Any other comments or suggestions about this product concept?", required: false },
    ],
  },
  "proj-2": {
    title: "Plant-Based Packaging Perception Study",
    questions: [
      { id: "q1", type: "image_stimulus", title: "Looking at this plant-based packaging, how does it compare to traditional plastic packaging?", required: true },
      { id: "q2", type: "rating_scale", title: "How important is sustainable packaging when making purchasing decisions?", required: true },
      { id: "q3", type: "multiple_choice", title: "Which of these sustainable packaging materials are you aware of?", required: true },
      { id: "q4", type: "ranking", title: "Rank these packaging attributes by importance to you.", required: true },
      { id: "q5", type: "free_text", title: "What concerns, if any, do you have about plant-based packaging?", required: false },
      { id: "q6", type: "rating_scale", title: "How much more would you pay for a product in plant-based packaging?", required: true },
      { id: "q7", type: "multiple_choice", title: "Which product categories should prioritise sustainable packaging?", required: true },
      { id: "q8", type: "free_text", title: "Describe your ideal sustainable packaging solution.", required: false },
    ],
  },
  "proj-3": {
    title: "Premium Ready Meals Concept Test",
    questions: [
      { id: "q1", type: "image_stimulus", title: "Based on this packaging, how premium does this ready meal look?", required: true },
      { id: "q2", type: "rating_scale", title: "How appealing is the concept of a chef-designed premium ready meal?", required: true },
      { id: "q3", type: "multiple_choice", title: "Which cuisines would you like to see in a premium ready meal range?", required: true },
      { id: "q4", type: "ranking", title: "Rank the following factors when choosing a premium ready meal.", required: true },
      { id: "q5", type: "free_text", title: "What does 'premium' mean to you in the context of ready meals?", required: true },
      { id: "q6", type: "multiple_choice", title: "How often do you purchase ready meals?", required: true },
      { id: "q7", type: "rating_scale", title: "How much would you expect to pay for a premium ready meal?", required: true },
      { id: "q8", type: "multiple_choice", title: "Where do you typically buy ready meals?", required: true },
      { id: "q9", type: "image_stimulus", title: "Which of these portion sizes looks most appropriate?", required: true },
      { id: "q10", type: "free_text", title: "What ingredients do you expect in a premium ready meal?", required: false },
      { id: "q11", type: "rating_scale", title: "How likely are you to try this product at the suggested price?", required: true },
      { id: "q12", type: "multiple_choice", title: "Which meal occasions would you use this product for?", required: true },
      { id: "q13", type: "ranking", title: "Rank these nutritional claims by importance.", required: true },
      { id: "q14", type: "multiple_choice", title: "What dietary requirements should the range cater for?", required: false },
      { id: "q15", type: "free_text", title: "Any final thoughts on this premium ready meal concept?", required: false },
    ],
  },
  "proj-4": {
    title: "Energy Drink Brand Repositioning",
    questions: [
      { id: "q1", type: "multiple_choice", title: "Which energy drink brands do you currently consume?", required: true },
      { id: "q2", type: "rating_scale", title: "How well does this brand currently align with health and wellness values?", required: true },
      { id: "q3", type: "image_stimulus", title: "Looking at the new packaging design, what is your immediate reaction?", required: true },
      { id: "q4", type: "free_text", title: "What health-related claims would make you more likely to purchase an energy drink?", required: true },
      { id: "q5", type: "ranking", title: "Rank these brand values in order of importance to you.", required: true },
      { id: "q6", type: "multiple_choice", title: "When do you typically consume energy drinks?", required: true },
      { id: "q7", type: "rating_scale", title: "How likely are you to switch to a healthier energy drink brand?", required: true },
      { id: "q8", type: "free_text", title: "What does a 'healthy energy drink' look like to you?", required: false },
      { id: "q9", type: "multiple_choice", title: "Which of these new ingredients appeal to you?", required: true },
      { id: "q10", type: "rating_scale", title: "How does the new positioning affect your purchase intent?", required: true },
    ],
  },
  "proj-5": {
    title: "Cereal Aisle Shelf Impact Analysis",
    questions: [
      { id: "q1", type: "image_stimulus", title: "Looking at this shelf layout, which product catches your eye first?", required: true },
      { id: "q2", type: "rating_scale", title: "How visually appealing is this packaging compared to competitors?", required: true },
      { id: "q3", type: "multiple_choice", title: "Which elements of the packaging stand out to you?", required: true },
      { id: "q4", type: "image_stimulus", title: "Compare these two packaging designs — which would you pick up?", required: true },
      { id: "q5", type: "ranking", title: "Rank these packaging elements by how much they influence your purchase.", required: true },
      { id: "q6", type: "free_text", title: "Describe what you notice first when browsing the cereal aisle.", required: false },
      { id: "q7", type: "rating_scale", title: "How likely are you to purchase this product based on packaging alone?", required: true },
      { id: "q8", type: "multiple_choice", title: "Which shelf position do you typically look at first?", required: true },
      { id: "q9", type: "free_text", title: "What would make this packaging more impactful on shelf?", required: false },
    ],
  },
  "proj-6": {
    title: "Dairy Alternative Taste Preference",
    questions: [
      { id: "q1", type: "multiple_choice", title: "Which dairy alternative milks have you tried in the past 3 months?", required: true },
      { id: "q2", type: "rating_scale", title: "How satisfied are you with the taste of your current dairy alternative?", required: true },
      { id: "q3", type: "ranking", title: "Rank these dairy alternatives by taste preference.", required: true },
      { id: "q4", type: "free_text", title: "What taste improvements would you like to see in dairy alternatives?", required: false },
      { id: "q5", type: "multiple_choice", title: "What do you primarily use dairy alternative milk for?", required: true },
      { id: "q6", type: "rating_scale", title: "How important is taste vs. nutritional value when choosing a dairy alternative?", required: true },
    ],
  },
};

export function getDemoProjectData(projectId: string): DemoProject | null {
  return DEMO_PROJECT_DATA[projectId] ?? null;
}
