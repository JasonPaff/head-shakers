import type { AnyColumn, SQL } from 'drizzle-orm';

import { and, eq, isNull, or } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

/**
 * build ownership filter for user-specific queries
 */
export function buildOwnershipFilter(userIdColumn: AnyColumn, context: QueryContext): SQL | undefined {
  const userId = context.requiredUserId ?? context.userId;

  if (!userId) {
    return undefined;
  }

  return eq(userIdColumn, userId);
}

/**
 * build permission filter for queries with isPublic and userId columns
 */
export function buildPermissionFilter(
  isPublicColumn: AnyColumn,
  userIdColumn: AnyColumn,
  context: QueryContext,
): SQL | undefined {
  // admin/system access - return all content
  if (context.shouldIncludeDeleted && !context.isPublic && !context.userId && !context.requiredUserId) {
    return undefined;
  }

  // public access only
  if (context.isPublic) {
    return eq(isPublicColumn, true);
  }

  // protected operation - must be the owner
  if (context.requiredUserId) {
    return eq(userIdColumn, context.requiredUserId);
  }

  // user access - public content OR user's own content
  if (context.userId) {
    return or(eq(isPublicColumn, true), eq(userIdColumn, context.userId));
  }

  // default to public only if no specific user context
  return eq(isPublicColumn, true);
}

/**
 * build soft delete filter for timestamp deletedAt columns
 * returns isNull check (NULL = not deleted)
 */
export function buildSoftDeleteFilter(deletedAtColumn: AnyColumn, context: QueryContext): SQL | undefined {
  if (context.shouldIncludeDeleted) {
    return undefined;
  }

  return isNull(deletedAtColumn);
}

/**
 * combine multiple filters with AND logic
 */
export function combineFilters(...filters: Array<SQL | undefined>): SQL | undefined {
  const validFilters = filters.filter((filter): filter is SQL => filter !== undefined);

  if (validFilters.length === 0) {
    return undefined;
  }

  if (validFilters.length === 1) {
    return validFilters[0];
  }

  return and(...validFilters);
}
