import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.chat import Chat, Message
from app.models.document import Document, DocumentStatus
from app.schemas.overview import ActivityItem, OverviewStats


async def get_overview_stats(db: AsyncSession, workspace_id: uuid.UUID) -> OverviewStats:
    doc_count = await db.scalar(
        select(func.count()).select_from(Document).where(Document.workspace_id == workspace_id)
    )

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    base_query = (
        select(Message)
        .join(Chat, Chat.id == Message.chat_id)
        .where(
            Chat.workspace_id == workspace_id,
            Message.role == "assistant",
            Message.created_at >= thirty_days_ago,
        )
    )
    result = await db.execute(base_query)
    recent_assistant_messages = list(result.scalars().all())

    total = len(recent_assistant_messages)
    grounded = sum(1 for m in recent_assistant_messages if m.is_grounded)
    retried = sum(1 for m in recent_assistant_messages if m.retry_count > 0)
    latencies = [m.latency_ms for m in recent_assistant_messages if m.latency_ms is not None]

    return OverviewStats(
        document_count=doc_count or 0,
        query_count_30d=total,
        avg_groundedness_pct=round((grounded / total) * 100, 1) if total else 100.0,
        avg_latency_ms=round(sum(latencies) / len(latencies), 0) if latencies else None,
        critic_retry_rate_pct=round((retried / total) * 100, 1) if total else 0.0,
    )


async def get_recent_activity(db: AsyncSession, workspace_id: uuid.UUID, limit: int = 8) -> list[ActivityItem]:
    items: list[ActivityItem] = []

    msg_result = await db.execute(
        select(Message, Chat.title)
        .join(Chat, Chat.id == Message.chat_id)
        .where(Chat.workspace_id == workspace_id, Message.role == "assistant")
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    for message, chat_title in msg_result.all():
        if message.is_grounded:
            items.append(ActivityItem(
                kind="query_answered", title="Query answered",
                subtitle=f'"{chat_title}" · grounded, {message.retry_count} retries',
                created_at=message.created_at.isoformat(),
            ))
        else:
            items.append(ActivityItem(
                kind="query_unverified", title="Critic could not verify an answer",
                subtitle=f'"{chat_title}" · {message.retry_count} retries, unresolved',
                created_at=message.created_at.isoformat(),
            ))

    doc_result = await db.execute(
        select(Document).where(Document.workspace_id == workspace_id)
        .order_by(Document.uploaded_at.desc()).limit(limit)
    )
    for doc in doc_result.scalars().all():
        if doc.status == DocumentStatus.indexed:
            items.append(ActivityItem(
                kind="document_indexed", title="Document indexed",
                subtitle=f"{doc.filename}" + (f" · {doc.page_count} pages" if doc.page_count else ""),
                created_at=doc.uploaded_at.isoformat(),
            ))
        elif doc.status == DocumentStatus.failed:
            items.append(ActivityItem(
                kind="document_failed", title="Ingestion failed",
                subtitle=f"{doc.filename} · {doc.failure_reason or 'unknown error'}",
                created_at=doc.uploaded_at.isoformat(),
            ))

    items.sort(key=lambda i: i.created_at, reverse=True)
    return items[:limit]