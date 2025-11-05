import { z } from 'zod';

import { CONFIG, ENUMS } from '@/lib/constants';

/**
 * Public Search Validation Schemas
 * Validation schemas for public-facing search functionality accessible to unauthenticated users
 */

// Entity types that can be searched (excluding user from ENUMS.SEARCH.RESULT_TYPE)
const SEARCHABLE_ENTITY_TYPES = ['collection', 'subcollection', 'bobblehead'] as const;

/**
 * Schema for search query text validation
 * Validates query string with minimum/maximum length and trimming
 */
export const publicSearchQuerySchema = z
  .string()
  .trim()
  .min(CONFIG.SEARCH.MIN_QUERY_LENGTH, `Search query must be at least ${CONFIG.SEARCH.MIN_QUERY_LENGTH} characters`)
  .max(CONFIG.SEARCH.MAX_QUERY_LENGTH, `Search query must be ${CONFIG.SEARCH.MAX_QUERY_LENGTH} characters or less`);

/**
 * Schema for search filters (entity types, tags, sort options)
 * All filters are optional to support flexible search queries
 */
export const searchFiltersSchema = z.object({
  // Entity type toggles - array of entity types to include in search
  entityTypes: z
    .array(z.enum(SEARCHABLE_ENTITY_TYPES))
    .optional()
    .default(SEARCHABLE_ENTITY_TYPES as unknown as ['collection', 'subcollection', 'bobblehead'])
    .refine((types) => types.length > 0, 'At least one entity type must be selected'),

  // Sort options
  sortBy: z.enum(ENUMS.SEARCH.SORT_BY).optional().default('relevance'),

  sortOrder: z.enum(ENUMS.SEARCH.SORT_ORDER).optional().default('desc'),
  // Tag filtering - array of tag IDs to filter by (include only logic)
  tagIds: z
    .array(z.string().uuid('Invalid tag ID'))
    .max(CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD, `Maximum ${CONFIG.CONTENT.MAX_TAGS_PER_BOBBLEHEAD} tags allowed`)
    .optional()
    .default([]),
});

/**
 * Schema for pagination parameters
 * Validates page number and page size with maximum limits
 */
export const searchPaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(CONFIG.PAGINATION.SEARCH_RESULTS.MAX, `Maximum page size is ${CONFIG.PAGINATION.SEARCH_RESULTS.MAX}`)
    .default(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
});

/**
 * Combined schema for full public search input
 * Merges query, filters, and pagination for complete search functionality
 */
export const publicSearchInputSchema = z.object({
  filters: searchFiltersSchema.optional(),
  pagination: searchPaginationSchema.optional(),
  query: publicSearchQuerySchema,
});

/**
 * Schema for header search dropdown (query only, no pagination)
 * Used for instant search feedback in header with limited results (top 5)
 */
export const searchDropdownInputSchema = z.object({
  query: publicSearchQuerySchema,
});

export type PublicSearchInput = z.infer<typeof publicSearchInputSchema>;
// Type exports using z.infer for type-safe schema usage
export type PublicSearchQuery = z.infer<typeof publicSearchQuerySchema>;
// Helper type for searchable entity types
export type SearchableEntityType = (typeof SEARCHABLE_ENTITY_TYPES)[number];
export type SearchDropdownInput = z.infer<typeof searchDropdownInputSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export type SearchPagination = z.infer<typeof searchPaginationSchema>;
