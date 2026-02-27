# Claude Code Prompt: FMCG Survey Builder POC

## Context

You are building a proof-of-concept (POC) web application for an FMCG consumer insights platform inspired by Vypr. The platform lets product developers, marketers, and category managers at food, drink, and consumer goods companies create rapid consumer research surveys grounded in behavioral science.

This POC should demonstrate a clean, professional survey builder where users can create projects containing one or more behaviorally-grounded question types.
---

## Page 2: New Project Flow

Route: `/projects/new`

### Step 1: Project Details

A simple form collecting:

- **Project name** (text input, required, max 80 characters)
- **Category** (dropdown: Food & Drink, Health & Beauty, Household, Alcohol, Pet Care, Other)
- **Description** (optional textarea, max 200 characters, placeholder: "Brief description of what you're testing")

Below the form, a clear **project mode selector** with two large cards side by side:

---

### Step 2: Project Mode Selection

Present two clickable cards with icons, titles, and descriptions:

**Card 1: Single Question**
- Icon: a single circle/target icon
- Title: "Single Question"
- Description: "Test one thing fast. Create a focused micro-survey with a single question type — ideal for quick validation of a name, concept, price point, or claim."
- Subtext: "Results typically in under 1 hour"

**Card 2: Multi-Question Survey**
- Icon: a stacked layers/list icon
- Title: "Multi-Question Survey"
- Description: "Build a structured survey with multiple question types. Combine different methodologies to explore a topic in depth — from screening to final selection."
- Subtext: "Recommended: 3–5 questions for optimal completion rates"

Both cards should have a subtle border, hover state (slight lift + border color change), and a selected state (colored border + checkmark). Only one can be selected at a time.

After selecting a mode and clicking "Continue", navigate to the Question Builder.

---

## Page 3: Question Builder

Route: `/projects/new/build`

This is the core of the POC. The layout depends on the selected project mode.

### Layout for Single Question Mode

1. **Question Type Picker** — a grid of 10 cards, one for each question type (described below)
2. **Question Configurator** — once a type is selected, show the configuration panel for that specific type
3. **Live Preview Panel** — a narrow right-side panel or bottom section showing how the question will appear to respondents

### Layout for Multi-Question Survey Mode

1. **Left sidebar: Question List** — a vertical list showing added questions with drag handles for reordering. Each item shows: question number, type icon, question text (truncated), and a delete button. A prominent "+ Add Question" button at the bottom.
2. **Center: Question Configurator** — shows the configuration for the currently selected question in the sidebar
3. **Right panel or overlay: Question Type Picker** — appears when "+ Add Question" is clicked, showing the grid of 10 types to choose from

For Multi-Question mode, include a **guidance banner** at the top:
> "Build your survey question by question. We recommend 3–5 questions for the best completion rates. Each question appears on its own screen to respondents, keeping responses fast and instinctive."

---

## The 10 Question Types

Each question type appears as a selectable card in the Question Type Picker. Every card shows:
- An icon (use Lucide icons)
- The type name
- A one-line description
- A "Best for" tag (e.g., "Best for: Concept testing")

When a type is selected, the Question Configurator panel shows fields specific to that type. All types share these common fields at the top:

### Common Fields (all types)

| Field | Type | Details |
|-------|------|---------|
| Question text | Text input | Required. Max 120 characters. Show character counter. Placeholder: "e.g., Would you buy this product?" |
| Description | Text area | Optional. Max 100 characters. Placeholder: "Additional context shown to respondents" |
| Image upload | File drop zone | Optional. Accepts JPG/PNG. Shows a placeholder thumbnail. Label: "Add a stimulus image (product photo, packaging, concept board)" |

Below the common fields, show **type-specific configuration**.

---

### Type 1: Monadic Split Test

**Card info:**
- Icon: `SplitSquareVertical` or `Columns`
- Name: "Monadic Split Test"
- Description: "Show each respondent ONE variant. Compare results across groups."
- Best for: "Concept testing, packaging A/B testing, naming"

