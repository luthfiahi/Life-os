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

for tbl in ['transactions', 'finance_accounts', 'finance_transactions', 'finance_categories', 'finance_budgets', 'finance_income', 'finance_expenses', 'finance_debts', 'finance_goals']:
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name=%s 
        ORDER BY ordinal_position;
    """, (tbl,))
    cols = cur.fetchall()
    if cols:
        print(f"\n=== {tbl} ===")
        for c in cols:
            print(f"  {c[0]:25s} {c[1]:20s} nullable={c[2]:3s} default={c[3]}")
    else:
        print(f"\n=== {tbl} === (not found)")

cur.close()
conn.close()