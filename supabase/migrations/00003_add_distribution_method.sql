-- Add distribution_method column to projects table
-- Tracks how a survey was distributed: URL sharing, VYPR panel, or AI panel
ALTER TABLE projects
  ADD COLUMN distribution_method text DEFAULT 'url'
  CHECK (distribution_method IN ('url', 'vypr_panel', 'ai_panel'));
