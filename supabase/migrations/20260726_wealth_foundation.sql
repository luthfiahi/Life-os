-- ============================================================
-- Life OS — Sprint 3: Wealth Foundation Schema
-- Database: Supabase (PostgreSQL)
-- 
-- Tables: accounts, categories, transactions, budgets
-- Security: Row Level Security (RLS) per user
-- ============================================================

-- Shared trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. ACCOUNTS ──────────────────────────────────────────
-- User financial accounts (bank, cash, e-wallet, investment)

CREATE TABLE IF NOT EXISTS public.accounts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('bank', 'cash', 'ewallet', 'investment')),
  balance     NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency    TEXT        NOT NULL DEFAULT 'IDR',
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  icon        TEXT        DEFAULT NULL,
  color       TEXT        DEFAULT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_active ON public.accounts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(user_id, type);

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);


-- ─── 2. CATEGORIES ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  icon        TEXT        DEFAULT NULL,
  color       TEXT        DEFAULT NULL,
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);


-- ─── 3. TRANSACTIONS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transactions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id    UUID        NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id   UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
  type          TEXT        NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  description   TEXT        DEFAULT '',
  date          DATE        NOT NULL DEFAULT (CURRENT_DATE AT TIME ZONE 'Asia/Makassar'),
  note          TEXT        DEFAULT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_monthly ON public.transactions(user_id, date_trunc('month', date));

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);


-- ─── 4. BUDGETS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.budgets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  period        TEXT        NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON public.budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_user_category_period
  ON public.budgets(user_id, category_id, period)
  WHERE is_active = true;

CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);
