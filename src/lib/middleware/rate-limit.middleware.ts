import { Redis } from '@upstash/redis/node';
import { createMiddleware } from 'next-safe-action';

import type { ActionContext, ActionMetadata } from '@/lib/utils/next-safe-action';

import { REDIS_KEYS } from '@/lib/constants';
import { AppError } from '@/lib/utils/errors';

const redis = new Redis({
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  url: process.env.UPSTASH_REDIS_REST_URL,
});

export const createRateLimitMiddleware = (
  requests: number,
  windowInSeconds: number,
  keyGenerator?: (ctx: ActionContext) => string,
) => {
  return createMiddleware<{
    ctx: ActionContext;
    metadata: ActionMetadata;
  }>().define(async ({ ctx, metadata, next }) => {
    const key =
      keyGenerator ?
        keyGenerator(ctx)
      : REDIS_KEYS.RATE_LIMIT_ACTION(ctx.userId, metadata?.actionName || 'unknown');

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowInSeconds);
    }

    if (current > requests) {
      throw new AppError(
        `Rate limit exceeded. Max ${requests} requests per ${windowInSeconds} seconds.`,
        'RATE_LIMIT_EXCEEDED',
        429,
      );
    }

    return next();
  });
};
