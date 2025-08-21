import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ===================================
// CORE USER & AUTHENTICATION TABLES
// ===================================

export const users = pgTable(
  'users',
  {
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false),
    isVerified: boolean('is_verified').default(false),
    lastActiveAt: timestamp('last_active_at'),
    location: varchar('location', { length: 100 }),
    memberSince: timestamp('member_since').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    username: varchar('username', { length: 50 }).notNull().unique(),
  },
  (table) => [
    index('users_clerk_id_idx').on(table.clerkId),
    index('users_email_idx').on(table.email),
    index('users_username_idx').on(table.username),
  ],
);

export const userSessions = pgTable(
  'user_sessions',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deviceInfo: jsonb('device_info'),
    expiresAt: timestamp('expires_at').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    isActive: boolean('is_active').default(true),
    sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('user_sessions_token_idx').on(table.sessionToken),
    index('user_sessions_user_id_idx').on(table.userId),
  ],
);

export const loginHistory = pgTable(
  'login_history',
  {
    deviceInfo: jsonb('device_info'),
    failureReason: varchar('failure_reason', { length: 255 }),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    isSuccessful: boolean('is_successful').notNull(),
    loginAt: timestamp('login_at').defaultNow().notNull(),
    loginMethod: varchar('login_method', { length: 50 }).notNull(), // email, google, facebook, etc.
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    index('login_history_login_at_idx').on(table.loginAt),
    index('login_history_user_id_idx').on(table.userId),
  ],
);

// ===================================
// USER SETTINGS & PREFERENCES
// ===================================

export const userSettings = pgTable(
  'user_settings',
  {
    allowComments: varchar('allow_comments', { length: 20 }).default('anyone').notNull(), // anyone, followers, none
    // Communication Settings
    allowDirectMessages: varchar('allow_direct_messages', { length: 20 }).default('followers').notNull(), // anyone, followers, mutual, none

    createdAt: timestamp('created_at').defaultNow().notNull(),
    currency: varchar('currency', { length: 10 }).default('USD').notNull(),
    // Collection Defaults
    defaultItemPrivacy: varchar('default_item_privacy', { length: 20 }).default('public').notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    language: varchar('language', { length: 10 }).default('en').notNull(),

    moderateComments: boolean('moderate_comments').default(false),
    // Privacy Settings
    profileVisibility: varchar('profile_visibility', { length: 20 }).default('public').notNull(), // public, followers, private
    showCollectionStats: boolean('show_collection_stats').default(true),

    showCollectionValue: boolean('show_collection_value').default(false),
    showJoinDate: boolean('show_join_date').default(true),
    showLastActive: boolean('show_last_active').default(false),

    showLocation: boolean('show_location').default(false),
    showRealName: boolean('show_real_name').default(false),
    // Display Preferences
    theme: varchar('theme', { length: 20 }).default('light').notNull(), // light, dark, auto
    timezone: varchar('timezone', { length: 50 }).default('UTC').notNull(),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
  },
  (table) => ({
    userIdIndex: index('user_settings_user_id_idx').on(table.userId),
  }),
);

export const notificationSettings = pgTable(
  'notification_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    // Frequency Settings
    digestFrequency: varchar('digest_frequency', { length: 20 }).default('weekly').notNull(), // daily, weekly, monthly, never

    // Email Notifications
    emailNewComments: boolean('email_new_comments').default(true),
    emailNewFollowers: boolean('email_new_followers').default(true),
    emailNewLikes: boolean('email_new_likes').default(true),
    emailPlatformUpdates: boolean('email_platform_updates').default(true),
    emailWeeklyDigest: boolean('email_weekly_digest').default(true),

    id: uuid('id').primaryKey().defaultRandom(),
    inAppFollowingUpdates: boolean('in_app_following_updates').default(true),
    // In-App Notifications
    inAppNewComments: boolean('in_app_new_comments').default(true),
    inAppNewFollowers: boolean('in_app_new_followers').default(true),

    inAppNewLikes: boolean('in_app_new_likes').default(true),
    // Push Notifications (Mobile)
    pushNewComments: boolean('push_new_comments').default(true),
    pushNewFollowers: boolean('push_new_followers').default(true),

    pushNewLikes: boolean('push_new_likes').default(false),

    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
  },
  (table) => ({
    userIdIndex: index('notification_settings_user_id_idx').on(table.userId),
  }),
);

