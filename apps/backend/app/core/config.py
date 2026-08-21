from functools import lru_cache
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

    FREE_PLAN_MONTHLY_QUERY_LIMIT: int = 1000
    FREE_PLAN_MAX_DOCUMENTS: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()