import type { QueryContext, UserQueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import {
  createAdminQueryContext,
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';

/**
 * Abstract base class providing query context helper methods
 * Extended by both BaseQuery and BaseFacade
 */
export abstract class BaseContextHelpers {
  /**
   * Create a QueryContext for admin access
   */
  protected static adminContext(adminUserId: string, dbInstance?: DatabaseExecutor): QueryContext {
    return createAdminQueryContext(adminUserId, { dbInstance });
  }

  /**
   * Create a QueryContext for owner-or-viewer access
   * Returns protected context if viewer is the owner, otherwise viewer context
   */
  protected static getOwnerOrViewerContext(
    ownerId: string,
    viewerUserId: string | undefined,
    dbInstance?: DatabaseExecutor,
  ): QueryContext {
    if (viewerUserId && viewerUserId === ownerId) {
      return createProtectedQueryContext(ownerId, { dbInstance });
    }
    return this.getViewerContext(viewerUserId, dbInstance);
  }

  /**
   * Create a QueryContext for protected/owner-only operations
   */
  protected static getProtectedContext(userId: string, dbInstance?: DatabaseExecutor): UserQueryContext {
    return createProtectedQueryContext(userId, { dbInstance });
  }

  /**
   * Create a QueryContext for public access only
   */
  protected static getPublicContext(dbInstance?: DatabaseExecutor): QueryContext {
    return createPublicQueryContext({ dbInstance });
  }

  /**
   * Create a QueryContext for authenticated user access
   */
  protected static getUserContext(
    userId: string,
    dbInstance: DatabaseExecutor,
    overrides: Partial<Omit<UserQueryContext, 'userId'>> = {},
  ): UserQueryContext {
    return createUserQueryContext(userId, { ...overrides, dbInstance });
  }

  /**
   * Create a QueryContext for viewer-based access
   * Returns user context if viewerUserId is provided, otherwise public context
   */
  protected static getViewerContext(
    viewerUserId: string | undefined,
    dbInstance?: DatabaseExecutor,
  ): QueryContext {
    return viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
  }
}
