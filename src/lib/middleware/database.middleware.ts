import * as Sentry from '@sentry/nextjs';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata, ActionMiddleware } from '@/lib/utils/next-safe-action';

type DatabaseMiddleware = ActionMiddleware<NonNullable<unknown>, ActionMetadata>;

export const databaseMiddleware = createMiddleware<DatabaseMiddleware>().define(
  async ({ metadata, next }) => {
    return await Sentry.startSpan(
      {
        attributes: {
          'action.name': metadata?.actionName,
          'db.name': 'neon',
          'db.system': 'postgresql',
        },
        name: `db_${metadata?.actionName || 'unknown'}`,
        op: 'db.action',
      },
      async (span) => {
        // set database context
        Sentry.setContext('database', {
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
          Sentry.setContext('database_error', {
            operation: metadata?.actionName,
            provider: 'neon',
            timestamp: new Date().toISOString(),
          });

          throw error;
        }
      },
    );
  },
);
