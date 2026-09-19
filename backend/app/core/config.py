from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

INSECURE_PLACEHOLDERS = {
    "supersecretkey_please_change_in_production",
    "your-secret-key-here",
    "your-super-secret-jwt-key",
    "secret",
    "changeme",
}

class Settings(BaseSettings):
    PROJECT_NAME: str = "COPO Vision API"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "copovision"
    POSTGRES_PORT: str = "5432"
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("SECRET_KEY cannot be empty.")
        if v.strip() in INSECURE_PLACEHOLDERS:
            raise ValueError(
                f"Insecure SECRET_KEY detected: '{v}'. "
                "Please configure a secure, non-default secret key in your environment."
            )
        if len(v.strip()) < 16:
            raise ValueError("SECRET_KEY must be at least 16 characters long for security.")
        return v.strip()

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
settings = Settings()
