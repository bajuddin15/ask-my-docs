import uuid
from datetime import datetime

from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    chat_id: uuid.UUID | None = None  # omit to start a new conversation


class SourceRef(BaseModel):
    index: int  # matches the [1], [2] markers in the answer text
    document_id: uuid.UUID
    chunk_id: uuid.UUID
    filename: str
    page_number: int | None
    similarity: float


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    sources: list[SourceRef]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    chat_id: uuid.UUID
    message: MessageResponse