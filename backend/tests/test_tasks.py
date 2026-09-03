from fastapi.testclient import TestClient

from app.main import app


def test_task_lifecycle() -> None:
    client = TestClient(app)

    created = client.post(
        "/api/tasks", json={"title": "  Prepare demo  ", "description": "Record it."}
    )
    assert created.status_code == 201
    task = created.json()
    assert task["title"] == "Prepare demo"
    assert task["status"] == "pending"

    task_id = task["id"]
    listed = client.get("/api/tasks")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [task_id]

    completed = client.patch(f"/api/tasks/{task_id}", json={"status": "completed"})
    assert completed.status_code == 200
    assert completed.json()["status"] == "completed"
    assert completed.json()["completed_at"] is not None

    updated = client.patch(
        f"/api/tasks/{task_id}", json={"title": "Share demo", "status": "pending"}
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Share demo"
    assert updated.json()["completed_at"] is None

    deleted = client.delete(f"/api/tasks/{task_id}")
    assert deleted.status_code == 204
    assert client.get(f"/api/tasks/{task_id}").status_code == 404


def test_blank_task_title_is_rejected() -> None:
    response = TestClient(app).post("/api/tasks", json={"title": "   "})

    assert response.status_code == 422
