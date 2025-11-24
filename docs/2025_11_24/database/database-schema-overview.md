# Head Shakers Database Schema Overview

## Database Details

- **Database Name**: head-shakers
- **Platform**: PostgreSQL (Neon Serverless)
- **Development Branch**: br-dark-forest-adf48tll
- **Production Branch**: br-dry-forest-adjaydda

## Tables Summary

### 1. User Management Tables

#### `users`

Core user table for all platform users.

- **Key Fields**: id (UUID), clerkId, email, username, displayName, role, isDeleted, isVerified
- **Indexes**: 13 indexes including authentication covering index, profile covering index, text search indexes
- **Relationships**: Referenced by user_sessions, user_settings, notifications, and other tables

#### `user_sessions`

Active session tracking for users.

- **Key Fields**: id, sessionToken, userId, isActive, expiresAt, deviceInfo (JSONB)
- **Relationships**: References users table

#### `login_history`

Historical login audit trail.

- **Key Fields**: id, userId, loginAt, isSuccessful, loginMethod, deviceInfo
- **Relationships**: References users table

#### `user_settings`

User preferences and configuration.

- **Key Fields**: id, userId, language, timezone, currency, privacyLevel, allowComments, allowDirectMessages
- **Relationships**: References users table (one-to-one)

#### `notification_settings`

User notification preferences.

- **Key Fields**: id, userId, emailNewComments, pushNewLikes, inAppFollowingUpdates, etc.
- **Relationships**: References users table (one-to-one)

#### `user_blocks`

User blocking relationships.

- **Key Fields**: id, blockerId, blockedId, createdAt
- **Constraints**: Unique index on (blockerId, blockedId), no self-blocking

#### `user_activity`

User activity tracking and analytics.

- **Key Fields**: id, userId, actionType, targetType, targetId, metadata (JSONB), createdAt
- **Purpose**: Analytics and user behavior tracking

---

### 2. Content Management Tables

#### `collections`

User bobblehead collections.

- **Key Fields**: id, userId, name, slug, isPublic, totalItems, totalValue, likeCount, commentCount
- **Indexes**: 9 indexes for public browsing, search, and user-specific queries
- **Constraints**: Unique (userId, slug), totalItems >= 0, totalValue >= 0

#### `sub_collections`

Organized sections within collections.

- **Key Fields**: id, collectionId, name, slug, isPublic, itemCount, sortOrder
- **Relationships**: References collections (cascade delete)
- **Constraints**: Unique (collectionId, slug)

#### `bobbleheads`

Individual bobblehead items in collections.

- **Key Fields**: id, collectionId, subcollectionId, name, slug, isPublic, isFeatured
- **Metadata**: characterName, manufacturer, series, year, acquisitionDate, acquisitionMethod
- **Specifications**: height, weight, material, currentCondition
- **Pricing**: purchasePrice, purchaseLocation
- **Custom**: customFields (JSONB), category, description
- **Metrics**: likeCount, viewCount, commentCount
- **Indexes**: 16 indexes including collection view, public browse, search, pagination
- **Constraints**: Multiple validation checks for dates, prices, dimensions

#### `bobblehead_photos`

Photo gallery for bobbleheads.

- **Key Fields**: id, bobbleheadId, url, isPrimary, sortOrder
- **Metadata**: altText, caption, width, height, fileSize
- **Indexes**: 3 indexes for primary photo and sort order lookups

#### `bobblehead_tags`

Tags associated with bobbleheads.

- **Key Fields**: id, bobbleheadId, tagId
- **Relationships**: References bobbleheads and tags (cascade delete)
- **Constraints**: Unique (bobbleheadId, tagId)

#### `tags`

Reusable tags for categorization.

- **Key Fields**: id, userId, name, color, usageCount
- **Indexes**: 8 indexes for search and popularity
- **Constraints**: Unique (userId, name)

---

### 3. Social Features Tables

#### `follows`

User following relationships.

- **Key Fields**: id, followerId, followingId, followType, targetId
- **Constraints**: No self-following, unique combination

#### `likes`

Likes on content (bobbleheads, collections, comments).

- **Key Fields**: id, userId, targetId, targetType, createdAt
- **TargetType**: 'bobblehead' | 'collection' | 'comment'
- **Indexes**: 10 indexes including partial indexes for each content type
- **Constraints**: Unique (userId, targetType, targetId) - one like per user per content

#### `comments`

Comments on content.

- **Key Fields**: id, userId, targetId, targetType, content, isDeleted, likeCount
- **Relationships**: Self-referencing for nested comments (parentCommentId)
- **Metrics**: likeCount, editCount
- **Timestamps**: createdAt, editedAt, deletedAt
- **Indexes**: 9 indexes for comment threads and content queries

---

### 4. Moderation & Content Reports

#### `content_reports`

User reports of content violations.

- **Key Fields**: id, reporterId, moderatorId, targetId, targetType, status, reason
- **Reason Enum**: Specific violation types (e.g., offensive_content, spam, copyright)
- **Status Enum**: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
- **TargetType**: 'bobblehead' | 'collection' | 'subcollection' | 'comment' | 'user'
- **Fields**:
  - `description`: Reporter's explanation (max 1000 chars)
  - `moderatorNotes`: Moderator's notes (max 1000 chars)
  - `resolvedAt`: Timestamp when report was closed
