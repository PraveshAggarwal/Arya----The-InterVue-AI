
from app.services.gemini_service import generate_json


async def generate_interview_plan(
    role: str,
    experience: str,
    difficulty: str,
    total_questions: int,
    resume_text: str = "",
    job_description: str = "",
    skills: list[str] | None = None
):

    skills = skills or []

    prompt = f"""You are a senior technical interviewer. Generate {total_questions} interview questions as JSON.

ROLE: {role}
JOB DESCRIPTION: {job_description[:3000] if job_description else 'Not provided'}
EXPERIENCE: {experience}
DIFFICULTY: {difficulty}
SKILLS: {', '.join(skills) if skills else 'Not specified'}
RESUME: {resume_text[:3000]}

Rules: Include intro, technical, scenario, problem-solving, behavioral questions. No duplicates. Sound natural when spoken.

Return ONLY this JSON:
{{
  "questions": [
    {{
      "id": "Q1",
      "question": "Question text",
      "topic": "Topic",
      "type": "technical",
      "difficulty": "{difficulty}",
      "expected_points": ["Point 1", "Point 2"]
    }}
  ]
}}
"""

    result = await generate_json(prompt)

    questions = result.get("questions")

    if not isinstance(questions, list):
        raise ValueError("Invalid question plan")

    return questions[:total_questions]
