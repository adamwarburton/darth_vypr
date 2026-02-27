# 🐍 Vypr Brand Guidelines

*Consumer Intelligence & Product Insights Platform*

------------------------------------------------------------------------

## 1. Brand Overview

**Positioning Statement**\
Vypr enables brands to make better product decisions through fast,
predictive consumer insight.

**Core Value Proposition**\
Rapid, predictive insight that reduces guesswork and increases product
success rates.

**Tagline**\
\> Better decisions, winning products.

------------------------------------------------------------------------

## 2. Brand Personality

  Attribute     Description
  ------------- ---------------------------------------------
  Confident     Evidence-led and decisive
  Intelligent   Grounded in behavioural science
  Human         Clear, conversational, not corporate waffle
  Commercial    Insight tied directly to business value

Tone should feel like a smart colleague --- never overly academic, never
salesy.

------------------------------------------------------------------------

## 3. Typography

### Primary Heading Font

Montserrat, Helvetica Neue, or Arial\
Weight: 600--700

### Body Font

Inter, Roboto, or Arial\
Weight: 400

### Recommended Scale

  Use Case   Size       Weight
  ---------- ---------- --------
  H1         36--48px   700
  H2         28--32px   600
  H3         20--24px   600
  Body       14--16px   400
  Caption    12--13px   300

Use generous line height (1.4--1.6).\
Avoid overly condensed layouts.

------------------------------------------------------------------------

## 4. Colour Palette

  Name           Hex       Usage
  -------------- --------- --------------------------
  Deep Navy      #0B0F25   Primary background
  Vibrant Teal   #00D6C6   CTA / Accent
  White          #FFFFFF   Text on dark backgrounds
  Soft Grey      #F6F8FA   UI surfaces
  Slate Grey     #6C7280   Secondary text

### CSS Variables Example

``` css
:root {
  --vypr-navy: #0B0F25;
  --vypr-teal: #00D6C6;
  --vypr-white: #FFFFFF;
  --vypr-grey-light: #F6F8FA;
  --vypr-grey-slate: #6C7280;
}
```

------------------------------------------------------------------------

## 5. Logo Usage

-   Maintain clear space equal to height of the "V".
-   Do not distort, stretch, rotate, or recolour.
-   Use white logo on dark backgrounds.
-   Use navy logo on light backgrounds.

------------------------------------------------------------------------

## 6. Layout & Spacing

-   12-column responsive grid
-   Base spacing unit: 8px
-   Standard padding: 24px
-   Generous whitespace preferred
-   Left-aligned content for readability

------------------------------------------------------------------------

## 7. UI Component Principles

### Buttons

  Type        Background    Text      Border
  ----------- ------------- --------- -------------------
  Primary     #00D6C6       #0B0F25   None
  Secondary   Transparent   #0B0F25   1px solid #0B0F25
  Disabled    #F6F8FA       #6C7280   None

### Icons

-   Filled for primary actions
-   Outline for secondary actions

------------------------------------------------------------------------

## 8. Language & Messaging

### Always Emphasise:

-   Predictive insight
-   Consumer-led decision making
-   Speed and agility
-   Commercial outcomes

### Avoid:

-   Jargon-heavy consultancy language
-   Buzzwords without substance

### Example Messaging

**Strong:**\
"Test ideas in hours, not weeks."

**Weak:**\
"Leveraging data to maximise strategic outcomes."

------------------------------------------------------------------------

## 9. Content Structure Patterns

### Hero Pattern

-   Bold headline
-   Clear value statement
-   Single primary CTA

### Feature Block Pattern

    [Icon]
    Feature Title
    One-sentence explanation of value

### Quote Pattern

> "Vypr helped us confidently refine our product messaging." --- Client

------------------------------------------------------------------------

## 10. POC Alignment Checklist

-   [ ] Confirm official fonts
-   [ ] Replace placeholder colours if official palette differs
-   [ ] Add approved SVG logo
-   [ ] Implement CSS variables
-   [ ] Align tone in UI microcopy

------------------------------------------------------------------------

End of document.
