import * as Sentry from '@sentry/nextjs';
import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata } from '@/lib/utils/next-safe-action';

import {
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_OPERATIONS,
  SENTRY_TAGS,
} from '@/lib/constants';

export const sentryMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, metadata, next }) => {
  return Sentry.withScope(async (scope) => {
    // set action context
    scope.setTag(SENTRY_TAGS.ACTION, metadata?.actionName || 'unknown');
    scope.setTag(SENTRY_TAGS.COMPONENT, SENTRY_OPERATIONS.SERVER_ACTION);
    scope.setContext(SENTRY_CONTEXTS.ACTION_METADATA, { ...metadata });

    // add input size for monitoring large payloads
    if (clientInput) {
      scope.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
        hasInput: true,
        inputSize: JSON.stringify(clientInput).length,
      });
    }

    return await Sentry.startSpan(
      {
        attributes: {
          'action.component': SENTRY_OPERATIONS.SERVER_ACTION,
          'action.name': metadata?.actionName || 'unknown',
        },
        name: `action_${metadata?.actionName || 'unknown'}`,
        op: SENTRY_OPERATIONS.SERVER_ACTION,
      },
      async (span) => {
        try {
          const result = await next();

          // mark span as successful
          span.setStatus({ code: 1, message: 'ok' });

          // log successful actions
          if (process.env.NODE_ENV === 'production') {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
              level: 'info',
              message: `Action ${metadata?.actionName} completed successfully`,
            });
          }

          return result;
        } catch (error) {
          // mark span as failed
          span.setStatus({ code: 2, message: 'internal_error' });
          span.recordException(error as Error);

          // capture the error with full context
          Sentry.captureException(error, {
            extra: {
              inputSize: clientInput ? JSON.stringify(clientInput).length : 0,
              metadata,
            },
            tags: {
              [SENTRY_TAGS.ACTION]: metadata?.actionName,
              [SENTRY_TAGS.COMPONENT]: SENTRY_OPERATIONS.SERVER_ACTION,
            },
          });

          throw error;
        }
      },
    );
  });
});
