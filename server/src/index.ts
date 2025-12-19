import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { listingsRoutes } from './routes/listings.js';
import { areasRoutes } from './routes/areas.js';
import { searchRoutes } from './routes/search.js';
import { analyticsRoutes } from './routes/analytics.js';
import { RedisCache } from './services/cache.js';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    transport: config.nodeEnv === 'development'
      ? { target: 'pino-pretty' }
      : undefined,
  },
});

async function start() {
  // Register plugins
  await fastify.register(cors, {
    origin: config.nodeEnv === 'development'
      ? ['http://localhost:3000']
      : ['https://officeoracle.se'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Initialize Redis cache
  const cache = new RedisCache();
  fastify.decorate('cache', cache);

  // Register routes
  await fastify.register(listingsRoutes, { prefix: '/api/listings' });
  await fastify.register(areasRoutes, { prefix: '/api/areas' });
  await fastify.register(searchRoutes, { prefix: '/api/search' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Start server
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Office Oracle API running on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});
