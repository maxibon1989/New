"""
Database operations for storing scraped listings
"""
import structlog
from datetime import datetime
from typing import List, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config import db_config
from models import ScrapedListing

logger = structlog.get_logger()


class DatabaseManager:
    """Handles all database operations for scraped data"""

    def __init__(self):
        self.engine = create_engine(db_config.url, pool_pre_ping=True)
        self.Session = sessionmaker(bind=self.engine)
        self.log = logger.bind(component="database")

    def upsert_listing(self, listing: ScrapedListing) -> tuple[bool, bool]:
        """
        Insert or update a listing in the database.
        Returns (success, is_new)
        """
        session = self.Session()

        try:
            # Check if listing exists
            existing = session.execute(
                text("SELECT id FROM offices WHERE external_id = :external_id"),
                {"external_id": listing.external_id}
            ).fetchone()

            if existing:
                # Update existing listing
                session.execute(
                    text("""
                        UPDATE offices SET
                            address = :address,
                            area = :area,
                            city = :city,
                            sqm = :sqm,
                            lat = :lat,
                            lng = :lng,
                            official_rent = :official_rent,
                            rent_per_sqm = :rent_per_sqm,
                            rooms = :rooms,
                            floor = :floor,
                            building_year = :building_year,
                            type = :type,
                            amenities = :amenities,
                            images = :images,
                            description = :description,
                            newly_renovated = :newly_renovated,
                            flexible_contract = :flexible_contract,
                            available = :available,
                            metro_distance = :metro_distance,
                            owner = :owner,
                            source = :source,
                            source_url = :source_url,
                            last_scraped_at = :scraped_at,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE external_id = :external_id
                    """),
                    self._listing_to_dict(listing)
                )
                session.commit()
                return True, False

            else:
                # Insert new listing
                session.execute(
                    text("""
                        INSERT INTO offices (
                            external_id, address, area, city, sqm, lat, lng,
                            official_rent, rent_per_sqm, rooms, floor, building_year,
                            type, amenities, images, description,
                            newly_renovated, flexible_contract, available,
                            metro_distance, owner, source, source_url, last_scraped_at
                        ) VALUES (
                            :external_id, :address, :area, :city, :sqm, :lat, :lng,
                            :official_rent, :rent_per_sqm, :rooms, :floor, :building_year,
                            :type, :amenities, :images, :description,
                            :newly_renovated, :flexible_contract, :available,
                            :metro_distance, :owner, :source, :source_url, :scraped_at
                        )
                    """),
                    self._listing_to_dict(listing)
                )
                session.commit()
                return True, True

        except Exception as e:
            session.rollback()
            self.log.error("Database error", error=str(e), listing_id=listing.external_id)
            return False, False

        finally:
            session.close()

    def upsert_listings(self, listings: List[ScrapedListing]) -> tuple[int, int, int]:
        """
        Batch upsert listings.
        Returns (total, new, updated)
        """
        new_count = 0
        updated_count = 0

        for listing in listings:
            success, is_new = self.upsert_listing(listing)
            if success:
                if is_new:
                    new_count += 1
                else:
                    updated_count += 1

        return len(listings), new_count, updated_count

    def mark_unavailable(self, source: str, active_external_ids: List[str]) -> int:
        """
        Mark listings as unavailable if they weren't in the latest scrape.
        Returns count of listings marked unavailable.
        """
        if not active_external_ids:
            return 0

        session = self.Session()

        try:
            result = session.execute(
                text("""
                    UPDATE offices
                    SET available = FALSE, updated_at = CURRENT_TIMESTAMP
                    WHERE source = :source
                    AND external_id NOT IN :active_ids
                    AND available = TRUE
                """),
                {"source": source, "active_ids": tuple(active_external_ids)}
            )
            session.commit()
            return result.rowcount

        except Exception as e:
            session.rollback()
            self.log.error("Failed to mark unavailable", error=str(e))
            return 0

        finally:
            session.close()

    def log_scraping_job(
        self,
        source: str,
        status: str,
        listings_found: int = 0,
        listings_new: int = 0,
        listings_updated: int = 0,
        error_message: Optional[str] = None
    ) -> None:
        """Log a scraping job to the database"""
        session = self.Session()

        try:
            session.execute(
                text("""
                    INSERT INTO scraping_jobs (
                        source, status, listings_found, listings_new,
                        listings_updated, error_message, started_at, completed_at
                    ) VALUES (
                        :source, :status, :listings_found, :listings_new,
                        :listings_updated, :error_message, :started_at, CURRENT_TIMESTAMP
                    )
                """),
                {
                    "source": source,
                    "status": status,
                    "listings_found": listings_found,
                    "listings_new": listings_new,
                    "listings_updated": listings_updated,
                    "error_message": error_message,
                    "started_at": datetime.utcnow()
                }
            )
            session.commit()

        except Exception as e:
            session.rollback()
            self.log.error("Failed to log scraping job", error=str(e))

        finally:
            session.close()

    def _listing_to_dict(self, listing: ScrapedListing) -> dict:
        """Convert ScrapedListing to dict for SQL parameters"""
        import json

        return {
            "external_id": listing.external_id,
            "address": listing.address,
            "area": listing.area,
            "city": listing.city,
            "sqm": listing.sqm,
            "lat": listing.lat,
            "lng": listing.lng,
            "official_rent": listing.official_rent,
            "rent_per_sqm": listing.rent_per_sqm,
            "rooms": listing.rooms,
            "floor": listing.floor,
            "building_year": listing.building_year,
            "type": listing.property_type,
            "amenities": json.dumps(listing.amenities),
            "images": json.dumps(listing.images),
            "description": listing.description,
            "newly_renovated": listing.newly_renovated,
            "flexible_contract": listing.flexible_contract,
            "available": listing.available,
            "metro_distance": listing.metro_distance,
            "owner": listing.owner,
            "source": listing.source,
            "source_url": listing.source_url,
            "scraped_at": listing.scraped_at,
        }


# Singleton instance
db_manager = DatabaseManager()
