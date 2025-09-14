import { Redis } from '@upstash/redis/node';
import { createMiddleware } from 'next-safe-action';

import type { ActionContext, ActionMetadata } from '@/lib/utils/next-safe-action';

import { REDIS_KEYS } from '@/lib/constants';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { withServiceRetry } from '@/lib/utils/retry';

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
      keyGenerator ? keyGenerator(ctx) : REDIS_KEYS.RATE_LIMIT_ACTION(ctx.userId, metadata.actionName);

    const circuitBreaker = circuitBreakers.fast('redis-rate-limit');

    try {
      const current = await circuitBreaker.execute(async () => {
        // Redis operations with retry logic
        const retryResult = await withServiceRetry(
          async () => {
            const count = await redis.incr(key);

            if (count === 1) {
              await redis.expire(key, windowInSeconds);
            }

            return count;
          },
          'redis',
          {
            backoffMs: 50,
            maxAttempts: 2, // Quick retry for rate limiting
            operationName: 'redis-rate-limit',
          },
        );

        return retryResult.result;
      });

      if (current.result > requests) {
        throw new ActionError(
          ErrorType.RATE_LIMIT,
          'RATE_LIMIT_EXCEEDED',
          `Rate limit exceeded. Max ${requests} requests per ${windowInSeconds} seconds.`,
          {
            currentCount: current.result,
            limit: requests,
            operation: metadata.actionName,
            userId: ctx.userId,
            window: windowInSeconds,
          },
          false,
          429,
        );
      }

      return next();
    } catch (error) {
      // If Redis is down, we should fail open for rate limiting to maintain availability
      // Log the error but allow the request to proceed
      console.warn(
        `Rate limiting unavailable due to Redis failure: ${error instanceof Error ? error.message : String(error)}`,
      );

      // In production, you might want to use in-memory fallback or fail closed
      return next();
    }
  });
};
