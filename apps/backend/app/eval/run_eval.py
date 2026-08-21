"""
Runs every case in EVAL_DATASET through the real multi-agent pipeline
(app/agents/graph.py), scores each answer with the LLM judge, and prints
a summary report. Also writes a JSON report to disk for tracking scores
across runs (e.g. before/after a prompt change).

Usage:
    python -m app.eval.run_eval --workspace-id <uuid>

Assumes that workspace already has the 5 sample documents uploaded and
indexed (see app/eval/dataset.py for which ones).
"""
import argparse
import asyncio
import json
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timezone

from app.agents.graph import run_agent
from app.core.database import AsyncSessionLocal
from app.eval.dataset import EVAL_DATASET, EvalCase
from app.eval.judge import judge_answer

FAITHFULNESS_PASS_THRESHOLD = 0.8
RELEVANCE_PASS_THRESHOLD = 0.7


@dataclass
class EvalResult:
    id: str
    question: str
    generated_answer: str
    is_grounded: bool
    retry_count: int
    faithfulness: float
    relevance: float
    reasoning: str
    passed: bool


async def run_single_case(db, workspace_id: str, case: EvalCase) -> EvalResult:
    final_state = await run_agent(db=db, workspace_id=workspace_id, question=case["question"])
    generated_answer = final_state["final_answer"]

    score = await judge_answer(
        question=case["question"],
        reference_answer=case["reference_answer"],
        generated_answer=generated_answer,
    )

    passed = score.faithfulness >= FAITHFULNESS_PASS_THRESHOLD and score.relevance >= RELEVANCE_PASS_THRESHOLD

    return EvalResult(
        id=case["id"],
        question=case["question"],
        generated_answer=generated_answer,
        is_grounded=final_state["is_grounded"],
        retry_count=final_state["retry_count"],
        faithfulness=score.faithfulness,
        relevance=score.relevance,
        reasoning=score.reasoning,
        passed=passed,
    )


async def run_eval(workspace_id: str) -> list[EvalResult]:
    results: list[EvalResult] = []
    async with AsyncSessionLocal() as db:
        for case in EVAL_DATASET:
            result = await run_single_case(db, workspace_id, case)
            results.append(result)
    return results


def print_report(results: list[EvalResult]) -> None:
    print(f"\n{'ID':<5}{'Faith':<8}{'Rel':<8}{'Retries':<9}{'Pass':<6}Question")
    print("-" * 100)
    for r in results:
        status = "PASS" if r.passed else "FAIL"
        print(f"{r.id:<5}{r.faithfulness:<8.2f}{r.relevance:<8.2f}{r.retry_count:<9}{status:<6}{r.question[:60]}")

    total = len(results)
    passed = sum(1 for r in results if r.passed)
    avg_faithfulness = sum(r.faithfulness for r in results) / total
    avg_relevance = sum(r.relevance for r in results) / total
    avg_retries = sum(r.retry_count for r in results) / total

    print("-" * 100)
    print(f"Pass rate: {passed}/{total} ({passed/total*100:.0f}%)")
    print(f"Avg faithfulness: {avg_faithfulness:.2f} | Avg relevance: {avg_relevance:.2f} | Avg retries: {avg_retries:.2f}")


def save_report(results: list[EvalResult]) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    path = f"eval_report_{timestamp}.json"
    with open(path, "w") as f:
        json.dump([asdict(r) for r in results], f, indent=2)
    return path


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workspace-id", required=True, help="Workspace UUID with the 5 sample docs indexed")
    args = parser.parse_args()

    uuid.UUID(args.workspace_id)  # validates format early with a clear error

    results = await run_eval(args.workspace_id)
    print_report(results)
    path = save_report(results)
    print(f"\nReport saved to {path}")


if __name__ == "__main__":
    asyncio.run(main())