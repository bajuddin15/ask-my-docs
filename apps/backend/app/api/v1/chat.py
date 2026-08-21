from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_workspace
from app.core.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember
from app.schemas.chat import ChatRequest, ChatResponse, MessageResponse, SourceRef
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


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
            created_at=message.created_at,
        ),
    )