# Database Layer (`src/lib/db/`)

The database layer uses Drizzle ORM with PostgreSQL to provide type-safe, performant data operations for the Head Shakers platform. The schema is designed around bobblehead collecting with comprehensive social and analytics features.

## Database Architecture

### Technology Stack
- **PostgreSQL** via Neon Database for production reliability
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for migration management
- **Connection pooling** for performance optimization

### Directory Structure

```
db/
├── index.ts                   # Database connection and config
├── migrations/                # Database migration files
│   └── meta/                  # Migration metadata
│       └── _journal.json      # Migration history
├── scripts/                   # Database utilities
│   ├── reset-db.ts            # Database reset utility
│   └── seed.ts                # Development seed data
└── schema/                    # Drizzle schema definitions
    ├── analytics.schema.ts    # Analytics and tracking
    ├── bobbleheads.schema.ts  # Core bobblehead entities
    ├── collections.schema.ts  # Collection structures
    ├── moderation.schema.ts   # Content moderation
    ├── relations.schema.ts    # Table relationships
    ├── social.schema.ts       # Social features
    ├── system.schema.ts       # System configuration
    ├── tags.schema.ts         # Tagging system
    ├── users.schema.ts        # User profiles and settings
    └── index.ts               # Schema exports
```

## Core Domain Models

### Collections & Bobbleheads

#### Collections (`collections.schema.ts`)
Primary organization structure for bobblehead items:

