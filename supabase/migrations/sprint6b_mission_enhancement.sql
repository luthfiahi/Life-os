-- ═══════════════════════════════════════════════════════════════
-- Sprint 6B: Mission PM Enhancement
-- Adds notes, category to missions for Personal Project Management
-- ═══════════════════════════════════════════════════════════════

-- ─── Add columns to missions ─────────────────────────────
ALTER TABLE public.missions
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'career', 'finance', 'health', 'education', 'personal', 'creative', 'social'));

-- ─── Milestone due_date index for upcoming queries ────────
CREATE INDEX IF NOT EXISTS idx_milestones_due_date
  ON public.milestones(mission_id, due_date)
  WHERE due_date IS NOT NULL AND status != 'completed';