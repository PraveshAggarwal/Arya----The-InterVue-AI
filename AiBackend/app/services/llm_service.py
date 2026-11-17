import json
import re

from groq import AsyncGroq, RateLimitError

from app.config import settings


if not settings.GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from AiBackend/.env")


# Let Groq enforce the account's RPM/TPM limits. Automatic SDK retries are
# disabled so a rate-limited request does not silently consume extra attempts.
client = AsyncGroq(api_key=settings.GROQ_API_KEY, max_retries=0)


async def _generate(
    prompt: str,
    *,
    response_schema: dict | None = None,
    max_tokens: int,
) -> str:
    try:
        response = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2 if response_schema else 0.4,
            max_tokens=max_tokens,
            **(
                {
                    "response_format": {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "ai_response",
                            "strict": True,
                            "schema": response_schema,
                        },
                    },
                    "reasoning_format": "hidden",
                }
                if response_schema
                else {}
            ),
        )
    except RateLimitError as error:
        retry_after = error.response.headers.get("retry-after")
        wait = f" Retry after {retry_after} seconds." if retry_after else " Try again later."
        raise RuntimeError(f"Groq rate limit reached.{wait}") from error

    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("Groq returned an empty response")
    return content.strip()


async def generate_text(prompt: str) -> str:
    return await _generate(prompt, max_tokens=1024)


async def generate_json(prompt: str, schema: dict) -> dict:
    result = await _generate(prompt, response_schema=schema, max_tokens=2048)
    result = re.sub(r"^```(?:json)?\s*|\s*```$", "", result, flags=re.IGNORECASE)

    try:
        parsed = json.loads(result)
    except json.JSONDecodeError as error:
        raise ValueError(f"Groq returned invalid JSON: {error}") from error

    if not isinstance(parsed, dict):
        raise ValueError("Groq returned JSON that is not an object")
    return parsed
