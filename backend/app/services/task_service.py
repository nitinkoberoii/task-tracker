from datetime import UTC, date, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.task import Task, TaskStatus
from app.repositories import task_repository


def normalize_title(title: str) -> str:
    return " ".join(title.split())


def normalize_description(description: str | None) -> str | None:
    if description is None:
        return None
    normalized = description.strip()
    return normalized or None


def list_tasks(database: Session) -> list[Task]:
    return task_repository.list_tasks(database)


def get_task_or_404(database: Session, task_id: int) -> Task:
    task = task_repository.get_task(database, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found.")
    return task


def create_task(
    database: Session,
    title: str,
    description: str | None,
    category: Category | None,
    due_date: date | None,
) -> Task:
    task = Task(
        title=normalize_title(title),
        description=normalize_description(description),
        category=category,
        due_date=due_date,
    )
    return task_repository.save_task(database, task)


def update_task(
    database: Session,
    task: Task,
    title: str | None,
    description: str | None,
    status_value: TaskStatus | None,
    category_updated: bool,
    category: Category | None,
    due_date_updated: bool,
    due_date: date | None,
) -> Task:
    if title is not None:
        task.title = normalize_title(title)
    if description is not None:
        task.description = normalize_description(description)
    if status_value is not None and task.status != status_value:
        task.status = status_value
        task.completed_at = datetime.now(UTC) if status_value == TaskStatus.COMPLETED else None
    if category_updated:
        task.category = category
    if due_date_updated:
        task.due_date = due_date
    return task_repository.save_task(database, task)


def delete_task(database: Session, task: Task) -> None:
    task_repository.delete_task(database, task)


def get_summary(database: Session) -> dict[str, int | float]:
    total, completed = task_repository.get_summary(database)
    remaining = total - completed
    percentage = round((completed / total) * 100, 1) if total else 0
    return {
        "total": total,
        "completed": completed,
        "remaining": remaining,
        "completion_percentage": percentage,
    }


def suggest_priority(title: str) -> str:
    normalized = normalize_title(title).lower()
    high_keywords = ("urgent", "asap", "today", "important", "deadline")
    medium_keywords = ("review", "meeting", "email", "call", "follow up")
    if any(keyword in normalized for keyword in high_keywords):
        return "high"
    if any(keyword in normalized for keyword in medium_keywords):
        return "medium"
    return "low"


def find_duplicate_tasks(database: Session, title: str, exclude_task_id: int | None) -> list[Task]:
    normalized = normalize_title(title).casefold()
    if not normalized:
        return []
    return [
        task
        for task in task_repository.list_task_titles(database)
        if task.id != exclude_task_id and normalize_title(task.title).casefold() == normalized
    ]
