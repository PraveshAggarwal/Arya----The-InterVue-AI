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
            [f"Q: {t.question}\nA: {t.answer}" for t in data.history[-12:]]
        ) or "None"

        allow_followup = data.followup_count < 2

        prompt = f"""You are conducting a professional job interview as Arya. Keep the exchange natural, warm, concise, and specific to what the candidate actually said.

ROLE: {data.role}
CURRENT QUESTION: {data.current_question}
CANDIDATE ANSWER: {data.current_answer}
RESUME (use specific projects, skills, certifications, or experience as question material when relevant):
{data.resume_text[:5000] or "No resume text available"}
RECENT HISTORY:
{history_text}
REMAINING TOPICS: {', '.join(data.remaining_topics) if data.remaining_topics else 'Choose the next relevant topic'}
REMAINING PLANNED QUESTIONS: {data.remaining_questions[:10]}
MAIN QUESTION PROGRESS: {data.main_question_number} of {data.total_questions} (follow-ups do not count)
FOLLOW-UP COUNT: {data.followup_count}
FOLLOW-UP ALLOWED: {allow_followup}

Decide the next action like a thoughtful human interviewer. Always put a short spoken acknowledgment or useful feedback in "response", then ask the next question in "question".
- For a blank, "(no answer)", "I don't know", or clearly incorrect answer, be reassuring and non-judgmental. Briefly explain that it is okay not to know, then give one small hint or ask a simpler focused probe that lets the candidate try again. Do not praise an answer that was not given.
- Use "follow_up" when an answer is vague, incomplete, unsupported, or misses an important part. In "response", politely say what needs more detail; in "question", ask one focused probing question. Do not move on until the answer is reasonably clear; at most {2 - data.followup_count} more probes are available for this question.
- If the answer is clear and substantive, acknowledge a specific strength in "response" (for example, clear reasoning, a relevant example, or a measurable outcome), then ask the next distinct question. Avoid generic praise and do not exaggerate.
- If the candidate's answer is especially strong, say specifically what made it strong. If it is weak, be kind but direct about what is missing and how to improve it.
- Across the interview, cover both the role/job description and the candidate's resume. Ask about specific resume projects, their contribution, outcomes, listed skills, and certifications; do not make every question about the job title.
- Do not complete before all {data.total_questions} main questions have been answered. Follow-up questions do not count as a new main question.
- Never ask a question already present in RECENT HISTORY, including a paraphrase of one. A follow-up must add a genuinely new, narrower probe.
- Keep the question concise and conversational (1-2 sentences max).
- Never repeat a previous question.

Return ONLY this JSON:
{{
  "action": "follow_up",
  "response": "Brief spoken reaction to the candidate's answer",
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
                    "response": {"type": "string"},
                    "question": {"type": "string"},
                    "topic": {"type": "string"},
                    "reason": {"type": "string"},
                    "remarks": {"type": "string"},
                },
                "required": ["action", "response", "question", "topic", "reason", "remarks"],
                "additionalProperties": False,
            },
        )

        if not isinstance(result.get("question"), str):
            raise ValueError("Invalid question")
        if result.get("action") not in ["follow_up", "next", "complete"]:
            result["action"] = "next"
        if not allow_followup and result["action"] == "follow_up":
            result["action"] = "next"

        if data.main_question_number >= data.total_questions:
            result["action"] = "complete"
        elif result["action"] == "complete":
            result["action"] = "next"
            if data.remaining_questions:
                result["question"] = data.remaining_questions[0]
            elif not result.get("question"):
                result["question"] = "Could you describe a specific project that shows how you approach this role's challenges?"

        # Guard against an LLM repeating a question despite the prompt instruction.
        normalize = lambda value: " ".join(value.lower().split()).rstrip(" ?.!") if isinstance(value, str) else ""
        previous_questions = {normalize(turn.question) for turn in data.history}
        if result.get("action") in ["next", "follow_up"] and normalize(result.get("question")) in previous_questions:
            result["action"] = "next"
            result["question"] = (
                "Let's explore another part of your experience. Could you walk me through a project "
                "from your resume that best shows how you used one of your key skills?"
            )
            result["topic"] = "Resume project"

        return {"success": True, "data": result}

    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
