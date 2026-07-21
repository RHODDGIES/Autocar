import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./automatch.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", "8000"))

settings = Settings()

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None
