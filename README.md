# Smart Task Tracker

An MVP task-management application built with React, FastAPI, and SQLite. Phase 0 provides a runnable frontend/backend skeleton, health check, database model foundation, quality tooling, and tests. Core task workflows are scheduled for Phase 1.

## Prerequisites

- Node.js 20 or newer and npm.
- Python 3.12 or newer.
- [uv](https://docs.astral.sh/uv/) (recommended for the backend), or Python's `venv` and `pip`.

## Run locally

Open two terminals from the repository root.

### Backend

```powershell
cd backend
Copy-Item .env.example .env
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

The health endpoint is available at [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health). The interactive API documentation is at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

### Frontend

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open the URL printed by Vite (normally [http://localhost:5173](http://localhost:5173)). The frontend checks the backend health endpoint at startup; run both services to see a healthy connection.

## Quality commands

```powershell
# Backend
cd backend
uv run ruff check .
uv run pytest

# Frontend
cd frontend
npm run lint
npm run test
npm run build
```

## Database and migrations

SQLite is used by default. The database URL is configured through `DATABASE_URL` in `backend/.env`; the default points to `backend/task_tracker.db`. SQLAlchemy models live in `backend/app/models/`, and Alembic is configured in `backend/alembic/`.

When a schema change is intentionally introduced, create and review a migration before committing it:

```powershell
cd backend
uv run alembic revision --autogenerate -m "describe schema change"
uv run alembic upgrade head
```

Do not edit generated migration history to hide a schema change. The initial `20260903_01` migration creates the task table; categories will be introduced in Phase 2.

## Current features

- Create, list, edit, delete, complete, and reopen tasks.
- Persistent SQLite task storage managed through Alembic migrations.
- React dashboard with loading, empty, and API-error states.
- FastAPI task API and interactive API documentation.
- Automated frontend health check and backend task lifecycle tests.
