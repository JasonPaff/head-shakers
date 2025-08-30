import * as Sentry from '@sentry/nextjs';
import { createMiddleware } from 'next-safe-action';

import type {
  ActionMetadata,
  PublicTransactionContext,
  TransactionContext,
} from '@/lib/utils/next-safe-action';

import { SENTRY_CONTEXTS, SENTRY_OPERATIONS } from '@/lib/constants';

export const databaseMiddleware = createMiddleware<{
  ctx: TransactionContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  return await Sentry.startSpan(
    {
      attributes: {
        'action.name': metadata?.actionName,
        'db.name': 'neon',
        'db.system': 'postgresql',
      },
      name: `db_${metadata?.actionName || 'unknown'}`,
      op: SENTRY_OPERATIONS.DATABASE_ACTION,
    },
    async (span) => {
      // set database context
      Sentry.setContext(SENTRY_CONTEXTS.DATABASE, {
        action: metadata?.actionName,
        orm: 'drizzle',
        provider: 'neon',
      });

      try {
        const result = await next();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: 'internal_error' });
        span.recordException(error as Error);

        // add database-specific error context
        Sentry.setContext(SENTRY_CONTEXTS.DATABASE_ERROR, {
          operation: metadata?.actionName,
          provider: 'neon',
          timestamp: new Date().toISOString(),
        });

        throw error;
      }
    },
  );
});

export const publicDatabaseMiddleware = createMiddleware<{
  ctx: PublicTransactionContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  return await Sentry.startSpan(
    {
      attributes: {
        'action.name': metadata?.actionName,
        'action.type': 'public',
        'db.name': 'neon',
        'db.system': 'postgresql',
      },
      name: `db_public_${metadata?.actionName || 'unknown'}`,
      op: SENTRY_OPERATIONS.DATABASE_ACTION,
    },
    async (span) => {
      // set database context for public actions
      Sentry.setContext(SENTRY_CONTEXTS.DATABASE, {
        action: metadata?.actionName,
        orm: 'drizzle',
        provider: 'neon',
        type: 'public',
      });

      try {
        const result = await next();
        span.setStatus({ code: 1, message: 'ok' });
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: 'internal_error' });
        span.recordException(error as Error);

        // add database-specific error context for public actions
        Sentry.setContext(SENTRY_CONTEXTS.DATABASE_ERROR, {
          operation: metadata?.actionName,
          provider: 'neon',
          timestamp: new Date().toISOString(),
          type: 'public',
        });

        throw error;
      }
    },
  );
});
