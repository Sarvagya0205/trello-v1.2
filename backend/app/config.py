from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Full connection URL — takes priority when set (Railway, Render, etc.)
    DATABASE_URL: Optional[str] = None

    # Individual fields used for local MySQL dev
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "trello_clone"

    class Config:
        env_file = ".env"


settings = Settings()
