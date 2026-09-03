from dataclasses import dataclass
from os import getenv

from dotenv import load_dotenv

load_dotenv()


def normalize_database_url(database_url: str) -> str:
    """Use psycopg with Railway's standard PostgreSQL connection URL."""
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


@dataclass(frozen=True)
class Settings:
    database_url: str
    frontend_origin: str
    groq_api_key: str | None
    groq_model: str


def get_settings() -> Settings:
    return Settings(
        database_url=normalize_database_url(
            getenv("DATABASE_URL", "sqlite:///./task_tracker.db")
        ),
        frontend_origin=getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        groq_api_key=getenv("GROQ_API_KEY") or None,
        groq_model=getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    )
