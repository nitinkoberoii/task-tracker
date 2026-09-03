from dataclasses import dataclass
from os import getenv

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    database_url: str
    frontend_origin: str


def get_settings() -> Settings:
    return Settings(
        database_url=getenv("DATABASE_URL", "sqlite:///./task_tracker.db"),
        frontend_origin=getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
    )
