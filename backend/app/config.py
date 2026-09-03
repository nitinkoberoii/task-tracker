from dataclasses import dataclass
from os import getenv

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str
    frontend_origin: str
    groq_api_key: str | None
    groq_model: str


def get_settings() -> Settings:
    return Settings(
        database_url=getenv("DATABASE_URL", "sqlite:///./task_tracker.db"),
        frontend_origin=getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        groq_api_key=getenv("GROQ_API_KEY") or None,
        groq_model=getenv("GROQ_MODEL", "openai/gpt-oss-20b"),
    )
