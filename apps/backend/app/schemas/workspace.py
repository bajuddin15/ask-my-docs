import uuid
from pydantic import BaseModel


class WorkspaceResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    plan: str
    role: str  # the requesting user's role in this workspace

    class Config:
        from_attributes = True