import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { z } from 'zod';

import type { db } from '@/lib/db';

import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { databaseMiddleware } from '@/lib/middleware/database.middleware';
import { sanitizationMiddleware } from '@/lib/middleware/sanitization.middleware';
import { sentryMiddleware } from '@/lib/middleware/sentry.middleware';
import { transactionMiddleware } from '@/lib/middleware/transaction.middleware';

// final action context (for actions)
export type ActionContext = TransactionContext;

export interface ActionMetadata {
  actionName: string;
  isTransactionRequired?: boolean;
}

// base context from auth middleware
export interface AuthContext {
  clerkUserId: string;
  userId: string;
}

export type DatabaseExecutor = Parameters<Parameters<typeof db.transaction>[0]>[0] | typeof db;

// context after sanitization middleware
export interface SanitizedContext extends AuthContext {
  sanitizedInput: unknown;
}

// context after transaction middleware
export interface TransactionContext extends SanitizedContext {
  db: DatabaseExecutor;
  tx?: DatabaseExecutor;
}

class ActionError extends Error {}

// base client with error handling and optional logging
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      isTransactionRequired: z.boolean().optional().default(false),
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

export const authActionClient = actionClient
  .use(authMiddleware)
  .use(sanitizationMiddleware)
  .use(transactionMiddleware)
  .use(databaseMiddleware);
