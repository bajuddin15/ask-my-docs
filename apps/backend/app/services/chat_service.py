import uuid
import time

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.agents.graph import run_agent
from app.models.chat import Chat, Message
from app.models.workspace import Workspace

async def _get_or_create_chat(db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID, chat_id: uuid.UUID | None, first_message: str) -> Chat:
    if chat_id is not None:
        chat = await db.get(Chat, chat_id)
        if chat is None or chat.workspace_id != workspace_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found in this workspace")
        return chat

    # title the chat after the opening question so the history list is scannable
    title = first_message.strip()[:80] or "New conversation"
    chat = Chat(id=uuid.uuid4(), workspace_id=workspace_id, created_by=user_id, title=title)
    db.add(chat)
    await db.flush()
    return chat


async def ask(
    db: AsyncSession,
    workspace: Workspace,
    user_id: uuid.UUID,
    message: str,
    chat_id: uuid.UUID | None,
) -> tuple[Chat, Message]:
    chat = await _get_or_create_chat(db, workspace.id, user_id, chat_id, message)

    # save the user's message first, so it's in history even if the agent run fails downstream
    user_message = Message(id=uuid.uuid4(), chat_id=chat.id, role="user", content=message, sources=[])
    db.add(user_message)

    # Router -> Retriever -> Answer -> Critic (with retry loop), see app/agents/graph.py
    start = time.perf_counter()
    final_state = await run_agent(
        db=db, workspace_id=str(workspace.id), question=message,
        critic_enabled=workspace.critic_enabled, max_retries=workspace.max_critic_retries,
    )
    latency_ms = int((time.perf_counter() - start) * 1000)

    sources_payload = [
        {
            "index": i,
            "document_id": s["document_id"],
            "chunk_id": s["chunk_id"],
            "filename": s["filename"],
            "page_number": s["page_number"],
            "similarity": round(s["similarity"], 4),
        }
        for i, s in enumerate(final_state["sources"], start=1)
    ]

    assistant_message = Message(
        id=uuid.uuid4(),
        chat_id=chat.id,
        role="assistant",
        content=final_state["final_answer"],
        sources=sources_payload,
        is_grounded=final_state["is_grounded"],
        retry_count=final_state["retry_count"],
        latency_ms=latency_ms,
    )
    db.add(assistant_message)

    workspace.monthly_query_count += 1

    await db.commit()
    await db.refresh(assistant_message)

    return chat, assistant_message


async def list_chats(db: AsyncSession, workspace_id: uuid.UUID) -> list[Chat]:
    result = await db.execute(
        select(Chat).where(Chat.workspace_id == workspace_id).order_by(Chat.created_at.desc())
    )
    return list(result.scalars().all())

async def get_chat_messages(db: AsyncSession, workspace_id: uuid.UUID, chat_id: uuid.UUID) -> list[Message]:
    chat = await db.get(Chat, chat_id)
    if chat is None or chat.workspace_id != workspace_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found in this workspace")

    result = await db.execute(
        select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at.asc())
    )
    return list(result.scalars().all())