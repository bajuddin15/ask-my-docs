import enum
import uuid
from datetime import datetime
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class WorkspacePlan(str, enum.Enum):
    free = "free"
    pro = "pro"
    team = "team"


class Workspace(Base):
    __tablename__ = "workspaces"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    plan: Mapped[WorkspacePlan] = mapped_column(Enum(WorkspacePlan), default=WorkspacePlan.free, nullable=False)

    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    monthly_query_count: Mapped[int] = mapped_column(Integer, default=0)
    monthly_query_limit: Mapped[int] = mapped_column(Integer, default=1000)

    # agent behavior — first-class workspace settings, not hardcoded constants
    critic_enabled: Mapped[bool] = mapped_column(default=True)
    max_critic_retries: Mapped[int] = mapped_column(Integer, default=2)
    answer_model: Mapped[str] = mapped_column(String(50), default="gpt-4o-mini")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")