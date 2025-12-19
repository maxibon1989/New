"""
Configuration for the Office Oracle Scraping Pipeline
"""
import os
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import List

load_dotenv()


@dataclass
class DatabaseConfig:
    host: str = os.getenv("POSTGRES_HOST", "localhost")
    port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    user: str = os.getenv("POSTGRES_USER", "office_oracle")
    password: str = os.getenv("POSTGRES_PASSWORD", "password")
    database: str = os.getenv("POSTGRES_DB", "office_oracle")

    @property
    def url(self) -> str:
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"


@dataclass
class ScrapingConfig:
    # Rate limiting
    requests_per_minute: int = 30
    delay_between_pages: float = 2.0  # seconds

    # Browser settings
    headless: bool = True
    timeout: int = 30000  # milliseconds

    # Retry settings
    max_retries: int = 3
    retry_delay: float = 5.0

    # Data limits
    max_listings_per_source: int = 500


@dataclass
class SourceConfig:
    name: str
    base_url: str
    enabled: bool = True
    priority: int = 1


# Define scraping sources
SOURCES: List[SourceConfig] = [
    SourceConfig(
        name="vasakronan",
        base_url="https://www.vasakronan.se",
        enabled=True,
        priority=1,
    ),
    SourceConfig(
        name="castellum",
        base_url="https://www.castellum.se",
        enabled=True,
        priority=1,
    ),
    SourceConfig(
        name="humlegarden",
        base_url="https://www.humlegarden.se",
        enabled=True,
        priority=1,
    ),
    SourceConfig(
        name="fabege",
        base_url="https://www.fabege.se",
        enabled=True,
        priority=2,
    ),
    SourceConfig(
        name="atrium_ljungberg",
        base_url="https://www.atriumljungberg.se",
        enabled=True,
        priority=2,
    ),
    SourceConfig(
        name="wihlborgs",
        base_url="https://www.wihlborgs.se",
        enabled=True,
        priority=2,
    ),
]


# Export configs
db_config = DatabaseConfig()
scraping_config = ScrapingConfig()
