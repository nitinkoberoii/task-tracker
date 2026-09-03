"""add task due dates

Revision ID: 20260903_03
Revises: 20260903_02
Create Date: 2026-09-03 17:00:00
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20260903_03"
down_revision: str | None = "20260903_02"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("tasks") as batch:
        batch.add_column(sa.Column("due_date", sa.Date(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("tasks") as batch:
        batch.drop_column("due_date")
