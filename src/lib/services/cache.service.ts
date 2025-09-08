import { Redis } from '@upstash/redis';

interface CacheConfig {
  isCompress?: boolean;
  ttl?: number; // time to live in seconds
  version?: string;
}

interface CacheOptions extends CacheConfig {
  namespace?: string;
  tags?: string[];
}

class CacheService {
  private defaultTTL = 3600; // 1-hour default
  private isEnabled = false;
  private keyPrefix = 'hs:cache:';
  private redis: null | Redis = null;

  constructor() {
    try {
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        this.redis = new Redis({
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
          url: process.env.UPSTASH_REDIS_REST_URL,
        });
        this.isEnabled = true;
      } else {
        console.warn('Redis configuration missing, cache service disabled');
        this.isEnabled = false;
      }
    } catch (error) {
      console.warn('Failed to initialize Redis, cache service disabled:', error);
      this.isEnabled = false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      if (pattern) {
        const keys = await this.redis.keys(`${this.keyPrefix}${pattern}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } else {
        const keys = await this.redis.keys(`${this.keyPrefix}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  async del(key: string, namespace?: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, namespace);
      await this.redis.del(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async exists(key: string, namespace?: string): Promise<boolean> {
    if (!this.isEnabled || !this.redis) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists check error:', error);
      return false;
    }
  }

  async get<T = unknown>(key: string, options?: CacheOptions): Promise<null | T> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const result = await this.redis.get(fullKey);

      if (result === null) {
        return null;
      }

      // handle both direct values and wrapped values with metadata
      if (typeof result === 'object' && result !== null && 'data' in result) {
        return (result as { data: T }).data;
      }

      return result as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async getOrSet<T = unknown>(key: string, getter: () => Promise<T>, options?: CacheOptions): Promise<T> {
    if (!this.isEnabled) {
      // if the cache is disabled, always call the getter
      return await getter();
    }

    const cached = await this.get<T>(key, options);

    if (cached !== null) {
      return cached;
    }

    const data = await getter();
    await this.set(key, data, options);
    return data;
  }

  async increment(key: string, amount = 1, namespace?: string): Promise<number> {
    if (!this.isEnabled || !this.redis) {
      return 0;
    }

    try {
      const fullKey = this.buildKey(key, namespace);
      return await this.redis.incrby(fullKey, amount);
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const tagKey = this.buildTagKey(tag);
      const keys = await this.redis.smembers(tagKey);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        await this.redis.del(tagKey);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      await Promise.all(tags.map((tag) => this.invalidateByTag(tag)));
    } catch (error) {
      console.error('Cache batch invalidation error:', error);
    }
  }

  async mget<T = unknown>(keys: string[], namespace?: string): Promise<(null | T)[]> {
    if (!this.isEnabled || !this.redis) {
      return keys.map(() => null);
    }

    try {
      const fullKeys = keys.map((key) => this.buildKey(key, namespace));
      const results = await this.redis.mget(...fullKeys);
      return results.map((result) => (result === null ? null : (result as T)));
    } catch (error) {
      console.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  async set<T = unknown>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      const fullKey = this.buildKey(key, options?.namespace);
      const ttl = options?.ttl ?? this.defaultTTL;

      const wrappedValue = {
        data: value,
        tags: options?.tags ?? [],
        timestamp: Date.now(),
        version: options?.version ?? '1.0',
      };

      await this.redis.setex(fullKey, ttl, JSON.stringify(wrappedValue));

      // associate with tags for invalidation
      if (options?.tags?.length) {
        await this.addToTags(fullKey, options.tags);
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  private async addToTags(key: string, tags: string[]): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      await Promise.all(tags.map((tag) => this.redis!.sadd(this.buildTagKey(tag), key)));
    } catch (error) {
      console.error('Cache tag association error:', error);
    }
  }

  private buildKey(key: string, namespace?: string): string {
    const parts = [this.keyPrefix];
    if (namespace) parts.push(namespace);
    parts.push(key);
    return parts.join(':');
  }

  private buildTagKey(tag: string): string {
    return `${this.keyPrefix}tags:${tag}`;
  }
}

export const cacheService = new CacheService();
