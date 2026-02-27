# Claude Code Prompt: Results Viewer & AI Analysis Layer

## Project Context

You are working on **Viper**, a proof-of-concept FMCG consumer insights platform. The codebase already exists in the main branch with a working survey builder and public survey submission flow. This prompt covers the **results viewer** — the page users see when they click into a project from the dashboard, showing live response data and AI-powered analysis.

### Tech Stack (already configured)

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui component library
- **Database:** Supabase (Postgres + Realtime subscriptions + Storage)
- **AI:** Anthropic Claude API (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- **Hosting:** Vercel
- **Package Manager:** pnpm

### Existing Database Tables

These tables already exist in Supabase. Reference them — do not recreate them:

- `projects` — id (uuid), title, description, category, status (`draft`/`live`/`closed`), published_at, closed_at, created_at, updated_at
- `questions` — id, project_id (FK), type, title, description, options (jsonb), media_url, required, order_index, settings (jsonb), created_at
- `responses` — id, project_id (FK), respondent_id, started_at, completed_at, created_at
- `answers` — id, response_id (FK), question_id (FK), value (jsonb), answered_at

### Existing Question Types

The `questions.type` field contains one of these 10 values:

1. `monadic_split` — Monadic Split Test (A/B/C variant testing, each respondent sees one variant)
2. `single_choice` — Single Choice (pick one from up to 5 options + "None of these")
3. `multiple_choice` — Multiple Choice (select all that appeal from up to 10 options)
4. `scaled_response` — Scaled Response (5 or 7-point Likert/semantic scale)
5. `open_text` — Open Text (free-form text responses)
6. `ranking` — Ranking (drag items into preference order, 3–7 items)
7. `maxdiff` — MaxDiff/Best-Worst Scaling (pick best and worst from rotating subsets of 6–30 items)
8. `anchored_pricing` — Anchored Pricing (Gabor-Granger iterative pricing OR Van Westendorp price sensitivity)
9. `implicit_association` — Implicit Association (timed rapid-response, measuring subconscious associations)
10. `image_heatmap` — Image Heatmap (click on image areas to show what grabs attention)

### Answer Value Structures

Each question type stores answers in `answers.value` (jsonb) with a different shape. Here is the exact structure for each:

```typescript
// monadic_split
{ variant: "a" | "b" | "c", response: "yes" | "no" }
// OR for 5-point purchase intent:
{ variant: "a" | "b" | "c", response: 1 | 2 | 3 | 4 | 5 }

// single_choice
{ selected: string } // option id, or "none"

// multiple_choice
{ selected: string[] } // array of option ids

// scaled_response
{ rating: number } // e.g., 1–7 or 1–5

// open_text
{ text: string }

// ranking
{ ranked: string[] } // ordered array of item ids, first = most preferred

// maxdiff
{ sets: Array<{ items: string[], best: string, worst: string }> }

// anchored_pricing (Gabor-Granger)
{ method: "gabor_granger", responses: Array<{ price: number, wouldBuy: boolean }> }
// anchored_pricing (Van Westendorp)
{ method: "van_westendorp", tooCheap: number, bargain: number, expensive: number, tooExpensive: number }

// implicit_association
{ associations: Array<{ attribute: string, response: "fits" | "doesnt_fit", reactionTimeMs: number }> }

// image_heatmap
{ clicks: Array<{ x: number, y: number, comment?: string }> }
```

### Design System (already established)

Maintain consistency with the existing design system:

- **Primary:** `#1E40AF` (deep blue)
- **Primary hover:** `#1E3A8A`
- **Primary light:** `#DBEAFE`
- **Background:** `#F8FAFC`
- **Surface:** `#FFFFFF`
- **Border:** `#E2E8F0`
- **Text primary:** `#0F172A`
- **Text secondary:** `#64748B`
- **Success:** `#059669`
- **Warning:** `#D97706`
- **Error:** `#DC2626`
- **Font:** Inter with system-ui fallback
- **Cards:** bg-white, rounded-xl, border border-gray-200, shadow-sm
- **Guidance blocks:** bg-blue-50, border-l-4 border-blue-400, p-4, rounded-r-lg

---

## What To Build

### 1. Updated Dashboard (`/`)

The dashboard already shows projects as cards. Update it so that each project card displays:

- Project title
- Category badge
- **Status badge** — visually distinct for each state:
  - `draft` — grey badge, "Draft"
  - `live` — green badge with a subtle pulse animation dot, "Live"
  - `closed` — slate badge, "Closed"
- **Response count** — e.g., "47 responses". For live projects, this should update in real time via Supabase Realtime subscription on the `responses` table.
- **Completion rate** — percentage of responses where `completed_at` is not null.
- Created date in relative format (e.g., "2 days ago").
- Clicking a `draft` project goes to `/projects/[id]/edit`.
- Clicking a `live` or `closed` project goes to `/projects/[id]` (the results view).

Add a **"Close Project"** action on live project cards (a small button or dropdown menu) that sets `status` to `closed` and `closed_at` to now.

---

### 2. Results View — Page Structure

**Route:** `/projects/[projectId]`

This is the centerpiece of this prompt. The page has a clear, information-dense layout:

#### Header Section

- **Project title** (large heading)
- **Status badge** (live/closed) — same style as dashboard
- **Category badge**
- **Key metrics row** — four stat cards displayed horizontally:
  1. **Total Responses** — count of all response rows for this project. Show a live counter for live projects.
  2. **Completed** — count where `completed_at` is not null, plus percentage.
  3. **Average Completion Time** — calculated from `started_at` to `completed_at`.
  4. **Response Rate** — a sparkline or mini bar chart showing responses over time (responses per hour or per day depending on project age).
- **Action buttons:**
  - "Share Survey" — shows the public survey URL with a copy button (only for live projects)
  - "Re-run AI Analysis" — triggers fresh AI analysis across all questions and at the project level
  - "Close Project" — (only for live projects) stops accepting responses
  - "Export Data" — downloads all response data as CSV (stretch goal — implement if time allows, otherwise show as disabled with "Coming soon" tooltip)

#### Navigation Tabs

Below the header, two tabs:

1. **"Results"** (default) — shows per-question results with AI analysis
2. **"AI Summary"** — shows the project-level macro AI analysis

#### Results Tab Content

Display each question in a vertical stack, one card per question, in order. Each question card contains:

1. **Question header** — question number, type icon and label (e.g., "Q1 · Single Choice"), the question text
2. **Visualization** — the appropriate chart or visual for that question type (detailed below)
3. **Raw data summary** — response count for this question, any relevant breakdown
4. **AI Analysis Panel** — a clearly demarcated section within the card showing the AI's interpretation

#### AI Summary Tab Content

A full-page AI-generated analysis covering the entire project. This should feel like reading an analyst's report. Structure:

- **Executive Summary** — 2–3 sentence overview of the most important findings
- **Key Themes** — the 3–5 dominant patterns across all questions
- **Sentiment Overview** — overall sentiment with breakdown
- **Notable Insights** — surprising findings, divergent opinions, segments
- **Recommendations** — actionable next steps based on the data
- **Methodology Note** — brief note on sample size and confidence

---

### 3. Per-Question Visualizations

For each of the 10 question types, implement a specific visualization component. Use **Recharts** (`recharts` — install it) for charts. For text-based visualizations, build custom components.

---

#### 3.1 Monadic Split Test — `MonadicSplitResults`

**Visualization:**
- A **grouped bar chart** showing each variant side by side.
- If binary (yes/no): show % who said "Yes" for each variant, with the bar color intensity reflecting the value. Include the "No" as a lighter portion of the bar (stacked 100% bar chart).
- If 5-point purchase intent: show a **stacked horizontal bar chart** per variant. Each bar is divided into 5 segments (one per scale point) colored from red (1 — definitely would not buy) through amber (3 — neutral) to green (5 — definitely would buy). Show the "Top 2 Box" score (% who selected 4 or 5) prominently as a large number next to each variant.
- Show **sample sizes per variant** (n=X) beside each bar.
- If there are variant images, show small thumbnails next to the variant labels.

**Key metrics to display:**
- Winner indicator — highlight the leading variant with a subtle crown or star icon and "Leading" badge.
- Statistical significance note — show "Statistically significant difference" if the gap between variants exceeds a basic threshold (use a simple chi-squared approximation or just flag if the difference exceeds 5 percentage points with n>50 per variant). If not significant: "Difference not statistically significant — consider increasing sample size."
- Sample size per variant.

**AI Analysis for this question type should cover:**
- Which variant performs best and by what margin.
- Whether the difference is meaningful or within noise.
- If 5-point scale: analysis of the distribution shape (is sentiment polarized, clustered at neutral, etc.).
- Recommendation on which variant to proceed with or if more testing is needed.

---

#### 3.2 Single Choice — `SingleChoiceResults`

**Visualization:**
- A **horizontal bar chart** ranked from most to least selected. Each bar shows the option label, the count, and the percentage. If options have images, show thumbnails to the left of the label.
- The winning option's bar should be in the primary color; others in a lighter shade.
- If "None of these" was included and it has a significant share (>15%), highlight it with a warning color and an annotation.

**Key metrics:**
- **Clear winner?** — if the top option has >40% share, label it as "Clear preference". If the top two are within 5%, label as "Close contest".
- **"None of these" share** — prominently shown if it exceeds 10% (this is a critical signal in FMCG research).
- Total respondents.

**AI Analysis should cover:**
- The strength and clarity of the preference.
- Whether "None of these" is a concern and what it might indicate.
- Any notable clustering (e.g., "Options A and B together captured 78% of preference").
- What the result suggests for decision-making.

---

#### 3.3 Multiple Choice — `MultipleChoiceResults`

**Visualization:**
- A **horizontal bar chart** ranked by selection frequency. Each bar shows count and percentage (percentage = respondents who selected this / total respondents).
- Since respondents can select multiple options, percentages can exceed 100% in total. Show a note: "Respondents could select multiple options. Percentages reflect the proportion who selected each."
- If options have images, show thumbnails.
- Highlight a "cut line" — draw a dashed horizontal line between options that have substantially different selection rates (e.g., if there's a gap of >15% between consecutive options when ranked).

**Key metrics:**
- **Average selections per respondent** — mean number of options chosen.
- **Top 3 options** — call these out prominently.
- Total respondents.

**AI Analysis should cover:**
- Which options emerged as favourites and whether there's a natural tier structure (clear winners, middle tier, underperformers).
- Average engagement level (many selections = hard to choose, few = clear standouts).
- Which options could be safely eliminated and which should definitely be carried forward.

---

#### 3.4 Scaled Response — `ScaledResponseResults`

**Visualization:**
- A **distribution bar chart** showing the count/percentage at each scale point (1–5 or 1–7), with the scale labels below each bar.
- Color-code the bars: negative end in red/warm tones, midpoint in grey/amber, positive end in green/blue tones.
- Overlay a **mean marker** — a diamond or triangle marker on the x-axis showing the mean score.
- Show a large **mean score** number (e.g., "5.2 / 7") prominently.
- Below the chart, show a **Top Box / Top 2 Box** metric:
  - For 7-point scales: "Top 2 Box (6–7): X%"
  - For 5-point scales: "Top 2 Box (4–5): X%"
- Also show **Bottom 2 Box** for the negative end.

**Key metrics:**
- Mean score with standard deviation.
- Top 2 Box percentage.
- Bottom 2 Box percentage.
- Net score (Top 2 Box minus Bottom 2 Box).

**AI Analysis should cover:**
- Interpretation of the mean in context (e.g., "A mean of 5.2/7 on purchase intent indicates moderate-to-strong buying interest").
- Distribution shape — is it skewed positive, negative, or polarized (bimodal)?
- How the Top 2 Box score compares to typical FMCG benchmarks (if applicable — the AI should note that benchmarks depend on category).
- Whether the result is strong enough to proceed or suggests further iteration.

---

#### 3.5 Open Text — `OpenTextResults`

**Visualization:**
This type requires the richest AI treatment. Display:

1. **Sentiment donut chart** — a three-segment donut showing Positive / Negative / Neutral proportions. Use green, red, and grey respectively. Show the percentage and count for each. This sentiment classification should be performed by the AI.

2. **Theme tags** — AI-extracted themes shown as a row of pill-shaped tags, each with a count (e.g., "Taste (23)", "Packaging (18)", "Price (12)"). Clicking a tag filters the quotes below to only those tagged with that theme.

3. **Key quotes carousel** — a horizontally scrollable row of 5–8 selected quotes (chosen by AI as the most representative or insightful). Each quote card shows:
   - The quote text
   - A sentiment badge (Positive/Negative/Neutral)
   - Which theme(s) it was tagged with

4. **All responses table** — a paginated, scrollable table showing every response with:
   - Response text
   - AI-assigned sentiment
   - AI-assigned theme(s)
   - Timestamp

**Key metrics:**
- Total text responses received.
- Sentiment split (% positive / negative / neutral).
- Number of distinct themes identified.
- Average response length (characters).

**AI Analysis should cover:**
- Dominant sentiment and what's driving it.
- The top 3 themes with explanation of what respondents are saying within each.
- Notable outlier opinions — responses that go against the majority sentiment.
- Direct quotes that best capture the overall feeling.
- Language patterns — what words and phrases come up repeatedly.
- Actionable summary — "Respondents overwhelmingly associate this product with X, but have concerns about Y."

---

#### 3.6 Ranking — `RankingResults`

**Visualization:**
- A **horizontal bar chart** showing average rank position for each item (lowest average = most preferred, shown at the top). The bar length represents the inverse of average rank (so the most preferred item has the longest bar).
- Label each bar with the item name, average rank (e.g., "Avg rank: 1.8"), and the percentage of respondents who ranked it #1.
- Color intensity can reflect preference strength: darkest for the top-ranked, fading to lightest for the bottom.
- Show a **rank frequency heatmap** below: a small grid where rows are items and columns are rank positions (1st, 2nd, 3rd, etc.), with each cell colored by frequency. This shows whether an item consistently ranks in the same position or has wide variance.

**Key metrics:**
- **#1 ranked item** with its average rank score.
- **Consensus indicator** — low standard deviation across items means respondents agreed on the order; high standard deviation means polarized views.
- Percentage of respondents who ranked the top item first.

**AI Analysis should cover:**
- The clear hierarchy (if one exists) or whether preferences are fragmented.
- Which items are "consensus picks" (consistently ranked highly) vs. "polarizing" (ranked #1 by some and last by others).
- Whether there's a natural break point (e.g., "Items 1–3 are clearly preferred over items 4–7").
- Implications for decision-making: what to prioritize and what to deprioritize.

---

#### 3.7 MaxDiff — `MaxDiffResults`

**Visualization:**
- A **horizontal bar chart** showing the utility score for each item, calculated as: `(times chosen as Best − times chosen as Worst) / (times shown)`. This produces a score from -1 (always worst) to +1 (always best). Center the bars on zero.
- Bars extending right (positive utility) in green/blue; bars extending left (negative utility) in red/warm.
- Rank items from highest to lowest utility score.
- Show the raw counts alongside: "Best: X times · Worst: Y times · Shown: Z times".
- Optionally, overlay a **probability scale** showing the derived preference share (rescaled utility scores so they sum to 100%).

**Key metrics:**
- **Top 3 items** with their utility scores and preference shares.
- **Bottom 3 items** — the clearest losers.
- **Discrimination ratio** — the ratio between the top item's utility and the average, showing how much the winner stands out.
- Total number of sets evaluated across all respondents.

**AI Analysis should cover:**
- The standout winners and clear losers.
- Whether preferences are concentrated (a few items dominate) or diffuse (many items are close together).
- Any items that are polarizing — high best AND high worst counts (these are controversial, not simply average).
- Tier structure: group items into "must-haves", "nice-to-haves", and "cut list".
- Specific recommendation on which items/claims/features to carry forward.

---

#### 3.8 Anchored Pricing — `AnchoredPricingResults`

This type has two sub-modes with very different visualizations:

##### Gabor-Granger Mode

**Visualization:**
- A **demand curve** — a line chart with price points on the x-axis and "% who would buy" on the y-axis. The curve should decline as price increases (downward sloping demand curve).
- Overlay a **revenue curve** — a second line (dashed, different color) showing price × purchase probability at each point. The peak of this curve is the optimal price.
- Mark the **optimal price point** clearly with a vertical dashed line and annotation: "Optimal price: £X.XX" — this is the price that maximizes the revenue curve.
- If a reference product was used, show it as a labeled marker on the price axis.

**Key metrics:**
- **Optimal price** — the price point maximizing estimated revenue.
- **Price ceiling** — the highest price at which >50% would still buy.
- **Willingness-to-pay at each tested price** — percentage breakdown.
- Revenue index at each price point.

##### Van Westendorp Mode

**Visualization:**
- The classic **Van Westendorp Price Sensitivity Meter** — a chart with four cumulative distribution lines:
  1. "Too cheap" (ascending line, red)
  2. "Bargain" (ascending line, green)
  3. "Expensive" (ascending line, orange)
  4. "Too expensive" (ascending line, dark red)
- Mark the four intersection points:
  - **PMC (Point of Marginal Cheapness):** Too Cheap crosses Expensive
  - **PME (Point of Marginal Expensiveness):** Bargain crosses Too Expensive
  - **IDP (Indifference Price Point):** Bargain crosses Expensive
  - **OPP (Optimal Price Point):** Too Cheap crosses Too Expensive
- Shade the **acceptable price range** between PMC and PME.

**Key metrics:**
- Optimal price point (OPP).
- Indifference price point (IDP).
- Acceptable price range (PMC to PME).
- Percentage of respondents for whom the current price (if known) falls within the acceptable range.

**AI Analysis (both modes) should cover:**
- The recommended price and the reasoning behind it.
- Price sensitivity — how much demand drops with each price increase (elastic vs. inelastic).
- The trade-off between volume and margin at different price points.
- How the pricing compares to any reference product shown.
- Risk assessment — "At £X.XX, you capture Y% of demand; at £Z.ZZ you maximize revenue but lose A% of volume."
- Specific pricing recommendation with confidence level.

---

#### 3.9 Implicit Association — `ImplicitAssociationResults`

**Visualization:**
- A **diverging bar chart** for each attribute:
  - Each bar extends left or right from center.
  - Right = "Fits" (positive association), colored green/blue.
  - Left = "Doesn't fit" (negative association), colored red/warm.
  - Bar length = percentage of respondents who chose that direction.
  - The opacity or saturation of the bar reflects average reaction time — faster responses = more saturated (indicating stronger, more genuine associations).
- Sort attributes by net association strength (strongest "Fits" at top, strongest "Doesn't fit" at bottom).
- Show a **reaction time scatter plot** as a secondary visualization: x-axis = % who said "Fits", y-axis = average reaction time. The four quadrants represent:
  - Top-right: "Fits" but slow (conscious/deliberate association — may not hold)
  - Bottom-right: "Fits" and fast (genuine System 1 association — strongest signal)
  - Top-left: "Doesn't fit" but slow (uncertain rejection)
  - Bottom-left: "Doesn't fit" and fast (genuine rejection)
  Label these quadrants.

**Key metrics:**
- **Strongest associations** — top 3 attributes by "Fits" percentage with fast reaction times.
- **Weakest/rejected associations** — bottom 3.
- **Average reaction time** across all attributes (and note whether this suggests System 1 or System 2 processing).
- Percentage of responses excluded for being too fast (<200ms) or too slow (>800ms flagged).

**AI Analysis should cover:**
- Which attributes are genuinely and instinctively associated with the brand/product (high Fits + fast reaction time).
- Which attributes the brand aspires to but doesn't yet own (high Fits but slow reaction time — conscious, not instinctive).
- Which attributes are strongly rejected (important negative signals).
- The overall brand/product perception profile: "This product is instinctively seen as [X, Y, Z] but not as [A, B, C]."
- Comparison to brand intent: if the brand is trying to be "Premium" but the data shows "Affordable" is the strongest association, call that out.
- Strategic recommendations for positioning.

---

#### 3.10 Image Heatmap — `ImageHeatmapResults`

**Visualization:**
- The **original image** displayed at full width with a heatmap overlay. Use a canvas-based or CSS-based heatmap rendering:
  - Each click coordinates from all respondents creates a "heat" point.
  - Aggregate into a smooth gradient heatmap (red = highest concentration, yellow = medium, green = low, transparent = no clicks).
  - Use a Gaussian blur on the click points to create smooth heat zones.
- Below the heatmap, show a **click cluster list**: the AI should identify distinct clusters (areas with concentrated clicks) and list them with:
  - A description of what's in that area (e.g., "Product logo area", "Price tag", "Hero image").
  - The percentage of total clicks in that cluster.
  - A summary of comments left for clicks in that area.
- If "Require comment" was enabled, show a **comments panel** — a scrollable list of click comments grouped by cluster/area.

**Key metrics:**
- **Hottest zone** — the single area with the most concentrated attention.
- **Click distribution** — what percentage of clicks concentrated in the top 3 areas vs. spread evenly.
- **Total clicks** and average clicks per respondent.

**AI Analysis should cover:**
- What elements draw the most attention and why (based on comment analysis).
- Whether attention is concentrated on the right elements (e.g., is the brand name getting noticed, or is attention on the wrong area?).
- The most common comments and what they reveal about perception.
- Specific design recommendations: "The hero image dominates attention — consider reducing its size to give the product name more visual weight."
- Areas that received zero or minimal attention (these are being ignored by consumers).

---

### 4. AI Analysis Implementation

#### New Database Table

Create a Supabase migration for the `ai_analyses` table if it doesn't already exist:

```sql
create table if not exists ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade,
  analysis_type text not null,
  content jsonb not null,
  response_count_at_generation integer not null,
  model text not null,
  created_at timestamptz default now() not null
);

create index idx_ai_analyses_project on ai_analyses(project_id);
create index idx_ai_analyses_question on ai_analyses(question_id);
```

Where `question_id` is null for project-level (macro) analyses.

`analysis_type` values: `question_summary`, `project_summary`, `sentiment`, `themes`, `recommendations`.

#### API Route: `/api/ai/analyze`

**POST** endpoint that accepts:

```typescript
{
  projectId: string;
  questionId?: string; // omit for project-level analysis
  analysisType: "question_summary" | "project_summary";
}
```

**Implementation logic:**

1. Fetch the project, its questions, and all answers from Supabase.
2. Build a structured prompt for the Anthropic API that includes:
   - The project title, category, and description.
   - The specific question (for question-level) or all questions (for project-level).
   - All answer data, aggregated into a readable summary (not raw JSON — pre-process into counts, percentages, text lists, etc.).
   - The question type context (e.g., "This is a MaxDiff question where respondents chose the best and worst from rotating subsets").
3. Send to `claude-sonnet-4-20250514` with a **system prompt** that establishes the AI as a senior FMCG consumer insights analyst. The system prompt should be:

```
You are a senior consumer insights analyst specializing in FMCG (Fast-Moving Consumer Goods) research. You have 20 years of experience analyzing consumer data for brands like Unilever, Nestlé, and P&G. You understand behavioral science principles including System 1/System 2 thinking, anchoring effects, and cognitive biases.

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
```

4. Parse the AI response and store it in `ai_analyses` with the current response count.
5. Return the analysis to the client.

#### Analysis Caching Logic

- When the results page loads, check `ai_analyses` for existing analyses for each question and at the project level.
- If an analysis exists and `response_count_at_generation` matches the current response count, use the cached version.
- If the response count has increased since the last analysis, show the cached version but display a banner: "X new responses since this analysis was generated" with a "Refresh analysis" button.
- The "Re-run AI Analysis" button in the header triggers fresh analysis for ALL questions and the project level, regardless of cache.

#### Structured AI Output

For question-level analysis, the AI should return structured JSON:

```typescript
interface QuestionAnalysis {
  headline: string;           // One-sentence key finding
  summary: string;            // 2–3 paragraph detailed analysis
  keyMetrics: Array<{
    label: string;
    value: string;
    interpretation: string;   // What this number means
  }>;
  sentiment?: "positive" | "negative" | "mixed" | "neutral";
  themes?: string[];          // For open text questions
  recommendation: string;     // Clear "what to do next" action
  confidenceNote: string;     // Sample size / reliability caveat
}
```

For project-level analysis:

```typescript
interface ProjectAnalysis {
  executiveSummary: string;
  keyThemes: Array<{
    theme: string;
    evidence: string;         // Which questions/data points support this
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
    basedOn: string;          // Which question(s) drive this recommendation
  }>;
  methodologyNote: string;
}
```

Instruct the AI to return valid JSON matching these structures. Use `response_format` or explicit prompting to ensure structured output.

---

### 5. Real-Time Updates

For **live projects**, implement Supabase Realtime subscriptions:

- Subscribe to `INSERT` events on the `responses` table filtered by `project_id`.
- Subscribe to `INSERT` events on the `answers` table (join via `response_id` to `responses` with matching `project_id`).
- When new responses/answers arrive:
  - Increment the response counter in the header.
  - Update the per-question visualizations with the new data (recalculate aggregations client-side).
  - Show a subtle toast notification: "New response received" with a brief animation on the counter.
  - Do NOT auto-trigger AI re-analysis on each new response (that would be expensive). Instead, show the "X new responses since last analysis" banner.

Implementation pattern:

```typescript
// In the results page component
useEffect(() => {
  if (project.status !== 'live') return;

  const channel = supabase
    .channel(`project-${project.id}-responses`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'responses',
      filter: `project_id=eq.${project.id}`
    }, (payload) => {
      // Update response count
      // Fetch associated answers
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'answers',
    }, (payload) => {
      // Update question visualizations
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [project.id, project.status]);
```

---

### 6. Component Architecture

Create these new components:

```
src/components/results/
├── ResultsPage.tsx               # Main results page wrapper
├── ResultsHeader.tsx             # Project header with stats and actions
├── StatCard.tsx                  # Reusable metric card (count, label, subtext)
├── QuestionResultCard.tsx        # Wrapper card for each question's results
├── AIAnalysisPanel.tsx           # Reusable AI analysis display panel
├── AISummaryTab.tsx              # Full project-level AI summary
├── AnalysisRefreshBanner.tsx     # "X new responses" refresh prompt
├── question-types/
│   ├── MonadicSplitResults.tsx
│   ├── SingleChoiceResults.tsx
│   ├── MultipleChoiceResults.tsx
│   ├── ScaledResponseResults.tsx
│   ├── OpenTextResults.tsx
│   ├── RankingResults.tsx
│   ├── MaxDiffResults.tsx
│   ├── AnchoredPricingResults.tsx
│   ├── ImplicitAssociationResults.tsx
│   └── ImageHeatmapResults.tsx
├── charts/
│   ├── HorizontalBarChart.tsx    # Reusable horizontal bar (used by many types)
│   ├── StackedBarChart.tsx       # For monadic split, scaled response
│   ├── DemandCurve.tsx           # Gabor-Granger pricing
│   ├── VanWestendorpChart.tsx    # Van Westendorp price sensitivity meter
│   ├── SentimentDonut.tsx        # For open text sentiment
│   ├── HeatmapOverlay.tsx        # Canvas-based image heatmap
│   ├── RankHeatmapGrid.tsx       # For ranking position frequency
│   └── ReactionTimeScatter.tsx   # For implicit association
└── shared/
    ├── QuoteCarousel.tsx         # Horizontally scrollable quote cards
    ├── ThemeTags.tsx             # Clickable filter pills
    └── ResponseTable.tsx         # Paginated response data table
```

---

### 7. Data Aggregation Utilities

Create a `src/lib/aggregations.ts` file with pure functions that transform raw answer arrays into the aggregated data structures needed by each visualization. These should run client-side (they're fast for PoC-scale data volumes):

```typescript
// Examples of the functions needed:

function aggregateMonadicSplit(answers: Answer[], question: Question): MonadicSplitAggregation;
function aggregateSingleChoice(answers: Answer[], question: Question): SingleChoiceAggregation;
function aggregateMultipleChoice(answers: Answer[], question: Question): MultipleChoiceAggregation;
function aggregateScaledResponse(answers: Answer[], question: Question): ScaledResponseAggregation;
function aggregateOpenText(answers: Answer[], question: Question): OpenTextAggregation;
function aggregateRanking(answers: Answer[], question: Question): RankingAggregation;
function aggregateMaxDiff(answers: Answer[], question: Question): MaxDiffAggregation;
function aggregateGaborGranger(answers: Answer[], question: Question): GaborGrangerAggregation;
function aggregateVanWestendorp(answers: Answer[], question: Question): VanWestendorpAggregation;
function aggregateImplicitAssociation(answers: Answer[], question: Question): ImplicitAssociationAggregation;
function aggregateImageHeatmap(answers: Answer[], question: Question): ImageHeatmapAggregation;
```

Define proper TypeScript interfaces for each aggregation result. These aggregated structures are what get passed to both the chart components and the AI analysis API.

---

### 8. Seed Data for Demo

Create a seed script (`src/lib/seed-demo-data.ts`) that can be triggered from a hidden `/seed` route or a console command. This should create:

- **One demo project** called "Summer Range Taste Test 2025" in the "Food & Drink" category, status `live`, with 5–6 questions of different types.
- **50–100 simulated responses** with realistic-looking answer data for each question type. The data should be plausible for an FMCG consumer test — not random noise, but data that tells a story (e.g., one variant clearly winning in a split test, a bimodal distribution in scaled response, coherent themes in open text).
- This seed data is critical for demonstrating the results viewer and AI analysis working end to end.

For open text responses, write 30–50 realistic consumer responses about a food product (e.g., "Love the taste but the packaging looks cheap", "Would definitely buy this for my kids", "Too expensive for what it is", etc.). Make them varied in sentiment and theme.

---

### 9. Charting Library Setup

Install Recharts:

```bash
pnpm add recharts
```

Also install a heatmap utility for the image heatmap visualization. If no lightweight library fits, implement a custom canvas-based heatmap renderer using the `<canvas>` element with Gaussian blur kernels applied to click coordinates.

Use consistent chart theming across all visualizations:

```typescript
const chartTheme = {
  colors: {
    primary: '#1E40AF',
    primaryLight: '#3B82F6',
    positive: '#059669',
    negative: '#DC2626',
    neutral: '#94A3B8',
    warning: '#D97706',
    scale: ['#DC2626', '#F59E0B', '#94A3B8', '#34D399', '#059669'], // 5-point red to green
    scale7: ['#DC2626', '#EF4444', '#F59E0B', '#94A3B8', '#34D399', '#10B981', '#059669'], // 7-point
  },
  font: 'Inter, system-ui, sans-serif',
  fontSize: {
    tick: 12,
    label: 14,
    title: 16,
  },
};
```

---

### 10. What To Build — Summary Checklist

In order of priority:

1. **Data aggregation utilities** (`lib/aggregations.ts`) — the foundation everything else depends on.
2. **Seed data script** — so you have data to work with immediately.
3. **Results page layout** — the `/projects/[projectId]` page with header, tabs, and question card stack.
4. **Chart components** — one for each question type, using Recharts and custom rendering.
5. **AI analysis API route** (`/api/ai/analyze`) — the server-side endpoint that calls Anthropic.
6. **AI analysis display components** — `AIAnalysisPanel` and `AISummaryTab`.
7. **Real-time subscriptions** — for live project updates.
8. **Dashboard updates** — response counts, status badges, click-through routing.
9. **Analysis caching logic** — check existing analyses, show refresh banners.
10. **Polish** — loading states, empty states, error handling, transitions.

Build this in sequence. Ensure each step works before moving to the next. The project should compile and run (`pnpm dev`) without errors at every stage.
