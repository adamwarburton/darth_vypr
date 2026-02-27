-- ============================================================================
-- Vypr — Initial Database Schema
-- ============================================================================

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'live', 'closed')),
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Questions table
create table questions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type text not null
    check (type in (
      'multiple_choice', 'free_text', 'rating_scale',
      'image_stimulus', 'video_stimulus', 'video_response', 'ranking'
    )),
  title text not null,
  description text,
  options jsonb,
  media_url text,
  required boolean not null default true,
  order_index integer not null,
  settings jsonb,
  created_at timestamptz not null default now()
);

-- Responses table
create table responses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  respondent_id text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Answers table
create table answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references responses(id) on delete cascade,
  question_id uuid not null references questions(id),
  value jsonb not null,
  answered_at timestamptz not null default now()
);

-- AI analyses table
create table ai_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  question_id uuid references questions(id),
  analysis_type text not null
    check (analysis_type in (
      'question_summary', 'project_summary', 'sentiment', 'themes', 'recommendations'
    )),
  content jsonb not null,
  response_count_at_generation integer not null,
  model text not null,
  created_at timestamptz not null default now()
);

-- AI chat messages table
create table ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes for common queries
create index idx_questions_project_id on questions(project_id);
create index idx_questions_order on questions(project_id, order_index);
create index idx_responses_project_id on responses(project_id);
create index idx_responses_respondent on responses(project_id, respondent_id);
create index idx_answers_response_id on answers(response_id);
create index idx_answers_question_id on answers(question_id);
create index idx_ai_analyses_project_id on ai_analyses(project_id);
create index idx_ai_analyses_question_id on ai_analyses(question_id);
create index idx_ai_chat_messages_project_id on ai_chat_messages(project_id);

-- Updated_at trigger for projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();

-- Enable Realtime on responses and answers tables
alter publication supabase_realtime add table responses;
alter publication supabase_realtime add table answers;

-- Create storage bucket for media (images/videos)
-- Note: Run this via the Supabase dashboard or API, not via SQL migration.
-- insert into storage.buckets (id, name, public) values ('media', 'media', true);

-- RLS is intentionally disabled for this PoC (no auth).