**Guidance text shown in configurator:**
> "The gold standard for unbiased evaluation. Each respondent sees only one variant, eliminating comparison bias. This simulates how shoppers encounter products in real life — one at a time."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Number of variants | Selector: 2 or 3 | Default: 2. Label: "How many variants are you testing?" Help text: "Each variant is shown to a separate group of respondents" |
| Variant A label | Text input | Required. Max 40 chars. Placeholder: "e.g., Design A — Blue packaging" |
| Variant A image | File drop zone | Required. Label: "Upload Variant A image" |
| Variant B label | Text input | Required. Same constraints |
| Variant B image | File drop zone | Required |
| Variant C label | Text input | Only shown if 3 variants selected |
| Variant C image | File drop zone | Only shown if 3 variants selected |
| Response format | Toggle: "Yes / No" or "5-point purchase intent" | Default: Yes / No. Help text: "Binary Yes/No captures fast System 1 responses. The 5-point scale provides more granularity." |
| Sample per variant | Number input | Default: 200. Min: 100, Max: 500. Help text: "Minimum 150 per variant recommended for statistical significance" |

**Preview:** Show one variant card with the question text and the selected response format (either Yes/No buttons or a 5-point scale from "Definitely would buy" to "Definitely would not buy").

---

### Type 2: Single Choice

**Card info:**
- Icon: `CircleDot` or `CheckCircle`
- Name: "Single Choice"
- Description: "Pick one favourite from a short list."
- Best for: "Final preference selection, head-to-head"

**Guidance text:**
> "Forces genuine preference by limiting selection to one option. Always includes 'None of these' to prevent false positives. Keep options to 5 or fewer — research shows decision quality drops sharply above this."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Options | Dynamic list | Min: 2, Max: 5. Each option has: text input (max 60 chars) + optional image upload. "+ Add option" button shown until max reached. Drag to reorder. |
| Include "None of these" | Checkbox | Default: checked (ON). Label: "Include 'None of these' option". Help text: "Recommended. Prevents forced false preferences." |
| Randomize order | Checkbox | Default: checked (ON). Help text: "Randomizes option order for each respondent to prevent primacy bias" |

Show a counter: "2 of 5 options" that updates as options are added.

**Preview:** Show all options as radio buttons with images (if uploaded), plus the "None of these" option at the bottom (greyed, non-randomizable).

---

### Type 3: Multiple Choice

**Card info:**
- Icon: `CheckSquare` or `ListChecks`
- Name: "Multiple Choice"
- Description: "Select all that appeal from a longer list."
- Best for: "Early screening, feature exploration"

**Guidance text:**
> "Ideal for screening a longer list down to favourites. Respondents select all options that appeal to them. Limit to 10 options maximum — beyond this, respondents start scanning rather than evaluating."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Options | Dynamic list | Min: 4, Max: 10. Each option: text input (max 60 chars) + optional image. "+ Add option" button. |
| Selection limit | Optional number input | Label: "Maximum selections allowed (optional)". Placeholder: "Leave blank for unlimited". Min: 1, Max: total options minus 1. Help text: "Set a cap to force discrimination, e.g., 'Choose up to 3'" |
| Randomize order | Checkbox | Default: checked (ON) |

Show counter: "4 of 10 options".

**Preview:** Show all options as checkboxes with images.

---

### Type 4: Scaled Response

**Card info:**
- Icon: `SlidersHorizontal` or `Gauge`
- Name: "Scaled Response"
- Description: "Rate on a numbered scale (Likert or semantic differential)."
- Best for: "Concept evaluation, claims testing, brand tracking"

**Guidance text:**
> "Captures intensity of opinion on a labelled scale. 7-point scales are the empirically validated sweet spot — enough granularity to capture variance without overwhelming respondents. Every point should be labelled for consistent interpretation."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Scale type | Dropdown | Options: "Agreement (Strongly disagree → Strongly agree)", "Purchase intent (Definitely would not buy → Definitely would buy)", "Appeal (Not at all appealing → Extremely appealing)", "Custom labels" |
| Number of points | Selector: 5 or 7 | Default: 7. Help text: "7-point recommended for bipolar scales. 5-point for simple unipolar measures." |
| Custom labels | Conditional | Only shown if "Custom labels" selected. One text input per scale point, pre-populated with defaults based on point count. Max 30 chars per label. |
| Show midpoint label | Display | Automatically shown. For 7-point: "Neither agree nor disagree". For 5-point: "Neutral". |

