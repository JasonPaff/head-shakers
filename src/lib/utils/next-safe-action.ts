import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from 'next-safe-action';
import { z } from 'zod';

import type { db } from '@/lib/db';

import { authMiddleware } from '@/lib/middleware/auth.middleware';
import { databaseMiddleware, publicDatabaseMiddleware } from '@/lib/middleware/database.middleware';
import {
  publicSanitizationMiddleware,
  sanitizationMiddleware,
} from '@/lib/middleware/sanitization.middleware';
import { sentryMiddleware } from '@/lib/middleware/sentry.middleware';
import { publicTransactionMiddleware, transactionMiddleware } from '@/lib/middleware/transaction.middleware';

import { ActionError, ErrorType } from './errors';

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

export type PublicActionContext = PublicTransactionContext;

// base context for public actions (no auth required)
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PublicContext {}

// context after sanitization middleware (public chain)
export interface PublicSanitizedContext extends PublicContext {
  sanitizedInput: unknown;
}

// context after transaction middleware (public chain)
export interface PublicTransactionContext extends PublicSanitizedContext {
  db: DatabaseExecutor;
  tx?: DatabaseExecutor;
}

// context after sanitization middleware (auth chain)
export interface SanitizedContext extends AuthContext {
  sanitizedInput: unknown;
}

// context after transaction middleware (auth chain)
export interface TransactionContext extends SanitizedContext {
  db: DatabaseExecutor;
  tx?: DatabaseExecutor;
}

// base client with enhanced error handling
const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
      isTransactionRequired: z.boolean().default(false).optional(),
    });
  },
  handleServerError(error, utils) {
    console.error('Server action error:', {
      actionName: utils?.metadata?.actionName,
      clientInput: utils?.clientInput ? 'present' : 'none',
      message: error.message,
    });

    if (error instanceof ActionError) {
      switch (error.type) {
        case ErrorType.AUTHORIZATION:
          return error.statusCode === 401 ? 'Authentication required' : 'Access denied';
        case ErrorType.BUSINESS_RULE:
          return error.message;
        case ErrorType.DATABASE:
          if (error.code === 'DUPLICATE_ENTRY') {
            return 'A record with this information already exists.';
          }
          if (error.code === 'FOREIGN_KEY_VIOLATION') {
            return 'Cannot complete operation due to related data constraints.';
          }
          return 'A database error occurred. Please try again.';
        case ErrorType.EXTERNAL_SERVICE:
          return error.isRecoverable ?
              'External service temporarily unavailable. Please try again.'
            : 'External service error occurred.';
        case ErrorType.NOT_FOUND:
          return error.message;
        case ErrorType.RATE_LIMIT:
          return 'Rate limit exceeded. Please try again later.';
        case ErrorType.VALIDATION:
          return error.message;
        case ErrorType.INTERNAL:
        default:
          return DEFAULT_SERVER_ERROR_MESSAGE;
      }
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(sentryMiddleware);

export const authActionClient = actionClient
  .use(authMiddleware)
  .use(sanitizationMiddleware)
  .use(transactionMiddleware)
  .use(databaseMiddleware);

export const publicActionClient = actionClient
  .use(publicSanitizationMiddleware)
  .use(publicTransactionMiddleware)
  .use(publicDatabaseMiddleware);
