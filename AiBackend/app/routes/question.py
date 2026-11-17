from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone

from app.schemas.interview import InterviewPlanRequest
from app.services.question_engine import generate_interview_plan
from app.db import get_db

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


@router.post("/generate")
async def generate_questions(
    data: InterviewPlanRequest
):

    try:

        questions = await generate_interview_plan(
            role=data.role,
            experience=data.experience,
            difficulty=data.difficulty,
            total_questions=data.total_questions,
            resume_text=data.resume_text,
            job_description=data.job_description,
            skills=data.skills
        )

        session = {
            "role": data.role,
            "experience": data.experience,
            "difficulty": data.difficulty,
            "skills": data.skills,
            "questions": questions,
            "answers": [],
            "report": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        db = get_db()
        result = await db["sessions"].insert_one(session)
        session_id = str(result.inserted_id)

        return {
            "success": True,
            "session_id": session_id,
            "role": data.role,
            "total_questions": len(questions),
            "questions": questions
        }

    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=str(e)
        )
