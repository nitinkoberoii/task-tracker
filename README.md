# Smart Task Tracker

An MVP task-management application built with React, FastAPI, and SQLite. It supports task lifecycle management, categories, and progress summaries.

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

## Client acceptance test

Use this checklist after starting both services. It verifies all required MVP behavior through the browser.

1. Open `http://localhost:5173` and confirm the header shows **API connected** in green. If it shows **API unavailable**, start the backend or check that it is using port `8000`.
2. Select **Add task**, enter a title and optional description, then choose **Save task**. Expect to return to the dashboard and see the new task.
3. Refresh the browser. Expect the task to remain, proving it was stored in SQLite.
4. Select **Edit** for the task, change its title or description, and save. Expect the updated values to appear on the dashboard.
5. Select the task checkbox. Expect its completed styling to appear and the **Completed**, **Remaining**, and **Progress** summary metrics to update. Clear the checkbox to reopen it and expect the metrics to reverse.
6. Create a category in the **New category** field, for example `Personal`. Expect it to become available in the category filter and task form.
7. Edit or create a task and assign `Personal`. Expect a `Personal` badge on that task.
8. Choose `Personal` from the dashboard category filter. Expect only Personal tasks to appear. Return to **All categories** to see every task.
9. Attempt to add `personal` after `Personal` exists. Expect a duplicate-category error; category matching is case-insensitive.
10. Select **Delete** for a task. Expect a confirmation prompt. Confirm it and expect the task to disappear and the summary metrics to update.
11. Select **Add task**, leave the title empty, and submit. Expect the message **Enter a task title.**
12. Stop the backend and refresh the browser. Expect a helpful API error with a **Try again** button. Restart the backend and select **Try again**; expect the dashboard to recover.

For direct API verification, open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). The health check, task routes, category routes, and summary endpoint are interactive there.

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
- Create categories, assign them to tasks, and filter the task dashboard by category.
- View total, completed, remaining, and completion-percentage summary metrics.
- Persistent SQLite task storage managed through Alembic migrations.
- React dashboard with loading, empty, and API-error states.
- FastAPI task API and interactive API documentation.
- Automated frontend component tests and backend API lifecycle tests.
