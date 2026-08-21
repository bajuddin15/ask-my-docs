"""
Given a user's question, embeds it and runs a cosine-similarity search
over chunks — but ONLY chunks belonging to documents in the current
workspace. This join through Document is the actual enforcement point:
Chunk itself has no workspace_id column, so there is no way to accidentally
search across workspaces here even if a caller forgets to filter.
"""
import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chunk import Chunk
from app.models.document import Document, DocumentStatus
from app.rag.embeddings import get_embeddings_client

TOP_K = 6


@dataclass
class RetrievedChunk:
    chunk_id: uuid.UUID
    document_id: uuid.UUID
    filename: str
    page_number: int | None
    content: str
    similarity: float  # 1 - cosine_distance, so higher = more relevant


async def retrieve_relevant_chunks(
    db: AsyncSession,
    workspace_id: uuid.UUID,
    query: str,
    top_k: int = TOP_K,
) -> list[RetrievedChunk]:
    embeddings_client = get_embeddings_client()
    query_vector = await embeddings_client.aembed_query(query)

    distance = Chunk.embedding.cosine_distance(query_vector).label("distance")

    stmt = (
        select(Chunk, Document.filename, distance)
        .join(Document, Document.id == Chunk.document_id)
        .where(
            Document.workspace_id == workspace_id,
            Document.status == DocumentStatus.indexed,
        )
        .order_by(distance)
        .limit(top_k)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        RetrievedChunk(
            chunk_id=chunk.id,
            document_id=chunk.document_id,
            filename=filename,
            page_number=chunk.page_number,
            content=chunk.content,
            similarity=1 - dist,
        )
        for chunk, filename, dist in rows
    ]