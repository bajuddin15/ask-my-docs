import uuid
from pydantic import BaseModel, EmailStr, Field


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: str
    role: str
    monthly_query_count: int
    monthly_query_limit: int

    class Config:
        from_attributes = True


class CreateWorkspaceRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)


class MemberResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    role: str
    status: str
    joined_at: str | None

    class Config:
        from_attributes = True


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = Field(default="member", pattern="^(admin|member)$")


class WorkspaceSettingsRequest(BaseModel):
    critic_enabled: bool | None = None
    max_critic_retries: int | None = Field(default=None, ge=0, le=5)
    answer_model: str | None = None


class WorkspaceSettingsResponse(BaseModel):
    critic_enabled: bool
    max_critic_retries: int
    answer_model: str

    class Config:
        from_attributes = True