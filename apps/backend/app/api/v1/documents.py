from fastapi import APIRouter, BackgroundTasks, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.rag.ingestion import ingest_document
from app.schemas.document import DocumentResponse
from app.services import document_service

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    content = await file.read()

    document = await document_service.create_document(
        db=db,
        workspace=workspace,
        uploaded_by=current_user.id,
        filename=file.filename or "untitled.pdf",
        content_type=file.content_type or "application/octet-stream",
        content=content,
    )

    # returns immediately with status="processing"; ingestion continues after response is sent
    background_tasks.add_task(ingest_document, document.id)

    return document


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    return await document_service.list_documents(db, workspace.id)