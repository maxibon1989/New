"""
Scraper for Vasakronan - one of Sweden's largest property owners
Website: https://www.vasakronan.se
"""
import re
from typing import List, Optional
from playwright.async_api import Page

from base_scraper import BaseScraper
from models import ScrapedListing


class VasakronanScraper(BaseScraper):
    """
    Scraper for Vasakronan's office listings.

    Vasakronan typically lists:
    - Address and area
    - Size (kvm)
    - Sometimes rent info
    - Amenities and images
    """

    def __init__(self):
        super().__init__(
            source_name="vasakronan",
            base_url="https://www.vasakronan.se"
        )

    async def get_listing_urls(self, page: Page) -> List[str]:
        """Get all office listing URLs from Vasakronan"""
        urls = []

        # Navigate to office listings page
        await self.fetch_page(
            page,
            f"{self.base_url}/lediga-lokaler?type=kontor"
        )

        # Wait for listings to load
        await page.wait_for_selector(".property-list-item", timeout=10000)

        # Extract all listing links
        links = await page.query_selector_all(".property-list-item a")

        for link in links:
            href = await link.get_attribute("href")
            if href:
                full_url = href if href.startswith("http") else f"{self.base_url}{href}"
                urls.append(full_url)

        return urls

    async def parse_listing(self, page: Page, url: str) -> Optional[ScrapedListing]:
        """Parse a single Vasakronan listing page"""
        await self.fetch_page(page, url)

        try:
            # Extract address
            address_el = await page.query_selector("h1.property-title")
            address = self.clean_text(await address_el.text_content()) if address_el else ""

            # Extract area/neighborhood
            area_el = await page.query_selector(".property-area")
            area_text = self.clean_text(await area_el.text_content()) if area_el else ""

            # Determine city from area
            city = self._determine_city(area_text)

            # Extract size
            size_el = await page.query_selector(".property-size")
            size_text = await size_el.text_content() if size_el else ""
            sqm = self.parse_sqm(size_text)

            if not sqm:
                self.log.warning("Could not parse size", url=url)
                return None

            # Extract description
            desc_el = await page.query_selector(".property-description")
            description = self.clean_text(await desc_el.text_content()) if desc_el else ""

            # Extract images
            image_els = await page.query_selector_all(".property-gallery img")
            images = []
            for img in image_els:
                src = await img.get_attribute("src")
                if src:
                    images.append(src)

            # Extract amenities from description and feature list
            amenities = self.extract_amenities(description)

            # Try to get rent if available
            rent_el = await page.query_selector(".property-rent")
            rent_text = await rent_el.text_content() if rent_el else ""
            official_rent = self.parse_rent(rent_text)

            # Get coordinates (if available in page data)
            lat, lng = await self._extract_coordinates(page)

            # Check for renovation status
            newly_renovated = "renovera" in description.lower() or "nybyggd" in description.lower()

            return ScrapedListing(
                external_id=self._generate_external_id(url),
                address=address,
                area=area_text or "Okänt",
                city=city,
                sqm=sqm,
                lat=lat,
                lng=lng,
                official_rent=official_rent,
                description=description,
                amenities=amenities,
                images=images[:5],  # Limit images
                newly_renovated=newly_renovated,
                owner="Vasakronan",
                source="vasakronan",
                source_url=url,
            )

        except Exception as e:
            self.log.error("Failed to parse Vasakronan listing", url=url, error=str(e))
            return None

    async def _extract_coordinates(self, page: Page) -> tuple[float, float]:
        """Try to extract coordinates from page JavaScript or embedded map"""
        try:
            # Try to find coordinates in page script
            coords = await page.evaluate("""
                () => {
                    // Check for Google Maps
                    if (window.google && window.google.maps) {
                        const maps = document.querySelectorAll('[data-lat][data-lng]');
                        if (maps.length > 0) {
                            return {
                                lat: parseFloat(maps[0].dataset.lat),
                                lng: parseFloat(maps[0].dataset.lng)
                            };
                        }
                    }
                    // Check for data attributes
                    const el = document.querySelector('[data-latitude]');
                    if (el) {
                        return {
                            lat: parseFloat(el.dataset.latitude),
                            lng: parseFloat(el.dataset.longitude)
                        };
                    }
                    return null;
                }
            """)

            if coords:
                return coords["lat"], coords["lng"]

        except Exception:
            pass

        # Default to Stockholm center if not found
        return 59.3293, 18.0686

    def _determine_city(self, area: str) -> str:
        """Determine city from area name"""
        stockholm_areas = [
            "norrmalm", "södermalm", "östermalm", "kungsholmen",
            "vasastan", "kista", "solna", "sundbyberg", "bromma"
        ]
        gothenburg_areas = ["centrum", "hisingen", "majorna", "lindholmen"]
        malmo_areas = ["västra hamnen", "hyllie"]

        area_lower = area.lower()

        for a in stockholm_areas:
            if a in area_lower:
                return "Stockholm"

        for a in gothenburg_areas:
            if a in area_lower:
                return "Göteborg"

        for a in malmo_areas:
            if a in area_lower:
                return "Malmö"

        # Default to Stockholm
        return "Stockholm"

    def _generate_external_id(self, url: str) -> str:
        """Generate a unique external ID from the URL"""
        # Extract property ID from URL
        match = re.search(r"/(\d+)/?$", url)
        if match:
            return f"vasakronan_{match.group(1)}"
        # Fallback to hash
        return f"vasakronan_{hash(url)}"
