"""
Chunking strategy: RecursiveCharacterTextSplitter, ~500 tokens per chunk
with 50 tokens overlap. We approximate "tokens" as characters * 4 (rough
average for English text) since exact tokenization isn't needed at chunk
time — it only needs to be consistent, not perfect.
"""
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE_CHARS = 2000    # ~500 tokens
CHUNK_OVERLAP_CHARS = 200  # ~50 tokens


def get_splitter() -> RecursiveCharacterTextSplitter:
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE_CHARS,
        chunk_overlap=CHUNK_OVERLAP_CHARS,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def chunk_text(text: str) -> list[str]:
    """Split raw document text into overlapping chunks ready for embedding."""
    if not text or not text.strip():
        return []
    splitter = get_splitter()
    return splitter.split_text(text)