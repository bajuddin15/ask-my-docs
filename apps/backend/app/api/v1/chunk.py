import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_workspace
from app.core.database import get_db
from app.models.chunk import Chunk
from app.models.document import Document
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.chunk import ChunkDetailResponse

router = APIRouter(prefix="/chunks", tags=["chunks"])


@router.get("/{chunk_id}", response_model=ChunkDetailResponse)
async def get_chunk(
    chunk_id: uuid.UUID,
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    result = await db.execute(
        select(Chunk, Document.filename)
        .join(Document, Document.id == Chunk.document_id)
        .where(Chunk.id == chunk_id, Document.workspace_id == workspace.id)
    )
    row = result.first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chunk not found in this workspace")
    chunk, filename = row
    return ChunkDetailResponse(id=chunk.id, content=chunk.content, page_number=chunk.page_number,
                                 document_id=chunk.document_id, filename=filename)