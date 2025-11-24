import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type {
  BobbleheadListRecord,
  BrowseCategoriesResult,
  BrowseCollectionsResult,
  BrowseCollectionsWithSubcollectionsResult,
  CategoryRecord,
  CollectionRecord,
  CollectionWithRelations,
} from '@/lib/queries/collections/collections.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { BrowseCategoriesInput } from '@/lib/validations/browse-categories.validation';
import type { BrowseCollectionsInput } from '@/lib/validations/browse-collections.validation';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { CacheService } from '@/lib/services/cache.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { createFacadeError } from '@/lib/utils/error-builders';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

export interface CollectionDashboardData {
  coverImageUrl: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  metrics: CollectionMetrics;
  name: string;
  slug: string;
  subCollections: Array<{
    bobbleheadCount: number;
    coverImageUrl: null | string;
    description: null | string;
    id: string;
    isPublic: boolean;
    name: string;
    slug: string;
  }>;
}

export interface CollectionMetrics {
  directBobbleheads: number;
  featuredBobbleheads: number;
  hasSubcollections: boolean;
  lastUpdated: Date;
  subcollectionBobbleheads: number;
  totalBobbleheads: number;
  viewCount?: number;
  viewStats?: {
    anonymousViews: number;
    authenticatedViews: number;
    averageViewDuration: null | number;
    totalViews: number;
    uniqueViewers: number;
  };
}

export type PublicCollection = Awaited<ReturnType<typeof CollectionsFacade.getCollectionForPublicView>>;

