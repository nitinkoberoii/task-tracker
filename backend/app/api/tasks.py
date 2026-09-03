from datetime import datetime

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.task import TaskStatus
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Title must not be blank.")
        return value


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    status: TaskStatus | None = None

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("Title must not be blank.")
        return value


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    status: TaskStatus
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None


@router.get("", response_model=list[TaskResponse])
def list_tasks(database: Session = Depends(get_db)) -> list[TaskResponse]:
    return task_service.list_tasks(database)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, database: Session = Depends(get_db)) -> TaskResponse:
    return task_service.create_task(database, payload.title, payload.description)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, database: Session = Depends(get_db)) -> TaskResponse:
    return task_service.get_task_or_404(database, task_id)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int, payload: TaskUpdate, database: Session = Depends(get_db)
) -> TaskResponse:
    task = task_service.get_task_or_404(database, task_id)
    updates = payload.model_fields_set
    return task_service.update_task(
        database,
        task,
        payload.title if "title" in updates else None,
        payload.description if "description" in updates else None,
        payload.status if "status" in updates else None,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, database: Session = Depends(get_db)) -> Response:
    task_service.delete_task(database, task_service.get_task_or_404(database, task_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
