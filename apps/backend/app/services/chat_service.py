import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.graph import run_agent
from app.models.chat import Chat, Message
from app.models.workspace import Workspace


async def _get_or_create_chat(db: AsyncSession, workspace_id: uuid.UUID, user_id: uuid.UUID, chat_id: uuid.UUID | None) -> Chat:
    if chat_id is not None:
        chat = await db.get(Chat, chat_id)
        if chat is None or chat.workspace_id != workspace_id:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found in this workspace")
        return chat

    chat = Chat(id=uuid.uuid4(), workspace_id=workspace_id, created_by=user_id)
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
    chat = await _get_or_create_chat(db, workspace.id, user_id, chat_id)

    # save the user's message first, so it's in history even if the agent run fails downstream
    user_message = Message(id=uuid.uuid4(), chat_id=chat.id, role="user", content=message, sources=[])
    db.add(user_message)

    # Router -> Retriever -> Answer -> Critic (with retry loop), see app/agents/graph.py
    final_state = await run_agent(db=db, workspace_id=str(workspace.id), question=message)

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
    )
    db.add(assistant_message)

    workspace.monthly_query_count += 1

    await db.commit()
    await db.refresh(assistant_message)

    return chat, assistant_message