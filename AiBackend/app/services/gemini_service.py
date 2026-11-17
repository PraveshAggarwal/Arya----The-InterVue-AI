
import json
import re
import asyncio

from google import genai
from google.genai import types

from app.config import settings


if not settings.GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY is missing in .env")


client = genai.Client(
    api_key=settings.GOOGLE_API_KEY
)


async def generate_text(prompt: str) -> str:
    for attempt in range(3):
        try:
            response = await client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.4,
                    max_output_tokens=1024
                )
            )
            if not response.text:
                raise RuntimeError("Gemini returned an empty response")
            return response.text.strip()
        except Exception as e:
            if "503" in str(e) and attempt < 2:
                await asyncio.sleep(3 * (attempt + 1))
                continue
            raise


async def generate_json(prompt: str) -> dict:
    for attempt in range(3):
        try:
            response = await client.aio.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                    max_output_tokens=4096
                )
            )

            if not response.text:
                raise RuntimeError("Gemini returned an empty response")

            result = response.text.strip()
            result = re.sub(
                r"^```(?:json)?\s*|\s*```$",
                "",
                result,
                flags=re.IGNORECASE
            )

            try:
                parsed = json.loads(result)
                if not isinstance(parsed, dict):
                    raise ValueError("Expected a JSON object")
                return parsed
            except (json.JSONDecodeError, ValueError) as error:
                raise ValueError(f"Gemini returned invalid JSON: {error}") from error

        except Exception as e:
            if "503" in str(e) and attempt < 2:
                await asyncio.sleep(3 * (attempt + 1))
                continue
            raise
