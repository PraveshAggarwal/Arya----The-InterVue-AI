from pydantic import BaseModel, Field
from typing import Literal


class InterviewPlanRequest(BaseModel):

    role: str = Field(min_length=2, max_length=100)

    experience: str = Field(min_length=1, max_length=50)

    difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ] = "medium"

    total_questions: int = Field(
        default=15,
        ge=5,
        le=15
    )

    resume_text: str = Field(
        default="",
        max_length=20000
    )

    job_description: str = Field(default="", max_length=10000)

    skills: list[str] = Field(default_factory=list)


class InterviewQuestion(BaseModel):

    id: str

    question: str

    topic: str

    type: Literal[
        "introduction",
        "technical",
        "scenario",
        "problem_solving",
        "project",
        "behavioral"
    ]

    difficulty: Literal[
        "easy",
        "medium",
        "hard"
    ]

    expected_points: list[str]


class InterviewPlanResponse(BaseModel):

    role: str

    total_questions: int

    questions: list[InterviewQuestion]


class ConversationTurn(BaseModel):

    question: str

    answer: str


class NextQuestionRequest(BaseModel):

    session_id: str | None = None

    role: str

    current_question: str

    current_answer: str

    resume_text: str = Field(default="", max_length=20000)

    history: list[ConversationTurn] = Field(
        default_factory=list
    )

    remaining_topics: list[str] = Field(
        default_factory=list
    )

    remaining_questions: list[str] = Field(default_factory=list)

    main_question_number: int = Field(default=1, ge=1, le=15)

    total_questions: int = Field(default=15, ge=1, le=15)

    followup_count: int = Field(
        default=0,
        ge=0,
        le=3
    )


class NextQuestionResponse(BaseModel):

    action: Literal[
        "follow_up",
        "next"
    ]

    question: str

    topic: str

    reason: str


class PerformanceReportRequest(BaseModel):
    role: str
    transcript: list[ConversationTurn] = Field(default_factory=list)


class PerformanceReportResponse(BaseModel):
    overallScore: int
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    recommendations: list[str]
    performance: dict[str, int]
    questionReviews: list[dict]
