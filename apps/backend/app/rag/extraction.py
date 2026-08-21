"""
Extracts text from a PDF, page by page, so each chunk can later be traced
back to a page number (used for citations in the chat UI).
"""
from pypdf import PdfReader


def extract_pages(file_path: str) -> list[tuple[int, str]]:
    """Returns a list of (page_number, page_text) tuples, 1-indexed."""
    reader = PdfReader(file_path)
    pages: list[tuple[int, str]] = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append((i, text))
    return pages


def get_page_count(file_path: str) -> int:
    return len(PdfReader(file_path).pages)