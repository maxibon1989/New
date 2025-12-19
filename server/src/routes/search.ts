import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { eq, and, or, gte, lte, like, sql, desc } from 'drizzle-orm';
import { RedisCache } from '../services/cache.js';
import { config } from '../config.js';

const searchQuerySchema = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().default(20),
  offset: z.coerce.number().default(0),
});

const autocompleteSchema = z.object({
  q: z.string().min(2),
});

export async function searchRoutes(fastify: FastifyInstance) {
  const cache = (fastify as any).cache as RedisCache;

  /**
   * GET /api/search
   * Full-text search across listings
   */
  fastify.get('/', async (request: FastifyRequest) => {
    const query = searchQuerySchema.parse(request.query);
    const searchTerm = query.q.toLowerCase();

    const cacheKey = RedisCache.keys.search(RedisCache.hashSearchParams(query));
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    // Search in multiple fields
    const listings = await db
      .select()
      .from(schema.offices)
      .where(
        and(
          eq(schema.offices.available, true),
          or(
            like(schema.offices.address, `%${searchTerm}%`),
            like(schema.offices.area, `%${searchTerm}%`),
            like(schema.offices.city, `%${searchTerm}%`),
            like(schema.offices.owner, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(desc(schema.offices.verified), desc(schema.offices.createdAt))
      .limit(query.limit)
      .offset(query.offset);

    // Also search areas
    const areas = await db
      .select()
      .from(schema.areaStats)
      .where(
        or(
          like(schema.areaStats.name, `%${searchTerm}%`),
          like(schema.areaStats.city, `%${searchTerm}%`)
        )
      )
      .limit(5);

    const result = {
      listings: {
        data: listings,
        count: listings.length,
      },
      areas: {
        data: areas,
        count: areas.length,
      },
      query: query.q,
    };

    await cache?.set(cacheKey, result, config.cacheTTL.search);

    return result;
  });

  /**
   * GET /api/search/autocomplete
   * Fast autocomplete suggestions
   */
  fastify.get('/autocomplete', async (request: FastifyRequest) => {
    const query = autocompleteSchema.parse(request.query);
    const searchTerm = query.q.toLowerCase();

    const cacheKey = `autocomplete:${searchTerm}`;
    const cached = await cache?.get<string[]>(cacheKey);
    if (cached) return { suggestions: cached };

    // Get unique addresses, areas, and cities matching the query
    const [addresses, areas, cities] = await Promise.all([
      db
        .selectDistinct({ value: schema.offices.address })
        .from(schema.offices)
        .where(like(schema.offices.address, `%${searchTerm}%`))
        .limit(5),
      db
        .selectDistinct({ value: schema.offices.area })
        .from(schema.offices)
        .where(like(schema.offices.area, `%${searchTerm}%`))
        .limit(5),
      db
        .selectDistinct({ value: schema.offices.city })
        .from(schema.offices)
        .where(like(schema.offices.city, `%${searchTerm}%`))
        .limit(3),
    ]);

    const suggestions = [
      ...cities.map((c) => ({ type: 'city', value: c.value })),
      ...areas.map((a) => ({ type: 'area', value: a.value })),
      ...addresses.map((a) => ({ type: 'address', value: a.value })),
    ];

    await cache?.set(cacheKey, suggestions, 600); // 10 min cache

    return { suggestions };
  });

  /**
   * GET /api/search/nearby
   * Find listings near a coordinate
   */
  fastify.get('/nearby', async (request: FastifyRequest) => {
    const query = z.object({
      lat: z.coerce.number(),
      lng: z.coerce.number(),
      radius: z.coerce.number().default(2), // km
      limit: z.coerce.number().default(10),
    }).parse(request.query);

    // Haversine formula approximation for nearby search
    // 1 degree latitude ≈ 111 km
    const latDelta = query.radius / 111;
    const lngDelta = query.radius / (111 * Math.cos(query.lat * Math.PI / 180));

    const listings = await db
      .select()
      .from(schema.offices)
      .where(
        and(
          eq(schema.offices.available, true),
          gte(schema.offices.lat, String(query.lat - latDelta)),
          lte(schema.offices.lat, String(query.lat + latDelta)),
          gte(schema.offices.lng, String(query.lng - lngDelta)),
          lte(schema.offices.lng, String(query.lng + lngDelta))
        )
      )
      .limit(query.limit);

    // Calculate actual distance and sort
    const withDistance = listings.map((l) => ({
      ...l,
      distance: calculateDistance(
        query.lat,
        query.lng,
        parseFloat(String(l.lat)),
        parseFloat(String(l.lng))
      ),
    })).sort((a, b) => a.distance - b.distance);

    return {
      data: withDistance,
      center: { lat: query.lat, lng: query.lng },
      radius: query.radius,
    };
  });
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
