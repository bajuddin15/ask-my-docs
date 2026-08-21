"""
Orchestrates the full ingestion pipeline for one document:
  1. extract text page-by-page
  2. chunk each page's text
  3. embed all chunks in one batch call
  4. store Chunk rows, then flip Document.status

Runs as a FastAPI BackgroundTask so the upload request returns immediately
(status="processing") while this keeps working.
"""
import uuid

from app.core.database import AsyncSessionLocal
from app.models.chunk import Chunk
from app.models.document import Document, DocumentStatus
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed_texts
from app.rag.extraction import extract_pages, get_page_count


async def ingest_document(document_id: uuid.UUID) -> None:
    """
    Owns its own DB session because it runs in a background task, outside
    the request/response cycle where the request's session would already
    be closed.
    """
    async with AsyncSessionLocal() as db:
        document = await db.get(Document, document_id)
        if document is None:
            return

        try:
            pages = extract_pages(document.storage_path)
            document.page_count = get_page_count(document.storage_path)

            page_chunks: list[tuple[int, str]] = []
            for page_number, page_text in pages:
                for chunk in chunk_text(page_text):
                    page_chunks.append((page_number, chunk))

            if not page_chunks:
                document.status = DocumentStatus.failed
                document.failure_reason = "No extractable text found in this file"
                await db.commit()
                return

            chunk_strings = [c for _, c in page_chunks]
            vectors = await embed_texts(chunk_strings)

            for (page_number, content), vector in zip(page_chunks, vectors):
                db.add(
                    Chunk(
                        id=uuid.uuid4(),
                        document_id=document.id,
                        content=content,
                        embedding=vector,
                        page_number=page_number,
                    )
                )

            document.status = DocumentStatus.indexed
            await db.commit()

        except Exception as exc:  # noqa: BLE001 — any failure marks doc failed, doesn't crash the worker
            document.status = DocumentStatus.failed
            document.failure_reason = str(exc)[:500]
            await db.commit()