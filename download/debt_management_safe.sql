-- ============================================================
-- Life OS — Sprint 5B: Debt Management Schema (Idempotent)
-- Safe to run multiple times — uses DROP IF EXISTS + CREATE
-- ============================================================

-- ─── 1. DEBTS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  creditor    TEXT NOT NULL DEFAULT '',
  total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,
  interest_rate   NUMERIC(5,2) DEFAULT 0,
  tenure_months   INTEGER NOT NULL DEFAULT 1,
  monthly_payment NUMERIC(15,2) GENERATED ALWAYS AS (
    CASE 
      WHEN interest_rate = 0 OR tenure_months = 0 THEN total_amount
      ELSE ROUND(
        (total_amount * (interest_rate / 100 / 12) * POWER(1 + interest_rate / 100 / 12, tenure_months))
        / (POWER(1 + interest_rate / 100 / 12, tenure_months) - 1)
      , 2)
    END
  ) STORED,
  remaining_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  due_day     INTEGER NOT NULL DEFAULT 1,
  is_paid_off BOOLEAN NOT NULL DEFAULT FALSE,
  paid_off_at TIMESTAMPTZ,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_active ON public.debts(user_id, is_paid_off) WHERE NOT is_paid_off;

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies (idempotent)
DROP POLICY IF EXISTS "Users can view own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON public.debts;

CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger (drop + recreate)
DROP TRIGGER IF EXISTS debts_updated_at ON public.debts;
CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─── 2. DEBT PAYMENTS ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.debt_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id     UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount      NUMERIC(15,2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_debt_payments_user_id ON public.debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON public.debt_payments(debt_id);

ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Drop & recreate policies (idempotent)
DROP POLICY IF EXISTS "Users can view own debt payments" ON public.debt_payments;
DROP POLICY IF EXISTS "Users can insert own debt payments" ON public.debt_payments;
DROP POLICY IF EXISTS "Users can delete own debt payments" ON public.debt_payments;

CREATE POLICY "Users can view own debt payments"
  ON public.debt_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debt payments"
  ON public.debt_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debt payments"
  ON public.debt_payments FOR DELETE
  USING (auth.uid() = user_id);