```sql
collections (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  name: varchar(100) NOT NULL,
  description: text,
  is_public: boolean DEFAULT true,
  total_items: integer DEFAULT 0,
  total_value: decimal(15,2) DEFAULT '0.00',
  cover_image_url: text,
  last_item_added_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

**Key Features:**
- **Automatic aggregation** of item counts and values
- **Public/private visibility** controls
- **Cover image** support via Cloudinary
- **Activity tracking** with last item added timestamp
- **Performance indexes** on user_id, is_public, updated_at
- **Check constraints** for data validation

#### Sub-Collections (`collections.schema.ts`)
Organizational structure within collections:

```sql
sub_collections (
  id: uuid PRIMARY KEY,
  collection_id: uuid REFERENCES collections(id),
  name: varchar(100) NOT NULL,
  description: text,
  sort_order: integer DEFAULT 0,
  item_count: integer DEFAULT 0,
  is_public: boolean DEFAULT true,
  cover_image_url: text,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

#### Bobbleheads (`bobbleheads.schema.ts`)  
Core item tracking with comprehensive metadata:

```sql
bobbleheads (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  collection_id: uuid REFERENCES collections(id),
  sub_collection_id: uuid REFERENCES sub_collections(id),
  name: varchar(200) NOT NULL,
  description: text,
  category: varchar(50),
  character_name: varchar(100),
  manufacturer: varchar(100),
  series: varchar(100),
  year: integer,
  height: decimal(5,2),
  weight: decimal(6,2),
  material: varchar(100),
  current_condition: varchar(20) DEFAULT 'excellent',
  status: varchar(20) DEFAULT 'owned',
  purchase_price: decimal(10,2),
  purchase_location: varchar(100),
  acquisition_method: varchar(50),
  acquisition_date: timestamp,
  custom_fields: jsonb,
  is_public: boolean DEFAULT true,
  is_featured: boolean DEFAULT false,
  view_count: integer DEFAULT 0,
  like_count: integer DEFAULT 0,
  comment_count: integer DEFAULT 0,
  is_deleted: boolean DEFAULT false,
  deleted_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

**Advanced Features:**
- **Custom fields** via JSONB for specialized tracking
- **Soft deletes** with deleted_at timestamp  
- **Engagement metrics** (views, likes, comments)
- **Rich metadata** for detailed cataloging
- **Comprehensive indexing** for search and filtering

#### Bobblehead Photos (`bobbleheads.schema.ts`)
Image management with metadata:

```sql
bobblehead_photos (
  id: uuid PRIMARY KEY,
  bobblehead_id: uuid REFERENCES bobbleheads(id),
  url: text NOT NULL,
  alt_text: varchar(255),
  caption: text,
  sort_order: integer DEFAULT 0,
  is_primary: boolean DEFAULT false,
  width: integer,
  height: integer,
  file_size: integer,
  uploaded_at: timestamp DEFAULT NOW()
)
```

#### Bobblehead Tags (`bobbleheads.schema.ts`)
Many-to-many relationship for tagging:

```sql
bobblehead_tags (
  id: uuid PRIMARY KEY,
  bobblehead_id: uuid REFERENCES bobbleheads(id),
  tag_id: uuid REFERENCES tags(id),
  created_at: timestamp DEFAULT NOW(),
  UNIQUE(bobblehead_id, tag_id)
)
```

### User Management

#### Users (`users.schema.ts`)
Core user profiles with Clerk integration:

```sql
users (
  id: uuid PRIMARY KEY,
  clerk_id: varchar(255) UNIQUE NOT NULL,
  username: varchar(50) UNIQUE NOT NULL,
  email: varchar(255) UNIQUE NOT NULL,
  display_name: varchar(100) NOT NULL,
  bio: varchar(500),
  avatar_url: varchar(100),
  location: varchar(100),
  is_verified: boolean DEFAULT false,
  is_deleted: boolean DEFAULT false,
  failed_login_attempts: integer DEFAULT 0,
  last_active_at: timestamp,
  last_failed_login_at: timestamp,
  locked_until: timestamp,
  member_since: timestamp DEFAULT NOW(),
  deleted_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

#### User Settings (`users.schema.ts`)
Comprehensive user preferences:

```sql
user_settings (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id) UNIQUE,
  profile_visibility: privacy_level DEFAULT 'public',
  allow_comments: comment_permission DEFAULT 'anyone',
  allow_direct_messages: dm_permission DEFAULT 'followers',
  show_collection_stats: boolean DEFAULT true,
  show_collection_value: boolean DEFAULT false,
  show_join_date: boolean DEFAULT true,
  show_last_active: boolean DEFAULT false,
  show_location: boolean DEFAULT false,
  show_real_name: boolean DEFAULT false,
  moderate_comments: boolean DEFAULT false,
  theme: theme DEFAULT 'light',
  language: varchar(10) DEFAULT 'en',
  timezone: varchar(50) DEFAULT 'UTC',
  currency: varchar(10) DEFAULT 'USD',
  default_item_privacy: varchar(20) DEFAULT 'public',
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

#### Notification Settings (`users.schema.ts`)
Granular notification preferences:

```sql
notification_settings (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id) UNIQUE,
  email_new_comments: boolean DEFAULT true,
  email_new_followers: boolean DEFAULT true,
  email_new_likes: boolean DEFAULT true,
  email_platform_updates: boolean DEFAULT true,
  email_weekly_digest: boolean DEFAULT true,
  in_app_new_comments: boolean DEFAULT true,
  in_app_new_followers: boolean DEFAULT true,
  in_app_new_likes: boolean DEFAULT true,
  in_app_following_updates: boolean DEFAULT true,
  push_new_comments: boolean DEFAULT true,
  push_new_followers: boolean DEFAULT true,
  push_new_likes: boolean DEFAULT false,
  digest_frequency: digest_frequency DEFAULT 'weekly',
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

#### Session Management
- **User Sessions** (`user_sessions`) - Active session tracking with device info
- **Login History** (`login_history`) - Security audit trail with device tracking
- **User Activity** (`user_activity`) - Comprehensive activity logging
- **User Blocks** (`user_blocks`) - User blocking system

### Social Features

#### Social Interactions (`social.schema.ts`)

**Follows System:**
```sql
follows (
  id: uuid PRIMARY KEY,
  follower_id: uuid REFERENCES users(id),
  following_id: uuid REFERENCES users(id),
  follow_type: follow_type DEFAULT 'user',
  target_id: uuid,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW(),
  UNIQUE(follower_id, following_id, follow_type, target_id)
)
```

**Likes System:**
```sql
likes (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  target_type: like_target_type NOT NULL,
  target_id: uuid NOT NULL,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
)
```

**Comments System:**
```sql
comments (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  target_type: comment_target_type NOT NULL,
  target_id: uuid NOT NULL,
  parent_comment_id: uuid REFERENCES comments(id),
  content: varchar(5000) NOT NULL,
  like_count: integer DEFAULT 0,
  is_edited: boolean DEFAULT false,
  is_deleted: boolean DEFAULT false,
  edited_at: timestamp,
  deleted_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

### Analytics & Tracking

#### Analytics Tables (`analytics.schema.ts`)

**Content Views:**
```sql
content_views (
  id: uuid PRIMARY KEY,
  viewer_id: uuid REFERENCES users(id),
  target_type: content_views_target_type NOT NULL,
  target_id: uuid NOT NULL,
  ip_address: varchar(45),
  user_agent: varchar(1000),
  referrer_url: varchar(500),
  view_duration: integer,
  viewed_at: timestamp DEFAULT NOW()
)
```

**Search Analytics:**
```sql
search_queries (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  session_id: uuid,
  query: varchar(500) NOT NULL,
  filters: jsonb,
  result_count: integer,
  clicked_result_id: uuid,
  clicked_result_type: result_type,
  ip_address: varchar(45),
  searched_at: timestamp DEFAULT NOW()
)
```

### System Features

#### System Tables (`system.schema.ts`)

**Featured Content:**
```sql
featured_content (
  id: uuid PRIMARY KEY,
  content_type: featured_content_type NOT NULL,
  content_id: uuid NOT NULL,
  feature_type: feature_type NOT NULL,
  title: varchar(255),
  description: text,
  image_url: text,
  curator_id: uuid REFERENCES users(id),
  sort_order: integer DEFAULT 0,
  is_active: boolean DEFAULT true,
  start_date: timestamp,
  end_date: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

**Notifications:**
```sql
notifications (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  type: notification_type NOT NULL,
  title: varchar(255) NOT NULL,
  message: text,
  related_type: notification_related_type,
  related_id: uuid,
  related_user_id: uuid REFERENCES users(id),
  action_url: text,
  is_read: boolean DEFAULT false,
  is_email_sent: boolean DEFAULT false,
  read_at: timestamp,
  created_at: timestamp DEFAULT NOW()
)
```

**Platform Settings:**
```sql
platform_settings (
  id: uuid PRIMARY KEY,
  key: varchar(100) UNIQUE NOT NULL,
  value: text,
  value_type: value_type DEFAULT 'string',
  description: text,
  is_public: boolean DEFAULT false,
  updated_by: uuid REFERENCES users(id),
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

### Moderation System

#### Content Moderation (`moderation.schema.ts`)

**Content Reports:**
```sql
content_reports (
  id: uuid PRIMARY KEY,
  reporter_id: uuid REFERENCES users(id),
  target_type: content_report_target_type NOT NULL,
  target_id: uuid NOT NULL,
  reason: content_report_reason NOT NULL,
  description: varchar(1000),
  status: content_report_status DEFAULT 'pending',
  moderator_id: uuid REFERENCES users(id),
  moderator_notes: varchar,
  resolved_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

### Tagging System

#### Tags (`tags.schema.ts`)
User-created tags for categorization:

```sql
tags (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  name: varchar(50) NOT NULL,
  color: varchar(7) DEFAULT '#3B82F6',
  usage_count: integer DEFAULT 0,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW(),
  UNIQUE(user_id, name)
)
```

## Database Design Principles

### Performance Optimization

**Strategic Indexing:**
- **Single column indexes** on frequently queried fields (user_id, created_at, etc.)
- **Composite indexes** for multi-column queries (user_id + is_public, etc.)
- **Unique indexes** for constraint enforcement
- **Covering indexes** to avoid table lookups

**Query Optimization:**
- **Proper foreign key relationships** with cascade operations
- **Aggregate counters** to avoid expensive COUNT queries
- **Connection pooling** with Neon Database
- **Query timeout configuration** for performance

### Data Integrity

**Constraints:**
- **Foreign key constraints** maintain referential integrity
- **Check constraints** enforce business rules (length limits, non-negative values)
- **Unique constraints** prevent duplicate data
- **Not null constraints** on required fields

**Validation:**
- **Length constraints** on text fields via schema limits
- **Numeric range constraints** on values
- **Enum types** for controlled vocabularies
- **JSONB schema validation** for flexible fields

### Scalability Features

**Soft Deletes:**
- **Preserve data integrity** when content is "deleted"
- **Enable recovery** of accidentally deleted items
- **Maintain foreign key relationships**
- **Filter deleted content** in queries

**Audit Trail:**
- **Created/updated timestamps** on all entities
- **User activity tracking** for behavior analysis
- **Login history** for security monitoring
- **Change tracking** via updated_at triggers

**Flexible Schema:**
- **JSONB fields** for extensible metadata (custom_fields, device_info)
- **Custom fields** for specialized use cases
- **Dynamic configuration** via platform settings
- **Version compatibility** through migrations

## Relationship Architecture

### Core Entity Relationships
The `relations.schema.ts` file defines comprehensive type-safe relationships using Drizzle's relations API:

- **Users** → Collections, Bobbleheads, Social interactions, Settings
- **Collections** → Sub-collections, Bobbleheads, User ownership
- **Bobbleheads** → Photos, Tags, Comments, Likes
- **Social** → Bidirectional follows, polymorphic likes/comments

### Polymorphic Relationships
Several tables use polymorphic patterns for flexibility:
- **Likes** can target bobbleheads, collections, or comments
- **Comments** can be attached to bobbleheads or collections
- **Content Views** track views across different content types
- **Featured Content** can highlight any type of content

## Migration Strategy

### Schema Evolution
- **Drizzle Kit** manages schema migrations automatically
- **Version-controlled** migration files in `migrations/`
- **Snapshot-based** migration system for consistency
- **Rollback capabilities** for production safety

### Development Workflow
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Reset development database (drops all tables)
npm run db:reset

# Seed development data
npm run db:seed

# Fresh database setup (reset + migrate + seed)
npm run db:fresh
```

### Database Scripts

#### Reset Script (`scripts/reset-db.ts`)
- **Complete database reset** by dropping all tables and types
- **Cascade deletion** to handle foreign key dependencies
- **Custom type cleanup** for enum types
- **Safe error handling** with proper exit codes

#### Seed Script (`scripts/seed.ts`)
- **Sample data generation** for development
- **Realistic test data** with proper relationships
- **Aggregate updates** for calculated fields
- **Configurable reset** via environment variables

## Connection Management

### Database Configuration (`index.ts`)
- **Neon Database** connection with serverless pool
- **Connection pooling** for performance optimization
- **Timeout configuration** for queries and transactions
- **Schema integration** with full type safety

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  connectionTimeoutMillis: CONFIG.DATABASE.QUERY_TIMEOUT,
  idleTimeoutMillis: CONFIG.DATABASE.TRANSACTION_TIMEOUT,
  max: CONFIG.DATABASE.CONNECTION_POOL_SIZE,
  maxUses: CONFIG.DATABASE.MAX_USES,
});

export const db = drizzle(pool, { schema });
```

This database architecture provides a robust, type-safe foundation for the Head Shakers bobblehead collection platform with excellent performance, data integrity, comprehensive social features, and room for future growth.
