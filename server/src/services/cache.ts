import Redis from 'ioredis';
import { config } from '../config.js';

export class RedisCache {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Redis connected');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis error:', error.message);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.warn('⚠️ Redis connection failed, running without cache');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;

    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) return;

    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error);
    }
  }

  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached) return cached;

    // Fetch fresh data
    const data = await fetcher();

    // Cache it
    await this.set(key, data, ttlSeconds);

    return data;
  }

  // Listing-specific cache keys
  static keys = {
    listing: (id: number) => `listing:${id}`,
    listings: (hash: string) => `listings:${hash}`,
    area: (city: string, name: string) => `area:${city}:${name}`,
    areaStats: (city: string) => `areas:${city}`,
    search: (hash: string) => `search:${hash}`,
    rentHistory: (area: string) => `rent_history:${area}`,
  };

  // Create a hash from search parameters for cache key
  static hashSearchParams(params: Record<string, unknown>): string {
    const sorted = Object.keys(params)
      .sort()
      .map((k) => `${k}:${JSON.stringify(params[k])}`)
      .join('|');
    return Buffer.from(sorted).toString('base64').substring(0, 32);
  }
}
