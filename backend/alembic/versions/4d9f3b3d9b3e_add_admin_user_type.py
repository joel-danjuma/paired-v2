"""add admin user type

Revision ID: 4d9f3b3d9b3e
Revises: 
Create Date: 2024-07-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4d9f3b3d9b3e'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE usertype ADD VALUE 'admin'")


def downgrade():
    # Note: Downgrading this migration is destructive and will fail if any users have the 'admin' role.
    # A more robust downgrade would involve checking for existing 'admin' users and handling them appropriately.
    op.execute("ALTER TYPE usertype RENAME TO usertype_old")
    op.execute("CREATE TYPE usertype AS ENUM('seeker', 'provider', 'agent')")
    op.execute((
        "ALTER TABLE users ALTER COLUMN user_type TYPE usertype USING "
        "user_type::text::usertype"
    ))
    op.execute("DROP TYPE usertype_old") 