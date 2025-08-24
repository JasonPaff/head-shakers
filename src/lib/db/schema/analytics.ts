import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/users';

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

export const contentViewsTargetTypeEnum = pgEnum('content_views_target_type', ['bobblehead', 'collection', 'profile']);
export const resultTypeEnum = pgEnum('result_type', ['bobblehead', 'collection', 'user']);

export const contentViews = pgTable(
  'content_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    referrerUrl: text('referrer_url'),
    targetId: uuid('target_id').notNull(),
    targetType: contentViewsTargetTypeEnum('content_views_target_type').notNull(),
    userAgent: varchar('user_agent', { length: 1000 }),
    viewDuration: integer('view_duration'), // in seconds
    viewedAt: timestamp('viewed_at').defaultNow().notNull(),
    viewerId: uuid('viewer_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // single column indexes
    index('content_views_viewed_at_idx').on(table.viewedAt),
    index('content_views_viewer_id_idx').on(table.viewerId),
    index('content_views_target_id_idx').on(table.targetId),

    // composite indexes
    index('content_views_target_type_id_idx').on(table.targetType, table.targetId),
    index('content_views_viewer_viewed_idx').on(table.viewerId, table.viewedAt),
  ],
);

export const searchQueries = pgTable(
  'search_queries',
  {
    clickedResultId: uuid('clicked_result_id'),
    clickedResultType: resultTypeEnum('clicked_result_type'),
    filters: jsonb('filters').$type<SearchFilters>(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    query: varchar('query', { length: 500 }).notNull(),
    resultCount: integer('result_count'),
    searchedAt: timestamp('searched_at').defaultNow().notNull(),
    sessionId: uuid('session_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // single column indexes
    index('search_queries_query_idx').on(table.query),
    index('search_queries_searched_at_idx').on(table.searchedAt),
    index('search_queries_user_id_idx').on(table.userId),
    index('search_queries_session_id_idx').on(table.sessionId),

    // composite indexes
    index('search_queries_user_searched_idx').on(table.userId, table.searchedAt),
    index('search_queries_session_searched_idx').on(table.sessionId, table.searchedAt),
  ],
);

export const selectContentViewSchema = createSelectSchema(contentViews);
export const insertContentViewSchema = createInsertSchema(contentViews, {
  ipAddress: z.string().ip().optional(),
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
  ipAddress: z.string().ip().optional(),
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
