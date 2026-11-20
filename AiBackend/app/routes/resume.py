from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import settings
from app.schemas.resume import ResumeAnalysisRequest
from app.services.resume_parser import extract_resume_text
from app.services.llm_service import generate_json

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


@router.post("/analyze")
async def analyze_resume(data: ResumeAnalysisRequest):
    if not data.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text is empty")

    role_context = data.target_role.strip() or "No specific role supplied; assess general ATS readiness"
    job_context = data.job_description.strip() or "No job description supplied; assess general role fit"
    prompt = f"""You are an evidence-based resume and ATS-readiness reviewer.
Analyze only the resume content below. Do not invent facts, infer protected traits, or guarantee ATS performance.

TARGET ROLE: {role_context}
JOB DESCRIPTION: {job_context[:8000]}
RESUME TEXT:
{data.resume_text[:18000]}

Return a JSON object with EXACTLY these keys and no others:
{{
  "atsScore": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvements": ["<concrete step 1>", "<concrete step 2>", "<concrete step 3>"],
  "matchedKeywords": ["<keyword>", ...],
  "missingKeywords": ["<keyword>", ...],
  "sectionScores": {{
    "roleFit": <integer 0-100, how well resume matches target role>,
    "skills": <integer 0-100, presence of relevant technical skills>,
    "experience": <integer 0-100, depth and clarity of work experience>,
    "impact": <integer 0-100, presence of quantified metrics like % $ ms>,
    "structure": <integer 0-100, formatting section hierarchy contact info>
  }}
}}

Rules:
- All 8 top-level keys are required. Do not omit any.
- sectionScores must contain all 5 keys with real scored values, not 0.
- strengths and weaknesses must each have at least 1 item.
- improvements must have at least 1 concrete actionable step.
- matchedKeywords and missingKeywords based on job description if provided, else use role-related terms.
- Do not wrap in markdown. Return raw JSON only."""

    schema = {
        "type": "object",
        "properties": {
            "atsScore": {"type": "integer", "minimum": 0, "maximum": 100},
            "summary": {"type": "string"},
            "strengths": {"type": "array", "items": {"type": "string"}},
            "weaknesses": {"type": "array", "items": {"type": "string"}},
            "improvements": {"type": "array", "items": {"type": "string"}},
            "matchedKeywords": {"type": "array", "items": {"type": "string"}},
            "missingKeywords": {"type": "array", "items": {"type": "string"}},
            "sectionScores": {
                "type": "object",
                "properties": {
                    "roleFit": {"type": "integer", "minimum": 0, "maximum": 100},
                    "skills": {"type": "integer", "minimum": 0, "maximum": 100},
                    "experience": {"type": "integer", "minimum": 0, "maximum": 100},
                    "impact": {"type": "integer", "minimum": 0, "maximum": 100},
                    "structure": {"type": "integer", "minimum": 0, "maximum": 100},
                },
                "required": ["roleFit", "skills", "experience", "impact", "structure"],
                "additionalProperties": False,
            },
        },
        "required": ["atsScore", "summary", "strengths", "weaknesses", "improvements", "matchedKeywords", "missingKeywords", "sectionScores"],
        "additionalProperties": False,
    }
    try:
        raw = await generate_json(prompt, schema)
        analysis = {
            "atsScore": raw.get("atsScore") or raw.get("score", 0),
            "summary": raw.get("summary", ""),
            "strengths": raw.get("strengths", []),
            "weaknesses": raw.get("weaknesses", []),
            "improvements": raw.get("improvements") or raw.get("improvement_steps", []),
            "matchedKeywords": raw.get("matchedKeywords") or raw.get("matched_keywords", []),
            "missingKeywords": raw.get("missingKeywords") or raw.get("missing_keywords", []),
            "sectionScores": raw.get("sectionScores") or {
                "roleFit": 0, "skills": 0, "experience": 0, "impact": 0, "structure": 0
            },
        }
        return {"success": True, "data": analysis}
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"Resume analysis failed: {error}") from error


@router.post("/parse")
async def parse_candidate_resume(
    file: UploadFile = File(...)
):

    filename = file.filename or ""

    extension = filename.lower().rsplit(".", 1)[-1]

    if extension not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX are supported"
        )

    content = await file.read(
        settings.MAX_RESUME_SIZE_MB * 1024 * 1024 + 1
    )

    if len(content) > settings.MAX_RESUME_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Resume file exceeds size limit"
        )

    try:
        resume_text = extract_resume_text(
            filename,
            content
        )

        return {
            "success": True,
            "resume_text": resume_text,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # except Exception:
    #     raise HTTPException(
    #         status_code=502,
    #         detail="Resume analysis failed"
    #     )
    except Exception:
        raise HTTPException(status_code=502, detail="Resume parsing failed")
