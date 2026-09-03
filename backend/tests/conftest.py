import os

import pytest

os.environ["DATABASE_URL"] = "sqlite:///./test_task_tracker.db"

from app.db import Base, engine  # noqa: E402


@pytest.fixture(autouse=True)
def test_database() -> None:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
