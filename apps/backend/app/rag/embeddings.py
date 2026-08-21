"""
Embeddings via LangChain's OpenAIEmbeddings wrapper (not the raw OpenAI
SDK) — kept consistent with the rest of the stack, since the RAG chain
(Day 5-7) and the agent graph (Day 8-9, LangGraph) are also built on
LangChain primitives. Swapping embedding providers later (Cohere, etc.)
means changing this one file, not call sites elsewhere in the app.
"""
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

_embeddings: OpenAIEmbeddings | None = None

# print("OPENAI_API_KEY:", settings.OPENAI_API_KEY)

def get_embeddings_client() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(
            model=EMBEDDING_MODEL,
            api_key=settings.OPENAI_API_KEY,
        )
    return _embeddings


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embeds a batch of chunk strings, returns one vector per input string,
    in the same order."""
    if not texts:
        return []
    client = get_embeddings_client()
    return await client.aembed_documents(texts)