import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { contentViews, searchQueries } from '@/lib/db/schema';

export const searchFiltersSchema = z.object({
  category: z.string().optional(),
  priceRange: z
    .object({
      max: z.number().min(0).optional(),
      min: z.number().min(0).optional(),
    })
    .optional(),
  sortBy: z.enum(ENUMS.SEARCH.SORT_BY).optional(),
  sortOrder: z.enum(ENUMS.SEARCH.SORT_ORDER).optional(),
  tags: z.array(z.string()).optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const selectContentViewSchema = createSelectSchema(contentViews);
export const insertContentViewSchema = createInsertSchema(contentViews, {
  ipAddress: z.string().max(SCHEMA_LIMITS.CONTENT_VIEW.IP_ADDRESS.MAX).optional(),
  referrerUrl: z.url().optional(),
  userAgent: z
    .string()
    .min(SCHEMA_LIMITS.CONTENT_VIEW.USER_AGENT.MIN)
    .max(SCHEMA_LIMITS.CONTENT_VIEW.USER_AGENT.MAX)
    .optional(),
  viewDuration: z.number().min(0).optional(),
}).omit({
  id: true,
  viewedAt: true,
});

export const updateContentViewSchema = insertContentViewSchema.partial();

export const selectSearchQuerySchema = createSelectSchema(searchQueries);
export const insertSearchQuerySchema = createInsertSchema(searchQueries, {
  filters: searchFiltersSchema.optional(),
  ipAddress: z.string().max(SCHEMA_LIMITS.SEARCH_QUERY.QUERY.MAX).optional(),
  query: z.string().min(SCHEMA_LIMITS.SEARCH_QUERY.QUERY.MIN).max(SCHEMA_LIMITS.SEARCH_QUERY.QUERY.MAX),
  resultCount: z.number().min(0).optional(),
}).omit({
  id: true,
  searchedAt: true,
});

export const updateSearchQuerySchema = insertSearchQuerySchema.partial();

export type InsertContentView = z.infer<typeof insertContentViewSchema>;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;
export type SelectContentView = z.infer<typeof selectContentViewSchema>;
export type SelectSearchQuery = z.infer<typeof selectSearchQuerySchema>;
export type UpdateContentView = z.infer<typeof updateContentViewSchema>;
export type UpdateSearchQuery = z.infer<typeof updateSearchQuerySchema>;
