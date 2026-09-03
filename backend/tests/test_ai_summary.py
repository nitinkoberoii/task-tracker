from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.services import task_summary_service


def test_ai_summary_returns_groq_response(monkeypatch) -> None:
    class FakeCompletions:
        def create(self, **_kwargs):
            return SimpleNamespace(
                choices=[
                    SimpleNamespace(
                        message=SimpleNamespace(content="One task remains: Prepare demo.")
                    )
                ]
            )

    fake_client = SimpleNamespace(chat=SimpleNamespace(completions=FakeCompletions()))
    monkeypatch.setattr(task_summary_service, "_create_client", lambda _api_key: fake_client)

    client = TestClient(app)
    client.post(
        "/api/tasks",
        json={"title": "Prepare demo", "description": "Record the walkthrough."},
    )

    response = client.get("/api/tasks/ai-summary")

    assert response.status_code == 200
    assert response.json() == {"summary": "One task remains: Prepare demo."}


def test_ai_summary_requires_configured_key(monkeypatch) -> None:
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    response = TestClient(app).get("/api/tasks/ai-summary")

    assert response.status_code == 503
    assert "GROQ_API_KEY" in response.json()["detail"]