// ===================================
// COLLECTIONS & ORGANIZATION
// ===================================

export const collections = pgTable(
  'collections',
  {
    coverImageUrl: text('cover_image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(true),
    lastItemAddedAt: timestamp('last_item_added_at'),
    name: varchar('name', { length: 100 }).notNull(),
    totalItems: integer('total_items').default(0),
    totalValue: decimal('total_value', { precision: 10, scale: 2 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
  },
  (table) => ({
    isPublicIndex: index('collections_is_public_idx').on(table.isPublic),
    userIdIndex: index('collections_user_id_idx').on(table.userId),
  }),
);

export const subCollections = pgTable(
  'sub_collections',
  {
    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    coverImageUrl: text('cover_image_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(true), // Can override collection privacy
    itemCount: integer('item_count').default(0),
    name: varchar('name', { length: 100 }).notNull(),
    sortOrder: integer('sort_order').default(0),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    collectionIdIndex: index('sub_collections_collection_id_idx').on(table.collectionId),
    sortOrderIndex: index('sub_collections_sort_order_idx').on(table.sortOrder),
  }),
);

export const tags = pgTable(
  'tags',
  {
    color: varchar('color', { length: 7 }).default('#3B82F6'), // Hex color
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull(),
    usageCount: integer('usage_count').default(0),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    nameIndex: index('tags_name_idx').on(table.name),
    userIdIndex: index('tags_user_id_idx').on(table.userId),
    userTagUnique: uniqueIndex('tags_user_name_unique').on(table.userId, table.name),
  }),
);

// ===================================
// BOBBLEHEADS & CONTENT
// ===================================

export const bobbleheads = pgTable(
  'bobbleheads',
  {
    // Acquisition & Value
    acquisitionDate: timestamp('acquisition_date'),
    acquisitionMethod: varchar('acquisition_method', { length: 50 }), // purchase, gift, trade, etc.
    category: varchar('category', { length: 50 }),
    characterName: varchar('character_name', { length: 100 }),

    collectionId: uuid('collection_id')
      .references(() => collections.id, { onDelete: 'cascade' })
      .notNull(),
    commentCount: integer('comment_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    currentCondition: varchar('current_condition', { length: 20 }).default('excellent'), // mint, excellent, good, fair, poor
    // Custom Fields (JSON for flexibility)
    customFields: jsonb('custom_fields'),
    deletedAt: timestamp('deleted_at'),
    description: text('description'),

    // Physical Details
    height: decimal('height', { precision: 5, scale: 2 }), // in cm
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false),

    isFeatured: boolean('is_featured').default(false),
    isPublic: boolean('is_public').default(true),
    likeCount: integer('like_count').default(0),
    manufacturer: varchar('manufacturer', { length: 100 }),
    material: varchar('material', { length: 100 }),

    // Basic Information
    name: varchar('name', { length: 200 }).notNull(),
    purchaseLocation: varchar('purchase_location', { length: 100 }),
    purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }),

    series: varchar('series', { length: 100 }),

    // Status & Organization
    status: varchar('status', { length: 20 }).default('owned').notNull(), // owned, for_trade, for_sale, sold, wishlist
    subCollectionId: uuid('sub_collection_id').references(() => subCollections.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    // Metadata
    viewCount: integer('view_count').default(0),
    weight: decimal('weight', { precision: 6, scale: 2 }), // in grams
    year: integer('year'),
  },
  (table) => ({
    categoryIndex: index('bobbleheads_category_idx').on(table.category),
    collectionIdIndex: index('bobbleheads_collection_id_idx').on(table.collectionId),
    createdAtIndex: index('bobbleheads_created_at_idx').on(table.createdAt),
    isFeaturedIndex: index('bobbleheads_is_featured_idx').on(table.isFeatured),
    isPublicIndex: index('bobbleheads_is_public_idx').on(table.isPublic),
    statusIndex: index('bobbleheads_status_idx').on(table.status),
    subCollectionIdIndex: index('bobbleheads_sub_collection_id_idx').on(table.subCollectionId),
    userIdIndex: index('bobbleheads_user_id_idx').on(table.userId),
  }),
);

export const bobbleheadPhotos = pgTable(
  'bobblehead_photos',
  {
    altText: varchar('alt_text', { length: 255 }),
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    caption: text('caption'),
    fileSize: integer('file_size'), // in bytes
    height: integer('height'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPrimary: boolean('is_primary').default(false),
    sortOrder: integer('sort_order').default(0),
    uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
    url: text('url').notNull(),
    width: integer('width'),
  },
  (table) => ({
    bobbleheadIdIndex: index('bobblehead_photos_bobblehead_id_idx').on(table.bobbleheadId),
    isPrimaryIndex: index('bobblehead_photos_is_primary_idx').on(table.isPrimary),
    sortOrderIndex: index('bobblehead_photos_sort_order_idx').on(table.sortOrder),
  }),
);

export const bobbleheadTags = pgTable(
  'bobblehead_tags',
  {
    bobbleheadId: uuid('bobblehead_id')
      .references(() => bobbleheads.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    bobbleheadIdIndex: index('bobblehead_tags_bobblehead_id_idx').on(table.bobbleheadId),
    bobbleheadTagUnique: uniqueIndex('bobblehead_tags_unique').on(table.bobbleheadId, table.tagId),
    tagIdIndex: index('bobblehead_tags_tag_id_idx').on(table.tagId),
  }),
);

// ===================================
// SOCIAL FEATURES
// ===================================

export const follows = pgTable(
  'follows',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    followerId: uuid('follower_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followingId: uuid('following_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followType: varchar('follow_type', { length: 20 }).default('user').notNull(), // user, collection
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id'), // For following specific collections
  },
  (table) => ({
    followerIdIndex: index('follows_follower_id_idx').on(table.followerId),
    followingIdIndex: index('follows_following_id_idx').on(table.followingId),
    targetIdIndex: index('follows_target_id_idx').on(table.targetId),
    uniqueFollow: uniqueIndex('follows_unique').on(
      table.followerId,
      table.followingId,
      table.followType,
      table.targetId,
    ),
  }),
);

export const userBlocks = pgTable(
  'user_blocks',
  {
    blockedId: uuid('blocked_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    blockerId: uuid('blocker_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    reason: varchar('reason', { length: 100 }),
  },
  (table) => ({
    blockedIdIndex: index('user_blocks_blocked_id_idx').on(table.blockedId),
    blockerIdIndex: index('user_blocks_blocker_id_idx').on(table.blockerId),
    uniqueBlock: uniqueIndex('user_blocks_unique').on(table.blockerId, table.blockedId),
  }),
);

export const likes = pgTable(
  'likes',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, collection, comment
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    targetIndex: index('likes_target_idx').on(table.targetType, table.targetId),
    uniqueLike: uniqueIndex('likes_unique').on(table.userId, table.targetType, table.targetId),
    userIdIndex: index('likes_user_id_idx').on(table.userId),
  }),
);

export const comments = pgTable(
  'comments',
  {
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(false),
    isEdited: boolean('is_edited').default(false),
    likeCount: integer('like_count').default(0),
    parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }), // For threaded comments
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, collection
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    createdAtIndex: index('comments_created_at_idx').on(table.createdAt),
    parentCommentIdIndex: index('comments_parent_comment_id_idx').on(table.parentCommentId),
    targetIndex: index('comments_target_idx').on(table.targetType, table.targetId),
    userIdIndex: index('comments_user_id_idx').on(table.userId),
  }),
);

