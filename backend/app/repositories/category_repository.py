from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category


def list_categories(database: Session) -> list[Category]:
    return list(database.scalars(select(Category).order_by(Category.name)))


def get_category(database: Session, category_id: int) -> Category | None:
    return database.get(Category, category_id)


def get_category_by_name(database: Session, name: str) -> Category | None:
    statement = select(Category).where(func.lower(Category.name) == name.lower())
    return database.scalar(statement)


def save_category(database: Session, category: Category) -> Category:
    database.add(category)
    database.commit()
    database.refresh(category)
    return category
