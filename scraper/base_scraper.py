"""
Base scraper class with common functionality
"""
import asyncio
import structlog
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional, AsyncGenerator
from playwright.async_api import async_playwright, Browser, Page, BrowserContext
from tenacity import retry, stop_after_attempt, wait_exponential

from models import ScrapedListing, ScrapingResult
from config import scraping_config

logger = structlog.get_logger()


class BaseScraper(ABC):
    """
    Abstract base class for property scrapers.
    Each source (Vasakronan, Castellum, etc.) extends this.
    """

    def __init__(self, source_name: str, base_url: str):
        self.source_name = source_name
        self.base_url = base_url
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.log = logger.bind(source=source_name)

    async def __aenter__(self):
        """Set up browser on context manager entry"""
        playwright = await async_playwright().start()
        self.browser = await playwright.chromium.launch(
            headless=scraping_config.headless
        )
        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Clean up browser on context manager exit"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()

    async def new_page(self) -> Page:
        """Create a new page with default settings"""
        if not self.context:
            raise RuntimeError("Browser context not initialized")

        page = await self.context.new_page()
        page.set_default_timeout(scraping_config.timeout)
        return page

    @retry(
        stop=stop_after_attempt(scraping_config.max_retries),
        wait=wait_exponential(multiplier=1, min=2, max=10),
    )
    async def fetch_page(self, page: Page, url: str) -> None:
        """Fetch a page with retry logic"""
        self.log.info("Fetching page", url=url)
        await page.goto(url, wait_until="networkidle")
        await asyncio.sleep(scraping_config.delay_between_pages)

    @abstractmethod
    async def get_listing_urls(self, page: Page) -> List[str]:
        """
        Get all listing URLs from the source's listing page.
        Must be implemented by each source scraper.
        """
        pass

    @abstractmethod
    async def parse_listing(self, page: Page, url: str) -> Optional[ScrapedListing]:
        """
        Parse a single listing page into a ScrapedListing.
        Must be implemented by each source scraper.
        """
        pass

    async def scrape_all(self) -> ScrapingResult:
        """
        Main scraping method. Scrapes all listings from the source.
        """
        result = ScrapingResult(
            source=self.source_name,
            status="running",
            started_at=datetime.utcnow(),
        )

        try:
            page = await self.new_page()

            # Get all listing URLs
            self.log.info("Getting listing URLs")
            urls = await self.get_listing_urls(page)
            self.log.info("Found listing URLs", count=len(urls))

            # Limit if needed
            if len(urls) > scraping_config.max_listings_per_source:
                urls = urls[: scraping_config.max_listings_per_source]
                self.log.warning("Limiting listings", max=scraping_config.max_listings_per_source)

            result.listings_found = len(urls)

            # Parse each listing
            listings: List[ScrapedListing] = []
            for url in urls:
                try:
                    listing = await self.parse_listing(page, url)
                    if listing:
                        listings.append(listing)
                except Exception as e:
                    self.log.error("Failed to parse listing", url=url, error=str(e))
                    result.errors.append(f"Failed to parse {url}: {str(e)}")

            await page.close()

            result.status = "success" if not result.errors else "partial"
            result.completed_at = datetime.utcnow()
            result.duration_seconds = (
                result.completed_at - result.started_at
            ).total_seconds()

            self.log.info(
                "Scraping completed",
                found=result.listings_found,
                parsed=len(listings),
                errors=len(result.errors),
            )

            return result

        except Exception as e:
            self.log.error("Scraping failed", error=str(e))
            result.status = "failed"
            result.errors.append(str(e))
            result.completed_at = datetime.utcnow()
            return result

    async def scrape_stream(self) -> AsyncGenerator[ScrapedListing, None]:
        """
        Generator that yields listings as they are scraped.
        Useful for real-time processing.
        """
        page = await self.new_page()

        try:
            urls = await self.get_listing_urls(page)

            for url in urls:
                try:
                    listing = await self.parse_listing(page, url)
                    if listing:
                        yield listing
                except Exception as e:
                    self.log.error("Failed to parse listing", url=url, error=str(e))

        finally:
            await page.close()

    # Helper methods for parsing

    def clean_text(self, text: Optional[str]) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        return " ".join(text.strip().split())

    def parse_sqm(self, text: str) -> Optional[int]:
        """Extract square meters from text like '250 kvm' or '250 m²'"""
        import re

        match = re.search(r"(\d+(?:\s*\d+)?)\s*(?:kvm|m²|m2|sqm)", text.lower())
        if match:
            return int(match.group(1).replace(" ", ""))
        return None

    def parse_rent(self, text: str) -> Optional[int]:
        """Extract rent from text like '65 000 kr/mån'"""
        import re

        # Remove spaces in numbers
        text = text.replace(" ", "").replace("\xa0", "")
        match = re.search(r"(\d+)(?:kr|sek|:-)", text.lower())
        if match:
            return int(match.group(1))
        return None

    def extract_amenities(self, text: str) -> List[str]:
        """Extract amenities from description text"""
        amenity_keywords = {
            "pentry": "Pentry",
            "kök": "Pentry",
            "dusch": "Dusch",
            "gym": "Gym",
            "träning": "Gym",
            "fiber": "Fiber",
            "parkering": "Parkering",
            "garage": "Parkering",
            "reception": "Reception",
            "balkong": "Balkong",
            "terrass": "Terrass",
            "cykel": "Cykelparkering",
            "larm": "Larm",
            "luftkonditionering": "AC",
            "ac": "AC",
            "konferens": "Konferensrum",
        }

        found = set()
        text_lower = text.lower()

        for keyword, amenity in amenity_keywords.items():
            if keyword in text_lower:
                found.add(amenity)

        return list(found)
