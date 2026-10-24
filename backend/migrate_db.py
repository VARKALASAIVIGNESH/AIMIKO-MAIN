"""Database auto-migration utility to ensure all SQLite tables have all columns defined in models."""

import sqlite3
from app.core.database import Base, engine
from app.models import *

def migrate():
    # 1. Create any missing tables
    Base.metadata.create_all(bind=engine)

    # 2. Inspect existing columns and add any missing ones
    conn = sqlite3.connect("aimiko.db")
    cursor = conn.cursor()

    type_mapping = {
        "VARCHAR": "VARCHAR(255)",
        "STRING": "VARCHAR(255)",
        "TEXT": "TEXT",
        "INTEGER": "INTEGER",
        "BOOLEAN": "BOOLEAN",
        "DATETIME": "DATETIME",
        "FLOAT": "FLOAT",
        "JSON": "TEXT",
    }

    for table_name, table in Base.metadata.tables.items():
        cursor.execute(f"PRAGMA table_info({table_name})")
        existing_cols = {row[1]: row for row in cursor.fetchall()}

        for column in table.columns:
            if column.name not in existing_cols:
                col_type_str = str(column.type).split("(")[0].upper()
                sql_type = type_mapping.get(col_type_str, "VARCHAR(255)")
                
                # Default values for booleans/strings
                default_clause = ""
                if str(column.type).upper().startswith("BOOL"):
                    default_clause = " DEFAULT 0"
                
                alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {column.name} {sql_type}{default_clause}"
                print(f"Adding column: {table_name}.{column.name} ({sql_type})")
                try:
                    cursor.execute(alter_sql)
                except Exception as e:
                    print(f"Error altering {table_name}.{column.name}: {e}")

    conn.commit()
    conn.close()
    print("Database migration completed successfully!")

if __name__ == "__main__":
    migrate()