// ===================================
// NOTIFICATIONS & ACTIVITY
// ===================================

export const notifications = pgTable(
  'notifications',
  {
    actionUrl: text('action_url'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    isEmailSent: boolean('is_email_sent').default(false),
    isRead: boolean('is_read').default(false),
    message: text('message'),
    readAt: timestamp('read_at'),
    relatedId: uuid('related_id'),
    relatedType: varchar('related_type', { length: 20 }), // bobblehead, collection, comment
    relatedUserId: uuid('related_user_id').references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // comment, like, follow, mention, system
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    createdAtIndex: index('notifications_created_at_idx').on(table.createdAt),
    isReadIndex: index('notifications_is_read_idx').on(table.isRead),
    typeIndex: index('notifications_type_idx').on(table.type),
    userIdIndex: index('notifications_user_id_idx').on(table.userId),
  }),
);

export const userActivity = pgTable(
  'user_activity',
  {
    actionType: varchar('action_type', { length: 50 }).notNull(), // create, update, delete, like, comment, follow
    createdAt: timestamp('created_at').defaultNow().notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    metadata: jsonb('metadata'), // Additional context about the action
    targetId: uuid('target_id'),
    targetType: varchar('target_type', { length: 20 }), // bobblehead, collection, user, comment
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    actionTypeIndex: index('user_activity_action_type_idx').on(table.actionType),
    createdAtIndex: index('user_activity_created_at_idx').on(table.createdAt),
    targetIndex: index('user_activity_target_idx').on(table.targetType, table.targetId),
    userIdIndex: index('user_activity_user_id_idx').on(table.userId),
  }),
);

