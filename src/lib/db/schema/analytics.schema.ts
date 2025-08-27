import { index, integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import type { SearchFilters } from '@/lib/validations/analytics.validation';

import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';
import { users } from '@/lib/db/schema/users.schema';

export const contentViewsTargetTypeEnum = pgEnum(
  'content_views_target_type',
  ENUMS.CONTENT_VIEWS.TARGET_TYPE,
);
export const resultTypeEnum = pgEnum('result_type', ENUMS.SEARCH.RESULT_TYPE);

export const contentViews = pgTable(
  'content_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: SCHEMA_LIMITS.CONTENT_VIEW.IP_ADDRESS.MAX }),
    referrerUrl: varchar('referrer_url', { length: SCHEMA_LIMITS.CONTENT_VIEW.REFERRER_URL.MAX }),
    targetId: uuid('target_id').notNull(),
    targetType: contentViewsTargetTypeEnum('content_views_target_type').notNull(),
    userAgent: varchar('user_agent', { length: SCHEMA_LIMITS.CONTENT_VIEW.USER_AGENT.MAX }),
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
    ipAddress: varchar('ip_address', { length: SCHEMA_LIMITS.SEARCH_QUERY.IP_ADDRESS.MAX }),
    query: varchar('query', { length: SCHEMA_LIMITS.SEARCH_QUERY.QUERY.MAX }).notNull(),
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
