import { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { db, schema } from '../db/index.js';
import { eq, and, sql, desc, avg, count, min, max } from 'drizzle-orm';
import { RedisCache } from '../services/cache.js';
import { config } from '../config.js';

const cityQuerySchema = z.object({
  city: z.string().optional(),
});

export async function analyticsRoutes(fastify: FastifyInstance) {
  const cache = (fastify as any).cache as RedisCache;

  /**
   * GET /api/analytics/overview
   * Get platform-wide statistics
   */
  fastify.get('/overview', async (request: FastifyRequest) => {
    const query = cityQuerySchema.parse(request.query);

    const cacheKey = `analytics:overview:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    const conditions = [eq(schema.offices.available, true)];
    if (query.city) {
      conditions.push(eq(schema.offices.city, query.city));
    }

    const stats = await db
      .select({
        totalListings: count(),
        avgRent: avg(schema.offices.estimatedRent),
        avgSqm: avg(schema.offices.sqm),
        avgRentPerSqm: avg(schema.offices.rentPerSqm),
        minRent: min(schema.offices.estimatedRent),
        maxRent: max(schema.offices.estimatedRent),
        verifiedCount: sql<number>`SUM(CASE WHEN ${schema.offices.verified} THEN 1 ELSE 0 END)`,
      })
      .from(schema.offices)
      .where(and(...conditions));

    // Get listings by type
    const byType = await db
      .select({
        type: schema.offices.type,
        count: count(),
      })
      .from(schema.offices)
      .where(and(...conditions))
      .groupBy(schema.offices.type);

    // Get listings by price level
    const byPriceLevel = await db
      .select({
        priceLevel: schema.offices.priceLevel,
        count: count(),
      })
      .from(schema.offices)
      .where(and(...conditions))
      .groupBy(schema.offices.priceLevel);

    const result = {
      summary: stats[0],
      byType,
      byPriceLevel,
      generatedAt: new Date().toISOString(),
    };

    await cache?.set(cacheKey, result, config.cacheTTL.analytics);

    return result;
  });

  /**
   * GET /api/analytics/rent-index
   * Get comprehensive rent index data
   */
  fastify.get('/rent-index', async (request: FastifyRequest) => {
    const query = cityQuerySchema.parse(request.query);

    const cacheKey = `analytics:rent-index:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    // Get all area stats
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

    // Get rent history for each area
    const areasWithHistory = await Promise.all(
      areas.map(async (area) => {
        const history = await db
          .select()
          .from(schema.rentHistory)
          .where(
            and(
              eq(schema.rentHistory.areaName, area.name),
              eq(schema.rentHistory.city, area.city)
            )
          )
          .orderBy(schema.rentHistory.year, schema.rentHistory.monthNum);

        return {
          ...area,
          history,
        };
      })
    );

    // Calculate overall market stats
    const marketStats = {
      totalAreas: areas.length,
      avgRentAcrossAreas: areas.reduce((sum, a) => sum + parseFloat(String(a.avgRentPerSqm)), 0) / areas.length,
      areasRising: areas.filter((a) => a.trend === 'up').length,
      areasFalling: areas.filter((a) => a.trend === 'down').length,
      areasStable: areas.filter((a) => a.trend === 'stable').length,
    };

    const result = {
      areas: areasWithHistory,
      marketStats,
      generatedAt: new Date().toISOString(),
    };

    await cache?.set(cacheKey, result, config.cacheTTL.analytics);

    return result;
  });

  /**
   * GET /api/analytics/price-distribution
   * Get price distribution data for charts
   */
  fastify.get('/price-distribution', async (request: FastifyRequest) => {
    const query = cityQuerySchema.parse(request.query);

    const cacheKey = `analytics:price-dist:${query.city || 'all'}`;
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    const conditions = [eq(schema.offices.available, true)];
    if (query.city) {
      conditions.push(eq(schema.offices.city, query.city));
    }

    // Get all rent values for distribution
    const rents = await db
      .select({
        rentPerSqm: schema.offices.rentPerSqm,
        sqm: schema.offices.sqm,
      })
      .from(schema.offices)
      .where(and(...conditions));

    // Create price buckets
    const buckets = [
      { min: 0, max: 150, label: '< 150 kr' },
      { min: 150, max: 200, label: '150-200 kr' },
      { min: 200, max: 250, label: '200-250 kr' },
      { min: 250, max: 300, label: '250-300 kr' },
      { min: 300, max: 350, label: '300-350 kr' },
      { min: 350, max: Infinity, label: '> 350 kr' },
    ];

    const distribution = buckets.map((bucket) => ({
      ...bucket,
      count: rents.filter((r) => {
        const rent = parseFloat(String(r.rentPerSqm));
        return rent >= bucket.min && rent < bucket.max;
      }).length,
    }));

    const result = {
      distribution,
      totalListings: rents.length,
      generatedAt: new Date().toISOString(),
    };

    await cache?.set(cacheKey, result, config.cacheTTL.analytics);

    return result;
  });

  /**
   * GET /api/analytics/sources
   * Get listings count by source (for scraping insights)
   */
  fastify.get('/sources', async () => {
    const cacheKey = 'analytics:sources';
    const cached = await cache?.get(cacheKey);
    if (cached) return cached;

    const sources = await db
      .select({
        source: schema.offices.source,
        count: count(),
        verified: sql<number>`SUM(CASE WHEN ${schema.offices.verified} THEN 1 ELSE 0 END)`,
      })
      .from(schema.offices)
      .where(eq(schema.offices.available, true))
      .groupBy(schema.offices.source);

    await cache?.set(cacheKey, sources, config.cacheTTL.analytics);

    return sources;
  });
}
