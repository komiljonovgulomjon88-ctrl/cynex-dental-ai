import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

class Settings:
    APP_SECRET_KEY: str              = os.getenv("APP_SECRET_KEY", "dev-secret-change-me")
    ALGORITHM: str                   = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))
    SUPABASE_URL: str                = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str        = os.getenv("SUPABASE_SERVICE_KEY", "")
    ANTHROPIC_API_KEY: str           = os.getenv("ANTHROPIC_API_KEY", "")
    ALLOWED_ORIGINS: str             = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

    @property
    def origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

settings = Settings()