export class CollectionsFacade {
  /**
   * Browse collections by category with filtering, sorting, and pagination
   */
  static async browseCategories(
    input: BrowseCategoriesInput,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BrowseCategoriesResult> {
    const startTime = performance.now();

    // Track filter usage patterns
    const activeFilters: Array<string> = [];
    if (input.filters?.query) activeFilters.push('search');
    if (input.filters?.category) activeFilters.push('category');
    if (input.filters?.ownerId) activeFilters.push('owner');
    if (input.filters?.dateFrom || input.filters?.dateTo) activeFilters.push('dateRange');

    Sentry.addBreadcrumb({
      category: 'browse_categories_filters',
      data: {
        activeFilters,
        category: input.filters?.category ? 'set' : 'unset',
        dateFrom: input.filters?.dateFrom ? 'set' : 'unset',
        dateTo: input.filters?.dateTo ? 'set' : 'unset',
        ownerId: input.filters?.ownerId ? 'set' : 'unset',
        query:
          input.filters?.query ?
            `"${input.filters.query.substring(0, 50)}${input.filters.query.length > 50 ? '...' : ''}"`
          : 'empty',
      },
      level: 'info',
      message: `Browse categories with filters: ${activeFilters.join(', ') || 'none'}`,
    });

    Sentry.addBreadcrumb({
      category: 'browse_categories_pagination',
      data: {
        page: input.pagination?.page,
        pageSize: input.pagination?.pageSize,
      },
      level: 'info',
      message: `Browse categories pagination: page ${input.pagination?.page}, size ${input.pagination?.pageSize}`,
    });

    try {
      const inputHash = createHashFromObject(input);
      const result = await CacheService.collections.public(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const queryStartTime = performance.now();
          const result = await CollectionsQuery.getBrowseCategoriesAsync(input, context);
          const queryDuration = performance.now() - queryStartTime;

          // Track query performance
          Sentry.captureMessage('Browse categories query executed', {
            level: 'info',
            tags: {
              activeFilters: activeFilters.join(','),
              cacheKey: 'browse_categories_public',
              operation: 'getBrowseCategoriesAsync',
            },
          });

          // Track slow queries
          if (queryDuration > 1000) {
            Sentry.captureMessage('Browse categories slow query', {
              level: 'info',
              tags: {
                activeFilters: activeFilters.join(','),
                operation: 'query',
              },
            });
          }

          // transform results to include Cloudinary URLs for first bobblehead photos
          const transformedCollections = result.collections.map((record) => ({
            ...record,
            firstBobbleheadPhoto:
              record.firstBobbleheadPhoto ?
                CloudinaryService.getOptimizedUrl(record.firstBobbleheadPhoto, {
                  crop: 'fill',
                  gravity: 'auto',
                  height: 300,
                  quality: 'auto',
                  width: 300,
                })
              : null,
          }));

          return {
            ...result,
            collections: transformedCollections,
          };
        },
        inputHash,
        {
          context: {
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'browseCategories',
            userId: viewerUserId,
          },
        },
      );

      const totalDuration = performance.now() - startTime;

      // Track custom metrics for filter and pagination patterns
      if (activeFilters.length > 0) {
        Sentry.captureMessage('Browse categories filtered search', {
          level: 'info',
          tags: {
            filterCount: activeFilters.length.toString(),
            filters: activeFilters.join(','),
          },
        });
      }

      // Track pagination depth (how far users are paginating)
      if (input.pagination?.page && input.pagination.page > 1) {
        Sentry.captureMessage('Browse categories deep pagination', {
          level: 'info',
          tags: {
            page: input.pagination.page.toString(),
          },
        });
      }

      // Track overall performance - report slow responses
      if (totalDuration > 1000) {
        Sentry.captureMessage('Browse categories slow response', {
          level: 'info',
          tags: {
            hasFilters: activeFilters.length > 0 ? 'yes' : 'no',
            resultCount: result.collections.length.toString(),
            totalCount: result.pagination.totalCount.toString(),
            viewerAuthenticated: !!viewerUserId,
          },
        });
      }

      // Add success breadcrumb with results summary
      Sentry.addBreadcrumb({
        category: 'browse_categories_results',
        data: {
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
        },
        level: 'info',
        message: `Browse categories completed: ${result.collections.length} results of ${result.pagination.totalCount} total`,
      });

      return result;
    } catch (error) {
      const totalDuration = performance.now() - startTime;

      // Track error metrics
      Sentry.captureMessage('Browse categories error', {
        level: 'error',
        tags: {
          activeFilters: activeFilters.join(','),
          errorType: error instanceof Error ? error.constructor.name : 'unknown',
        },
      });

      const context: FacadeErrorContext = {
        data: {
          activeFilters,
          filters: {
            category: input.filters?.category ? `[${input.filters.category}]` : 'unset',
            dateRange: input.filters?.dateFrom || input.filters?.dateTo ? 'set' : 'unset',
            owner: input.filters?.ownerId ? 'set' : 'unset',
            query: input.filters?.query ? `[${input.filters.query.substring(0, 100)}]` : 'empty',
          },
          input,
          pagination: input.pagination,
          totalDuration,
        },
        facade: 'CollectionsFacade',
        method: 'browseCategories',
        operation: 'browseCategories',
        userId: viewerUserId,
      };

      Sentry.addBreadcrumb({
        category: 'error',
        data: {
          activeFilters,
          durationMs: totalDuration,
        },
        level: 'error',
        message: `Browse categories failed after ${totalDuration.toFixed(2)}ms`,
      });

      throw createFacadeError(context, error);
    }
  }

