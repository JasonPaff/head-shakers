import * as Sentry from '@sentry/nextjs';
import { createMiddleware } from 'next-safe-action';

import type {
  ActionMetadata,
  PublicTransactionContext,
  TransactionContext,
} from '@/lib/utils/next-safe-action';

import {
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_OPERATIONS,
  SENTRY_TAGS,
} from '@/lib/constants';

/**
 * Database middleware for authenticated server actions.
 * Provides Sentry tracing, context isolation, and error tracking for database operations.
 * Uses Neon serverless PostgreSQL with Drizzle ORM.
 */
export const databaseMiddleware = createMiddleware<{
  ctx: TransactionContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  return Sentry.withScope(async (scope) => {
    // set database-specific tags for filtering
    scope.setTag(SENTRY_TAGS.ACTION, metadata?.actionName || 'unknown');
    scope.setTag(SENTRY_TAGS.COMPONENT, SENTRY_OPERATIONS.DATABASE_ACTION);

    // set database context
    scope.setContext(SENTRY_CONTEXTS.DATABASE, {
      action: metadata?.actionName,
      orm: 'drizzle',
      provider: 'neon',
    });

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
        try {
          const result = await next();

          // mark span as successful
          span.setStatus({ code: 1, message: 'ok' });

          // log successful database operations in production
          if (process.env.NODE_ENV === 'production') {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
              level: 'info',
              message: `Database operation ${metadata?.actionName} completed successfully`,
            });
          }

          return result;
        } catch (error) {
          // mark span as failed
          span.setStatus({ code: 2, message: 'internal_error' });
          span.recordException(error as Error);

          // add database-specific error context
          scope.setContext(SENTRY_CONTEXTS.DATABASE_ERROR, {
            operation: metadata?.actionName,
            provider: 'neon',
            timestamp: new Date().toISOString(),
          });

          // capture the error with full context
          Sentry.captureException(error, {
            extra: {
              metadata,
              provider: 'neon',
            },
            tags: {
              [SENTRY_TAGS.ACTION]: metadata?.actionName,
              [SENTRY_TAGS.COMPONENT]: SENTRY_OPERATIONS.DATABASE_ACTION,
            },
          });

          throw error;
        }
      },
    );
  });
});

/**
 * Database middleware for public (unauthenticated) server actions.
 * Provides Sentry tracing, context isolation, and error tracking for database operations.
 * Uses Neon serverless PostgreSQL with Drizzle ORM.
 */
export const publicDatabaseMiddleware = createMiddleware<{
  ctx: PublicTransactionContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  return Sentry.withScope(async (scope) => {
    // set database-specific tags for filtering
    scope.setTag(SENTRY_TAGS.ACTION, metadata?.actionName || 'unknown');
    scope.setTag(SENTRY_TAGS.COMPONENT, SENTRY_OPERATIONS.DATABASE_ACTION);

    // set database context for public actions
    scope.setContext(SENTRY_CONTEXTS.DATABASE, {
      action: metadata?.actionName,
      orm: 'drizzle',
      provider: 'neon',
      type: 'public',
    });

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
        try {
          const result = await next();

          // mark span as successful
          span.setStatus({ code: 1, message: 'ok' });

          // log successful database operations in production
          if (process.env.NODE_ENV === 'production') {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.DATABASE,
              level: 'info',
              message: `Public database operation ${metadata?.actionName} completed successfully`,
            });
          }

          return result;
        } catch (error) {
          // mark span as failed
          span.setStatus({ code: 2, message: 'internal_error' });
          span.recordException(error as Error);

          // add database-specific error context for public actions
          scope.setContext(SENTRY_CONTEXTS.DATABASE_ERROR, {
            operation: metadata?.actionName,
            provider: 'neon',
            timestamp: new Date().toISOString(),
            type: 'public',
          });

          // capture the error with full context
          Sentry.captureException(error, {
            extra: {
              metadata,
              provider: 'neon',
              type: 'public',
            },
            tags: {
              [SENTRY_TAGS.ACTION]: metadata?.actionName,
              [SENTRY_TAGS.COMPONENT]: SENTRY_OPERATIONS.DATABASE_ACTION,
            },
          });

          throw error;
        }
      },
    );
  });
});
