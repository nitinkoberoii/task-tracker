"""add task positions

Revision ID: 20260903_04
Revises: 20260903_03
Create Date: 2026-09-03 18:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260903_04"
down_revision: str | None = "20260903_03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("tasks") as batch:
        batch.add_column(sa.Column("position", sa.Integer(), nullable=False, server_default="0"))
    op.execute("UPDATE tasks SET position = id")


def downgrade() -> None:
    with op.batch_alter_table("tasks") as batch:
        batch.drop_column("position")
