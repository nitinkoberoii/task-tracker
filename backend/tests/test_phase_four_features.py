from fastapi.testclient import TestClient

from app.main import app


def test_task_insights_and_due_dates() -> None:
    client = TestClient(app)

    created = client.post(
        "/api/tasks",
        json={"title": "Urgent client review", "due_date": "2026-09-10"},
    )
    assert created.status_code == 201
    assert created.json()["due_date"] == "2026-09-10"

    insights = client.get("/api/tasks/insights", params={"title": "urgent client review"})
    assert insights.status_code == 200
    assert insights.json()["suggested_priority"] == "high"
    assert insights.json()["duplicates"] == [
        {"id": created.json()["id"], "title": "Urgent client review"}
    ]

    updated = client.patch(
        f"/api/tasks/{created.json()['id']}", json={"due_date": None}
    )
    assert updated.status_code == 200
    assert updated.json()["due_date"] is None


def test_low_priority_is_suggested_without_keywords() -> None:
    response = TestClient(app).get("/api/tasks/insights", params={"title": "Organize bookshelf"})

    assert response.status_code == 200
    assert response.json() == {"suggested_priority": "low", "duplicates": []}
