from fastapi import APIRouter, HTTPException
from app.schemas.interview import NextQuestionRequest, PerformanceReportRequest
from app.services.llm_service import generate_json

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.post("/performance-report")
async def performance_report(data: PerformanceReportRequest):
    try:
        transcript = "\n\n".join(
            f"Question: {turn.question}\nCandidate answer: {turn.answer}"
            for turn in data.transcript
        ) or "No answers were captured."
        prompt = f"""You are a fair, constructive interviewer evaluating a completed interview.

ROLE: {data.role}
TRANSCRIPT:
{transcript[:18000]}

Evaluate only what the candidate said. Give practical, specific feedback. Do not invent achievements.
Return ONLY this JSON:
{{
  "overallScore": 0,
  "summary": "2-3 sentence assessment",
  "strengths": ["specific strength"],
  "weaknesses": ["specific area to improve"],
  "recommendations": ["actionable next step"],
  "performance": {{"communication": 0, "technicalSkills": 0, "problemSolving": 0, "confidence": 0}},
  "questionReviews": [{{"question": "exact question", "answer": "candidate answer", "score": 0, "feedback": "brief feedback"}}]
}}
All scores are integers from 0 to 100. Include one review per transcript turn."""
        result = await generate_json(
            prompt,
            {
                "type": "object",
                "properties": {
                    "overallScore": {"type": "integer", "minimum": 0, "maximum": 100},
                    "summary": {"type": "string"},
                    "strengths": {"type": "array", "items": {"type": "string"}},
                    "weaknesses": {"type": "array", "items": {"type": "string"}},
                    "recommendations": {"type": "array", "items": {"type": "string"}},
                    "performance": {"type": "object", "properties": {"communication": {"type": "integer"}, "technicalSkills": {"type": "integer"}, "problemSolving": {"type": "integer"}, "confidence": {"type": "integer"}}, "required": ["communication", "technicalSkills", "problemSolving", "confidence"], "additionalProperties": False},
                    "questionReviews": {"type": "array", "items": {"type": "object", "properties": {"question": {"type": "string"}, "answer": {"type": "string"}, "score": {"type": "integer", "minimum": 0, "maximum": 100}, "feedback": {"type": "string"}}, "required": ["question", "answer", "score", "feedback"], "additionalProperties": False}},
                },
                "required": ["overallScore", "summary", "strengths", "weaknesses", "recommendations", "performance", "questionReviews"],
                "additionalProperties": False,
            },
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@router.post("/next-question")
async def next_question(data: NextQuestionRequest):
    try:
        history_text = "\n".join(
            [f"Q: {t.question}\nA: {t.answer}" for t in data.history[-4:]]
        ) or "None"

        allow_followup = data.followup_count < 1

        prompt = f"""You are conducting a professional job interview.

ROLE: {data.role}
CURRENT QUESTION: {data.current_question}
CANDIDATE ANSWER: {data.current_answer}
RECENT HISTORY:
{history_text}
REMAINING TOPICS: {', '.join(data.remaining_topics) if data.remaining_topics else 'Choose the next relevant topic'}
FOLLOW-UP COUNT: {data.followup_count}
FOLLOW-UP ALLOWED: {allow_followup}

Decide the next action:
- Use "follow_up" only when the candidate's answer needs one essential clarification.
- Otherwise use "next" and generate a new question based on the candidate's answer, moving from basic context toward progressively more complex role-specific topics. Do not rely on a fixed question list.
- Use "complete" when the interview has covered enough ground (usually 5-8 substantive questions) or the candidate has no answer and there is little useful ground left. Put concise, specific overall interview remarks in "remarks".
- Keep the question concise and conversational (1-2 sentences max).
- Never repeat a previous question.

Return ONLY this JSON:
{{
  "action": "follow_up",
  "question": "Your next question here",
  "topic": "Topic name",
  "reason": "Brief reason"
  ,"remarks": "Short overall feedback"
}}

action must be "follow_up", "next", or "complete".
"""
        result = await generate_json(
            prompt,
            {
                "type": "object",
                "properties": {
                    "action": {"type": "string", "enum": ["follow_up", "next", "complete"]},
                    "question": {"type": "string"},
                    "topic": {"type": "string"},
                    "reason": {"type": "string"},
                    "remarks": {"type": "string"},
                },
                "required": ["action", "question", "topic", "reason", "remarks"],
                "additionalProperties": False,
            },
        )

        if not isinstance(result.get("question"), str):
            raise ValueError("Invalid question")
        if result.get("action") not in ["follow_up", "next", "complete"]:
            result["action"] = "next"
        if not allow_followup and result["action"] == "follow_up":
            result["action"] = "next"

        return {"success": True, "data": result}

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
