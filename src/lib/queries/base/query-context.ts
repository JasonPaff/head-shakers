import type { SQL } from 'drizzle-orm';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

/**
 * options for find operations
 */
export interface FindOptions {
  /** maximum number of records to return */
  limit?: number;
  /** number of records to skip */
  offset?: number;
  /** order by expressions */
  orderBy?: Array<SQL>;
  /** search term for text-based filtering */
  search?: string;
}

/**
 * query context for all database operations
 * provides a consistent interface for permissions, filtering, and database access
 */
export interface QueryContext {
  /** database instance (transaction or main db) */
  dbInstance?: DatabaseExecutor;
  /** public access mode - only return public content */
  isPublic?: boolean;
  /** required user ID (for protected operations) */
  requiredUserId?: string;
  /** include soft-deleted records */
  shouldIncludeDeleted?: boolean;
  /** current user ID (optional for public queries) */
  userId?: string;
}

/**
 * query context for authenticated user operations
 * extends QueryContext with userId property
 */
export interface UserQueryContext extends QueryContext {
  userId: string;
}

/**
 * create a QueryContext for admin/moderator access
 * admin users can see all content regardless of visibility
 */
export function createAdminQueryContext(
  adminUserId: string,
  overrides: Partial<QueryContext> = {},
): QueryContext {
  return {
    shouldIncludeDeleted: false,
    userId: adminUserId,
    ...overrides,
  };
}

/**
 * create a QueryContext for protected operations (owner required)
 */
export function createProtectedQueryContext(
  requiredUserId: string,
  overrides: Partial<QueryContext> = {},
): UserQueryContext {
  return {
    requiredUserId,
    shouldIncludeDeleted: false,
    userId: requiredUserId,
    ...overrides,
  };
}

/**
 * create a QueryContext for public access
 */
export function createPublicQueryContext(overrides: Partial<QueryContext> = {}): QueryContext {
  return {
    isPublic: true,
    shouldIncludeDeleted: false,
    ...overrides,
  };
}

/**
 * create a QueryContext for authenticated user access
 */
export function createUserQueryContext(
  userId: string,
  overrides: Partial<Omit<UserQueryContext, 'userId'>> = {},
): UserQueryContext {
  return {
    shouldIncludeDeleted: false,
    userId,
    ...overrides,
  };
}
