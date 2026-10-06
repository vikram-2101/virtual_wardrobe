from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Virtual Wardrobe - AI Service"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/ai"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    MINIO_ENDPOINT: str = "http://localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "wardrobe-storage"
    MINIO_REGION: str = "us-east-1"

    BACKEND_CALLBACK_URL: str = "http://localhost:8080/api/internal/try-ons/callback"
    INTERNAL_API_SECRET: str = "dev_internal_secret_key_12345"

    # Fashn.ai VTON provider (leave blank to use enhanced mock mode)
    FASHN_API_KEY: str = ""
    FASHN_API_BASE_URL: str = "https://api.fashn.ai/v1"
    FASHN_MODEL: str = "tryon"
    FASHN_POLL_TIMEOUT_SECONDS: int = 120
    FASHN_POLL_INTERVAL_SECONDS: int = 3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

