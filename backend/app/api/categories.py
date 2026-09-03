from datetime import datetime

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy.orm import Session

from app.db import get_db
from app.services import category_service

router = APIRouter(prefix="/categories", tags=["categories"])


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Category name must not be blank.")
        return value


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    created_at: datetime


@router.get("", response_model=list[CategoryResponse])
def list_categories(database: Session = Depends(get_db)) -> list[CategoryResponse]:
    return category_service.list_categories(database)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate, database: Session = Depends(get_db)
) -> CategoryResponse:
    return category_service.create_category(database, payload.name)
