import uuid
from datetime import datetime

from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: uuid.UUID
    filename: str
    file_size_bytes: int
    page_count: int | None
    status: str
    failure_reason: str | None
    uploaded_at: datetime

    class Config:
        from_attributes = True