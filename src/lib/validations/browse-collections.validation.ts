import { z } from 'zod';

import { CONFIG } from '@/lib/constants';

/**
 * Browse Collections Validation Schemas
 * Validation schemas for browsing and filtering collections with sorting and pagination
 */

/**
 * Sort by options for collections browse
 * Supports sorting by name, creation date, popularity (likes), and followers
 */
export const BROWSE_COLLECTIONS_SORT_BY = ['name', 'createdAt', 'likeCount', 'followerCount'] as const;

/**
 * Sort order options
 */
export const BROWSE_COLLECTIONS_SORT_ORDER = ['asc', 'desc'] as const;

/**
 * Schema for browse collections sort options
 */
export const browseCollectionsSortSchema = z.object({
  sortBy: z.enum(BROWSE_COLLECTIONS_SORT_BY).optional().default('createdAt'),
  sortOrder: z.enum(BROWSE_COLLECTIONS_SORT_ORDER).optional().default('desc'),
});

/**
 * Schema for browse collections pagination
 * Uses collection-specific pagination limits from config
 */
export const browseCollectionsPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(CONFIG.PAGINATION.COLLECTIONS.MAX, `Maximum page size is ${CONFIG.PAGINATION.COLLECTIONS.MAX}`)
    .default(CONFIG.PAGINATION.COLLECTIONS.DEFAULT),
});

/**
 * Schema for browse collections filters
 * All filters are optional to support flexible browsing
 */
export const browseCollectionsFiltersSchema = z.object({
  // Filter by category ID
  categoryId: z.string().uuid('Invalid category ID').optional(),

  // Filter by date range
  dateFrom: z.coerce.date().optional(),

  dateTo: z.coerce.date().optional(),

  // Filter by owner user ID
  ownerId: z.string().uuid('Invalid owner ID').optional(),
  // Search query for collection name/description text search
  query: z.string().trim().max(500, 'Search query must be 500 characters or less').optional(),
});

/**
 * Combined schema for full browse collections input
 * Merges filters, sorting, and pagination for complete browse functionality
 */
export const browseCollectionsInputSchema = z
  .object({
    filters: browseCollectionsFiltersSchema.optional(),
    pagination: browseCollectionsPaginationSchema.optional(),
    sort: browseCollectionsSortSchema.optional(),
  })
  .refine(
    (data) => {
      // Validate date range if both dates are provided
      if (data.filters?.dateFrom && data.filters?.dateTo) {
        return data.filters.dateFrom <= data.filters.dateTo;
      }
      return true;
    },
    {
      message: 'dateFrom must be before or equal to dateTo',
      path: ['filters', 'dateFrom'],
    },
  );

export type BrowseCollectionsFilters = z.infer<typeof browseCollectionsFiltersSchema>;
// Type exports using z.infer for type-safe schema usage
export type BrowseCollectionsInput = z.infer<typeof browseCollectionsInputSchema>;
export type BrowseCollectionsPagination = z.infer<typeof browseCollectionsPaginationSchema>;
export type BrowseCollectionsSort = z.infer<typeof browseCollectionsSortSchema>;
export type BrowseCollectionsSortBy = (typeof BROWSE_COLLECTIONS_SORT_BY)[number];
export type BrowseCollectionsSortOrder = (typeof BROWSE_COLLECTIONS_SORT_ORDER)[number];
