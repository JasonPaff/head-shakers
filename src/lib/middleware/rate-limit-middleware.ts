import { Redis } from '@upstash/redis/node';
import { createMiddleware } from 'next-safe-action';

import type { ActionMiddleware } from '@/lib/utils/next-safe-action';

const redis = new Redis({
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  url: process.env.UPSTASH_REDIS_REST_URL,
});

export const rateLimitMiddleware = createMiddleware<ActionMiddleware>().define(async ({ ctx, next }) => {
  const userId = ctx?.userId;
  if (!userId) return next();

  const key = `rate_limit:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, 60); // 1 minute
  }

  // 10 requests per minute
  if (current > 10) {
    throw new Error('Rate limit exceeded');
  }

  return next();
});
