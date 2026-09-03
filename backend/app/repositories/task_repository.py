from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.task import Task, TaskStatus


def list_tasks(database: Session) -> list[Task]:
    statement = (
        select(Task)
        .options(joinedload(Task.category))
        .order_by(Task.created_at.desc(), Task.id.desc())
    )
    return list(database.scalars(statement))


def get_task(database: Session, task_id: int) -> Task | None:
    statement = select(Task).options(joinedload(Task.category)).where(Task.id == task_id)
    return database.scalar(statement)


def save_task(database: Session, task: Task) -> Task:
    database.add(task)
    database.commit()
    database.refresh(task)
    return task


def delete_task(database: Session, task: Task) -> None:
    database.delete(task)
    database.commit()


def get_summary(database: Session) -> tuple[int, int]:
    completed_expression = func.coalesce(
        func.sum(case((Task.status == TaskStatus.COMPLETED, 1), else_=0)), 0
    )
    total, completed = database.execute(select(func.count(Task.id), completed_expression)).one()
    return int(total), int(completed)
