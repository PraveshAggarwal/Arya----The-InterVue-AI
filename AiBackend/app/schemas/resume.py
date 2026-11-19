from pydantic import BaseModel, Field


class ResumeAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=100, max_length=20000)
    target_role: str = Field(default="", max_length=120)
    job_description: str = Field(default="", max_length=10000)
