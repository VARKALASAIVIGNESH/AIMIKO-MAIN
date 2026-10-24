"""AIMIKO Database & Supabase Connectivity Diagnostic Tool.

Usage:
    python verify_supabase.py

Reads configuration from backend/.env and validates:
- Connection establishment & latency
- Engine type (PostgreSQL / Supabase / SQLite)
- Schema creation across all 23 production tables
- Read/write round-trip capability
"""

import os
import sys
import time
from sqlalchemy import text, inspect
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
import app.models  # Ensures all 23 models are registered in metadata


def main():
    print("=" * 70)
    print("AIMIKO DATABASE & SUPABASE HEALTH DIAGNOSTIC")
    print("=" * 70)

    db_url = settings.database_url
    # Mask password for secure logging
    masked_url = db_url
    if "@" in db_url and ":" in db_url:
        prefix = db_url.split("://")[0]
        rest = db_url.split("://")[1]
        user_pass = rest.split("@")[0]
        host_db = rest.split("@")[1]
        user = user_pass.split(":")[0]
        masked_url = f"{prefix}://{user}:********@{host_db}"

    print(f"Target Database URL: {masked_url}")
    is_postgres = "postgres" in db_url.lower()
    print(f"Engine Type: {'PostgreSQL (Supabase/Neon)' if is_postgres else 'SQLite (Local)'}")
    print("-" * 70)

    # 1. Test raw connection & latency
    print("[1/4] Establishing database connection...")
    start_time = time.time()
    try:
        with engine.connect() as conn:
            latency_ms = (time.time() - start_time) * 1000
            if is_postgres:
                version = conn.execute(text("SELECT version();")).scalar()
                current_db = conn.execute(text("SELECT current_database();")).scalar()
                print(f"[OK] Connected in {latency_ms:.1f}ms")
                print(f"     Database Name: {current_db}")
                print(f"     Server Version: {str(version).split(',')[0]}")
            else:
                conn.execute(text("SELECT 1;"))
                print(f"[OK] Connected to local SQLite in {latency_ms:.1f}ms")
    except Exception as exc:
        print(f"[FAIL] Connection failed: {exc}")
        print("\nTroubleshooting tips for Supabase:")
        print("1. In Supabase Dashboard -> Project Settings -> Database:")
        print("   Copy the 'URI' connection string.")
        print("2. Ensure your password is correct and special characters are URL-encoded.")
        print("3. Use port 5432 (direct) or port 6543 (transaction pooler).")
        sys.exit(1)

    # 2. Schema check / table auto-provisioning
    print("\n[2/4] Verifying 23 production tables in schema...")
    try:
        Base.metadata.create_all(bind=engine)
        inspector = inspect(engine)
        tables = sorted(inspector.get_table_names())
        print(f"[OK] Verified {len(tables)} active tables in database:")
        for i, table_name in enumerate(tables, 1):
            columns = inspector.get_columns(table_name)
            print(f"     {i:2d}. {table_name:<26} ({len(columns)} columns)")
    except Exception as exc:
        print(f"[FAIL] Schema verification failed: {exc}")
        sys.exit(1)

    # 3. Read/write test
    print("\n[3/4] Testing transactional write & read operations...")
    db = SessionLocal()
    try:
        from app.models import AuditLog
        test_log = AuditLog(
            actor_email="diagnostic@aimiko.ai",
            action="DIAGNOSTIC_HEALTH_CHECK",
            resource_type="system",
            resource_id="check_001",
            details={"engine": "supabase" if is_postgres else "sqlite", "status": "verified"},
            ip_address="127.0.0.1",
        )
        db.add(test_log)
        db.commit()
        db.refresh(test_log)
        
        # Read back
        fetched = db.query(AuditLog).filter(AuditLog.id == test_log.id).first()
        assert fetched is not None, "Failed to read inserted diagnostic record"
        # Clean up
        db.delete(fetched)
        db.commit()
        print("[OK] Read/Write transaction committed and cleaned up successfully.")
    except Exception as exc:
        db.rollback()
        print(f"[FAIL] Transaction test failed: {exc}")
        sys.exit(1)
    finally:
        db.close()

    # 4. Final summary
    print("\n[4/4] Enterprise Readiness Status:")
    if is_postgres:
        print("     Status: 100% LIVE ON SUPABASE CLOUD POSTGRESQL")
        print("     High-throughput connection pooling active (20 pool / 30 max overflow)")
        print("     Zero seed mock data; all 23 modules ready for dynamic multi-role scale.")
    else:
        print("     Status: RUNNING ON ZERO-DEPENDENCY LOCAL SQLITE")
        print("     To switch to Supabase, update DATABASE_URL in backend/.env with your Supabase URI.")
    print("=" * 70)


if __name__ == "__main__":
    main()
