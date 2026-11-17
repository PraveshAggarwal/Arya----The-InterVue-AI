import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current directory or in AiBackend directory
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "InterVue AI")
    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    # This is the Groq model tier matching the account limits supplied by the user.
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    MAX_RESUME_SIZE_MB = int(os.getenv("MAX_RESUME_SIZE_MB", "5"))
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "aiinterviewer")
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5000").split(",")
        if origin.strip()
    ]


settings = Settings()
