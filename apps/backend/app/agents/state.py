"""
Shared state that flows through every node in the graph. TypedDict (not
Pydantic) because LangGraph merges partial dict returns from each node
into this state automatically — each node only returns the keys it
changed.
"""
from typing import Literal, TypedDict

MAX_RETRIES = 2


class RetrievedChunkDict(TypedDict):
    chunk_id: str
    document_id: str
    filename: str
    page_number: int | None
    content: str
    similarity: float


class AgentState(TypedDict):
    # input
    workspace_id: str
    question: str

    # router output
    intent: Literal["single_doc", "multi_doc", "summarization", "general"]

    # retriever output
    retrieved_chunks: list[RetrievedChunkDict]

    # answer draft
    draft_answer: str

    # critic output
    is_grounded: bool
    critic_feedback: str
    retry_count: int
    next_action: Literal["retry", "end"]

    # final result (set once next_action == "end")
    final_answer: str
    sources: list[RetrievedChunkDict]