import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.storage import save_upload
from app.models.document import Document, DocumentStatus
from app.models.workspace import Workspace

ALLOWED_CONTENT_TYPES = {"application/pdf"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25MB


async def create_document(
    db: AsyncSession,
    workspace: Workspace,
    uploaded_by: uuid.UUID,
    filename: str,
    content_type: str,
    content: bytes,
) -> Document:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF files are supported right now")
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File exceeds the 25MB limit")

    # enforce free-plan document cap (workspace-scoped, not user-scoped)
    count_result = await db.execute(select(Document).where(Document.workspace_id == workspace.id))
    doc_count = len(count_result.all())
    if workspace.plan.value == "free" and doc_count >= 5:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Free plan is limited to 5 documents per workspace — upgrade to add more",
        )

    storage_path = save_upload(workspace.id, filename, content)

    document = Document(
        id=uuid.uuid4(),
        workspace_id=workspace.id,
        uploaded_by=uploaded_by,
        filename=filename,
        storage_path=storage_path,
        file_size_bytes=len(content),
        status=DocumentStatus.processing,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


async def list_documents(db: AsyncSession, workspace_id: uuid.UUID) -> list[Document]:
    result = await db.execute(
        select(Document).where(Document.workspace_id == workspace_id).order_by(Document.uploaded_at.desc())
    )
    return list(result.scalars().all())