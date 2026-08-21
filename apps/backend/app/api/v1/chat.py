import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.chat import ChatRequest, ChatResponse, ChatSummary, MessageResponse, SourceRef
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])
chats_router = APIRouter(prefix="/chats", tags=["chat"])


@chats_router.get("", response_model=list[ChatSummary])
async def list_chats(
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    return await chat_service.list_chats(db, workspace.id)

@chats_router.get("/{chat_id}/messages", response_model=list[MessageResponse])
async def get_chat_messages(
    chat_id: uuid.UUID,
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership
    messages = await chat_service.get_chat_messages(db, workspace.id, chat_id)
    return [
        MessageResponse(
            id=m.id, role=m.role, content=m.content,
            sources=[SourceRef(**s) for s in m.sources],
            is_grounded=m.is_grounded, retry_count=m.retry_count,
            latency_ms=m.latency_ms, created_at=m.created_at,
        )
        for m in messages
    ]


@router.post("", response_model=ChatResponse)
async def ask(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    workspace_membership: tuple[Workspace, WorkspaceMember] = Depends(get_current_workspace),
    db: AsyncSession = Depends(get_db),
):
    workspace, _membership = workspace_membership

    chat, message = await chat_service.ask(
        db=db,
        workspace=workspace,
        user_id=current_user.id,
        message=payload.message,
        chat_id=payload.chat_id,
    )

    return ChatResponse(
        chat_id=chat.id,
        message=MessageResponse(
            id=message.id,
            role=message.role,
            content=message.content,
            sources=[SourceRef(**s) for s in message.sources],
            is_grounded=message.is_grounded,
            retry_count=message.retry_count,
            latency_ms=message.latency_ms,
            created_at=message.created_at,
        ),
    )