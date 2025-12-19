import pg from 'pg';
import { config } from '../config.js';

const { Client } = pg;

const migrationSQL = `
-- Create offices table
CREATE TABLE IF NOT EXISTS offices (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE,

  -- Location
  address VARCHAR(500) NOT NULL,
  area VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  postal_code VARCHAR(20),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,

  -- Property details
  sqm INTEGER NOT NULL,
  rooms INTEGER,
  floor INTEGER,
  building_year INTEGER,

  -- Rent information
  official_rent INTEGER,
  estimated_rent INTEGER NOT NULL,
  rent_min INTEGER,
  rent_max INTEGER,
  rent_per_sqm DECIMAL(10, 2),

  -- Classification
  type VARCHAR(50) DEFAULT 'office',
  culture VARCHAR(50),
  price_level VARCHAR(50),

  -- Features
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  description TEXT,

  -- Status & Quality
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  available BOOLEAN DEFAULT TRUE,
  newly_renovated BOOLEAN DEFAULT FALSE,
  flexible_contract BOOLEAN DEFAULT FALSE,

  -- Insights
  metro_distance INTEGER,
  restaurant_rating DECIMAL(2, 1),
  green_space_rating DECIMAL(2, 1),
  nearby_companies JSONB DEFAULT '[]',

  -- Owner/Source
  owner VARCHAR(255),
  source VARCHAR(100),
  source_url TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_scraped_at TIMESTAMP
);

-- Create indexes for offices
CREATE INDEX IF NOT EXISTS offices_city_idx ON offices(city);
CREATE INDEX IF NOT EXISTS offices_area_idx ON offices(area);
CREATE INDEX IF NOT EXISTS offices_sqm_idx ON offices(sqm);
CREATE INDEX IF NOT EXISTS offices_estimated_rent_idx ON offices(estimated_rent);
CREATE INDEX IF NOT EXISTS offices_location_idx ON offices(lat, lng);
CREATE INDEX IF NOT EXISTS offices_available_idx ON offices(available);

-- Create area_stats table
CREATE TABLE IF NOT EXISTS area_stats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,

  -- Statistics
  avg_rent_per_sqm DECIMAL(10, 2) NOT NULL,
  median_rent_per_sqm DECIMAL(10, 2),
  min_rent_per_sqm DECIMAL(10, 2),
  max_rent_per_sqm DECIMAL(10, 2),

  -- Trends
  year_change DECIMAL(5, 2),
  month_change DECIMAL(5, 2),
  trend VARCHAR(20),

  -- Counts
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,

  -- Location
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),

  -- Timestamps
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(city, name)
);

-- Create rent_history table
CREATE TABLE IF NOT EXISTS rent_history (
  id SERIAL PRIMARY KEY,
  area_name VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,

  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  month_num INTEGER NOT NULL,
  avg_rent_per_sqm DECIMAL(10, 2) NOT NULL,

  listings_count INTEGER,
  median_rent DECIMAL(10, 2),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(area_name, city, year, month_num)
);

-- Create scraping_jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',

  listings_found INTEGER DEFAULT 0,
  listings_new INTEGER DEFAULT 0,
  listings_updated INTEGER DEFAULT 0,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,

  query TEXT,
  filters JSONB,

  email_notify BOOLEAN DEFAULT FALSE,
  email VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  office_id INTEGER REFERENCES offices(id),

  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),

  message TEXT,
  employee_count INTEGER,
  desired_move_in VARCHAR(50),

  status VARCHAR(50) DEFAULT 'new',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to offices table
DROP TRIGGER IF EXISTS update_offices_updated_at ON offices;
CREATE TRIGGER update_offices_updated_at
  BEFORE UPDATE ON offices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to area_stats table
DROP TRIGGER IF EXISTS update_area_stats_updated_at ON area_stats;
CREATE TRIGGER update_area_stats_updated_at
  BEFORE UPDATE ON area_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to inquiries table
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON inquiries;
CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMIT;
`;

async function migrate() {
  const client = new Client({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
  });

  try {
    await client.connect();
    console.log('🔄 Running database migrations...');

    await client.query(migrationSQL);

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
