import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  json,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Offices/Listings table
export const offices = pgTable('offices', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id', { length: 255 }).unique(),

  // Location
  address: varchar('address', { length: 500 }).notNull(),
  area: varchar('area', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  lat: decimal('lat', { precision: 10, scale: 8 }).notNull(),
  lng: decimal('lng', { precision: 11, scale: 8 }).notNull(),

  // Property details
  sqm: integer('sqm').notNull(),
  rooms: integer('rooms'),
  floor: integer('floor'),
  buildingYear: integer('building_year'),

  // Rent information
  officialRent: integer('official_rent'),           // From source (often null)
  estimatedRent: integer('estimated_rent').notNull(), // Our calculated estimate
  rentMin: integer('rent_min'),
  rentMax: integer('rent_max'),
  rentPerSqm: decimal('rent_per_sqm', { precision: 10, scale: 2 }),

  // Classification
  type: varchar('type', { length: 50 }).default('office'), // office, retail, warehouse, flex
  culture: varchar('culture', { length: 50 }),              // modern, traditional, industrial, flexible
  priceLevel: varchar('price_level', { length: 50 }),       // budget, standard, premium

  // Features
  amenities: json('amenities').$type<string[]>().default([]),
  images: json('images').$type<string[]>().default([]),
  description: text('description'),

  // Status & Quality
  verified: boolean('verified').default(false),
  verifiedAt: timestamp('verified_at'),
  available: boolean('available').default(true),
  newlyRenovated: boolean('newly_renovated').default(false),
  flexibleContract: boolean('flexible_contract').default(false),

  // Insights
  metroDistance: integer('metro_distance'),      // minutes
  restaurantRating: decimal('restaurant_rating', { precision: 2, scale: 1 }),
  greenSpaceRating: decimal('green_space_rating', { precision: 2, scale: 1 }),
  nearbyCompanies: json('nearby_companies').$type<string[]>().default([]),

  // Owner/Source
  owner: varchar('owner', { length: 255 }),
  source: varchar('source', { length: 100 }),     // vasakronan, castellum, humlegården, etc.
  sourceUrl: text('source_url'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastScrapedAt: timestamp('last_scraped_at'),
}, (table) => ({
  cityIdx: index('offices_city_idx').on(table.city),
  areaIdx: index('offices_area_idx').on(table.area),
  sqmIdx: index('offices_sqm_idx').on(table.sqm),
  rentIdx: index('offices_estimated_rent_idx').on(table.estimatedRent),
  locationIdx: index('offices_location_idx').on(table.lat, table.lng),
  availableIdx: index('offices_available_idx').on(table.available),
}));

// Area statistics table
export const areaStats = pgTable('area_stats', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),

  // Statistics
  avgRentPerSqm: decimal('avg_rent_per_sqm', { precision: 10, scale: 2 }).notNull(),
  medianRentPerSqm: decimal('median_rent_per_sqm', { precision: 10, scale: 2 }),
  minRentPerSqm: decimal('min_rent_per_sqm', { precision: 10, scale: 2 }),
  maxRentPerSqm: decimal('max_rent_per_sqm', { precision: 10, scale: 2 }),

  // Trends
  yearChange: decimal('year_change', { precision: 5, scale: 2 }),   // percentage
  monthChange: decimal('month_change', { precision: 5, scale: 2 }),
  trend: varchar('trend', { length: 20 }),  // up, down, stable

  // Counts
  totalListings: integer('total_listings').default(0),
  activeListings: integer('active_listings').default(0),

  // Location
  lat: decimal('lat', { precision: 10, scale: 8 }),
  lng: decimal('lng', { precision: 11, scale: 8 }),

  // Timestamps
  calculatedAt: timestamp('calculated_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  cityAreaIdx: uniqueIndex('area_stats_city_area_idx').on(table.city, table.name),
}));

// Rent history for trend analysis
export const rentHistory = pgTable('rent_history', {
  id: serial('id').primaryKey(),
  areaName: varchar('area_name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }).notNull(),

  // Data point
  month: varchar('month', { length: 20 }).notNull(),  // 'Jan 2024'
  year: integer('year').notNull(),
  monthNum: integer('month_num').notNull(),           // 1-12
  avgRentPerSqm: decimal('avg_rent_per_sqm', { precision: 10, scale: 2 }).notNull(),

  // Additional metrics
  listingsCount: integer('listings_count'),
  medianRent: decimal('median_rent', { precision: 10, scale: 2 }),

  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  areaMonthIdx: uniqueIndex('rent_history_area_month_idx').on(table.areaName, table.city, table.year, table.monthNum),
}));

// Scraping jobs tracking
export const scrapingJobs = pgTable('scraping_jobs', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),  // pending, running, completed, failed

  // Results
  listingsFound: integer('listings_found').default(0),
  listingsNew: integer('listings_new').default(0),
  listingsUpdated: integer('listings_updated').default(0),

  // Timing
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),

  // Error handling
  errorMessage: text('error_message'),

  createdAt: timestamp('created_at').defaultNow(),
});

// User saved searches
export const savedSearches = pgTable('saved_searches', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),

  // Search criteria
  query: text('query'),
  filters: json('filters').$type<Record<string, unknown>>(),

  // Notification preferences
  emailNotify: boolean('email_notify').default(false),
  email: varchar('email', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow(),
});

// Property inquiries/leads
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  officeId: integer('office_id').references(() => offices.id),

  // Contact info
  companyName: varchar('company_name', { length: 255 }).notNull(),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),

  // Inquiry details
  message: text('message'),
  employeeCount: integer('employee_count'),
  desiredMoveIn: varchar('desired_move_in', { length: 50 }),

  // Status
  status: varchar('status', { length: 50 }).default('new'),  // new, contacted, qualified, closed

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Types export
export type Office = typeof offices.$inferSelect;
export type NewOffice = typeof offices.$inferInsert;
export type AreaStat = typeof areaStats.$inferSelect;
export type RentHistoryPoint = typeof rentHistory.$inferSelect;
