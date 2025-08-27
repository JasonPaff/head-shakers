import { Redis } from '@upstash/redis/node';
import { createMiddleware } from 'next-safe-action';

import type { ActionContext, ActionMetadata, ActionMiddleware } from '@/lib/utils/next-safe-action';

const redis = new Redis({
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  url: process.env.UPSTASH_REDIS_REST_URL,
});

type RateLimitMiddleware = ActionMiddleware<ActionContext, ActionMetadata>;

export const rateLimitMiddleware = createMiddleware<RateLimitMiddleware>().define(async ({ ctx, next }) => {
  const userId = ctx?.userId;
  if (!userId) return next();

  const key = `rate_limit:${userId}`;
  const userRequestCount = await redis.incr(key);

  if (userRequestCount === 1) {
    await redis.expire(key, 60); // 1 minute
  }

  // 10 requests per minute
  if (userRequestCount > 10) {
    throw new Error('Rate limit exceeded');
  }

  return next();
});
