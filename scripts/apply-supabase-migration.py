import psycopg2
import sys

# Supabase Connection Pooler (IPv4 accessible)
db_host = "aws-0-ap-southeast-1.pooler.supabase.com"
db_port = 6543
db_name = "postgres"
db_user = "postgres.osxumulwfgupvtognrzm"
db_pass = "YW8omMhc52fK1jym"

conn = None
cur = None

try:
    print(f"Connecting to Supabase Pooler ({db_host}:{db_port})...")
    conn = psycopg2.connect(
        host=db_host,
        port=db_port,
        dbname=db_name,
        user=db_user,
        password=db_pass,
        sslmode="require",
        connect_timeout=15
    )
    conn.autocommit = True
    cur = conn.cursor()
    print("Connected successfully!\n")

    # Read the SQL migration file
    sql_path = "/home/z/my-project/supabase/migrations/20260726_wealth_foundation.sql"
    with open(sql_path, "r") as f:
        sql_content = f.read()

    print(f"Read migration file: {len(sql_content)} chars")
    print("Applying migration...\n")

    cur.execute(sql_content)
    print("Migration applied successfully!\n")

    # Verify tables were created
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('accounts', 'categories', 'transactions', 'budgets')
        ORDER BY table_name;
    """)
    tables = cur.fetchall()
    print("Verified tables in Supabase:")
    for t in tables:
        print(f"  [OK] {t[0]}")

    # Check RLS is enabled
    print("\nRLS Status:")
    for tbl in ['accounts', 'categories', 'transactions', 'budgets']:
        cur.execute("""
            SELECT relrowsecurity FROM pg_class WHERE relname = %s;
        """, (tbl,))
        rls = cur.fetchone()
        status = "ENABLED" if rls and rls[0] else "DISABLED"
        print(f"  {tbl}: RLS {status}")

    # Count policies
    print("\nRLS Policies:")
    cur.execute("""
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('accounts', 'categories', 'transactions', 'budgets')
        ORDER BY tablename, policyname;
    """)
    policies = cur.fetchall()
    for p in policies:
        print(f"  [OK] {p[1]}.{p[2]}")
    print(f"  Total: {len(policies)} policies")

    # Check indexes
    print("\nIndexes:")
    cur.execute("""
        SELECT tablename, indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('accounts', 'categories', 'transactions', 'budgets')
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname;
    """)
    indexes = cur.fetchall()
    for idx in indexes:
        print(f"  [OK] {idx[0]}.{idx[1]}")
    print(f"  Total: {len(indexes)} indexes")

    # Check triggers
    print("\nTriggers:")
    cur.execute("""
        SELECT event_object_table, trigger_name 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND event_object_table IN ('accounts', 'categories', 'transactions', 'budgets')
        ORDER BY event_object_table;
    """)
    triggers = cur.fetchall()
    for tr in triggers:
        print(f"  [OK] {tr[0]}.{tr[1]}")
    print(f"  Total: {len(triggers)} triggers")

    # Check function
    cur.execute("""
        SELECT proname FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace;
    """)
    func = cur.fetchone()
    print(f"\nFunction: update_updated_at_column = {'FOUND' if func else 'MISSING'}")

    print("\n========================================")
    print("  ALL MIGRATION APPLIED SUCCESSFULLY")
    print("========================================")

except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    sys.exit(1)
finally:
    if cur:
        cur.close()
    if conn:
        conn.close()
        print("\nConnection closed.")
