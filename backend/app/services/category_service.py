from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories import category_repository


def normalize_name(name: str) -> str:
    return " ".join(name.split())


def list_categories(database: Session) -> list[Category]:
    return category_repository.list_categories(database)


def get_category_or_404(database: Session, category_id: int) -> Category:
    category = category_repository.get_category(database, category_id)
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    return category


def create_category(database: Session, name: str) -> Category:
    normalized_name = normalize_name(name)
    if category_repository.get_category_by_name(database, normalized_name) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="A category with this name exists."
        )
    return category_repository.save_category(database, Category(name=normalized_name))
