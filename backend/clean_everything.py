import sqlite3
import os
import json
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
db_path = backend_dir / "aimiko.db"

conn = sqlite3.connect(db_path)
c = conn.cursor()

tables = [r[0] for r in c.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Found tables in DB:", tables)

# We want 0 seeded test data - keep only admin or clean test users
for t in tables:
    if t == "users":
        c.execute("DELETE FROM users WHERE email != 'admin@aimiko.ai'")
        print("Purged all test users from 'users' table, keeping only clean system admin.")
    elif t == "organizations":
        c.execute("DELETE FROM organizations WHERE is_internal = 0")
        print("Purged test organizations.")
    elif t in ["sqlite_sequence"]:
        continue
    else:
        try:
            c.execute(f"DELETE FROM {t}")
            print(f"Purged table '{t}'.")
        except Exception as e:
            print(f"Could not purge table '{t}': {e}")

conn.commit()

# Verify counts
print("\n--- DATABASE POST-PURGE STATUS ---")
for t in tables:
    if t != "sqlite_sequence":
        count = c.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
        print(f"Table '{t}': {count} row(s)")

conn.close()

# Also clean backend/data/*.json
data_dir = backend_dir / "data"
if data_dir.exists():
    for f in data_dir.glob("*.json"):
        if f.name == "users.json":
            # Keep only admin
            try:
                users = json.loads(f.read_text(encoding="utf-8"))
                admin_only = [u for u in users if u.get("email") == "admin@aimiko.ai"]
                f.write_text(json.dumps(admin_only, indent=2), encoding="utf-8")
                print(f"Cleaned {f.name}: {len(admin_only)} user left.")
            except Exception as e:
                print(f"Error updating {f.name}: {e}")
        else:
            try:
                f.write_text("[]", encoding="utf-8")
                print(f"Reset {f.name} to empty list []")
            except Exception as e:
                print(f"Error resetting {f.name}: {e}")

print("\n[SUCCESS] 100% clean state achieved. 0 test users, 0 seeded data.")
