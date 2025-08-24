import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { contentViews, searchQueries } from '@/lib/db/schema';

export const searchFiltersSchema = z.object({
  category: z.string().optional(),
  priceRange: z
    .object({
      max: z.number().min(0).optional(),
      min: z.number().min(0).optional(),
    })
    .optional(),
  sortBy: z.enum(['relevance', 'date', 'price', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  tags: z.array(z.string()).optional(),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

export const selectContentViewSchema = createSelectSchema(contentViews);
export const insertContentViewSchema = createInsertSchema(contentViews, {
  ipAddress: z.ipv6().optional(),
  referrerUrl: z.url().optional(),
  userAgent: z.string().min(1).max(1000).optional(),
  viewDuration: z.number().min(0).optional(),
}).omit({
  id: true,
  viewedAt: true,
});

export const updateContentViewSchema = insertContentViewSchema.partial();

export const selectSearchQuerySchema = createSelectSchema(searchQueries);
export const insertSearchQuerySchema = createInsertSchema(searchQueries, {
  filters: searchFiltersSchema.optional(),
  ipAddress: z.ipv6().optional(),
  query: z.string().min(1).max(500),
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
