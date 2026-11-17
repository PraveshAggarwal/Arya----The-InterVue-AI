from fastapi import APIRouter, UploadFile, File, HTTPException

from app.config import settings
from app.services.resume_parser import extract_resume_text

router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


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
