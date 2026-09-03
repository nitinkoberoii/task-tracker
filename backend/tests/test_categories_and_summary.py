from fastapi.testclient import TestClient

from app.main import app


def test_categories_can_be_assigned_and_summary_tracks_completion() -> None:
    client = TestClient(app)

    category = client.post("/api/categories", json={"name": "Work"})
    assert category.status_code == 201
    category_id = category.json()["id"]

    duplicate = client.post("/api/categories", json={"name": "work"})
    assert duplicate.status_code == 409

    task = client.post("/api/tasks", json={"title": "Plan release", "category_id": category_id})
    assert task.status_code == 201
    task_data = task.json()
    assert task_data["category"]["name"] == "Work"

    summary = client.get("/api/tasks/summary")
    assert summary.status_code == 200
    assert summary.json() == {
        "total": 1,
        "completed": 0,
        "remaining": 1,
        "completion_percentage": 0,
    }

    completed = client.patch(f"/api/tasks/{task_data['id']}", json={"status": "completed"})
    assert completed.status_code == 200

    summary = client.get("/api/tasks/summary")
    assert summary.json() == {
        "total": 1,
        "completed": 1,
        "remaining": 0,
        "completion_percentage": 100,
    }