  /**
   * Browse collections with filtering, sorting, and pagination
   */
  static async browseCollections(
    input: BrowseCollectionsInput,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BrowseCollectionsResult | BrowseCollectionsWithSubcollectionsResult> {
    const startTime = performance.now();

    // Track filter usage patterns
    const activeFilters: Array<string> = [];
    if (input.filters?.query) activeFilters.push('search');
    if (input.filters?.categoryId) activeFilters.push('category');
    if (input.filters?.ownerId) activeFilters.push('owner');
    if (input.filters?.dateFrom || input.filters?.dateTo) activeFilters.push('dateRange');
    if (input.filters?.includeSubcollections) activeFilters.push('includeSubcollections');

    Sentry.addBreadcrumb({
      category: 'browse_filters',
      data: {
        activeFilters,
        categoryId: input.filters?.categoryId ? 'set' : 'unset',
        dateFrom: input.filters?.dateFrom ? 'set' : 'unset',
        dateTo: input.filters?.dateTo ? 'set' : 'unset',
        includeSubcollections: input.filters?.includeSubcollections ? 'enabled' : 'disabled',
        ownerId: input.filters?.ownerId ? 'set' : 'unset',
        query:
          input.filters?.query ?
            `"${input.filters.query.substring(0, 50)}${input.filters.query.length > 50 ? '...' : ''}"`
          : 'empty',
      },
      level: 'info',
      message: `Browse with filters: ${activeFilters.join(', ') || 'none'}`,
    });

    Sentry.addBreadcrumb({
      category: 'browse_pagination',
      data: {
        page: input.pagination?.page,
        pageSize: input.pagination?.pageSize,
      },
      level: 'info',
      message: `Browse pagination: page ${input.pagination?.page}, size ${input.pagination?.pageSize}`,
    });

    try {
      const inputHash = createHashFromObject(input);
      const result = await CacheService.collections.public(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const queryStartTime = performance.now();
          const result = await CollectionsQuery.getBrowseCollectionsAsync(input, context);
          const queryDuration = performance.now() - queryStartTime;

          // Track query performance
          Sentry.captureMessage('Browse collections query executed', {
            level: 'info',
            tags: {
              activeFilters: activeFilters.join(','),
              cacheKey: 'browse_public',
              operation: 'getBrowseCollectionsAsync',
            },
          });

          // Track query performance
          if (queryDuration > 1000) {
            // Only report slow queries
            Sentry.captureMessage('Browse collections slow query', {
              level: 'info',
              tags: {
                activeFilters: activeFilters.join(','),
                operation: 'query',
              },
            });
          }

          // transform results to include Cloudinary URLs for first bobblehead photos
          // and subcollection cover images when includeSubcollections is enabled
          const transformedCollections = result.collections.map((record) => {
            const baseTransform = {
              ...record,
              firstBobbleheadPhoto:
                record.firstBobbleheadPhoto ?
                  CloudinaryService.getOptimizedUrl(record.firstBobbleheadPhoto, {
                    crop: 'fill',
                    gravity: 'auto',
                    height: 300,
                    quality: 'auto',
                    width: 300,
                  })
                : null,
            };

            // Transform subcollection cover images if present (when includeSubcollections is enabled)
            if ('subCollections' in record && Array.isArray(record.subCollections)) {
              return {
                ...baseTransform,
                subCollections: record.subCollections.map((subCollection) => ({
                  ...subCollection,
                  coverImageUrl:
                    subCollection.coverImageUrl ?
                      CloudinaryService.getOptimizedUrl(subCollection.coverImageUrl, {
                        crop: 'fill',
                        gravity: 'auto',
                        height: 200,
                        quality: 'auto',
                        width: 200,
                      })
                    : null,
                })),
              };
            }

            return baseTransform;
          });

          return {
            ...result,
            collections: transformedCollections,
          };
        },
        inputHash,
        {
          context: {
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'browse',
            userId: viewerUserId,
          },
        },
      );

      const totalDuration = performance.now() - startTime;

      // Track custom metrics for filter and pagination patterns
      if (activeFilters.length > 0) {
        Sentry.captureMessage('Browse collections filtered search', {
          level: 'info',
          tags: {
            filterCount: activeFilters.length.toString(),
            filters: activeFilters.join(','),
          },
        });
      }

      // Track pagination depth (how far users are paginating)
      if (input.pagination?.page && input.pagination.page > 1) {
        Sentry.captureMessage('Browse collections deep pagination', {
          level: 'info',
          tags: {
            page: input.pagination.page.toString(),
          },
        });
      }

      // Track overall performance - report slow responses
      if (totalDuration > 1000) {
        Sentry.captureMessage('Browse collections slow response', {
          level: 'info',
          tags: {
            hasFilters: activeFilters.length > 0 ? 'yes' : 'no',
            resultCount: result.collections.length.toString(),
            totalCount: result.pagination.totalCount.toString(),
            viewerAuthenticated: !!viewerUserId,
          },
        });
      }

      // Add success breadcrumb with results summary
      Sentry.addBreadcrumb({
        category: 'browse_results',
        data: {
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
        },
        level: 'info',
        message: `Browse completed: ${result.collections.length} results of ${result.pagination.totalCount} total`,
      });

      return result;
    } catch (error) {
      const totalDuration = performance.now() - startTime;

      // Track error metrics
      Sentry.captureMessage('Browse collections error', {
        level: 'error',
        tags: {
          activeFilters: activeFilters.join(','),
          errorType: error instanceof Error ? error.constructor.name : 'unknown',
        },
      });

      const context: FacadeErrorContext = {
        data: {
          activeFilters,
          filters: {
            category: input.filters?.categoryId ? 'set' : 'unset',
            dateRange: input.filters?.dateFrom || input.filters?.dateTo ? 'set' : 'unset',
            includeSubcollections: input.filters?.includeSubcollections ? 'enabled' : 'disabled',
            owner: input.filters?.ownerId ? 'set' : 'unset',
            query: input.filters?.query ? `[${input.filters.query.substring(0, 100)}]` : 'empty',
          },
          input,
          pagination: input.pagination,
          totalDuration,
        },
        facade: 'CollectionsFacade',
        method: 'browseCollections',
        operation: 'browse',
        userId: viewerUserId,
      };

      Sentry.addBreadcrumb({
        category: 'error',
        data: {
          activeFilters,
          durationMs: totalDuration,
        },
        level: 'error',
        message: `Browse collections failed after ${totalDuration.toFixed(2)}ms`,
      });

      throw createFacadeError(context, error);
    }
  }

