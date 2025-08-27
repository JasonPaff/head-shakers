import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { z } from 'zod';

import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { databaseMiddleware } from '@/lib/middleware/database.middleware';
import { sentryMiddleware } from '@/lib/middleware/sentry.middleware';

export interface ActionContext {
  clerkUserId: string;
  userId: string;
}

export interface ActionMetadata {
  actionName: string;
}

export interface ActionMiddleware<TContext, TMetadata> {
  ctx: TContext;
  metadata: TMetadata;
}

class ActionError extends Error {}

// base client with error handling and optional logging
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },
  handleServerError(e) {
    console.error('Action error:', e.message);

    if (e instanceof ActionError) {
      return e.message;
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(sentryMiddleware);

export const authActionClient = actionClient.use(authMiddleware).use(databaseMiddleware);
