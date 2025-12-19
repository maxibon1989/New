"""
Data models for scraped office listings
"""
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ScrapedListing(BaseModel):
    """Represents a scraped office listing"""

    # Required fields
    external_id: str
    address: str
    area: str
    city: str
    sqm: int
    lat: float
    lng: float

    # Optional pricing (often not disclosed)
    official_rent: Optional[int] = None
    rent_per_sqm: Optional[float] = None

    # Property details
    rooms: Optional[int] = None
    floor: Optional[int] = None
    building_year: Optional[int] = None

    # Classification
    property_type: str = "office"
    culture: Optional[str] = None

    # Features
    amenities: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    description: Optional[str] = None

    # Status
    newly_renovated: bool = False
    flexible_contract: bool = False
    available: bool = True

    # Insights
    metro_distance: Optional[int] = None
    owner: Optional[str] = None

    # Source info
    source: str
    source_url: str
    scraped_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ScrapingResult(BaseModel):
    """Result of a scraping job"""
    source: str
    status: str  # success, partial, failed
    listings_found: int = 0
    listings_new: int = 0
    listings_updated: int = 0
    errors: List[str] = Field(default_factory=list)
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None


class GeocodingResult(BaseModel):
    """Result from geocoding an address"""
    lat: float
    lng: float
    formatted_address: str
    area: Optional[str] = None
    confidence: float = 0.0
