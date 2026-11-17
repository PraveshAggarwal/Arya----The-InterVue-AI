
from io import BytesIO

from pypdf import PdfReader
from docx import Document


def extract_pdf_text(file_bytes: bytes) -> str:

    reader = PdfReader(BytesIO(file_bytes))

    if reader.is_encrypted:
        raise ValueError("Encrypted PDFs are not supported")

    text_parts = []

    for page in reader.pages:
        text_parts.append(page.extract_text() or "")

    return "\n".join(text_parts).strip()


def extract_docx_text(file_bytes: bytes) -> str:

    document = Document(BytesIO(file_bytes))

    paragraphs = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs).strip()


def extract_resume_text(
    filename: str,
    file_bytes: bytes
) -> str:

    extension = filename.lower().rsplit(".", 1)[-1]

    if extension == "pdf":
        text = extract_pdf_text(file_bytes)

    elif extension == "docx":
        text = extract_docx_text(file_bytes)

    else:
        raise ValueError(
            "Only PDF and DOCX files are supported"
        )

    if not text:
        raise ValueError(
            "No readable text found in resume"
        )

    return text
