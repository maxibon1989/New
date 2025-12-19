# Office Oracle - Tech Stack Documentation

## Overview

Office Oracle is a commercial real estate platform designed to be "Booli för kontor" - providing transparent pricing, market insights, and intelligent matching for office spaces in Sweden.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                   Next.js 16 + React 19                         │
│              Tailwind CSS + Mapbox GL JS                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API LAYER                                  │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │   Next.js API    │     │      Fastify Backend API          │  │
│  │   (Internal)     │◄───►│   (External/Production)          │  │
│  └──────────────────┘     └──────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────────┐     ┌──────────────────────────────────┐  │
│  │   PostgreSQL     │     │           Redis                   │  │
│  │   (Primary DB)   │     │     (Cache & Sessions)           │  │
│  └──────────────────┘     └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCRAPING PIPELINE                             │
│                Python + Playwright (Async)                       │
│           Runs nightly to fetch listings                         │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack Components

### Frontend: Next.js 16 + React 19

**Why Next.js?**
- **SEO-critical**: When people search "kontor i Stockholm", your listings need to rank. Server-side rendering is essential.
- **Fast UX**: App Router with streaming and suspense for instant page transitions.
- **Image optimization**: Automatic optimization for property photos.

**Key files:**
```
src/
├── app/                  # App Router pages
│   ├── api/             # API routes (lightweight)
│   ├── property/[id]/   # Property detail pages
│   ├── search/          # Search results
│   └── rent-index/      # Rent index page
├── components/          # React components
│   ├── ListingCard.tsx  # Office listing card
│   ├── MapView.tsx      # Mapbox integration
│   └── SearchWithAutocomplete.tsx
├── hooks/               # Custom React hooks
│   ├── useListings.ts   # Listings data fetching
│   └── useSearch.ts     # Search with autocomplete
├── lib/                 # Utilities
│   └── api.ts           # API client
└── data/
    └── mockData.ts      # Development data
```

### Backend: Fastify + TypeScript

**Why Fastify?**
- **Performance**: 2x faster than Express for high-throughput APIs.
- **TypeScript-first**: Full type safety with schema validation.
- **Plugin architecture**: Easy to extend.

**Key files:**
```
server/
├── src/
│   ├── index.ts          # Entry point
│   ├── config.ts         # Configuration
│   ├── routes/           # API routes
│   │   ├── listings.ts   # /api/listings
│   │   ├── areas.ts      # /api/areas
│   │   ├── search.ts     # /api/search
│   │   └── analytics.ts  # /api/analytics
│   ├── services/
│   │   ├── cache.ts      # Redis caching
│   │   └── rentEstimator.ts  # Rent estimation algorithm
│   └── db/
│       ├── schema.ts     # Drizzle ORM schema
│       ├── migrate.ts    # Database migrations
│       └── seed.ts       # Seed data
└── package.json
```

### Database: PostgreSQL + Drizzle ORM

**Why PostgreSQL?**
- **Structured data**: Offices have well-defined schemas.
- **GIS support**: PostGIS for location queries.
- **JSON support**: Flexible amenities and features storage.

**Key tables:**
- `offices` - Main listings table
- `area_stats` - Area-level statistics
- `rent_history` - Historical rent data for trends
- `scraping_jobs` - Tracking scraper runs
- `inquiries` - Lead management

### Cache: Redis

**Why Redis?**
- **Fast searches**: Sub-millisecond response for autocomplete.
- **API caching**: Reduce database load.
- **Session storage**: User preferences.

**Cache strategy:**
```typescript
// Cache-aside pattern
async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<T> {
  const cached = await this.get<T>(key);
  if (cached) return cached;

  const data = await fetcher();
  await this.set(key, data, ttl);
  return data;
}
```

### Scraping: Python + Playwright

**Why Playwright?**
- **JavaScript rendering**: Modern property sites are SPAs.
- **Reliable**: Better than Puppeteer for complex sites.
- **Async**: Handle multiple sites concurrently.

