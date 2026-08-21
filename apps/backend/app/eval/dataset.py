"""
15-question eval dataset. Each entry assumes the workspace has these
documents indexed (the same fictional set used throughout testing so far):
  - Vendor MSA - Northwind.pdf
  - Series-B Term Sheet.pdf
  - Employment Agreement.pdf
  - SaaS Master Agreement.pdf
  - Lease - Warehouse B.pdf

reference_answer is the gold answer the judge compares against - it
doesn't need to match wording exactly, just the facts.
"""
from typing import TypedDict


class EvalCase(TypedDict):
    id: str
    question: str
    reference_answer: str
    expects_grounded: bool  # False = this question SHOULD get an "I couldn't find" response


EVAL_DATASET: list[EvalCase] = [
    {
        "id": "q1",
        "question": "What's the termination notice period in the Northwind vendor agreement?",
        "reference_answer": "60 days written notice for termination for convenience; immediate termination is allowed for cause under Section 4.2 if a breach isn't cured within 15 days.",
        "expects_grounded": True,
    },
    {
        "id": "q2",
        "question": "What notice period does the Series-B term sheet specify for vendor relationships?",
        "reference_answer": "A standard 30-day notice period for all vendor relationships.",
        "expects_grounded": True,
    },
    {
        "id": "q3",
        "question": "How long does the non-compete clause in the employment agreement last?",
        "reference_answer": "The non-compete restricts employment with direct competitors for 12 months after employment ends.",
        "expects_grounded": True,
    },
    {
        "id": "q4",
        "question": "What is the liability cap in the SaaS master agreement?",
        "reference_answer": "Liability is capped at 12 months of fees paid, excluding certain carve-outs.",
        "expects_grounded": True,
    },
    {
        "id": "q5",
        "question": "How does rent escalate under the Warehouse B lease?",
        "reference_answer": "Base rent increases 3% annually starting in year 2 of the lease term.",
        "expects_grounded": True,
    },
    {
        "id": "q6",
        "question": "Does the Northwind vendor agreement allow immediate termination for cause?",
        "reference_answer": "Yes - either party may terminate immediately if the other materially breaches and fails to cure within 15 days.",
        "expects_grounded": True,
    },
    {
        "id": "q7",
        "question": "What happens if the SaaS agreement counterparty breaches confidentiality obligations?",
        "reference_answer": "Not directly specified in the excerpt used for testing - expect the system to say it can't find this rather than guessing.",
        "expects_grounded": False,
    },
    {
        "id": "q8",
        "question": "What's the exact cure period for breach under the Northwind vendor agreement?",
        "reference_answer": "15 days to cure a material breach before the non-breaching party may terminate immediately.",
        "expects_grounded": True,
    },
    {
        "id": "q9",
        "question": "What is the color scheme of the office building in the lease agreement?",
        "reference_answer": "This information is not contained in a lease agreement - system should decline rather than fabricate.",
        "expects_grounded": False,
    },
    {
        "id": "q10",
        "question": "Compare the termination notice periods between the vendor agreement and the term sheet.",
        "reference_answer": "Vendor agreement: 60 days (or immediate for cause). Term sheet: standard 30 days for vendor relationships. They don't match.",
        "expects_grounded": True,
    },
    {
        "id": "q11",
        "question": "What's the CEO's personal cell phone number listed in these documents?",
        "reference_answer": "Personal contact information like this would not be in these business documents - system should decline.",
        "expects_grounded": False,
    },
    {
        "id": "q12",
        "question": "Summarize the key termination terms across all vendor and employment documents.",
        "reference_answer": "Vendor MSA: 60 days or immediate for cause. Employment: 12-month non-compete applies post-termination. Should cite both sources.",
        "expects_grounded": True,
    },
    {
        "id": "q13",
        "question": "What percentage does rent increase after the second year of the Warehouse B lease?",
        "reference_answer": "3% annually, starting in year 2.",
        "expects_grounded": True,
    },
    {
        "id": "q14",
        "question": "Is there a confidentiality clause in the vendor agreement?",
        "reference_answer": "Not explicitly covered in the test excerpt - system should say it can't confirm rather than assume yes.",
        "expects_grounded": False,
    },
    {
        "id": "q15",
        "question": "What's the total contract value of the SaaS master agreement?",
        "reference_answer": "Not specified in the test excerpt - system should decline to guess a dollar figure.",
        "expects_grounded": False,
    },
]

assert len(EVAL_DATASET) == 15