**Preview:** Show a horizontal scale with all labels visible, the question text above, and the stimulus image (if any).

---

### Type 5: Open Text

**Card info:**
- Icon: `MessageSquareText` or `AlignLeft`
- Name: "Open Text"
- Description: "Free-form text with AI-powered sentiment analysis."
- Best for: "Capturing consumer language, concept diagnostics"

**Guidance text:**
> "Captures authentic consumer reactions in their own words. AI automatically classifies responses as Positive, Negative, or Neutral and surfaces key themes. Keep prompts open and non-leading — avoid 'Why?' questions, which trigger post-rationalisation."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Character minimum | Number input | Default: 20. Min: 10, Max: 100. Help text: "Prevents single-word throwaway responses" |
| Character maximum | Number input | Default: 500. Min: 100, Max: 1000. Help text: "500 chars recommended — long enough for substance, short enough to prevent over-rationalisation" |
| AI analysis | Checkboxes (all default ON) | "Sentiment classification (Positive / Negative / Neutral)", "Word cloud generation", "Theme extraction" |
| Prompt suggestions | Read-only help box | Show 3 example prompts: "What do you think about this product?", "How does this make you feel?", "What's your first reaction to this?" with a note: "Tip: Avoid 'Why?' questions — they trigger System 2 rationalisation rather than capturing instinctive reactions." |

**Preview:** Show a text area with character counter (e.g., "0 / 500") and the question text above.

---

### Type 6: Ranking

**Card info:**
- Icon: `ArrowUpDown` or `ListOrdered`
- Name: "Ranking"
- Description: "Drag items into preference order."
- Best for: "Short-list prioritisation, feature ordering"

**Guidance text:**
> "Forces respondents to make trade-offs by placing items in order. Limit to 7 items maximum — beyond this, people rank the top 2–3 carefully and guess the rest. For longer lists, use MaxDiff instead."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Items | Dynamic list | Min: 3, Max: 7. Each item: text input (max 60 chars) + optional image. "+ Add item" button. |
| Randomize starting order | Checkbox | Default: checked (ON). Help text: "Essential — respondents are biased toward keeping the initial order" |

Show counter: "3 of 7 items". If user tries to add an 8th, show a message: "For lists of 8+ items, MaxDiff produces more reliable data. Consider switching to MaxDiff."

**Preview:** Show items as a draggable list with grip handles and position numbers (1, 2, 3…).

---

### Type 7: MaxDiff (Best-Worst Scaling)

**Card info:**
- Icon: `ArrowLeftRight` or `Scale`
- Name: "MaxDiff"
- Description: "Pick the best and worst from rotating subsets. Reveals true priorities."
- Best for: "Claims testing, feature prioritisation, screening 10–30 items"

**Guidance text:**
> "The most powerful prioritisation method available. Respondents see small subsets of items and pick the best and worst in each set. This produces ratio-scaled preference scores without the 'everything is important' problem of rating scales. Ideal for testing 10–30 claims, features, or concepts."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Items | Dynamic list | Min: 6, Max: 30. Each item: text input (max 80 chars). "+ Add item" button. |
| Items per set | Selector: 4 or 5 | Default: 4. Help text: "How many items the respondent sees in each subset. 4 is standard. Never more than half the total items." Validation: if total items < 8 and user selects 5, show warning. |
| Number of sets per respondent | Auto-calculated display | Formula: `3 × (total items ÷ items per set)`, rounded up. Show as read-only: "Each respondent will answer X sets". Help text: "Each item appears 3–5 times across the sets for robust estimation" |
| Best label | Text input | Default: "Most appealing". Max 30 chars. |
| Worst label | Text input | Default: "Least appealing". Max 30 chars. |

Show counter: "6 of 30 items" and the auto-calculated set count.

**Preview:** Show one example set of 4 (or 5) items with "Most appealing" and "Least appealing" selection buttons on either side of each item.

