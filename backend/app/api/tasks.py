from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.api.categories import CategoryResponse
from app.db import get_db
from app.models.task import TaskStatus
from app.services import category_service, task_service, task_summary_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    category_id: int | None = None
    due_date: date | None = None

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
    category_id: int | None = None
    due_date: date | None = None

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
    category: CategoryResponse | None
    due_date: date | None
    position: int


@router.get("", response_model=list[TaskResponse])
def list_tasks(database: Session = Depends(get_db)) -> list[TaskResponse]:
    return task_service.list_tasks(database)


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, database: Session = Depends(get_db)) -> TaskResponse:
    category = (
        category_service.get_category_or_404(database, payload.category_id)
        if payload.category_id
        else None
    )
    return task_service.create_task(
        database, payload.title, payload.description, category, payload.due_date
    )


class SummaryResponse(BaseModel):
    total: int
    completed: int
    remaining: int
    completion_percentage: float


class AiSummaryResponse(BaseModel):
    summary: str


@router.get("/summary", response_model=SummaryResponse)
def get_summary(database: Session = Depends(get_db)) -> SummaryResponse:
    return task_service.get_summary(database)


@router.get("/ai-summary", response_model=AiSummaryResponse)
def get_ai_summary(database: Session = Depends(get_db)) -> AiSummaryResponse:
    tasks = task_service.list_tasks(database)
    return AiSummaryResponse(summary=task_summary_service.summarize_tasks(tasks))


class DuplicateTaskResponse(BaseModel):
    id: int
    title: str


class TaskInsightsResponse(BaseModel):
    suggested_priority: Literal["high", "medium", "low"]
    duplicates: list[DuplicateTaskResponse]


class TaskOrderUpdate(BaseModel):
    task_ids: list[int]


@router.get("/insights", response_model=TaskInsightsResponse)
def get_task_insights(
    title: str = "", exclude_task_id: int | None = None, database: Session = Depends(get_db)
) -> TaskInsightsResponse:
    duplicates = task_service.find_duplicate_tasks(database, title, exclude_task_id)
    return TaskInsightsResponse(
        suggested_priority=task_service.suggest_priority(title),
        duplicates=[DuplicateTaskResponse(id=task.id, title=task.title) for task in duplicates],
    )


@router.put("/order", response_model=list[TaskResponse])
def reorder_tasks(
    payload: TaskOrderUpdate, database: Session = Depends(get_db)
) -> list[TaskResponse]:
    return task_service.reorder_tasks(database, payload.task_ids)


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
        "category_id" in updates,
        category_service.get_category_or_404(database, payload.category_id)
        if payload.category_id is not None
        else None,
        "due_date" in updates,
        payload.due_date if "due_date" in updates else None,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, database: Session = Depends(get_db)) -> Response:
    task_service.delete_task(database, task_service.get_task_or_404(database, task_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
