from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache

_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    # App settings
    app_name: str = "claygendron.io"
    debug: bool = False

    # Microsoft Entra ID (Azure AD)
    azure_tenant_id: str = ""
    azure_client_id: str = ""
    azure_client_secret: str = ""
    azure_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    frontend_url: str = "http://localhost:8000"
    admin_allowed_emails: str = ""

    # Database (for analytics)
    database_url: str = ""

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
