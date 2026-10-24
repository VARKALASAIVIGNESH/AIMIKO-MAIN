"""Database Reset Utility for AIMIKO Development & Testing.

Deletes all test users, organizations, audit logs, and resets data files
so testing can be repeated with fresh Google OAuth and email signups.
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal
from app.core.config import settings
from app.models import (
    User,
    Organization,
    AuditLog,
    PaymentTransaction,
    LearnSubmission,
    LearnAssignment,
    Project,
    Customer,
    UsageMetric,
    ContactSubmission,
    Lead,
    DemoSession
)
from app.services.json_store import JSONStore
from app.seed import _ensure_admin

def reset_test_data():
    from app.models import (
        BuddyNote,
        BuddyPlannerTask,
        MikodinPost,
        BuddyConversation,
        BuddyMessage,
        CreatorAsset,
    )
    db = SessionLocal()
    try:
        print("[AIMIKO DB RESET] Cleaning up database...")

        # Clear all user generated operational and Buddy data
        db.query(BuddyMessage).delete(synchronize_session=False)
        db.query(BuddyConversation).delete(synchronize_session=False)
        db.query(BuddyNote).delete(synchronize_session=False)
        db.query(BuddyPlannerTask).delete(synchronize_session=False)
        db.query(MikodinPost).delete(synchronize_session=False)
        db.query(CreatorAsset).delete(synchronize_session=False)
        db.query(AuditLog).delete(synchronize_session=False)
        db.query(PaymentTransaction).delete(synchronize_session=False)
        db.query(LearnSubmission).delete(synchronize_session=False)
        db.query(LearnAssignment).delete(synchronize_session=False)
        db.query(Customer).delete(synchronize_session=False)
        db.query(Project).delete(synchronize_session=False)
        db.query(Lead).delete(synchronize_session=False)
        db.query(ContactSubmission).delete(synchronize_session=False)
        db.query(DemoSession).delete(synchronize_session=False)
        db.query(UsageMetric).delete(synchronize_session=False)
        print("  Cleared all Buddy notes, messages, conversations, tasks, posts, and operational logs.")
        
        # 1. Identify non-admin users to delete
        test_users = db.query(User).filter(User.email != settings.admin_email).all()
        user_ids = [u.id for u in test_users]
        user_emails = [u.email for u in test_users]
        print(f"  Found {len(test_users)} test user(s) to remove: {user_emails}")
        
        # 2. Delete test users and their non-internal organizations
        for u in test_users:
            org_id = u.organization_id
            db.delete(u)
            if org_id:
                org = db.query(Organization).filter(Organization.id == org_id, Organization.is_internal.is_(False)).first()
                if org:
                    db.delete(org)
                    
        db.commit()
        
        # 3. Ensure bootstrap admin is present and healthy
        admin = _ensure_admin(db)
        print(f"  Bootstrap admin verified: {admin.email}")
        
        # 4. Synchronize JSONStore so deleted users are removed from backend/data/*.json
        print("  Synchronizing JSON storage files...")
        JSONStore.dump_all(db)
        
        print("[SUCCESS] All test users and records have been deleted from database and JSON storage.")
        print("You can now test new Google OAuth or email signups from a clean state.")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Reset failed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    reset_test_data()
