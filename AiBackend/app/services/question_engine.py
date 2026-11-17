
from app.services.llm_service import generate_json


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

Rules: Order the questions from a very basic warm-up, then gradually increase difficulty from foundational concepts to role-specific technical, scenario, problem-solving, project, and behavioral questions. No duplicates. Sound natural when spoken.

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

    result = await generate_json(
        prompt,
        {
            "type": "object",
            "properties": {
                "questions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "question": {"type": "string"},
                            "topic": {"type": "string"},
                            "type": {
                                "type": "string",
                                "enum": [
                                    "introduction",
                                    "technical",
                                    "scenario",
                                    "problem_solving",
                                    "project",
                                    "behavioral",
                                ],
                            },
                            "difficulty": {
                                "type": "string",
                                "enum": ["easy", "medium", "hard"],
                            },
                            "expected_points": {
                                "type": "array",
                                "items": {"type": "string"},
                            },
                        },
                        "required": [
                            "id",
                            "question",
                            "topic",
                            "type",
                            "difficulty",
                            "expected_points",
                        ],
                        "additionalProperties": False,
                    },
                }
            },
            "required": ["questions"],
            "additionalProperties": False,
        },
    )

    questions = result.get("questions")

    if not isinstance(questions, list):
        raise ValueError("Invalid question plan")

    return questions[:total_questions]