---

### Type 8: Anchored Pricing

**Card info:**
- Icon: `PoundSterling` or `Banknote`
- Name: "Anchored Pricing"
- Description: "Iterative willingness-to-pay with reference product framing."
- Best for: "Launch pricing, price sensitivity, competitive benchmarking"

**Guidance text:**
> "Mimics real shopping by first showing a familiar reference product with its price (the anchor), then testing willingness to pay for your product. Prices are shown in random order to prevent starting-price bias. Based on Kahneman & Tversky's anchoring research."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Pricing method | Selector | Options: "Iterative (Gabor-Granger)" — default, "Price Sensitivity (Van Westendorp)". Help text for Gabor-Granger: "Tests specific price points to build a demand curve". Help text for Van Westendorp: "Four open questions identify the acceptable price range" |
| Currency | Dropdown | GBP (£), EUR (€), USD ($), AUD (A$). Default: GBP |

**Gabor-Granger specific fields (shown when selected):**

| Field | Type | Details |
|-------|------|---------|
| Reference product name | Text input | Optional. Max 60 chars. Placeholder: "e.g., Cadbury Dairy Milk 100g" |
| Reference product price | Currency input | Optional. Placeholder: "e.g., 1.50" |
| Reference product image | File drop zone | Optional |
| Test product name | Text input | Required. Max 60 chars |
| Test product image | File drop zone | Required |
| Price points | Exactly 5 currency inputs | Labels: "Price 1 (lowest)" through "Price 5 (highest)". Help text: "Use equal intervals. e.g., £1.00, £1.50, £2.00, £2.50, £3.00". Validation: each must be higher than the previous. |
| Randomize starting price | Checkbox | Default: checked (ON). Help text: "Starting price is randomised across Low / Mid / High to prevent anchoring bias on the first price shown" |

**Van Westendorp specific fields (shown when selected):**

| Field | Type | Details |
|-------|------|---------|
| Product name | Text input | Required. Max 60 chars |
| Product image | File drop zone | Required |
| Product description | Text area | Optional. Max 200 chars |

No price inputs needed — Van Westendorp uses four open-ended price questions that are fixed:
1. "At what price would this be so cheap you'd question the quality?"
2. "At what price would this be a bargain — great value for money?"
3. "At what price would this start to feel expensive?"
4. "At what price would this be too expensive to consider?"

Show these four questions as read-only preview text.

**Preview (Gabor-Granger):** Show reference product with price, then test product with one price point and Yes/No buttons.
**Preview (Van Westendorp):** Show product image with the first of the four price questions and a currency input field.

---

### Type 9: Implicit Association

**Card info:**
- Icon: `Zap` or `Timer`
- Name: "Implicit Association"
- Description: "Timed rapid-response test measuring subconscious associations."
- Best for: "Brand positioning, packaging testing, claims believability"

**Guidance text:**
> "Measures what consumers truly associate with your brand or product by capturing both direction (fits / doesn't fit) and speed of response. Fast responses (under 600ms) reveal genuine System 1 associations. Slow responses suggest conscious deliberation. Based on Kahneman's dual-process theory."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Stimulus type | Dropdown | "Brand logo", "Product packaging", "Concept image", "Advertising creative". This is informational only — all use an image upload. |
| Stimulus image | File drop zone | Required. Label: "Upload the stimulus respondents will react to" |
| Attributes | Dynamic list | Min: 8, Max: 15. Each: text input, max 20 chars. Pre-populated suggestions based on stimulus type. For "Brand logo": "Premium, Trustworthy, Modern, Natural, Fun, Healthy, Affordable, Traditional, Innovative, Bold". "+ Add attribute" button. |
| Response threshold | Read-only display | "Responses under 200ms are excluded (too fast). Responses over 800ms are flagged as System 2 deliberation." |
| Practice rounds | Number input | Default: 3. Min: 2, Max: 5. Help text: "Warm-up rounds to establish baseline reaction time" |

Show counter: "10 of 15 attributes".

**Preview:** Show the stimulus image centered, one attribute word below it, and two large buttons: "Fits ←" and "→ Doesn't fit" with a timer indicator.