- **Indexes**: 8 indexes for filtering, status tracking, and moderator queue
- **Relationships**:
  - reporterId -> users (cascade delete)
  - moderatorId -> users (set null on delete)
- **Use Case**: Admin reports page uses this for content moderation dashboard

---

### 5. Featured Content & System Tables

#### `featured_content`

Curated featured content for homepage.

- **Key Fields**: id, contentId, contentType, featureType, isActive, sortOrder, priority
- **Metadata**: title, description, imageUrl, curatorNotes, curatorId
- **Scheduling**: startDate, endDate, viewCount
- **Indexes**: 14 indexes for active content, feature type, and date range queries

#### `platform_settings`

Global platform configuration.

- **Key Fields**: id, key (unique), value, valueType, isPublic
- **Metadata**: description, updatedBy, createdAt, updatedAt

#### `notifications`

In-app and email notifications.

- **Key Fields**: id, userId, type, title, message, isRead, createdAt, readAt
- **Related**: relatedType, relatedId, relatedUserId
- **Metadata**: actionUrl
- **Indexes**: 8 indexes for user queries and read status

#### `content_metrics`

Analytics data for content performance.

- **Key Fields**: id, contentId, contentType, metricType, date, metricValue
- **Metadata**: metadata (JSONB)
- **Indexes**: 7 indexes for content analysis and time-series queries

---

### 6. Analytics Tables

#### `content_views`

View tracking for analytics.

- **Key Fields**: id, viewerId, targetId, targetType, viewedAt
- **Environment**: ipAddress, userAgent, referrerUrl
- **Metrics**: viewDuration (in seconds)
- **Indexes**: 6 indexes for view analysis and time-series data

#### `search_queries`

Search analytics.

- **Key Fields**: id, userId, query, searchedAt, resultCount
- **Metadata**: filters (JSONB), sessionId, clickedResultId, clickedResultType
- **Indexes**: 6 indexes for search analytics

---

### 7. Launch & Growth Tables

#### `launch_notifications`

Email signup list for pre-launch.

- **Key Fields**: id, email (unique), createdAt, notifiedAt
- **Purpose**: Early access list and launch notification management

---

## Key Relationships & Constraints

### Cascade Delete

- Users deletion cascades to: user_sessions, login_history, user_settings, notification_settings, user_blocks (both directions), user_activity, collections, likes, comments, follows, contentReports (as reporter), search_queries, content_views, bobbleheads, tags, content_metrics

### Set Null on Delete

- contentReports.moderatorId (moderator can be deleted)
- featured_content.curatorId (curator can be deleted)
- platform_settings.updatedBy (user can be deleted)

---

## Common Query Patterns

### Admin Reports Page

Uses `content_reports` with complex LEFT JOINs to fetch:

- Report metadata
- Reported content details (slug, existence check)
- Reporter & moderator info
- Comment content (if comment report)

**Key Query**: `getAllReportsWithSlugsForAdminAsync` in `ContentReportsQuery` class

- Joins: bobbleheads, collections, subCollections, comments, users (left joins)
- Filters: status, targetType, reason, dateFrom, dateTo, reporterId, moderatorId
- Pagination: offset/limit
- Ordering: created_at DESC

### Featured Content

**Key Query**: Get active featured content by type

- Filters: isActive = true, within date range, by feature type
- Ordering: sortOrder, priority
- Pagination: Common in homepage display

### User Profiles & Collections

**Key Queries**:

- Get user with settings and stats
- Get user's collections with item counts
- Get collection's bobbleheads with photos and tags

### Search & Browse

**Key Queries**:

- Full-text search on content (name, description using GIN trigram indexes)
- Filter by category, status, public/private
- Sort by popularity (likeCount, viewCount), recency, featured status

---

## Enums & Constants

### Content Report Reason

- Offensive content
- Spam
- Copyright violation
- Misinformation
- Impersonation
- Other

### Content Report Status

- pending (initial state)
- reviewed (moderator has reviewed)
- resolved (action taken)
- dismissed (no violation found)

### User Role

- admin
- moderator
- user

### Privacy Levels

- private
- friends_only
- public

---

## Performance Considerations

### Indexes Strategy

1. **Single Column Indexes**: Fast lookups on common filters (status, userId, isPublic, etc.)
2. **Composite Indexes**: Multi-condition queries (e.g., userId + status)
3. **Covering Indexes**: Include all fields needed without table access
4. **Partial Indexes**: Filter on specific conditions to reduce size
5. **GIN Trigram Indexes**: Full-text search on text fields (name, description, bio)
6. **Text Search Indexes**: Using gin_trgm_ops for fuzzy matching

### Query Optimization Tips

1. Always use indexed columns in WHERE clauses
2. Join tables on indexed columns
3. Use LIMIT for pagination (avoid full table scans)
4. Leverage covering indexes for list queries
5. Use partial indexes for filtered views (e.g., isPublic = true)

---

## Database Files Structure

- **Schema Files**: `/src/lib/db/schema/*.schema.ts`
- **Query Classes**: `/src/lib/queries/*/`
- **Facades**: `/src/lib/facades/*/`
- **Validations**: `/src/lib/validations/*.validation.ts`
- **Migrations**: `/src/lib/db/migrations/` (Drizzle managed)
