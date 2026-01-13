import { z } from 'zod';

import { CONFIG } from '@/lib/constants';

/**
 * Content Search Validation Schemas
 * Validation schemas for admin content search operations (featuring search)
 */

// =============================================================================
// Type Exports (before schemas for better IDE support)
// =============================================================================

export type EntityByIdInput = z.infer<typeof entityByIdSchema>;
export type SearchContentForFeaturingInput = z.infer<typeof searchContentForFeaturingSchema>;

// =============================================================================
// Admin Content Search Schemas
// =============================================================================

/**
 * Schema for searching content (collections, bobbleheads, users) for featuring
 * Used by admin/moderator search actions
 */
export const searchContentForFeaturingSchema = z.object({
  excludeTags: z.array(z.string().uuid()).optional(),
  includeTags: z.array(z.string().uuid()).optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(CONFIG.PAGINATION.SEARCH_RESULTS.MAX)
    .default(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
  query: z.string().min(1).max(CONFIG.SEARCH.MAX_QUERY_LENGTH).optional(),
});

/**
 * Schema for getting a specific entity by ID for featuring
 * Used by admin/moderator get-by-id actions for collections, bobbleheads, and users
 */
export const entityByIdSchema = z.object({
  id: z.string().uuid(),
});
