from functools import lru_cache
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    ENVIRONMENT: str = "development"
    APP_NAME: str = "Ask My Docs API"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ask_my_docs"
    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:19006"]

    OPENAI_API_KEY: str = ""
    LANGCHAIN_API_KEY: str = ""
    LANGCHAIN_PROJECT: str = "ask-my-docs-dev"
    LANGCHAIN_TRACING_V2: bool = True

    LANGSMITH_TRACING: bool = True
    LANGSMITH_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = "ask-my-docs-dev"

    FREE_PLAN_MONTHLY_QUERY_LIMIT: int = 1000
    FREE_PLAN_MAX_DOCUMENTS: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# LangChain/LangSmith's automatic tracing reads directly from os.environ —
# it has no idea our `settings` object exists. pydantic-settings loads .env
# into `settings.*` but does NOT copy those values into the real process
# environment, so without this, tracing silently does nothing (no error,
# just an empty LangSmith project).
os.environ.setdefault("LANGSMITH_TRACING", "true" if settings.LANGSMITH_TRACING else "false")
os.environ.setdefault("LANGSMITH_API_KEY", settings.LANGSMITH_API_KEY)
os.environ.setdefault("LANGSMITH_PROJECT", settings.LANGSMITH_PROJECT)
os.environ.setdefault("LANGCHAIN_TRACING_V2", "true" if settings.LANGCHAIN_TRACING_V2 else "false")
os.environ.setdefault("LANGCHAIN_API_KEY", settings.LANGCHAIN_API_KEY)
os.environ.setdefault("LANGCHAIN_PROJECT", settings.LANGCHAIN_PROJECT)