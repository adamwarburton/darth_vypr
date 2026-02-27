# Vypr

AI-native insights platform for consumer research and surveys. Create surveys, collect responses via shareable links, and get AI-powered analysis of the results.

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database & Backend:** Supabase (Postgres, Realtime, Storage)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### Setup

1. **Clone the repo and install dependencies:**

   ```bash
   git clone <repo-url>
   cd vypr
   pnpm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and fill in your keys:

   - `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key (server-side only)
   - `ANTHROPIC_API_KEY` — Your Anthropic API key

3. **Set up the database:**

   Run the migration SQL in `supabase/migrations/00001_initial_schema.sql` against your Supabase project via the SQL Editor in the Supabase dashboard, or using the Supabase CLI:

   ```bash
   supabase db push
   ```

4. **Create the storage bucket:**

   In your Supabase dashboard, create a public storage bucket named `media` for image and video uploads.

5. **Enable Realtime:**

   The migration enables Realtime on the `responses` and `answers` tables. Verify this is active in your Supabase dashboard under Database > Replication.

6. **Run the dev server:**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Dashboard (home)
│   ├── projects/           # Project management pages
│   ├── survey/             # Public survey pages
│   └── api/                # API routes (projects, questions, responses, AI, publish)
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard/          # Dashboard components
│   ├── survey-builder/     # Survey builder components
│   ├── survey-renderer/    # Public survey components
│   ├── results/            # Results and analysis components
│   └── ai/                 # AI chat and analysis components
├── lib/
│   ├── supabase/           # Supabase client (browser + server)
│   ├── anthropic.ts        # Anthropic client
│   ├── utils.ts            # Utilities
│   └── constants.ts        # App constants
├── hooks/                  # React hooks (projects, responses, AI chat)
└── types/                  # Shared TypeScript types
```

## Deployment (Vercel)

1. Push your code to a Git repository.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local.example` in Vercel's project settings.
4. Deploy.

The app will automatically build and deploy on every push.

## Key Features

- **Survey Builder** — Multi-step interface for creating surveys with multiple question types (multiple choice, free text, rating scale, image/video stimulus, video response, ranking).
- **Shareable Surveys** — Publish surveys and share via URL. Respondents complete one question at a time.
- **Real-time Results** — Live-updating response counts and charts via Supabase Realtime.
- **AI Analysis** — Claude-powered analysis of survey results with themes, sentiment, and recommendations.
- **AI Assistant** — Chat with an AI research methodologist while building surveys.
