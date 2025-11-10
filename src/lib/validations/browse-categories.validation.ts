import { z } from 'zod';

import { CONFIG } from '@/lib/constants';

/**
 * Browse Categories Validation Schemas
 * Validation schemas for browsing and filtering collections by category with sorting and pagination
 */

/**
 * Sort by options for category browse
 * Supports sorting by name, creation date, popularity (likes), followers, and bobblehead count
 */
export const BROWSE_CATEGORIES_SORT_BY = [
  'name',
  'createdAt',
  'likeCount',
  'followerCount',
  'bobbleheadCount',
] as const;

/**
 * Sort order options
 */
export const BROWSE_CATEGORIES_SORT_ORDER = ['asc', 'desc'] as const;

/**
 * Schema for browse categories sort options
 */
export const browseCategoriesSortSchema = z.object({
  sortBy: z.enum(BROWSE_CATEGORIES_SORT_BY).optional().default('createdAt'),
  sortOrder: z.enum(BROWSE_CATEGORIES_SORT_ORDER).optional().default('desc'),
});

/**
 * Schema for browse categories pagination
 * Uses collection-specific pagination limits from config
 */
export const browseCategoriesPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(CONFIG.PAGINATION.COLLECTIONS.MAX, `Maximum page size is ${CONFIG.PAGINATION.COLLECTIONS.MAX}`)
    .default(CONFIG.PAGINATION.COLLECTIONS.DEFAULT),
});

/**
 * Schema for browse categories filters
 * All filters are optional to support flexible browsing
 */
export const browseCategoriesFiltersSchema = z.object({
  // Filter by category name (varchar string)
  category: z.string().trim().max(255, 'Category name must be 255 characters or less').optional(),

  // Filter by date range
  dateFrom: z.coerce.date().optional(),

  dateTo: z.coerce.date().optional(),

  // Filter by owner user ID
  ownerId: z.string().uuid('Invalid owner ID').optional(),

  // Search query for collection name/description text search
  query: z.string().trim().max(500, 'Search query must be 500 characters or less').optional(),
});

/**
 * Combined schema for full browse categories input
 * Merges filters, sorting, and pagination for complete browse functionality
 */
export const browseCategoriesInputSchema = z
  .object({
    filters: browseCategoriesFiltersSchema.optional(),
    pagination: browseCategoriesPaginationSchema.optional(),
    sort: browseCategoriesSortSchema.optional(),
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

// Type exports using z.infer for type-safe schema usage
export type BrowseCategoriesFilters = z.infer<typeof browseCategoriesFiltersSchema>;
export type BrowseCategoriesInput = z.infer<typeof browseCategoriesInputSchema>;
export type BrowseCategoriesPagination = z.infer<typeof browseCategoriesPaginationSchema>;
export type BrowseCategoriesSort = z.infer<typeof browseCategoriesSortSchema>;
export type BrowseCategoriesSortBy = (typeof BROWSE_CATEGORIES_SORT_BY)[number];
export type BrowseCategoriesSortOrder = (typeof BROWSE_CATEGORIES_SORT_ORDER)[number];
