import { Redis } from '@upstash/redis';

let redisClient: null | Redis = null;

/**
 * Get Redis client singleton instance
 * Creates a new instance on first call and reuses it for subsequent calls
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        'Redis configuration is missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.',
      );
    }

    redisClient = new Redis({
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
      url: process.env.UPSTASH_REDIS_REST_URL,
    });
  }

  return redisClient;
}

/**
 * Redis operations wrapper with error handling
 */
export class RedisOperations {
  private static client = getRedisClient();

  /**
   * Delete a key from Redis
   */
  static async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration on a key
   */
  static async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get a value from Redis
   * Note: Upstash client auto-deserializes JSON, so this may return objects or strings
   */
  static async get<T = string>(key: string): Promise<null | T> {
    try {
      const value = await this.client.get<T>(key);
      return value === null || value === undefined ? null : value;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get all fields and values in a hash
   */
  static async hgetall(key: string): Promise<null | Record<string, string>> {
    try {
      const result = await this.client.hgetall(key);
      return result && Object.keys(result).length > 0 ? (result as Record<string, string>) : null;
    } catch (error) {
      console.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Increment a hash field by a given amount
   */
  static async hincrby(key: string, field: string, increment: number): Promise<null | number> {
    try {
      const result = await this.client.hincrby(key, field, increment);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error(`Redis HINCRBY error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  /**
   * Set multiple fields in a hash
   */
  static async hset(key: string, values: Record<string, number | string>): Promise<boolean> {
    try {
      const result = await this.client.hset(key, values);
      return typeof result === 'number' && result >= 0;
    } catch (error) {
      console.error(`Redis HSET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment a value by 1
   */
  static async incr(key: string): Promise<null | number> {
    try {
      const result = await this.client.incr(key);
      return typeof result === 'number' ? result : null;
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set a value in Redis with optional TTL
   * Note: Upstash client auto-serializes, so you can pass objects or strings
   */
  static async set<T = string>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        const result = await this.client.set(key, value, { ex: ttlSeconds });
        return result === 'OK';
      }
      const result = await this.client.set(key, value);
      return result === 'OK';
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }
}
