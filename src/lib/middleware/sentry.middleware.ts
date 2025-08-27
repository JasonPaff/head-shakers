import * as Sentry from '@sentry/nextjs';
import { createMiddleware } from 'next-safe-action';

import type { ActionMiddleware } from '@/lib/utils/next-safe-action';

export const sentryMiddleware = createMiddleware<ActionMiddleware>().define(
  async ({ clientInput, metadata, next }) => {
    return Sentry.withScope(async (scope) => {
      // set action context
      scope.setTag('action', metadata?.actionName || 'unknown');
      scope.setTag('component', 'server_action');
      scope.setContext('action_metadata', { ...metadata });

      // add input size for monitoring large payloads
      if (clientInput) {
        scope.setContext('input_info', {
          hasInput: true,
          inputSize: JSON.stringify(clientInput).length,
        });
      }

      return await Sentry.startSpan(
        {
          attributes: {
            'action.component': 'server_action',
            'action.name': metadata?.actionName || 'unknown',
          },
          name: `action_${metadata?.actionName || 'unknown'}`,
          op: 'server_action',
        },
        async (span) => {
          try {
            const result = await next();

            // mark span as successful
            span.setStatus({ code: 1, message: 'ok' });

            // log successful actions
            if (process.env.NODE_ENV === 'production') {
              Sentry.addBreadcrumb({
                category: 'action',
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
                action: metadata?.actionName,
                component: 'server_action',
              },
            });

            throw error;
          }
        },
      );
    });
  },
);
