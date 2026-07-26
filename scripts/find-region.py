import psycopg2, sys

db_pass = "YW8omMhc52fK1jym"
db_port = 6543
db_name = "postgres"

regions = [
    "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-south-1",
    "us-east-1", "us-west-1", "us-west-2",
    "eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1",
    "sa-east-1", "ca-central-1", "me-south-1", "af-south-1",
]

for region in regions:
    host = f"aws-0-{region}.pooler.supabase.com"
    user = f"postgres.osxumulwfgupvtognrzm"
    try:
        print(f"{region:20s} ... ", end="", flush=True)
        conn = psycopg2.connect(
            host=host, port=db_port, dbname=db_name,
            user=user, password=db_pass,
            sslmode="require", connect_timeout=5
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT version();")
        ver = cur.fetchone()[0]
        print(f"SUCCESS!")
        print(f"  Version: {ver[:80]}")
        
        # List public tables
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema='public' ORDER BY table_name;
        """)
        tables = cur.fetchall()
        print(f"  Tables: {[t[0] for t in tables]}")
        cur.close()
        conn.close()
        print(f"\n>>> REGION: {region} <<<")
        sys.exit(0)
    except psycopg2.OperationalError as e:
        err = str(e)
        if "ENOTFOUND" in err or "tenant" in err.lower():
            print("no tenant")
        elif "timeout" in err.lower():
            print("timeout")
        elif "auth" in err.lower() or "password" in err.lower():
            print(f"AUTH OK, wrong pass? {err[:60]}")
        else:
            print(f"err: {err[:60]}")
    except Exception as e:
        print(f"err: {e}")

print("\nNo region found.")
