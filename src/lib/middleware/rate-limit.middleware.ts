import { Redis } from '@upstash/redis/node';
import { createMiddleware } from 'next-safe-action';
import { headers } from 'next/headers';

import type { ActionContext, ActionMetadata, PublicContext } from '@/lib/utils/next-safe-action';

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

/**
 * Rate limiting middleware for public actions (no auth required).
 * Uses IP address for rate limiting instead of userId.
 */
export const createPublicRateLimitMiddleware = (
  requests: number,
  windowInSeconds: number,
  actionName: string,
) => {
  return createMiddleware<{
    ctx: PublicContext;
    metadata: ActionMetadata;
  }>().define(async ({ metadata, next }) => {
    // Get IP from headers (x-forwarded-for for proxied requests, x-real-ip as fallback)
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0]?.trim() ?? headersList.get('x-real-ip') ?? 'unknown';

    const key = REDIS_KEYS.RATE_LIMIT_IP(ip, actionName);
    const circuitBreaker = circuitBreakers.fast('redis-rate-limit');

    try {
      const current = await circuitBreaker.execute(async () => {
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
            maxAttempts: 2,
            operationName: 'redis-rate-limit-public',
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
            window: windowInSeconds,
          },
          false,
          429,
        );
      }

      return next();
    } catch (error) {
      // If it's already an ActionError (rate limit exceeded), re-throw it
      if (error instanceof ActionError) {
        throw error;
      }

      // If Redis is down, fail open for availability
      console.warn(
        `Rate limiting unavailable due to Redis failure: ${error instanceof Error ? error.message : String(error)}`,
      );

      return next();
    }
  });
};
