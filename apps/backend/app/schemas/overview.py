from pydantic import BaseModel


class OverviewStats(BaseModel):
    document_count: int
    query_count_30d: int
    avg_groundedness_pct: float
    avg_latency_ms: float | None
    critic_retry_rate_pct: float


class ActivityItem(BaseModel):
    kind: str  # "query_answered" | "query_unverified" | "document_indexed" | "document_failed"
    title: str
    subtitle: str
    created_at: str