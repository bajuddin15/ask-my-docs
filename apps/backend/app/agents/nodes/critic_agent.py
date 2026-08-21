"""
Critic Agent: checks whether the draft answer's claims are actually
supported by the retrieved context. This is the node that turns a
plain RAG chain into something that catches its own hallucinations —
if the answer isn't grounded and we haven't exhausted retries, it sends
control back to the Retriever with feedback about what's missing.
"""
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.agents.state import AgentState, MAX_RETRIES
from app.rag.chain import get_llm

CRITIC_SYSTEM_PROMPT = """You are a strict fact-checker. You will be given a CONTEXT (source material) \
and an ANSWER that was generated from it. Your only job is to verify whether every factual claim in \
the ANSWER is directly supported by the CONTEXT.

- If the ANSWER states something the CONTEXT does not support, or contradicts the CONTEXT, mark it as NOT grounded.
- If the ANSWER correctly says information wasn't found (rather than guessing), that counts as grounded.
- Be strict: an answer that is "probably right" but not explicitly stated in the context is NOT grounded.
"""

CRITIC_HUMAN_TEMPLATE = """CONTEXT:
{context}

ANSWER TO VERIFY:
{answer}"""


class CriticVerdict(BaseModel):
    is_grounded: bool = Field(description="True only if every claim in the answer is directly supported by the context")
    feedback: str = Field(
        description="If not grounded, briefly explain exactly which claim is unsupported and what "
        "kind of information the retriever should look for instead. Empty string if grounded."
    )


def _build_context_block(chunks: list[dict]) -> str:
    if not chunks:
        return "(no context was retrieved)"
    lines = []
    for i, c in enumerate(chunks, start=1):
        lines.append(f"[{i}] {c['content']}")
    return "\n\n".join(lines)

async def critic_node(state: AgentState) -> dict:
    retry_count = state.get("retry_count", 0)
    max_retries = state.get("max_critic_retries", MAX_RETRIES)
    
    if not state["retrieved_chunks"]:
        return {"is_grounded": True, "critic_feedback": "", "retry_count": retry_count,
                "next_action": "end", "final_answer": state["draft_answer"], "sources": []}

    # workspaces can turn the Critic off entirely (Settings page)
    if not state.get("critic_enabled", True):
        return {"is_grounded": True, "critic_feedback": "", "retry_count": retry_count,
                "next_action": "end", "final_answer": state["draft_answer"], "sources": state["retrieved_chunks"]}

    llm = get_llm()
    structured_llm = llm.with_structured_output(CriticVerdict)
    chain = ChatPromptTemplate.from_messages(
        [("system", CRITIC_SYSTEM_PROMPT), ("human", CRITIC_HUMAN_TEMPLATE)]
    ) | structured_llm

    context = _build_context_block(state["retrieved_chunks"])
    verdict: CriticVerdict = await chain.ainvoke({"context": context, "answer": state["draft_answer"]})

    new_retry_count = retry_count + (0 if verdict.is_grounded else 1)
    exhausted = new_retry_count > max_retries   # <-- max_retries, not the hardcoded constant

    if verdict.is_grounded or exhausted:
        return {"is_grounded": verdict.is_grounded, "critic_feedback": verdict.feedback,
                "retry_count": new_retry_count, "next_action": "end",
                "final_answer": state["draft_answer"], "sources": state["retrieved_chunks"]}

    return {"is_grounded": False, "critic_feedback": verdict.feedback,
            "retry_count": new_retry_count, "next_action": "retry"}

def route_after_critic(state: AgentState) -> str:
    return state["next_action"]