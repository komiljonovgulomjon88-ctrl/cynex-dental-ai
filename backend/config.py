from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_SECRET_KEY: str = "dev-secret-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""

    ANTHROPIC_API_KEY: str = ""

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()