---

### Type 10: Image Heatmap

**Card info:**
- Icon: `MousePointerClick` or `Focus`
- Name: "Image Heatmap"
- Description: "Click on image areas to show what grabs attention."
- Best for: "Packaging optimisation, ad creative testing"

**Guidance text:**
> "Reveals which visual elements draw attention and why. Respondents tap areas of the image and leave a brief comment. Aggregated clicks produce a heat map showing visual hotspots. A cost-effective proxy for eye-tracking — consumers evaluate packaging in 3–5 seconds, and the first fixation points determine purchase consideration."

**Type-specific fields:**

| Field | Type | Details |
|-------|------|---------|
| Image | File drop zone | Required. Min 1000px on longest axis. Label: "Upload the image to test (packaging, advertisement, shelf display)" |
| Click mode | Dropdown | "What draws your attention?" (default), "What do you like?", "What would you change?", "Custom prompt" |
| Custom click prompt | Text input | Only shown if "Custom prompt" selected. Max 80 chars. |
| Max clicks | Selector: 1, 2, 3, 4, 5 | Default: 3. Help text: "How many areas each respondent can highlight" |
| Require comment | Checkbox | Default: checked (ON). Help text: "Respondents must briefly explain each click — ensures clicks are meaningful" |

**Preview:** Show the uploaded image with a cursor indicator and instruction text matching the click mode.

---

## Survey Preview Page

Route: `/projects/new/preview`

After building questions, users can preview the full survey as respondents would see it:

- **Mobile frame mockup** — show questions inside a phone-shaped container (375px wide, centered)
- **One question per screen** with forward/back navigation arrows
- **Progress indicator** at top (dots or thin progress bar)
- For Multi-Question surveys, show all questions in sequence
- For Single Question, show just the one question
- Non-interactive (respondent can't actually answer) but visually accurate
- A "Back to Builder" button to return to editing

---

## Design System

### Colors
- **Primary:** `#1E40AF` (deep blue — trust, intelligence)
- **Primary hover:** `#1E3A8A`
- **Primary light:** `#DBEAFE` (backgrounds, selected states)
- **Surface:** `#FFFFFF`
- **Background:** `#F8FAFC`
- **Border:** `#E2E8F0`
- **Text primary:** `#0F172A`
- **Text secondary:** `#64748B`
- **Success:** `#059669`
- **Warning:** `#D97706`
- **Error:** `#DC2626`

### Typography
- **Font:** Inter (import from Google Fonts) with system-ui fallback
- **Headings:** font-semibold, tracking-tight
- **Body:** text-sm (14px) for form labels, text-base (16px) for body text
- **Guidance text:** text-sm, text-secondary, italic, with a left blue border (like a blockquote)

### Components
- **Cards:** bg-white, rounded-xl, border border-gray-200, shadow-sm, hover:shadow-md transition
- **Buttons:** rounded-lg, font-medium, px-4 py-2. Primary: bg-primary text-white. Secondary: bg-white border text-primary.
- **Inputs:** rounded-lg, border border-gray-300, focus:ring-2 focus:ring-primary/20 focus:border-primary
- **Badges:** rounded-full, px-3 py-1, text-xs, font-medium
- **Guidance blocks:** bg-blue-50, border-l-4 border-blue-400, p-4, rounded-r-lg, text-sm text-gray-700

### Spacing
- Page padding: px-8 py-6
- Card padding: p-6
- Form field gaps: space-y-4
- Section gaps: space-y-8

---

## Navigation Flow

```
Dashboard (/)
  └── New Project (/projects/new)
        ├── Step 1: Name + Category
        ├── Step 2: Single Question / Multi-Question
        └── Question Builder (/projects/new/build)
              ├── Select question type(s)
              ├── Configure each question
              └── Preview (/projects/new/preview)
```

Use a **step indicator** (breadcrumb or numbered stepper) at the top of the new project flow showing: "Details → Mode → Build → Preview" with the current step highlighted.

---

## State Management

Use React Context with useReducer for global project state:

```typescript
interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  mode: 'single' | 'multi';
  questions: Question[];
  createdAt: Date;
  status: 'draft' | 'complete';
}

interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  description: string;
  stimulusImage: string | null;
  config: QuestionConfig; // Union type — different shape per question type
  order: number;
}

type QuestionType =
  | 'monadic_split'
  | 'single_choice'
  | 'multiple_choice'
  | 'scaled_response'
  | 'open_text'
  | 'ranking'
  | 'maxdiff'
  | 'anchored_pricing'
  | 'implicit_association'
  | 'image_heatmap';
```

Define a specific config interface for each of the 10 question types. For example:

```typescript
interface MonadicSplitConfig {
  variantCount: 2 | 3;
  variants: Array<{
    label: string;
    image: string | null;
  }>;
  responseFormat: 'binary' | 'five_point';
  samplePerVariant: number;
}

interface SingleChoiceConfig {
  options: Array<{
    text: string;
    image: string | null;
  }>;
  includeNone: boolean;
  randomize: boolean;
}

interface MaxDiffConfig {
  items: Array<{ text: string }>;
  itemsPerSet: 4 | 5;
  setsPerRespondent: number; // auto-calculated
  bestLabel: string;
  worstLabel: string;
}

// ... define for all 10 types
```

---

## Key Implementation Notes

1. **Validation:** Enforce all parameter limits as hard constraints in the UI. If a field has a max (e.g., 5 options for single choice, 7 items for ranking, 120 chars for question text), disable the "add" button or show an inline error when the limit is reached. Don't just warn — prevent.

2. **Character counters:** Show live character counts on all text inputs with limits. Format as "42 / 120" and change color to warning when within 10 of the limit, error when at the limit.

3. **Auto-calculation for MaxDiff:** The "Number of sets per respondent" field should auto-update whenever total items or items-per-set changes. Formula: `Math.ceil(3 * (totalItems / itemsPerSet))`.

4. **Conditional fields:** Several question types have fields that appear/disappear based on selections (e.g., Variant C fields in Monadic Split, custom labels in Scaled Response, Gabor-Granger vs Van Westendorp fields in Pricing). Use smooth transitions (height animation or fade) when showing/hiding.

5. **Image handling:** Since this is a POC with no backend, handle image uploads as data URLs stored in state. Show thumbnails in the configurator and full images in the preview.

6. **Drag and drop:** For the Multi-Question sidebar (reordering questions) and the Ranking preview, implement basic drag-and-drop. A simple implementation using HTML5 drag events or pointer events is fine — no need for a library.

7. **Responsive but desktop-first:** The builder itself should work well at 1280px+ width. The survey preview mockup inside the builder should be shown in a mobile frame (375px wide) to demonstrate the respondent experience.

8. **Guided experience:** Every question type should feel self-explanatory. Use guidance text blocks, help text on fields, smart defaults, and inline suggestions so a first-time user can configure a question without external documentation.

9. **File structure:**

```
src/
  components/
    layout/         — Header, Stepper, PageContainer
    dashboard/      — ProjectCard, ProjectList
    project/        — ProjectForm, ModeSelector
    builder/        — QuestionTypePicker, QuestionConfigurator, QuestionList
    questions/      — One component per question type (MonadicSplitForm, SingleChoiceForm, etc.)
    preview/        — SurveyPreview, QuestionPreviewRenderer
    ui/             — Button, Input, Select, Textarea, Card, Badge, FileUpload, CharCounter, GuidanceBlock
  context/          — ProjectContext.tsx
  types/            — index.ts (all TypeScript interfaces)
  data/             — seedProjects.ts, questionTypeDefinitions.ts
  pages/            — Dashboard, NewProject, Builder, Preview
  App.tsx
  main.tsx
```

10. **Question type definitions data file:** Create a `questionTypeDefinitions.ts` that contains the metadata for all 10 types (name, icon, description, bestFor, guidanceText) so the Question Type Picker can render directly from this data without hardcoding in JSX.

# Send Survey

The flow should end with the user having an option to send the survey to respondents. This should generate a URL where the survey can be compeleted by users (no edit options etc.) and responses should be collated in the backend, using the Supabase setup we've created.