// ===================================
// ANALYTICS & TRACKING
// ===================================

export const contentViews = pgTable(
  'content_views',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    referrerUrl: text('referrer_url'),
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, collection, profile
    userAgent: text('user_agent'),
    viewDuration: integer('view_duration'), // in seconds
    viewedAt: timestamp('viewed_at').defaultNow().notNull(),
    viewerId: uuid('viewer_id').references(() => users.id, { onDelete: 'cascade' }), // Null for anonymous views
  },
  (table) => ({
    targetIndex: index('content_views_target_idx').on(table.targetType, table.targetId),
    viewedAtIndex: index('content_views_viewed_at_idx').on(table.viewedAt),
    viewerIdIndex: index('content_views_viewer_id_idx').on(table.viewerId),
  }),
);

export const searchQueries = pgTable(
  'search_queries',
  {
    clickedResultId: uuid('clicked_result_id'),
    clickedResultType: varchar('clicked_result_type', { length: 20 }),
    filters: jsonb('filters'), // Search filters applied
    id: uuid('id').primaryKey().defaultRandom(),
    ipAddress: varchar('ip_address', { length: 45 }),
    query: varchar('query', { length: 500 }).notNull(),
    resultCount: integer('result_count'),
    searchedAt: timestamp('searched_at').defaultNow().notNull(),
    sessionId: uuid('session_id'),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    queryIndex: index('search_queries_query_idx').on(table.query),
    searchedAtIndex: index('search_queries_searched_at_idx').on(table.searchedAt),
    userIdIndex: index('search_queries_user_id_idx').on(table.userId),
  }),
);

// ===================================
// CONTENT MODERATION
// ===================================

export const contentReports = pgTable(
  'content_reports',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    moderatorId: uuid('moderator_id').references(() => users.id, { onDelete: 'set null' }),
    moderatorNotes: text('moderator_notes'),
    reason: varchar('reason', { length: 100 }).notNull(),
    reporterId: uuid('reporter_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    resolvedAt: timestamp('resolved_at'),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, reviewed, resolved, dismissed
    targetId: uuid('target_id').notNull(),
    targetType: varchar('target_type', { length: 20 }).notNull(), // bobblehead, comment, user, collection
  },
  (table) => ({
    createdAtIndex: index('content_reports_created_at_idx').on(table.createdAt),
    reporterIdIndex: index('content_reports_reporter_id_idx').on(table.reporterId),
    statusIndex: index('content_reports_status_idx').on(table.status),
    targetIndex: index('content_reports_target_idx').on(table.targetType, table.targetId),
  }),
);

// ===================================
// FEATURED CONTENT & CURATION
// ===================================

export const featuredContent = pgTable(
  'featured_content',
  {
    contentId: uuid('content_id').notNull(),
    contentType: varchar('content_type', { length: 20 }).notNull(), // bobblehead, collection, user
    createdAt: timestamp('created_at').defaultNow().notNull(),
    curatorId: uuid('curator_id').references(() => users.id, { onDelete: 'set null' }),
    description: text('description'),
    endDate: timestamp('end_date'),
    featureType: varchar('feature_type', { length: 50 }).notNull(), // homepage_banner, collection_of_week, trending
    id: uuid('id').primaryKey().defaultRandom(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true),
    sortOrder: integer('sort_order').default(0),
    startDate: timestamp('start_date'),
    title: varchar('title', { length: 255 }),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    contentIndex: index('featured_content_content_idx').on(table.contentType, table.contentId),
    featureTypeIndex: index('featured_content_feature_type_idx').on(table.featureType),
    isActiveIndex: index('featured_content_is_active_idx').on(table.isActive),
    sortOrderIndex: index('featured_content_sort_order_idx').on(table.sortOrder),
  }),
);

// ===================================
// SYSTEM & CONFIGURATION
// ===================================

