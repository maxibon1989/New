import 'dotenv/config';

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'office_oracle',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DB || 'office_oracle',
    url: process.env.DATABASE_URL || 'postgresql://office_oracle:password@localhost:5432/office_oracle',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  // External APIs
  mapbox: {
    accessToken: process.env.MAPBOX_ACCESS_TOKEN || '',
  },

  // Scraping
  scraping: {
    enabled: process.env.SCRAPING_ENABLED === 'true',
    intervalHours: parseInt(process.env.SCRAPING_INTERVAL_HOURS || '24', 10),
  },

  // Cache TTL (in seconds)
  cacheTTL: {
    listings: 300,      // 5 minutes
    areas: 3600,        // 1 hour
    analytics: 1800,    // 30 minutes
    search: 180,        // 3 minutes
  },
};
