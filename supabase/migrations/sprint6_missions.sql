-- ═══════════════════════════════════════════════════════════════
-- Sprint 6: Mission & Milestone Tables
-- ═══════════════════════════════════════════════════════════════

-- ─── missions table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.missions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  priority      TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'archived', 'draft')),
  icon          TEXT,
  color         TEXT,
  start_date    DATE,
  target_date   DATE,
  progress      NUMERIC(5,2) NOT NULL DEFAULT 0
                CHECK (progress >= 0 AND progress <= 100),
  is_pinned     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── milestones table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id    UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed')),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_missions_user_id        ON public.missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_status     ON public.missions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_missions_user_priority   ON public.missions(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_missions_user_target_date ON public.missions(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_milestones_user_id        ON public.milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_mission_id     ON public.milestones(mission_id);
CREATE INDEX IF NOT EXISTS idx_milestones_mission_status ON public.milestones(mission_id, status);

-- ─── RLS: Enable ──────────────────────────────────────────
ALTER TABLE public.missions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- ─── RLS: Policies ─────────────────────────────────────────

-- Missions: users can only see their own
CREATE POLICY "missions_select_own"   ON public.missions   FOR SELECT   USING (auth.uid() = user_id);
CREATE POLICY "missions_insert_own"   ON public.missions   FOR INSERT   WITH CHECK (auth.uid() = user_id);
CREATE POLICY "missions_update_own"   ON public.missions   FOR UPDATE   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "missions_delete_own"   ON public.missions   FOR DELETE   USING (auth.uid() = user_id);

-- Milestones: users can only see their own (via mission ownership)
CREATE POLICY "milestones_select_own" ON public.milestones FOR SELECT   USING (auth.uid() = user_id);
CREATE POLICY "milestones_insert_own" ON public.milestones FOR INSERT   WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_update_own" ON public.milestones FOR UPDATE   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "milestones_delete_own" ON public.milestones FOR DELETE   USING (auth.uid() = user_id);

-- ─── Trigger: auto-update updated_at ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
