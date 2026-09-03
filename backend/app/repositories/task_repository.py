from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task


def list_tasks(database: Session) -> list[Task]:
    statement = select(Task).order_by(Task.created_at.desc(), Task.id.desc())
    return list(database.scalars(statement))


def get_task(database: Session, task_id: int) -> Task | None:
    return database.get(Task, task_id)


def save_task(database: Session, task: Task) -> Task:
    database.add(task)
    database.commit()
    database.refresh(task)
    return task


def delete_task(database: Session, task: Task) -> None:
    database.delete(task)
    database.commit()
