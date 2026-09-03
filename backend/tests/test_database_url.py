from app.config import normalize_database_url


def test_railway_postgres_urls_use_the_psycopg_driver() -> None:
    assert normalize_database_url("postgres://user:password@host:5432/database") == (
        "postgresql+psycopg://user:password@host:5432/database"
    )
    assert normalize_database_url("postgresql://user:password@host:5432/database") == (
        "postgresql+psycopg://user:password@host:5432/database"
    )


def test_sqlite_url_is_unchanged() -> None:
    assert normalize_database_url("sqlite:///./task_tracker.db") == "sqlite:///./task_tracker.db"
