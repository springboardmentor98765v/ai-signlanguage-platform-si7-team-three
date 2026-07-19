"""
Data Layer (Step 9 in the PDF).

Sets up the database connection. Uses SQLite for easy local
development/demo purposes. Swap SQLALCHEMY_DATABASE_URL to a
Postgres/MySQL URL for production deployment (see PDF: Infrastructure
Layer -> Data Layer -> separate User/Learning/Assessment/Analytics DBs).
For this intern-friendly build, all data lives in one database with
clearly separated tables, matching the "folders instead of microservices"
approach the PDF recommends for interns.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Overridable via env var so tests/Docker/CI can point at a different DB
# (e.g. a throwaway SQLite file, or Postgres in production) without code changes.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sign_language_platform.db")

connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session per-request, closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Creates all tables. Called on app startup (see app/main.py)."""
    from app import models  # noqa: F401 (import registers models with Base)
    Base.metadata.create_all(bind=engine)
