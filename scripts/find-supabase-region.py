import psycopg2
import sys

db_port = 6543
db_name = "postgres"
db_pass = "YW8omMhc52fK1jym"

regions = [
    ("aws-0-ap-southeast-1.pooler.supabase.com", "ap-southeast-1"),
    ("aws-0-us-east-1.pooler.supabase.com", "us-east-1"),
    ("aws-0-us-west-1.pooler.supabase.com", "us-west-1"),
    ("aws-0-eu-west-1.pooler.supabase.com", "eu-west-1"),
]

for host, region in regions:
    db_user = f"postgres.osxumulwfgupvtognrzm"
    try:
        print(f"Trying {region} ({host})...", end=" ", flush=True)
        conn = psycopg2.connect(
            host=host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_pass,
            sslmode="require",
            connect_timeout=8
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute("SELECT version();")
        ver = cur.fetchone()[0]
        print(f"SUCCESS!")
        print(f"  Version: {ver[:60]}...")
        cur.close()
        conn.close()
        print(f"\nRegion found: {region}")
        sys.exit(0)
    except psycopg2.OperationalError as e:
        err = str(e)
        if "ENOTFOUND" in err or "tenant" in err.lower():
            print(f"Not here (tenant not found)")
        elif "authentication" in err.lower() or "password" in err.lower():
            print(f"Auth failed: {err[:80]}")
        else:
            print(f"Error: {err[:80]}")
    except Exception as e:
        print(f"Error: {e}")

print("\nNo region matched. Trying direct connection with IPv4 override...")

# Also try connecting directly to the DB host via IP if we can find it
# Let's also try the Supabase session mode pooler (port 5432)
for host, region in regions:
    db_user = f"postgres.osxumulwfgupvtognrzm"
    try:
        print(f"Trying {region} port 5432...", end=" ", flush=True)
        conn = psycopg2.connect(
            host=host,
            port=5432,
            dbname=db_name,
            user=db_user,
            password=db_pass,
            sslmode="require",
            connect_timeout=8
        )
        print(f"SUCCESS!")
        conn.close()
        print(f"\nRegion found: {region} (port 5432)")
        sys.exit(0)
    except Exception as e:
        print(f"No")

print("\nAll regions failed.")
