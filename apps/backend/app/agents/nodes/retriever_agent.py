"""
Retriever Agent: wraps the existing pgvector similarity search
(app/rag/retrieval.py) as a graph node. On a retry (critic sent it back),
the original question is combined with the critic's feedback so the
second search looks for material the first pass missed, instead of
returning the exact same chunks again.

Needs a live DB session, so it's built as a closure inside build_graph()
rather than a free function — LangGraph nodes are plain callables, they
don't have to be module-level.
"""
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.state import AgentState
from app.rag.retrieval import retrieve_relevant_chunks


def make_retriever_node(db: AsyncSession):
    async def retriever_node(state: AgentState) -> dict:
        workspace_id = uuid.UUID(state["workspace_id"])

        search_query = state["question"]
        if state.get("retry_count", 0) > 0 and state.get("critic_feedback"):
            search_query = f"{state['question']}\n\nAlso specifically look for: {state['critic_feedback']}"

        chunks = await retrieve_relevant_chunks(db, workspace_id, search_query)

        return {
            "retrieved_chunks": [
                {
                    "chunk_id": str(c.chunk_id),
                    "document_id": str(c.document_id),
                    "filename": c.filename,
                    "page_number": c.page_number,
                    "content": c.content,
                    "similarity": c.similarity,
                }
                for c in chunks
            ]
        }

    return retriever_node