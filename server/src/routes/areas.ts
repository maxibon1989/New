import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { RedisCache } from '../services/cache.js';
import { config } from '../config.js';

const areaQuerySchema = z.object({
  city: z.string().optional(),
});

const areaParamsSchema = z.object({
  city: z.string(),
  name: z.string(),
});

export async function areasRoutes(fastify: FastifyInstance) {
  const cache = (fastify as any).cache as RedisCache;

  /**
   * GET /api/areas
   * Get all area statistics
   */
  fastify.get('/', async (request: FastifyRequest) => {
    const query = areaQuerySchema.parse(request.query);

    const cacheKey = `areas:all:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    let areas;
    if (query.city) {
      areas = await db
        .select()
        .from(schema.areaStats)
        .where(eq(schema.areaStats.city, query.city))
        .orderBy(desc(schema.areaStats.avgRentPerSqm));
    } else {
      areas = await db
        .select()
        .from(schema.areaStats)
        .orderBy(desc(schema.areaStats.avgRentPerSqm));
    }

    await cache?.set(cacheKey, areas, config.cacheTTL.areas);

    return areas;
  });

  /**
   * GET /api/areas/:city/:name
   * Get detailed stats for a specific area
   */
  fastify.get('/:city/:name', async (request: FastifyRequest, reply: FastifyReply) => {
    const params = areaParamsSchema.parse(request.params);

    const cacheKey = RedisCache.keys.area(params.city, params.name);
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    // Get area stats
    const areaResult = await db
      .select()
      .from(schema.areaStats)
      .where(
        eq(schema.areaStats.city, params.city) &&
        eq(schema.areaStats.name, params.name)
      )
      .limit(1);

    if (areaResult.length === 0) {
      reply.code(404);
      return { error: 'Area not found' };
    }

    // Get rent history
    const history = await db
      .select()
      .from(schema.rentHistory)
      .where(
        eq(schema.rentHistory.city, params.city) &&
        eq(schema.rentHistory.areaName, params.name)
      )
      .orderBy(schema.rentHistory.year, schema.rentHistory.monthNum);

    const result = {
      area: areaResult[0],
      rentHistory: history,
    };

    await cache?.set(cacheKey, result, config.cacheTTL.areas);

    return result;
  });

  /**
   * GET /api/areas/trending
   * Get top trending areas (highest year-over-year change)
   */
  fastify.get('/trending', async (request: FastifyRequest) => {
    const query = areaQuerySchema.parse(request.query);

    const cacheKey = `areas:trending:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    let areas;
    if (query.city) {
      areas = await db
        .select()
        .from(schema.areaStats)
        .where(eq(schema.areaStats.city, query.city))
        .orderBy(desc(schema.areaStats.yearChange))
        .limit(10);
    } else {
      areas = await db
        .select()
        .from(schema.areaStats)
        .orderBy(desc(schema.areaStats.yearChange))
        .limit(10);
    }

    await cache?.set(cacheKey, areas, config.cacheTTL.areas);

    return areas;
  });

  /**
   * GET /api/areas/affordable
   * Get most affordable areas
   */
  fastify.get('/affordable', async (request: FastifyRequest) => {
    const query = areaQuerySchema.parse(request.query);

    const cacheKey = `areas:affordable:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    let areas;
    if (query.city) {
      areas = await db
        .select()
        .from(schema.areaStats)
        .where(eq(schema.areaStats.city, query.city))
        .orderBy(schema.areaStats.avgRentPerSqm)
        .limit(10);
    } else {
      areas = await db
        .select()
        .from(schema.areaStats)
        .orderBy(schema.areaStats.avgRentPerSqm)
        .limit(10);
    }

    await cache?.set(cacheKey, areas, config.cacheTTL.areas);

    return areas;
  });
}
