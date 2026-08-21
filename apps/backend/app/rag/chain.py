"""
The simple, single-pass RAG chain for Day 5-7 — no router/critic yet
(that's the LangGraph multi-agent layer, Day 8-9). Built with LangChain's
LCEL: prompt | llm | output_parser.
"""
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.core.config import settings

ANSWER_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """You are a careful assistant answering questions about a user's documents.

Rules:
- Only answer using the provided context. If the context doesn't contain the answer, say so plainly — never guess.
- Every claim you make must be traceable to the context. Reference sources using their bracketed number, e.g. [1], [2].
- Be concise and direct. Do not repeat the question back.
"""

HUMAN_TEMPLATE = """Context:
{context}

Question: {question}"""

_llm: ChatOpenAI | None = None


def get_llm() -> ChatOpenAI:
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(model=ANSWER_MODEL, api_key=settings.OPENAI_API_KEY, temperature=0)
    return _llm


def build_chain():
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", SYSTEM_PROMPT),
            ("human", HUMAN_TEMPLATE),
        ]
    )
    return prompt | get_llm() | StrOutputParser()


async def generate_answer(question: str, context: str) -> str:
    chain = build_chain()
    return await chain.ainvoke({"context": context, "question": question})