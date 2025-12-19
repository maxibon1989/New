#!/usr/bin/env python3
"""
Office Oracle Scraping Pipeline
Main entry point for running scrapers.

Usage:
    python main.py                    # Run all enabled scrapers
    python main.py --source vasakronan  # Run specific scraper
    python main.py --schedule         # Run on schedule (every 24h)
"""
import asyncio
import argparse
import structlog
from datetime import datetime
from typing import List

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import SOURCES, scraping_config
from database import db_manager
from models import ScrapedListing
from scrapers.vasakronan import VasakronanScraper

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.dev.ConsoleRenderer()
    ]
)

logger = structlog.get_logger()


def get_scraper(source_name: str):
    """Factory function to get scraper by name"""
    scrapers = {
        "vasakronan": VasakronanScraper,
        # Add more scrapers as they're implemented:
        # "castellum": CastellumScraper,
        # "humlegarden": HumlegardenScraper,
    }

    scraper_class = scrapers.get(source_name)
    if scraper_class:
        return scraper_class()
    return None


async def run_scraper(source_name: str) -> None:
    """Run a single scraper and store results"""
    log = logger.bind(source=source_name)
    log.info("Starting scraper")

    scraper = get_scraper(source_name)
    if not scraper:
        log.error("Scraper not found")
        db_manager.log_scraping_job(source_name, "failed", error_message="Scraper not implemented")
        return

    listings: List[ScrapedListing] = []

    try:
        async with scraper:
            async for listing in scraper.scrape_stream():
                listings.append(listing)
                log.debug("Scraped listing", address=listing.address)

        if listings:
            # Store in database
            total, new, updated = db_manager.upsert_listings(listings)
            log.info("Stored listings", total=total, new=new, updated=updated)

            # Mark old listings as unavailable
            active_ids = [l.external_id for l in listings]
            unavailable = db_manager.mark_unavailable(source_name, active_ids)
            if unavailable:
                log.info("Marked unavailable", count=unavailable)

            # Log job
            db_manager.log_scraping_job(
                source=source_name,
                status="success",
                listings_found=len(listings),
                listings_new=new,
                listings_updated=updated
            )

        else:
            log.warning("No listings found")
            db_manager.log_scraping_job(source_name, "partial", error_message="No listings found")

    except Exception as e:
        log.error("Scraper failed", error=str(e))
        db_manager.log_scraping_job(source_name, "failed", error_message=str(e))


async def run_all_scrapers() -> None:
    """Run all enabled scrapers sequentially"""
    enabled_sources = [s for s in SOURCES if s.enabled]
    enabled_sources.sort(key=lambda s: s.priority)

    logger.info("Starting scraping run", sources=[s.name for s in enabled_sources])

    for source in enabled_sources:
        await run_scraper(source.name)
        # Small delay between scrapers
        await asyncio.sleep(5)

    logger.info("Scraping run completed")


def scheduled_job():
    """Wrapper for scheduled execution"""
    asyncio.run(run_all_scrapers())


def main():
    parser = argparse.ArgumentParser(description="Office Oracle Scraping Pipeline")
    parser.add_argument(
        "--source",
        type=str,
        help="Run specific scraper (e.g., vasakronan, castellum)"
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Run on schedule (configurable interval)"
    )
    parser.add_argument(
        "--list-sources",
        action="store_true",
        help="List available sources"
    )

    args = parser.parse_args()

    if args.list_sources:
        print("\nAvailable sources:")
        for source in SOURCES:
            status = "✓ Enabled" if source.enabled else "✗ Disabled"
            print(f"  {source.name}: {status} (priority: {source.priority})")
        return

    if args.schedule:
        logger.info(
            "Starting scheduled scraping",
            interval_hours=scraping_config.interval_hours if hasattr(scraping_config, 'interval_hours') else 24
        )

        scheduler = AsyncIOScheduler()
        scheduler.add_job(
            scheduled_job,
            "interval",
            hours=24,
            next_run_time=datetime.now()  # Run immediately first
        )
        scheduler.start()

        try:
            asyncio.get_event_loop().run_forever()
        except (KeyboardInterrupt, SystemExit):
            logger.info("Shutting down scheduler")
            scheduler.shutdown()

    elif args.source:
        asyncio.run(run_scraper(args.source))

    else:
        asyncio.run(run_all_scrapers())


if __name__ == "__main__":
    main()
