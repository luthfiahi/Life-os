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
print("Connected to Supabase (ap-southeast-2)!\n")

# Check if new tables already partially exist from failed run
cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' 
    AND table_name IN ('accounts','categories','transactions','budgets')
""")
existing = [t[0] for t in cur.fetchall()]
if existing:
    print(f"Dropping partially created tables: {existing}")
    for tbl in existing:
        cur.execute(f"DROP TABLE IF EXISTS public.{tbl} CASCADE")
        print(f"  Dropped {tbl}")

print("\nApplying Wealth Foundation migration...")
sql_path = "/home/z/my-project/supabase/migrations/20260726_wealth_foundation.sql"
with open(sql_path, "r") as f:
    sql = f.read()
cur.execute(sql)
print("Migration applied!\n")

# ── Verify ──
print("Verification:")
cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' 
    AND table_name IN ('accounts','categories','transactions','budgets')
    ORDER BY table_name;
""")
tables = [t[0] for t in cur.fetchall()]
print(f"  New tables: {tables}")

for tbl in ['accounts','categories','transactions','budgets']:
    cur.execute("SELECT relrowsecurity FROM pg_class WHERE relname=%s", (tbl,))
    rls = cur.fetchone()
    status = "ENABLED" if rls and rls[0] else "DISABLED"
    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=%s ORDER BY ordinal_position;
    """, (tbl,))
    cols = [c[0] for c in cur.fetchall()]
    print(f"  {tbl}: RLS {status} | Cols: {cols}")

cur.execute("""
    SELECT tablename, policyname FROM pg_policies 
    WHERE schemaname='public'
    AND tablename IN ('accounts','categories','transactions','budgets')
    ORDER BY tablename, policyname;
""")
policies = cur.fetchall()
print(f"\n  RLS Policies ({len(policies)}):")
for p in policies: print(f"    {p[0]}.{p[1]}")

cur.execute("""
    SELECT tablename, indexname FROM pg_indexes 
    WHERE schemaname='public'
    AND tablename IN ('accounts','categories','transactions','budgets')
    AND indexname LIKE 'idx_%' ORDER BY tablename, indexname;
""")
indexes = cur.fetchall()
print(f"\n  Indexes ({len(indexes)}):")
for i in indexes: print(f"    {i[0]}.{i[1]}")

cur.execute("""
    SELECT event_object_table, trigger_name FROM information_schema.triggers 
    WHERE trigger_schema='public'
    AND event_object_table IN ('accounts','categories','transactions','budgets')
    ORDER BY event_object_table;
""")
triggers = cur.fetchall()
print(f"\n  Triggers ({len(triggers)}):")
for t in triggers: print(f"    {t[0]}.{t[1]}")

cur.execute("SELECT proname FROM pg_proc WHERE proname='update_updated_at_column' AND pronamespace='public'::regnamespace")
func = cur.fetchone()
print(f"\n  Function update_updated_at_column: {'FOUND' if func else 'MISSING'}")

print("\n========================================")
print("  MIGRATION COMPLETE")
print("========================================")

cur.close()
conn.close()
