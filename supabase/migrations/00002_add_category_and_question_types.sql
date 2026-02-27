-- ============================================================================
-- Migration: Add category column and update question type constraint
-- for the Results Viewer feature
-- ============================================================================

-- Add category column to projects
alter table projects add column if not exists category text;

-- Drop the old question type check constraint and add the expanded one
alter table questions drop constraint if exists questions_type_check;
alter table questions add constraint questions_type_check
  check (type in (
    'monadic_split', 'single_choice', 'multiple_choice',
    'scaled_response', 'open_text', 'ranking', 'maxdiff',
    'anchored_pricing', 'implicit_association', 'image_heatmap',
    'free_text', 'rating_scale', 'image_stimulus',
    'video_stimulus', 'video_response'
  ));
