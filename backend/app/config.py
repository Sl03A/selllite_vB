
from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str  # postgresql+asyncpg://user:pass@host:5432/dbname
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()