  static computeMetrics(collection: CollectionWithRelations): CollectionMetrics {
    // count direct bobbleheads (not in subcollections)
    const directBobbleheads = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subcollectionId === null,
    );

    // count bobbleheads in subcollections
    const subcollectionBobbleheads = collection.subCollections.reduce(
      (sum, subCollection) => sum + subCollection.bobbleheads.length,
      0,
    );

    // count featured bobbleheads across collection and subcollections
    const directFeatured = directBobbleheads.filter((b) => b.isFeatured).length;
    const subcollectionFeatured = collection.subCollections.reduce(
      (sum, sub) => sum + sub.bobbleheads.filter((b) => b.isFeatured).length,
      0,
    );

    // find the most recent update across a collection and subcollections
    const lastUpdated = [collection.updatedAt, ...collection.subCollections.map((sc) => sc.updatedAt)].reduce(
      (latest, date) => (date > latest ? date : latest),
      collection.updatedAt,
    );

    return {
      directBobbleheads: directBobbleheads.length,
      featuredBobbleheads: directFeatured + subcollectionFeatured,
      hasSubcollections: collection.subCollections.length > 0,
      lastUpdated,
      subcollectionBobbleheads,
      totalBobbleheads: directBobbleheads.length + subcollectionBobbleheads,
    };
  }

  /**
   * Compute metrics with view data included
   */
  static async computeMetricsWithViews(
    collection: CollectionWithRelations,
    shouldIncludeViewData = false,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionMetrics> {
    const baseMetrics = this.computeMetrics(collection);

    if (!shouldIncludeViewData) {
      return baseMetrics;
    }

    try {
      const [viewCount, viewStats] = await Promise.all([
        this.getCollectionViewCountAsync(collection.id, true, viewerUserId, dbInstance),
        this.getCollectionViewStatsAsync(
          collection.id,
          { includeAnonymous: true, timeframe: 'month' },
          viewerUserId,
          dbInstance,
        ),
      ]);

      return {
        ...baseMetrics,
        viewCount,
        viewStats,
      };
    } catch (error) {
      // return base metrics if view data fails to load
      console.warn('Failed to load view data for collection metrics:', error);
      return baseMetrics;
    }
  }

  static async createAsync(data: InsertCollection, userId: string, dbInstance?: DatabaseExecutor) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const dbInst = context.dbInstance ?? db;

      // generate slug from name
      const baseSlug = generateSlug(data.name);

      // query existing collection slugs for this user only (user-scoped)
      const existingSlugs = await dbInst
        .select({ slug: collections.slug })
        .from(collections)
        .where(eq(collections.userId, userId))
        .then((results) => results.map((r) => r.slug));

      // ensure slug is unique within user's collections
      const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

      // create collection with unique slug
      return await CollectionsQuery.createAsync({ ...data, slug: uniqueSlug }, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { isPublic: data.isPublic, name: data.name },
        facade: 'CollectionsFacade',
        method: 'createAsync',
        operation: 'create',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async deleteAsync(data: DeleteCollection, userId: string, dbInstance?: DatabaseExecutor) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const deletedCollection = await CollectionsQuery.deleteAsync(data, userId, context);

      // cleanup cover photo from Cloudinary if it exists
      if (deletedCollection?.coverImageUrl) {
        try {
          const publicId = CloudinaryService.extractPublicIdFromUrl(deletedCollection.coverImageUrl);
          if (publicId) {
            await CloudinaryService.deletePhotosFromCloudinary([publicId]);
          }
        } catch (cloudinaryError) {
          // log the error but don't fail the deletion operation
          console.error('Failed to delete collection cover photo from Cloudinary:', cloudinaryError);
        }
      }

      return deletedCollection;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId: data.collectionId },
        facade: 'CollectionsFacade',
        method: 'deleteAsync',
        operation: 'delete',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getAllCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string; subcollectionId?: null | string },
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
        subcollectionId: null | string;
        subcollectionName: null | string;
        subcollectionSlug: null | string;
      }
    >
  > {
    try {
      const optionsHash = createHashFromObject({ all: true, options, photos: true, viewerUserId });
      return CacheService.bobbleheads.byCollection(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const bobbleheads = await CollectionsQuery.getAllCollectionBobbleheadsWithPhotosAsync(
            collectionId,
            context,
            options,
          );

          if (bobbleheads.length === 0) {
            return bobbleheads;
          }

          const bobbleheadIds = bobbleheads.map((b) => b.id);
          const likesMap = await SocialFacade.getLikesForMultipleContentItems(
            bobbleheadIds,
            'bobblehead',
            viewerUserId,
            dbInstance,
          );

          return bobbleheads.map((bobblehead) => ({
            ...bobblehead,
            likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null },
          }));
        },
        collectionId,
        optionsHash,
        {
          context: {
            entityId: collectionId,
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'getAllBobbleheadsWithPhotos',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, subcollectionId: options?.subcollectionId },
        facade: 'CollectionsFacade',
        method: 'getAllCollectionBobbleheadsWithPhotos',
        operation: 'getAllBobbleheadsWithPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get all distinct categories with counts
   */
  static async getCategories(dbInstance?: DatabaseExecutor): Promise<Array<CategoryRecord>> {
    try {
      return await CacheService.collections.public(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          return await CollectionsQuery.getDistinctCategoriesAsync(context);
        },
        'categories',
        {
          context: {
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'getCategories',
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: {},
        facade: 'CollectionsFacade',
        method: 'getCategories',
        operation: 'getCategories',
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionBobbleheads(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord>> {
    try {
      const optionsHash = createHashFromObject({ scope: 'basic', viewerUserId });
      return CacheService.bobbleheads.byCollection(
        () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });
          return CollectionsQuery.getBobbleheadsInCollectionAsync(collectionId, context);
        },
        collectionId,
        optionsHash,
        {
          context: {
            entityId: collectionId,
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'getBobbleheads',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBobbleheads',
        operation: 'getBobbleheads',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string; subcollectionId?: null | string },
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
        subcollectionId: null | string;
        subcollectionName: null | string;
        subcollectionSlug: null | string;
      }
    >
  > {
    try {
      const optionsHash = createHashFromObject({ options, photos: true, viewerUserId });
      return CacheService.bobbleheads.byCollection(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const bobbleheads = await CollectionsQuery.getCollectionBobbleheadsWithPhotosAsync(
            collectionId,
            context,
            options,
          );

          if (bobbleheads.length === 0) {
            return bobbleheads;
          }

          const bobbleheadIds = bobbleheads.map((b) => b.id);
          const likesMap = await SocialFacade.getLikesForMultipleContentItems(
            bobbleheadIds,
            'bobblehead',
            viewerUserId,
            dbInstance,
          );

          return bobbleheads.map((bobblehead) => ({
            ...bobblehead,
            likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null },
          }));
        },
        collectionId,
        optionsHash,
        {
          context: {
            entityId: collectionId,
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'getBobbleheadsWithPhotos',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, subcollectionId: options?.subcollectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBobbleheadsWithPhotos',
        operation: 'getBobbleheadsWithPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionRecord | null> {
    return CacheService.collections.byId(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return CollectionsQuery.findByIdAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'collection',
          facade: 'CollectionsFacade',
          operation: 'getById',
          userId: viewerUserId,
        },
      },
    );
  }

  static async getCollectionBySlug(
    slug: string,
    userId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionRecord | null> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return CollectionsQuery.findBySlugAsync(slug, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { slug, userId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBySlug',
        operation: 'getBySlug',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionBySlugWithRelations(
    slug: string,
    userId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionWithRelations | null> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return CollectionsQuery.findBySlugWithRelationsAsync(slug, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { slug, userId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBySlugWithRelations',
        operation: 'getBySlugWithRelations',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionForPublicView(id: string, viewerUserId?: string, dbInstance?: DatabaseExecutor) {
    const collection = await this.getCollectionWithRelations(id, viewerUserId, dbInstance);

    if (!collection) {
      return null;
    }

    const metrics = this.computeMetrics(collection);

    return {
      coverImageUrl: collection.coverImageUrl,
      createdAt: collection.createdAt,
      description: collection.description,
      id: collection.id,
      isPublic: collection.isPublic,
      lastUpdatedAt: metrics.lastUpdated,
      name: collection.name,
      slug: collection.slug,
      subCollectionCount: collection.subCollections.length,
      totalBobbleheadCount: metrics.totalBobbleheads,
      userId: collection.userId,
    };
  }

  static async getCollectionsByUser(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionRecord>> {
    try {
      const optionsHash = createHashFromObject({ options, viewerUserId });
      return CacheService.collections.byUser(
        () => {
          const context =
            viewerUserId && viewerUserId === userId ?
              createProtectedQueryContext(userId, { dbInstance })
            : createUserQueryContext(viewerUserId || userId, { dbInstance });
          return CollectionsQuery.findByUserAsync(userId, options, context);
        },
        userId,
        optionsHash,
        {
          context: { entityType: 'collection', facade: 'CollectionsFacade', operation: 'findByUser', userId },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: 'CollectionsFacade',
        method: 'getCollectionsByUser',
        operation: 'findByUser',
        userId: viewerUserId || userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get collection metadata for SEO and social sharing
   * returns minimal collection information optimized for metadata generation
   *
   * Cache invalidation triggers:
   * - Collection updates (name, description, cover image)
   * - Bobblehead count changes (items added/removed)
   * - Owner profile updates
   * - Visibility changes (public/private)
   *
   * @param slug - Collection's unique slug
   * @param userId - Owner's user ID
   * @param dbInstance - Optional database instance for transactions
   * @returns Collection metadata or null if not found
   */
  static async getCollectionSeoMetadata(
    slug: string,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    coverImage: null | string;
    description: null | string;
    isPublic: boolean;
    itemCount: number;
    name: string;
    owner: {
      displayName: string;
      username: string;
    };
    slug: string;
  }> {
    return CacheService.collections.byId(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return CollectionsQuery.getCollectionMetadata(slug, userId, context);
      },
      `${userId}:${slug}`,
      {
        context: {
          entityType: 'collection',
          facade: 'CollectionsFacade',
          operation: 'getSeoMetadata',
          userId,
        },
        ttl: 1800, // 30 minutes - balance between freshness and performance
      },
    );
  }

  /**
   * Get the view count for a collection
   */
  static async getCollectionViewCountAsync(
    collectionId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<number> {
    try {
      return await ViewTrackingFacade.getViewCountAsync(
        'collection',
        collectionId,
        shouldIncludeAnonymous,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionViewCountAsync',
        operation: 'getViewCount',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view statistics for a collection
   */
  static async getCollectionViewStatsAsync(
    collectionId: string,
    options?: {
      includeAnonymous?: boolean;
      timeframe?: 'day' | 'hour' | 'month' | 'week' | 'year';
    },
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getViewStatsAsync(
        'collection',
        collectionId,
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, options },
        facade: 'CollectionsFacade',
        method: 'getCollectionViewStatsAsync',
        operation: 'getViewStats',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionWithRelations(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionWithRelations | null> {
    return CacheService.collections.withRelations(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return CollectionsQuery.findByIdWithRelationsAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'collection',
          facade: 'CollectionsFacade',
          operation: 'getWithRelations',
          userId: viewerUserId,
        },
      },
    );
  }

  /**
   * Get trending collections based on view data
   */
  static async getTrendingCollectionsAsync(
    options?: {
      includeAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    },
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getTrendingContentAsync(
        'collection',
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options },
        facade: 'CollectionsFacade',
        method: 'getTrendingCollectionsAsync',
        operation: 'getTrendingContent',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getUserCollectionsForDashboard(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionDashboardData>> {
    return CacheService.collections.dashboard(
      async () => {
        const context = createProtectedQueryContext(userId, { dbInstance });
        return CollectionsQuery.getDashboardDataAsync(userId, context).then((collections) =>
          collections.map((collection) => this.transformForDashboard(collection)),
        );
      },
      userId,
      { context: { entityType: 'collection', facade: 'CollectionsFacade', operation: 'dashboard', userId } },
    );
  }

  /**
   * Record a view for a collection
   */
  static async recordCollectionViewAsync(
    collectionId: string,
    viewerUserId?: string,
    metadata?: {
      ipAddress?: string;
      referrerUrl?: string;
      userAgent?: string;
      viewDuration?: number;
    },
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.recordViewAsync(
        {
          ipAddress: metadata?.ipAddress,
          referrerUrl: metadata?.referrerUrl,
          targetId: collectionId,
          targetType: 'collection',
          userAgent: metadata?.userAgent,
          viewDuration: metadata?.viewDuration,
          viewerId: viewerUserId,
        },
        viewerUserId,
        {
          deduplicationWindow: 300, // 5 minutes
          shouldRespectPrivacySettings: true,
        },
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'recordCollectionViewAsync',
        operation: 'recordView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static transformForDashboard(collection: CollectionWithRelations): CollectionDashboardData {
    const metrics = this.computeMetrics(collection);

    return {
      coverImageUrl: collection.coverImageUrl,
      description: collection.description,
      id: collection.id,
      isPublic: collection.isPublic,
      metrics,
      name: collection.name,
      slug: collection.slug,
      subCollections: collection.subCollections.map((sub) => ({
        bobbleheadCount: sub.bobbleheads.length,
        coverImageUrl: sub.coverImageUrl,
        description: sub.description,
        id: sub.id,
        isPublic: sub.isPublic,
        name: sub.name,
        slug: sub.slug,
      })),
    };
  }

  static async updateAsync(data: UpdateCollection, userId: string, dbInstance?: DatabaseExecutor) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const dbInst = context.dbInstance ?? db;

      const updateData: UpdateCollection & { slug?: string } = { ...data };

      // if name is being updated, regenerate slug
      if (data.name) {
        const baseSlug = generateSlug(data.name);

        // query existing slugs for this user, excluding current collection
        const existingSlugs = await dbInst
          .select({ slug: collections.slug })
          .from(collections)
          .where(eq(collections.userId, userId))
          .then((results) => results.map((r) => r.slug).filter((slug) => slug !== data.collectionId));

        // ensure new slug is unique within user's collections
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
        updateData.slug = uniqueSlug;
      }

      return await CollectionsQuery.updateAsync(updateData, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId: data.collectionId },
        facade: 'CollectionsFacade',
        method: 'updateAsync',
        operation: 'update',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
