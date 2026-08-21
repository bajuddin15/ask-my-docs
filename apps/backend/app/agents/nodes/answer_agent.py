"""
Answer Generator: drafts a response from the retrieved chunks. On retry,
the critic's feedback is injected as an explicit instruction so the model
doesn't just repeat the same ungrounded claim.
"""
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

from app.agents.state import AgentState
from app.rag.chain import get_llm

SYSTEM_PROMPT = """You are a careful assistant answering questions about a user's documents.

Rules:
- Only answer using the provided context. If the context doesn't contain the answer, say so plainly — never guess.
- Every claim you make must be traceable to the context. Reference sources using their bracketed number, e.g. [1], [2].
- Be concise and direct. Do not repeat the question back.
"""

HUMAN_TEMPLATE = """Context:
{context}

Question: {question}{retry_note}"""


def _build_context_block(chunks: list[dict]) -> str:
    if not chunks:
        return "(no relevant context was found)"
    lines = []
    for i, c in enumerate(chunks, start=1):
        page_info = f", p.{c['page_number']}" if c.get("page_number") else ""
        lines.append(f"[{i}] (from {c['filename']}{page_info})\n{c['content']}")
    return "\n\n".join(lines)


async def answer_node(state: AgentState) -> dict:
    prompt = ChatPromptTemplate.from_messages([("system", SYSTEM_PROMPT), ("human", HUMAN_TEMPLATE)])
    chain = prompt | get_llm() | StrOutputParser()

    retry_note = ""
    if state.get("retry_count", 0) > 0 and state.get("critic_feedback"):
        retry_note = (
            f"\n\nNote: a previous attempt at this answer was not fully grounded in the context. "
            f"Specifically: {state['critic_feedback']}. Make sure this answer only states what the "
            f"context actually supports."
        )

    context = _build_context_block(state["retrieved_chunks"])

    if not state["retrieved_chunks"]:
        return {
            "draft_answer": (
                "I couldn't find anything relevant in your indexed documents to answer that. "
                "Try uploading a document first, or rephrasing your question."
            )
        }

    draft = await chain.ainvoke({"context": context, "question": state["question"], "retry_note": retry_note})
    return {"draft_answer": draft}