import type { SQL } from 'drizzle-orm';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

/**
 * permission levels for content access
 */
export enum PermissionLevel {
  /** all content (admin/system access) */
  ALL = 'all',
  /** only owner can access */
  OWNER_ONLY = 'owner_only',
  /** public content only */
  PUBLIC_ONLY = 'public_only',
  /** public content + owner's private content */
  PUBLIC_OR_OWNER = 'public_or_owner',
}

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
 * standard pagination options
 */
export interface PaginationOptions {
  /** page number (1-based) */
  page?: number;
  /** number of items per page */
  pageSize?: number;
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
 * search options for text-based queries
 */
export interface SearchOptions {
  /** fields to search in */
  fields?: Array<string>;
  /** case-sensitive search */
  isCaseSensitive?: boolean;
  /** search term */
  term: string;
}

/**
 * create a QueryContext for protected operations (owner required)
 */
export function createProtectedQueryContext(
  requiredUserId: string,
  overrides: Partial<QueryContext> = {},
): QueryContext {
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
export function createUserQueryContext(userId: string, overrides: Partial<QueryContext> = {}): QueryContext {
  return {
    shouldIncludeDeleted: false,
    userId,
    ...overrides,
  };
}
