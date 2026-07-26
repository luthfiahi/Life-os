import psycopg2, sys

conn = psycopg2.connect(
    host="aws-0-ap-southeast-2.pooler.supabase.com",
    port=6543, dbname="postgres",
    user="postgres.osxumulwfgupvtognrzm",
    password="YW8omMhc52fK1jym",
    sslmode="require", connect_timeout=15
)
conn.autocommit = True
cur = conn.cursor()

# Drop any partial tables
for tbl in ['accounts','categories','transactions','budgets']:
    cur.execute(f"DROP TABLE IF EXISTS public.{tbl} CASCADE")
    print(f"Dropped {tbl}")

# Drop function if exists
cur.execute("DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE")
print("Dropped function")

statements = [
    ("1. Function", """CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;"""),

    ("2. Accounts table", """CREATE TABLE public.accounts (
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
);"""),

    ("3. Accounts indexes", """CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_accounts_user_active ON public.accounts(user_id, is_active);
CREATE INDEX idx_accounts_type ON public.accounts(user_id, type);"""),

    ("4. Accounts trigger + RLS", """CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_accounts" ON public.accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_accounts" ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_accounts" ON public.accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_accounts" ON public.accounts FOR DELETE USING (auth.uid() = user_id);"""),

    ("5. Categories table", """CREATE TABLE public.categories (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  icon        TEXT        DEFAULT NULL,
  color       TEXT        DEFAULT NULL,
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);"""),

    ("6. Categories indexes + RLS", """CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_user_type ON public.categories(user_id, type);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_categories" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_categories" ON public.categories FOR DELETE USING (auth.uid() = user_id);"""),

    ("7. Transactions table", """CREATE TABLE public.transactions (
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
);"""),

    ("8. Transactions indexes", """CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(user_id, date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(user_id, type);"""),

    ("8b. Transactions monthly index", """CREATE INDEX idx_transactions_monthly ON public.transactions(user_id, date_trunc('month', date::timestamp));"""),

    ("9. Transactions RLS", """ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);"""),

    ("10. Budgets table", """CREATE TABLE public.budgets (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id   UUID        NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  period        TEXT        NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'weekly')),
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);"""),

    ("11. Budgets indexes", """CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_user_active ON public.budgets(user_id, is_active);
CREATE INDEX idx_budgets_category ON public.budgets(category_id);
CREATE UNIQUE INDEX idx_budgets_user_category_period ON public.budgets(user_id, category_id, period) WHERE is_active = true;"""),

    ("12. Budgets trigger + RLS", """CREATE TRIGGER budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own_budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "users_insert_own_budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_update_own_budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users_delete_own_budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);"""),
]

for label, sql in statements:
    try:
        cur.execute(sql)
        print(f"[OK] {label}")
    except Exception as e:
        print(f"[FAIL] {label}: {e}")

# Verify
print("\n--- Final Verification ---")
for tbl in ['accounts','categories','transactions','budgets']:
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=%s ORDER BY ordinal_position;", (tbl,))
    cols = [c[0] for c in cur.fetchall()]
    cur.execute("SELECT relrowsecurity FROM pg_class WHERE relname=%s", (tbl,))
    rls = cur.fetchone()
    print(f"  {tbl}: cols={cols}, RLS={'ON' if rls and rls[0] else 'OFF'}")

cur.execute("SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename IN ('accounts','categories','transactions','budgets')")
print(f"  Total RLS policies: {cur.fetchone()[0]}")

cur.execute("SELECT count(*) FROM pg_indexes WHERE schemaname='public' AND tablename IN ('accounts','categories','transactions','budgets') AND indexname LIKE 'idx_%'")
print(f"  Total indexes: {cur.fetchone()[0]}")

print("\n=== DONE ===")
cur.close()
conn.close()
