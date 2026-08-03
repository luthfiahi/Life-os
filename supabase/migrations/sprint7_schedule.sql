-- ═══════════════════════════════════════════════════════════════
-- Sprint 7: Schedule Module
-- ═══════════════════════════════════════════════════════════════

-- ─── schedule_events table ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.schedule_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  -- Time: all-day events have start_time/end_time = NULL
  event_date    DATE NOT NULL,
  start_time    TIME,           -- e.g. '09:00:00'
  end_time      TIME,           -- e.g. '10:30:00'
  is_all_day    BOOLEAN NOT NULL DEFAULT false,
  -- Categorization
  category      TEXT NOT NULL DEFAULT 'general'
                CHECK (category IN ('general', 'work', 'personal', 'health', 'education', 'social', 'finance', 'creative')),
  color         TEXT,           -- hex or named color for the event
  -- Linking
  mission_id    UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  -- Recurrence (simple: daily/weekly/monthly, or null for one-off)
  repeat_type   TEXT
                CHECK (repeat_type IN ('daily', 'weekly', 'monthly', 'weekday') OR repeat_type IS NULL),
  repeat_end_date DATE,        -- when the recurrence stops (null = forever)
  -- Metadata
  location      TEXT,
  is_completed  BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_schedule_events_user_id        ON public.schedule_events(user_id);
CREATE INDEX IF NOT EXISTS idx_schedule_events_user_date      ON public.schedule_events(user_id, event_date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_date_range      ON public.schedule_events(user_id, event_date, start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_events_mission_id      ON public.schedule_events(mission_id) WHERE mission_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_schedule_events_category       ON public.schedule_events(user_id, category);

-- ─── RLS: Enable ──────────────────────────────────────────
ALTER TABLE public.schedule_events ENABLE ROW LEVEL SECURITY;

-- ─── RLS: Policies ─────────────────────────────────────────
CREATE POLICY "schedule_events_select_own" ON public.schedule_events FOR SELECT   USING (auth.uid() = user_id);
CREATE POLICY "schedule_events_insert_own" ON public.schedule_events FOR INSERT   WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedule_events_update_own" ON public.schedule_events FOR UPDATE   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "schedule_events_delete_own" ON public.schedule_events FOR DELETE   USING (auth.uid() = user_id);

-- ─── Trigger: auto-update updated_at ───────────────────────
CREATE TRIGGER schedule_events_updated_at
  BEFORE UPDATE ON public.schedule_events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
