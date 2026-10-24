"""JSON Storage Service.

Persists all database tables as human-readable JSON files inside `backend/data/`
and syncs state on backend startup and model commits.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

from sqlalchemy import inspect
from sqlalchemy.orm import Session

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def _json_serializer(obj: Any) -> Any:
    if isinstance(obj, datetime):
        return obj.isoformat()
    return str(obj)


class JSONStore:
    """Handles JSON file persistence for all models."""

    @staticmethod
    def get_data_dir() -> Path:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        return DATA_DIR

    @classmethod
    def dump_table(cls, session: Session, model_class: type) -> None:
        """Export all rows of a model table to a JSON file."""
        data_dir = cls.get_data_dir()
        table_name = model_class.__tablename__
        json_file = data_dir / f"{table_name}.json"

        query = session.query(model_class).all()
        records: List[Dict[str, Any]] = []

        inst = inspect(model_class)
        col_names = [c.key for c in inst.mapper.column_attrs]

        for item in query:
            row = {}
            for col in col_names:
                val = getattr(item, col)
                if isinstance(val, datetime):
                    val = val.isoformat() if val else None
                row[col] = val
            records.append(row)

        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, default=_json_serializer)

    @classmethod
    def dump_all(cls, session: Session) -> None:
        """Export all database models to JSON files."""
        from app.models import (
            AuditLog,
            ContactSubmission,
            Customer,
            DemoSession,
            Lead,
            Organization,
            Project,
            UsageMetric,
            User,
        )

        models = [
            Organization,
            User,
            Lead,
            ContactSubmission,
            Customer,
            Project,
            UsageMetric,
            DemoSession,
            AuditLog,
        ]
        for model in models:
            cls.dump_table(session, model)

    @classmethod
    def load_table(cls, session: Session, model_class: type) -> None:
        """Import rows from a JSON file into the database table if empty."""
        table_name = model_class.__tablename__
        json_file = cls.get_data_dir() / f"{table_name}.json"

        if not json_file.exists():
            return

        if session.query(model_class).count() > 0:
            return

        with open(json_file, "r", encoding="utf-8") as f:
            records = json.load(f)

        inst = inspect(model_class)
        cols_by_name = {c.key: c for c in inst.mapper.column_attrs}

        for record in records:
            cleaned_row = {}
            for key, val in record.items():
                if key in cols_by_name:
                    # Convert ISO datetime strings back to datetime objects
                    col_prop = cols_by_name[key]
                    col_type = str(col_prop.columns[0].type).lower() if col_prop.columns else ""
                    if "datetime" in col_type and isinstance(val, str) and val:
                        try:
                            val = datetime.fromisoformat(val)
                        except ValueError:
                            pass
                    cleaned_row[key] = val
            obj = model_class(**cleaned_row)
            session.add(obj)
        session.commit()

    @classmethod
    def load_all(cls, session: Session) -> None:
        """Import all JSON files into database tables."""
        from app.models import (
            AuditLog,
            ContactSubmission,
            Customer,
            DemoSession,
            Lead,
            Organization,
            Project,
            UsageMetric,
            User,
        )

        models = [
            Organization,
            User,
            Lead,
            ContactSubmission,
            Customer,
            Project,
            UsageMetric,
            DemoSession,
            AuditLog,
        ]
        for model in models:
            cls.load_table(session, model)
