"""
Router Agent: classifies the incoming question before any retrieval
happens. In this MVP the classification doesn't branch to different
retrieval strategies yet, but it's already wired as a real graph node
with structured output so adding specific handling later is a routing
change, not an architecture change.
"""
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.agents.state import AgentState
from app.rag.chain import get_llm


class RouterDecision(BaseModel):
    intent: Literal["single_doc", "multi_doc", "summarization", "general"] = Field(
        description="single_doc: question about one specific document. "
        "multi_doc: comparison or synthesis across multiple documents. "
        "summarization: asks for a summary/overview rather than a specific fact. "
        "general: anything else, including questions unrelated to any document."
    )


ROUTER_PROMPT = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "Classify the user's question into exactly one intent category. "
            "Do not answer the question — only classify it.",
        ),
        ("human", "{question}"),
    ]
)


async def router_node(state: AgentState) -> dict:
    llm = get_llm()
    structured_llm = llm.with_structured_output(RouterDecision)
    chain = ROUTER_PROMPT | structured_llm

    decision: RouterDecision = await chain.ainvoke({"question": state["question"]})
    return {"intent": decision.intent}