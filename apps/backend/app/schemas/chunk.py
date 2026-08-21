import uuid
from pydantic import BaseModel


class ChunkDetailResponse(BaseModel):
    id: uuid.UUID
    content: str
    page_number: int | None
    document_id: uuid.UUID
    filename: str

    class Config:
        from_attributes = True