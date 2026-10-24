"""Database engine, session and base class.

Uses SQLAlchemy 2.0. Defaults to SQLite for local development with zero
external dependencies; point DATABASE_URL at PostgreSQL in production
(e.g. postgresql+psycopg://user:pass@host:5432/aimiko).
"""

from sqlalchemy import event, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

db_url = settings.database_url

# Supabase / cloud providers format the scheme as postgres:// or postgresql://
# In SQLAlchemy 2.0+, explicit driver specification prevents ModuleNotFoundError
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

connect_args = {}
engine_kwargs = {
    "pool_pre_ping": True,
}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # High-throughput connection pooling optimized for Supabase / PostgreSQL
    engine_kwargs.update({
        "pool_size": 20,
        "max_overflow": 30,
        "pool_recycle": 300,
        "pool_timeout": 30,
    })

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


@event.listens_for(Session, "after_commit")
def sync_json_files(session: Session) -> None:
    try:
        from app.services.json_store import JSONStore
        JSONStore.dump_all(session)
    except Exception:
        pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