export const platformSettings = pgTable(
  'platform_settings',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    description: text('description'),
    id: uuid('id').primaryKey().defaultRandom(),
    isPublic: boolean('is_public').default(false),
    key: varchar('key', { length: 100 }).notNull().unique(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
    value: text('value'),
    valueType: varchar('value_type', { length: 20 }).default('string').notNull(), // string, number, boolean, json
  },
  (table) => ({
    keyIndex: index('platform_settings_key_idx').on(table.key),
  }),
);

// ===================================
// DRIZZLE RELATIONS
// ===================================

export const usersRelations = relations(users, ({ many, one }) => ({
  activity: many(userActivity),
  blockedBy: many(userBlocks, { relationName: 'blocked' }),
  blocks: many(userBlocks, { relationName: 'blocker' }),
  bobbleheads: many(bobbleheads),
  collection: one(collections, {
    fields: [users.id],
    references: [collections.userId],
  }),
  comments: many(comments),
  contentViews: many(contentViews),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  likes: many(likes),
  loginHistory: many(loginHistory),
  moderatedReports: many(contentReports, { relationName: 'moderator' }),
  notifications: many(notifications),
  notificationSettings: one(notificationSettings, {
    fields: [users.id],
    references: [notificationSettings.userId],
  }),
  reports: many(contentReports, { relationName: 'reporter' }),
  searchQueries: many(searchQueries),
  sessions: many(userSessions),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId],
  }),
  tags: many(tags),
}));

export const collectionsRelations = relations(collections, ({ many, one }) => ({
  bobbleheads: many(bobbleheads),
  subCollections: many(subCollections),
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
}));

export const subCollectionsRelations = relations(subCollections, ({ many, one }) => ({
  bobbleheads: many(bobbleheads),
  collection: one(collections, {
    fields: [subCollections.collectionId],
    references: [collections.id],
  }),
}));

export const bobbleheadsRelations = relations(bobbleheads, ({ many, one }) => ({
  bobbleheadTags: many(bobbleheadTags),
  collection: one(collections, {
    fields: [bobbleheads.collectionId],
    references: [collections.id],
  }),
  comments: many(comments),
  likes: many(likes),
  photos: many(bobbleheadPhotos),
  subCollection: one(subCollections, {
    fields: [bobbleheads.subCollectionId],
    references: [subCollections.id],
  }),
  tags: many(tags, {
    relationName: 'bobbleheadToTags',
  }),
  user: one(users, {
    fields: [bobbleheads.userId],
    references: [users.id],
  }),
}));

