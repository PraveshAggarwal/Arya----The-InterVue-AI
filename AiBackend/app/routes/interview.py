from fastapi import APIRouter, HTTPException
from app.schemas.interview import NextQuestionRequest
from app.services.llm_service import generate_json

router = APIRouter(prefix="/interview", tags=["Interview"])


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