**Key files:**
```
scraper/
├── main.py              # Entry point
├── config.py            # Configuration
├── models.py            # Pydantic data models
├── base_scraper.py      # Abstract scraper class
├── database.py          # Database operations
└── scrapers/
    ├── __init__.py
    └── vasakronan.py    # Vasakronan scraper
```

**Adding a new scraper:**
```python
class NewSiteScraper(BaseScraper):
    def __init__(self):
        super().__init__("new_site", "https://example.com")

    async def get_listing_urls(self, page: Page) -> List[str]:
        # Navigate and extract listing URLs
        pass

    async def parse_listing(self, page: Page, url: str) -> Optional[ScrapedListing]:
        # Parse individual listing
        pass
```

### Maps: Mapbox GL JS

**Why Mapbox?**
- **Customizable**: Full control over styling.
- **Performance**: WebGL-powered smooth animations.
- **Swedish support**: Good coverage for Sweden.

## The "Secret Sauce": Rent Estimation

The rent estimation algorithm is what makes Office Oracle unique:

```typescript
async estimate(property: PropertyData): Promise<RentEstimate> {
  // 1. Base rent from area average
  const areaAvg = await this.getAreaAverageRent(property.area, property.city);

  // 2. Adjust for property size
  baseRent *= this.getSizeAdjustment(property.sqm);

  // 3. Adjust for building age
  baseRent *= this.getAgeAdjustment(property.buildingYear);

  // 4. Adjust for amenities
  baseRent *= this.getAmenityAdjustment(property.amenities);

  // 5. Adjust for metro distance
  baseRent *= this.getMetroAdjustment(property.metroDistance);

  // 6. Compare with similar properties
  const comparables = await this.findComparables(property);
  // Blend estimate with comparables

  return { estimatedRent, rentMin, rentMax, confidence };
}
```

## Getting Started

### Prerequisites
- Node.js 22+
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis (or use Docker)

### Quick Start with Docker

```bash
# Clone and setup
cp .env.example .env
# Edit .env with your Mapbox token and passwords

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec api npm run db:migrate

# Seed with sample data
docker-compose exec api npm run db:seed

# Access the app
open http://localhost:3000
```

### Local Development

**Frontend:**
```bash
npm install
npm run dev
# → http://localhost:3000
```

**Backend:**
```bash
cd server
npm install
npm run dev
# → http://localhost:3001
```

**Scraper:**
```bash
cd scraper
pip install -r requirements.txt
playwright install chromium

# Run all scrapers
python main.py

# Run specific scraper
python main.py --source vasakronan

# List available sources
python main.py --list-sources
```

## API Endpoints

### Listings
- `GET /api/listings` - List offices with filters
- `GET /api/listings/:id` - Get single office
- `GET /api/listings/map` - Optimized for map display

### Areas
- `GET /api/areas` - List all areas with stats
- `GET /api/areas/:city/:name` - Get area details with rent history

### Search
- `GET /api/search?q=query` - Full-text search
- `GET /api/search/autocomplete?q=query` - Fast autocomplete
- `GET /api/search/nearby?lat=&lng=&radius=` - Nearby search

### Analytics
- `GET /api/analytics/overview` - Platform statistics
- `GET /api/analytics/rent-index` - Comprehensive rent data
- `GET /api/analytics/price-distribution` - Price bucket distribution

## Deployment

### Vercel (Frontend)
```bash
vercel
```

### Railway/Render (Backend + DB)
```bash
# Use docker-compose.yml or deploy services individually
```

### Recommended Production Setup
1. **Frontend**: Vercel (free tier works well)
2. **API**: Railway or Render
3. **Database**: Supabase (PostgreSQL) or PlanetScale
4. **Redis**: Upstash (serverless Redis)
5. **Scraper**: GitHub Actions scheduled workflow or Railway cron

## Next Steps

1. **Implement more scrapers**: Castellum, Humlegården, Fabege
2. **Add user accounts**: Save searches, favorites
3. **Build mobile app**: React Native with shared components
4. **ML rent estimation**: Train model on historical data
5. **Landlord portal**: Property management features
