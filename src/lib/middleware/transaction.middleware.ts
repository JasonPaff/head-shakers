import { createMiddleware } from 'next-safe-action';

import type { ActionMetadata, PublicSanitizedContext, SanitizedContext } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';

export const transactionMiddleware = createMiddleware<{
  ctx: SanitizedContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  // only wrap in transaction if explicitly requested
  if (metadata?.isTransactionRequired) {
    return await db.transaction(async (tx) => {
      return await next({
        ctx: {
          db: tx,
        },
      });
    });
  }

  // for non-transactional actions, pass the regular db
  return await next({
    ctx: {
      db,
    },
  });
});

export const publicTransactionMiddleware = createMiddleware<{
  ctx: PublicSanitizedContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  // only wrap in transaction if explicitly requested
  if (metadata?.isTransactionRequired) {
    return await db.transaction(async (tx) => {
      return await next({
        ctx: {
          db: tx,
        },
      });
    });
  }

  // for non-transactional actions, pass the regular db
  return await next({
    ctx: {
      db,
    },
  });
});
