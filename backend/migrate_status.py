"""Add status column to orders table (SQLite safe migration)."""
from sqlalchemy import text
from database import SessionLocal

db = SessionLocal()
try:
    db.execute(text("ALTER TABLE orders ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'completed'"))
    db.commit()
    print("✅ status column added to orders table")
except Exception as e:
    if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
        print("ℹ️  status column already exists — skipping")
    else:
        print(f"❌ Error: {e}")
finally:
    db.close()