export const bobbleheadPhotosRelations = relations(bobbleheadPhotos, ({ one }) => ({
  bobblehead: one(bobbleheads, {
    fields: [bobbleheadPhotos.bobbleheadId],
    references: [bobbleheads.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many, one }) => ({
  bobbleheads: many(bobbleheads, {
    relationName: 'bobbleheadToTags',
  }),
  bobbleheadTags: many(bobbleheadTags),
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
}));

export const bobbleheadTagsRelations = relations(bobbleheadTags, ({ one }) => ({
  bobblehead: one(bobbleheads, {
    fields: [bobbleheadTags.bobbleheadId],
    references: [bobbleheads.id],
  }),
  tag: one(tags, {
    fields: [bobbleheadTags.tagId],
    references: [tags.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocked: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
    relationName: 'blocked',
  }),
  blocker: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
    relationName: 'blocker',
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ many, one }) => ({
  likes: many(likes),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'parentComment',
  }),
  replies: many(comments, {
    relationName: 'parentComment',
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userActivityRelations = relations(userActivity, ({ one }) => ({
  user: one(users, {
    fields: [userActivity.userId],
    references: [users.id],
  }),
}));

export const contentViewsRelations = relations(contentViews, ({ one }) => ({
  viewer: one(users, {
    fields: [contentViews.viewerId],
    references: [users.id],
  }),
}));

export const searchQueriesRelations = relations(searchQueries, ({ one }) => ({
  user: one(users, {
    fields: [searchQueries.userId],
    references: [users.id],
  }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  moderator: one(users, {
    fields: [contentReports.moderatorId],
    references: [users.id],
    relationName: 'moderator',
  }),
  reporter: one(users, {
    fields: [contentReports.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
}));

export const featuredContentRelations = relations(featuredContent, ({ one }) => ({
  curator: one(users, {
    fields: [featuredContent.curatorId],
    references: [users.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const loginHistoryRelations = relations(loginHistory, ({ one }) => ({
  user: one(users, {
    fields: [loginHistory.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [notificationSettings.userId],
    references: [users.id],
  }),
}));

// ===================================
// EXPORT ALL TABLES FOR DRIZZLE
// ===================================

export const schema = {
  bobbleheadPhotos,
  // Content
  bobbleheads,
  bobbleheadTags,
  // Collections & Organization
  collections,
  comments,

  // Moderation & Curation
  contentReports,
  // Analytics & Tracking
  contentViews,
  featuredContent,

  // Social Features
  follows,
  likes,
  loginHistory,

  // Notifications & Activity
  notifications,
  notificationSettings,
  // System
  platformSettings,
  searchQueries,

  subCollections,
  tags,

  userActivity,
  userBlocks,

  // Core User & Auth
  users,
  userSessions,

  userSettings,
};

// ===================================
// TYPE EXPORTS FOR APPLICATION USE
// ===================================

export type Bobblehead = typeof bobbleheads.$inferSelect;
export type BobbleheadPhoto = typeof bobbleheadPhotos.$inferSelect;

export type BobbleheadWithDetails = Bobblehead & {
  _count: {
    comments: number;
    likes: number;
    views: number;
  };
  collection: Collection;
  photos: BobbleheadPhoto[];
  subCollection?: SubCollection;
  tags: Tag[];
  user: User;
};
export type Collection = typeof collections.$inferSelect;

export type CollectionWithStats = Collection & {
  _count: {
    bobbleheads: number;
    followers: number;
  };
  recentBobbleheads: Bobblehead[];
  subCollections: SubCollection[];
  user: User;
};
export type Comment = typeof comments.$inferSelect;

export type CommentWithDetails = Comment & {
  _count: {
    likes: number;
  };
  replies?: CommentWithDetails[];
  user: User;
};
export type ContentReport = typeof contentReports.$inferSelect;

export type ContentView = typeof contentViews.$inferSelect;
export type FeaturedContent = typeof featuredContent.$inferSelect;

export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;

export type NewBobblehead = typeof bobbleheads.$inferInsert;
export type NewBobbleheadPhoto = typeof bobbleheadPhotos.$inferInsert;

export type NewCollection = typeof collections.$inferInsert;
export type NewComment = typeof comments.$inferInsert;

export type NewContentReport = typeof contentReports.$inferInsert;
export type NewContentView = typeof contentViews.$inferInsert;

export type NewFeaturedContent = typeof featuredContent.$inferInsert;
export type NewFollow = typeof follows.$inferInsert;

export type NewLike = typeof likes.$inferInsert;
export type NewNotification = typeof notifications.$inferInsert;

export type NewNotificationSettings = typeof notificationSettings.$inferInsert;
export type NewSearchQuery = typeof searchQueries.$inferInsert;

export type NewSubCollection = typeof subCollections.$inferInsert;
export type NewTag = typeof tags.$inferInsert;

export type NewUser = typeof users.$inferInsert;
export type NewUserActivity = typeof userActivity.$inferInsert;

export type NewUserSettings = typeof userSettings.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type SearchQuery = typeof searchQueries.$inferSelect;

export type SubCollection = typeof subCollections.$inferSelect;
export type Tag = typeof tags.$inferSelect;

// ===================================
// UTILITY TYPES FOR COMPLEX QUERIES
// ===================================

export type User = typeof users.$inferSelect;

export type UserActivity = typeof userActivity.$inferSelect;

export type UserProfile = User & {
  _count: {
    followers: number;
    following: number;
  };
  collection: Collection & {
    _count: {
      bobbleheads: number;
      subCollections: number;
    };
  };
  settings: UserSettings;
};

export type UserSettings = typeof userSettings.$inferSelect;

// ===================================
// DRIZZLE CONFIGURATION EXAMPLE
// ===================================

/*
// Example drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
*/

// ===================================
// MIGRATION NOTES
// ===================================

/*
Key Migration Considerations:

1. **Indexes**: All important queries have proper indexes
2. **Foreign Keys**: Proper cascade rules for data integrity
3. **Unique Constraints**: Prevent duplicate relationships
4. **Soft Deletes**: Important content uses isDeleted flags
5. **JSONB Fields**: Flexible for custom fields and metadata
6. **Privacy**: Multiple levels of privacy controls
7. **Performance**: Optimized for common query patterns

To generate migrations:
npx drizzle-kit generate:pg

To run migrations:
npx drizzle-kit push:pg
*/
