-- ============================================================
-- Life OS — Sprint 5B: Debt Management Schema
-- Tables: debts, debt_payments
-- Security: Row Level Security (RLS) per user
-- ============================================================

-- ─── 1. DEBTS ─────────────────────────────────────────────
-- Tracks individual debts/loans with creditor info, terms, and status

CREATE TABLE IF NOT EXISTS public.debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core info
  name        TEXT NOT NULL,                          -- e.g. 'KPR Rumah', 'Pinjaman Motor'
  creditor    TEXT NOT NULL DEFAULT '',                 -- Nama kreditur
  
  -- Financial details
  total_amount    NUMERIC(15,2) NOT NULL DEFAULT 0,   -- Jumlah pinjaman awal
  interest_rate   NUMERIC(5,2) DEFAULT 0,             -- Bunga tahunan (%), 0 = tanpa bunga
  tenure_months   INTEGER NOT NULL DEFAULT 1,         -- Tenor dalam bulan
  monthly_payment NUMERIC(15,2) GENERATED ALWAYS AS (
    CASE 
      WHEN interest_rate = 0 OR tenure_months = 0 THEN total_amount
      ELSE ROUND(
        (total_amount * (interest_rate / 100 / 12) * POWER(1 + interest_rate / 100 / 12, tenure_months))
        / (POWER(1 + interest_rate / 100 / 12, tenure_months) - 1)
      , 2)
    END
  ) STORED,                                             -- Cicilan per bulan (auto-calculated)
  remaining_balance NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Sisa pokok saat ini
  
  -- Schedule
  start_date  DATE NOT NULL DEFAULT CURRENT_DATE,     -- Tanggal mulai pinjaman
  due_day     INTEGER NOT NULL DEFAULT 1,             -- Tanggal jatuh tempo tiap bulan (1-28)
  
  -- Status
  is_paid_off BOOLEAN NOT NULL DEFAULT FALSE,
  paid_off_at TIMESTAMPTZ,
  
  -- Metadata
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user_active ON public.debts(user_id, is_paid_off) WHERE NOT is_paid_off;

-- RLS
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

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

-- updated_at trigger
CREATE TRIGGER debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ─── 2. DEBT PAYMENTS ────────────────────────────────────
-- Payment history for each debt

CREATE TABLE IF NOT EXISTS public.debt_payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debt_id     UUID NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  
  amount      NUMERIC(15,2) NOT NULL,                  -- Nominal bayar
  date        DATE NOT NULL DEFAULT CURRENT_DATE,      -- Tanggal bayar
  note        TEXT,                                     -- Catatan opsional
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debt_payments_user_id ON public.debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON public.debt_payments(debt_id);

-- RLS
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own debt payments"
  ON public.debt_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debt payments"
  ON public.debt_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own debt payments"
  ON public.debt_payments FOR DELETE
  USING (auth.uid() = user_id);
