import asyncio
import json
import re

from groq import AsyncGroq, RateLimitError
from google import genai
from google.genai import types

from app.config import settings


groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY, max_retries=0) if settings.GROQ_API_KEY else None
gemini_client = genai.Client(api_key=settings.GOOGLE_API_KEY) if settings.GOOGLE_API_KEY else None

_RETRIABLE = ("429", "503", "rate limit", "overloaded", "quota", "resource exhausted")


def _clean_json(raw: str) -> dict:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as error:
        raise ValueError(f"LLM returned invalid JSON: {error}") from error
    if not isinstance(parsed, dict):
        raise ValueError("LLM returned JSON that is not an object")
    return parsed


async def _with_retry(fn, retries: int = 3) -> str:
    for attempt in range(retries):
        try:
            return await asyncio.wait_for(fn(), timeout=30)
        except asyncio.TimeoutError:
            if attempt == retries - 1:
                raise RuntimeError("LLM request timed out after 30 seconds")
        except Exception as error:
            if attempt == retries - 1 or not any(c in str(error).lower() for c in _RETRIABLE):
                raise
        await asyncio.sleep(2 ** attempt)


# ── Gemini (used for ATS resume analysis) ────────────────────────────────────

async def _gemini_json(prompt: str, max_tokens: int, response_schema: dict | None = None) -> str:
    if not gemini_client:
        raise RuntimeError("GOOGLE_API_KEY is not configured")
    config_kwargs: dict = {
        "max_output_tokens": max_tokens,
        "temperature": 0.2,
        "response_mime_type": "application/json",
    }
    if response_schema:
        config_kwargs["response_schema"] = response_schema
    response = await gemini_client.aio.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(**config_kwargs),
    )
    if not response.text:
        raise RuntimeError("Gemini returned an empty response")
    return response.text.strip()


# ── Groq (used for interview questions, performance reports, etc.) ────────────

async def _groq_generate(prompt: str, *, response_schema: dict | None, max_tokens: int) -> str:
    if not groq_client:
        raise RuntimeError("GROQ_API_KEY is not configured")
    try:
        response = await groq_client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2 if response_schema else 0.4,
            max_tokens=max_tokens,
            **(
                {
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {"name": "ai_response", "strict": True, "schema": response_schema},
                    },
                    "reasoning_format": "hidden",
                }
                if response_schema
                else {}
            ),
        )
    except RateLimitError as error:
        retry_after = error.response.headers.get("retry-after")
        wait = f" Retry after {retry_after}s." if retry_after else ""
        raise RuntimeError(f"429: Groq rate limit reached.{wait}") from error

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("Groq returned an empty response")
    return content.strip()


# ── Public API ────────────────────────────────────────────────────────────────

async def generate_text(prompt: str) -> str:
    """Used by interview & question endpoints — Groq only."""
    result = await _with_retry(lambda: _groq_generate(prompt, response_schema=None, max_tokens=1024))
    return result


async def generate_json(prompt: str, schema: dict) -> dict:
    """Used by ATS resume analysis — Gemini only, Groq as fallback."""
    try:
        raw = await _with_retry(lambda: _gemini_json(prompt, max_tokens=4096, response_schema=schema))
    except Exception as gemini_error:
        if not groq_client:
            raise
        print(f"[LLM] Gemini failed ({gemini_error}), falling back to Groq")
        raw = await _with_retry(lambda: _groq_generate(prompt, response_schema=schema, max_tokens=4096))
    return _clean_json(raw)
