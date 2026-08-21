import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import Chat, Message
from app.models.workspace import Workspace
from app.rag.chain import generate_answer
from app.rag.retrieval import RetrievedChunk, retrieve_relevant_chunks


def build_context_block(chunks: list[RetrievedChunk]) -> str:
    """Numbers each chunk so the LLM can cite [1], [2], ... in its answer,
    and we can map those numbers back to real sources afterward."""
    lines = []
    for i, c in enumerate(chunks, start=1):
        page_info = f", p.{c.page_number}" if c.page_number else ""
        lines.append(f"[{i}] (from {c.filename}{page_info})\n{c.content}")
    return "\n\n".join(lines)


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

    # save the user's message first, so it's in history even if generation fails downstream
    user_message = Message(id=uuid.uuid4(), chat_id=chat.id, role="user", content=message, sources=[])
    db.add(user_message)

    retrieved = await retrieve_relevant_chunks(db, workspace.id, message)

    if not retrieved:
        answer_text = (
            "I couldn't find anything relevant in your indexed documents to answer that. "
            "Try uploading a document first, or rephrasing your question."
        )
        sources_payload: list[dict] = []
    else:
        context = build_context_block(retrieved)
        answer_text = await generate_answer(question=message, context=context)
        sources_payload = [
            {
                "index": i,
                "document_id": str(c.document_id),
                "chunk_id": str(c.chunk_id),
                "filename": c.filename,
                "page_number": c.page_number,
                "similarity": round(c.similarity, 4),
            }
            for i, c in enumerate(retrieved, start=1)
        ]

    assistant_message = Message(
        id=uuid.uuid4(),
        chat_id=chat.id,
        role="assistant",
        content=answer_text,
        sources=sources_payload,
    )
    db.add(assistant_message)

    workspace.monthly_query_count += 1

    await db.commit()
    await db.refresh(assistant_message)

    return chat, assistant_message