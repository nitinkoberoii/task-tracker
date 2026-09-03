"""add categories and task association

Revision ID: 20260903_02
Revises: 20260903_01
Create Date: 2026-09-03 04:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260903_02"
down_revision: str | None = "20260903_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    with op.batch_alter_table("tasks") as batch:
        batch.add_column(sa.Column("category_id", sa.Integer(), nullable=True))
        batch.create_foreign_key(
            "fk_tasks_category_id_categories", "categories", ["category_id"], ["id"]
        )


def downgrade() -> None:
    with op.batch_alter_table("tasks") as batch:
        batch.drop_constraint("fk_tasks_category_id_categories", type_="foreignkey")
        batch.drop_column("category_id")
    op.drop_table("categories")
