"""
LLM-as-judge: given a question, the system's generated answer, and a
reference (gold) answer, scores two things:
  - faithfulness: does the generated answer avoid contradicting or
    fabricating facts beyond what the reference supports?
  - relevance: does it actually address the question asked?
"""
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

from app.rag.chain import get_llm

JUDGE_SYSTEM_PROMPT = """You are grading an AI system's answer against a reference (gold) answer for a \
document Q&A system. Score two dimensions from 0.0 to 1.0:

faithfulness: Does the generated answer avoid stating anything that contradicts the reference, and avoid \
fabricating specifics (numbers, dates, clause names) not supported by the reference? A correct refusal \
("I couldn't find this") when the reference also says the info isn't available counts as fully faithful (1.0).

relevance: Does the generated answer actually address what was asked, rather than being generic or off-topic?

Be strict. A vague-but-safe answer should score lower on relevance than a precise, correct one.
"""

JUDGE_HUMAN_TEMPLATE = """QUESTION:
{question}

REFERENCE (gold) ANSWER:
{reference_answer}

GENERATED ANSWER TO GRADE:
{generated_answer}"""


class JudgeScore(BaseModel):
    faithfulness: float = Field(ge=0.0, le=1.0)
    relevance: float = Field(ge=0.0, le=1.0)
    reasoning: str = Field(description="One or two sentences explaining the scores")


async def judge_answer(question: str, reference_answer: str, generated_answer: str) -> JudgeScore:
    llm = get_llm()
    structured_llm = llm.with_structured_output(JudgeScore)
    chain = (
        ChatPromptTemplate.from_messages([("system", JUDGE_SYSTEM_PROMPT), ("human", JUDGE_HUMAN_TEMPLATE)])
        | structured_llm
    )
    return await chain.ainvoke(
        {"question": question, "reference_answer": reference_answer, "generated_answer": generated_answer}
    )