from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App settings
    app_name: str = "claygendron.io"
    debug: bool = False

    # Resend settings
    resend_api_key: str = ""
    contact_email: str = "clay@claygendron.io"
    from_email: str = "contact@claygendron.io"

    # Admin settings (for analytics dashboard)
    admin_secret: str = ""

    # Database (for analytics - Phase 6)
    database_url: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
