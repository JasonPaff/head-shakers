import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  AdminCreateFeaturedContent,
  AdminUpdateFeaturedContent,
} from '@/lib/validations/admin.validation';

import { type AdminFeaturedContentRecord, AdminQuery } from '@/lib/queries/admin/admin-query';
import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { createFacadeError } from '@/lib/utils/error-builders';

// export type for backward compatibility
export type AdminFeaturedContent = AdminFeaturedContentRecord;

/**
 * unified Admin Facade
 * combines admin query operations with business logic validation
 * provides a clean API for all admin operations
 */
export class AdminFacade {
  /**
   * get all featured content for admin management with React cache (request-level deduplication)
   */
  private static getAllFeaturedContentForAdminBase = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<AdminFeaturedContentRecord>> => {
      const context = createPublicQueryContext({ dbInstance });
      return AdminQuery.findAllFeaturedContentForAdmin(context);
    },
  );

  /**
   * get all featured content for admin management with Next.js unstable_cache (persistent caching)
   */
  static getAllFeaturedContentForAdmin = unstable_cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<AdminFeaturedContentRecord>> => {
      return await AdminFacade.getAllFeaturedContentForAdminBase(dbInstance);
    },
    ['admin-featured-content-all'],
    {
      revalidate: 180, // 3 minutes - admin data changes more frequently
      tags: ['admin', 'featured-content'],
    },
  );

  /**
   * get featured content by ID for admin management with React cache (request-level deduplication)
   */
  private static getFeaturedContentByIdForAdminBase = cache(
    async (id: string, dbInstance?: DatabaseExecutor): Promise<AdminFeaturedContentRecord | null> => {
      const context = createPublicQueryContext({ dbInstance });
      return AdminQuery.findFeaturedContentByIdForAdmin(id, context);
    },
  );

  /**
   * get featured content by ID for admin management with Next.js unstable_cache (persistent caching)
   */
  static getFeaturedContentByIdForAdmin = unstable_cache(
    async (id: string, dbInstance?: DatabaseExecutor): Promise<AdminFeaturedContentRecord | null> => {
      return await AdminFacade.getFeaturedContentByIdForAdminBase(id, dbInstance);
    },
    ['admin-featured-content-by-id'],
    {
      revalidate: 180, // 3 minutes - admin data changes more frequently
      tags: ['admin', 'featured-content'],
    },
  );
  /**
   * create a new featured content entry (admin only)
   */
  static async createFeaturedContentAsync(
    data: AdminCreateFeaturedContent,
    curatorId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<AdminFeaturedContentRecord | null> {
    try {
      const context = createUserQueryContext(curatorId, { dbInstance });
      return AdminQuery.createFeaturedContentAsync(data, curatorId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { contentId: data.contentId, contentType: data.contentType },
        facade: 'AdminFacade',
        method: 'createFeaturedContentAsync',
        operation: 'create',
        userId: curatorId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * delete a featured content entry (admin only)
   */
  static async deleteFeaturedContentAsync(
    id: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<AdminFeaturedContentRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return AdminQuery.deleteFeaturedContentAsync(id, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id },
        facade: 'AdminFacade',
        method: 'deleteFeaturedContentAsync',
        operation: 'delete',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * toggle featured content active status (admin/moderator)
   */
  static async toggleFeaturedContentStatusAsync(
    id: string,
    isActive: boolean,
    dbInstance?: DatabaseExecutor,
  ): Promise<AdminFeaturedContentRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return AdminQuery.toggleFeaturedContentStatusAsync(id, isActive, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id, isActive },
        facade: 'AdminFacade',
        method: 'toggleFeaturedContentStatusAsync',
        operation: 'toggle',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * update a featured content entry (admin only)
   */
  static async updateFeaturedContentAsync(
    data: AdminUpdateFeaturedContent,
    dbInstance?: DatabaseExecutor,
  ): Promise<AdminFeaturedContentRecord | null> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return AdminQuery.updateFeaturedContentAsync(data, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id: data.id },
        facade: 'AdminFacade',
        method: 'updateFeaturedContentAsync',
        operation: 'update',
      };
      throw createFacadeError(context, error);
    }
  }
}
