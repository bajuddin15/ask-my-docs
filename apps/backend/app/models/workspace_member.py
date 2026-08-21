import enum
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class MemberRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"


class MemberStatus(str, enum.Enum):
    active = "active"
    pending = "pending"


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    __table_args__ = (UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    role: Mapped[MemberRole] = mapped_column(Enum(MemberRole), default=MemberRole.member, nullable=False)
    status: Mapped[MemberStatus] = mapped_column(Enum(MemberStatus), default=MemberStatus.pending, nullable=False)

    invited_email: Mapped[str | None] = mapped_column(nullable=True)
    invited_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    joined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="memberships", foreign_keys=[user_id])