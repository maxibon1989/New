import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { eq, and, gte, lte, like, sql, desc, asc } from 'drizzle-orm';
import { RedisCache } from '../services/cache.js';
import { config } from '../config.js';

// Validation schemas
const listingQuerySchema = z.object({
  city: z.string().optional(),
  area: z.string().optional(),
  sqmMin: z.coerce.number().optional(),
  sqmMax: z.coerce.number().optional(),
  rentMin: z.coerce.number().optional(),
  rentMax: z.coerce.number().optional(),
  type: z.string().optional(),
  culture: z.string().optional(),
  priceLevel: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  amenities: z.string().optional(), // comma-separated
  limit: z.coerce.number().default(20),
  offset: z.coerce.number().default(0),
  sortBy: z.enum(['rent_asc', 'rent_desc', 'sqm_asc', 'sqm_desc', 'newest']).default('newest'),
});

const listingIdSchema = z.object({
  id: z.coerce.number(),
});

export async function listingsRoutes(fastify: FastifyInstance) {
  const cache = (fastify as any).cache as RedisCache;

  /**
   * GET /api/listings
   * List all offices with filtering and pagination
   */
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listingQuerySchema.parse(request.query);

    // Build cache key
    const cacheKey = RedisCache.keys.listings(RedisCache.hashSearchParams(query));
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    // Build dynamic query
    const conditions = [eq(schema.offices.available, true)];

    if (query.city) {
      conditions.push(eq(schema.offices.city, query.city));
    }
    if (query.area) {
      conditions.push(eq(schema.offices.area, query.area));
    }
    if (query.sqmMin) {
      conditions.push(gte(schema.offices.sqm, query.sqmMin));
    }
    if (query.sqmMax) {
      conditions.push(lte(schema.offices.sqm, query.sqmMax));
    }
    if (query.rentMin) {
      conditions.push(gte(schema.offices.estimatedRent, query.rentMin));
    }
    if (query.rentMax) {
      conditions.push(lte(schema.offices.estimatedRent, query.rentMax));
    }
    if (query.type) {
      conditions.push(eq(schema.offices.type, query.type));
    }
    if (query.culture) {
      conditions.push(eq(schema.offices.culture, query.culture));
    }
    if (query.priceLevel) {
      conditions.push(eq(schema.offices.priceLevel, query.priceLevel));
    }
    if (query.verified !== undefined) {
      conditions.push(eq(schema.offices.verified, query.verified));
    }

    // Determine sort order
    let orderBy;
    switch (query.sortBy) {
      case 'rent_asc':
        orderBy = asc(schema.offices.estimatedRent);
        break;
      case 'rent_desc':
        orderBy = desc(schema.offices.estimatedRent);
        break;
      case 'sqm_asc':
        orderBy = asc(schema.offices.sqm);
        break;
      case 'sqm_desc':
        orderBy = desc(schema.offices.sqm);
        break;
      default:
        orderBy = desc(schema.offices.createdAt);
    }

    // Execute query
    const [listings, countResult] = await Promise.all([
      db
        .select()
        .from(schema.offices)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(query.limit)
        .offset(query.offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.offices)
        .where(and(...conditions)),
    ]);

    // Filter by amenities in application (JSON containment)
    let filteredListings = listings;
    if (query.amenities) {
      const requiredAmenities = query.amenities.split(',');
      filteredListings = listings.filter((listing) => {
        const officeAmenities = listing.amenities as string[];
        return requiredAmenities.every((a) => officeAmenities.includes(a));
      });
    }

    const result = {
      data: filteredListings,
      pagination: {
        total: Number(countResult[0]?.count || 0),
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + query.limit < Number(countResult[0]?.count || 0),
      },
    };

    // Cache result
    await cache?.set(cacheKey, result, config.cacheTTL.listings);

    return result;
  });

  /**
   * GET /api/listings/:id
   * Get a single office by ID
   */
  fastify.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = listingIdSchema.parse(request.params);

    // Check cache
    const cacheKey = RedisCache.keys.listing(id);
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    const listing = await db
      .select()
      .from(schema.offices)
      .where(eq(schema.offices.id, id))
      .limit(1);

    if (listing.length === 0) {
      reply.code(404);
      return { error: 'Listing not found' };
    }

    // Get nearby listings for "similar properties"
    const nearby = await db
      .select()
      .from(schema.offices)
      .where(
        and(
          eq(schema.offices.area, listing[0].area),
          eq(schema.offices.available, true),
          sql`${schema.offices.id} != ${id}`
        )
      )
      .limit(4);

    const result = {
      data: listing[0],
      similar: nearby,
    };

    await cache?.set(cacheKey, result, config.cacheTTL.listings);

    return result;
  });

  /**
   * GET /api/listings/map
   * Get listings optimized for map display (minimal data)
   */
  fastify.get('/map', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = listingQuerySchema.parse(request.query);

    const conditions = [eq(schema.offices.available, true)];

    if (query.city) {
      conditions.push(eq(schema.offices.city, query.city));
    }

    const listings = await db
      .select({
        id: schema.offices.id,
        lat: schema.offices.lat,
        lng: schema.offices.lng,
        address: schema.offices.address,
        sqm: schema.offices.sqm,
        estimatedRent: schema.offices.estimatedRent,
        type: schema.offices.type,
        verified: schema.offices.verified,
      })
      .from(schema.offices)
      .where(and(...conditions))
      .limit(500); // Map performance limit

    return {
      data: listings,
      count: listings.length,
    };
  });

  /**
   * GET /api/listings/cities
   * Get list of available cities
   */
  fastify.get('/cities', async () => {
    const cities = await db
      .selectDistinct({ city: schema.offices.city })
      .from(schema.offices)
      .where(eq(schema.offices.available, true));

    return cities.map((c) => c.city);
  });
}
