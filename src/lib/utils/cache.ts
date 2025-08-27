import { Redis } from '@upstash/redis';

class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      url: process.env.UPSTASH_REDIS_REST_URL!,
    });
  }

  async get<T>(key: string): Promise<null | T> {
    try {
      const value = await this.redis.get(key);
      return value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await fetcher();
    await this.set(key, value, ttl);
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.redis.setex(key, ttl, JSON.stringify(value));
      } else {
        await this.redis.set(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
}

export const cache = new CacheManager();