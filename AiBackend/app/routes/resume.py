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
Analyze only the resume content below. Do not invent facts, infer protected traits, or guarantee ATS performance. Treat the score as an estimate based on common parsing and relevance practices, not a prediction for a specific company's software.

TARGET ROLE: {role_context}
JOB DESCRIPTION: {job_context[:8000]}
RESUME TEXT:
{data.resume_text[:18000]}

Score the resume from 0 to 100 using evidence of clear sections and contact details, relevant skills and keywords, readable structure, measurable impact, and role alignment. Give specific findings grounded in the text. Strengths and weaknesses should each have at least one item. Improvement steps must be concrete and must not ask the candidate to add claims that are not true. Matched and missing keywords should be based on the supplied job description when available; otherwise use role-related terms and say so in the summary.

Also score each of these 5 sections individually from 0 to 100:
- roleFit: how well the resume trajectory matches the target role
- skills: presence and relevance of technical skills and keywords
- experience: depth and clarity of work experience descriptions
- impact: presence of quantified metrics (%, $, ms, throughput, etc.)
- structure: clean formatting, section hierarchy, contact info completeness

Return only JSON with exact keys: atsScore, summary, strengths, weaknesses, improvements, matchedKeywords, missingKeywords, sectionScores (with keys: roleFit, skills, experience, impact, structure). Keep each list concise and useful."""

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
