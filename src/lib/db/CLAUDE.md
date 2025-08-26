# Database Layer (`src/lib/db/`)

The database layer uses Drizzle ORM with PostgreSQL to provide type-safe, performant data operations for the Head Shakers platform. The schema is designed around bobblehead collecting with comprehensive social and analytics features.

## Database Architecture

### Technology Stack
- **PostgreSQL** via Neon Database for production reliability
- **Drizzle ORM** for type-safe database operations
- **Drizzle Kit** for migration management
- **Connection pooling** for performance optimization

### Schema Organization

```
db/
├── index.ts          # Database connection configuration
└── schema/           # Schema definitions and relationships
    ├── analytics.ts  # Tracking and metrics tables
    ├── bobbleheads.ts # Core bobblehead entities
    ├── collections.ts # Collection management
    ├── moderations.ts # Content moderation system
    ├── relations.ts   # Table relationships
    ├── socials.ts     # Social features (likes, follows, comments)
    ├── systems.ts     # System configuration and features
    ├── tags.ts        # Tagging and categorization
    └── users.ts       # User profiles and settings
```

## Core Domain Models

### Collections & Bobbleheads

#### Collections (`collections.ts`)
Primary organization structure for bobblehead items:

```sql
-- Core collection structure
collections (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  name: varchar(100) NOT NULL,
  description: text,
  is_public: boolean DEFAULT true,
  total_items: integer DEFAULT 0,
  total_value: decimal(15,2) DEFAULT 0.00,
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

#### Sub-Collections (`collections.ts`)
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
  cover_image_url: text
)
```

#### Bobbleheads (`bobbleheads.ts`)  
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

#### Bobblehead Photos (`bobbleheads.ts`)
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

### User Management

#### Users (`users.ts`)
Core user profiles with extensive customization:

```sql
users (
  id: uuid PRIMARY KEY,
  clerk_id: varchar(100) UNIQUE NOT NULL,
  username: varchar(50) UNIQUE,
  email: varchar(255) UNIQUE NOT NULL,
  first_name: varchar(100),
  last_name: varchar(100),
  display_name: varchar(100),
  bio: text,
  profile_image_url: text,
  banner_image_url: text,
  location: varchar(100),
  website_url: text,
  social_links: jsonb,
  is_verified: boolean DEFAULT false,
  is_premium: boolean DEFAULT false,
  is_private: boolean DEFAULT false,
  follower_count: integer DEFAULT 0,
  following_count: integer DEFAULT 0,
  collection_count: integer DEFAULT 0,
  total_bobbleheads: integer DEFAULT 0,
  join_date: timestamp DEFAULT NOW(),
  last_active_at: timestamp,
  email_verified_at: timestamp,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

#### User Settings & Preferences
- **User Settings** (`user_settings`) - Display preferences, privacy
- **Notification Settings** (`notification_settings`) - Email/push preferences
- **User Sessions** (`user_sessions`) - Active session tracking
- **Login History** (`login_history`) - Security audit trail

### Social Features

#### Social Interactions (`socials.ts`)

**Follows System:**
```sql
follows (
  id: uuid PRIMARY KEY,
  follower_id: uuid REFERENCES users(id),
  following_id: uuid REFERENCES users(id),
  created_at: timestamp DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
)
```

**Likes System:**
```sql
likes (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  likeable_type: varchar(50) NOT NULL,
  likeable_id: uuid NOT NULL,
  created_at: timestamp DEFAULT NOW(),
  UNIQUE(user_id, likeable_type, likeable_id)
)
```

**Comments System:**
```sql
comments (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  commentable_type: varchar(50) NOT NULL,
  commentable_id: uuid NOT NULL,
  parent_comment_id: uuid REFERENCES comments(id),
  content: text NOT NULL,
  like_count: integer DEFAULT 0,
  reply_count: integer DEFAULT 0,
  is_edited: boolean DEFAULT false,
  is_deleted: boolean DEFAULT false,
  created_at: timestamp DEFAULT NOW(),
  updated_at: timestamp DEFAULT NOW()
)
```

**User Blocks:**
```sql
user_blocks (
  id: uuid PRIMARY KEY,
  blocker_id: uuid REFERENCES users(id),
  blocked_id: uuid REFERENCES users(id),
  reason: varchar(255),
  created_at: timestamp DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
)
```

### Analytics & Tracking

#### Analytics Tables (`analytics.ts`)

**Content Views:**
```sql
content_views (
  id: uuid PRIMARY KEY,
  viewer_id: uuid REFERENCES users(id),
  viewable_type: varchar(50) NOT NULL,
  viewable_id: uuid NOT NULL,
  ip_address: varchar(45),
  user_agent: text,
  referrer: text,
  viewed_at: timestamp DEFAULT NOW()
)
```

**Search Analytics:**
```sql
search_queries (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  query_text: varchar(500) NOT NULL,
  result_count: integer,
  filters_used: jsonb,
  query_time_ms: integer,
  clicked_result_id: uuid,
  clicked_result_type: varchar(50),
  searched_at: timestamp DEFAULT NOW()
)
```

### System Features

#### System Tables (`systems.ts`)

**Featured Content:**
```sql
featured_content (
  id: uuid PRIMARY KEY,
  content_type: varchar(50) NOT NULL,
  content_id: uuid NOT NULL,
  title: varchar(255),
  description: text,
  curator_id: uuid REFERENCES users(id),
  priority: integer DEFAULT 0,
  start_date: timestamp,
  end_date: timestamp,
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT NOW()
)
```

**Notifications:**
```sql
notifications (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  type: varchar(50) NOT NULL,
  title: varchar(255) NOT NULL,
  message: text NOT NULL,
  related_user_id: uuid REFERENCES users(id),
  related_content_type: varchar(50),
  related_content_id: uuid,
  action_url: text,
  is_read: boolean DEFAULT false,
  created_at: timestamp DEFAULT NOW(),
  read_at: timestamp
)
```

### Moderation System

#### Content Moderation (`moderations.ts`)

**Content Reports:**
```sql
content_reports (
  id: uuid PRIMARY KEY,
  reporter_id: uuid REFERENCES users(id),
  content_type: varchar(50) NOT NULL,
  content_id: uuid NOT NULL,
  reason: varchar(100) NOT NULL,
  description: text,
  status: varchar(20) DEFAULT 'pending',
  moderator_id: uuid REFERENCES users(id),
  moderator_notes: text,
  action_taken: varchar(50),
  resolved_at: timestamp,
  created_at: timestamp DEFAULT NOW()
)
```

## Database Design Principles

### Performance Optimization

**Strategic Indexing:**
- **Single column indexes** on frequently queried fields
- **Composite indexes** for multi-column queries
- **Partial indexes** for filtered queries
- **Covering indexes** to avoid table lookups

**Query Optimization:**
- **Proper foreign key relationships** with cascade operations
- **Aggregate counters** to avoid expensive COUNT queries
- **Materialized views** for complex reporting (planned)
- **Connection pooling** for concurrent access

### Data Integrity

**Constraints:**
- **Foreign key constraints** maintain referential integrity
- **Check constraints** enforce business rules
- **Unique constraints** prevent duplicate data
- **Not null constraints** on required fields

**Validation:**
- **Length constraints** on text fields
- **Numeric range constraints** on values
- **Enum-like constraints** via check constraints
- **JSON schema validation** for JSONB fields

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
- **JSONB fields** for extensible metadata
- **Custom fields** for specialized use cases
- **Dynamic configuration** via system tables
- **Version compatibility** through migrations

## Relationship Architecture

### Core Entity Relationships
The `relations.ts` file defines comprehensive type-safe relationships:

- **Users** → Collections, Bobbleheads, Social interactions
- **Collections** → Sub-collections, Bobbleheads, User ownership
- **Bobbleheads** → Photos, Tags, Comments, Likes
- **Social** → Bidirectional follows, polymorphic likes/comments

### Polymorphic Relationships
Several tables use polymorphic patterns for flexibility:
- **Likes** can target any content type (bobbleheads, comments, collections)
- **Comments** can be attached to any commentable entity  
- **Content Views** track views across different content types
- **Featured Content** can highlight any type of content

## Migration Strategy

### Schema Evolution
- **Drizzle Kit** manages schema migrations
- **Version-controlled** migration files
- **Rollback capabilities** for production safety
- **Seed data** for development environments

### Development Workflow
```bash
# Generate migration from schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# Reset development database
bun run db:reset
```

This database architecture provides a robust foundation for the bobblehead collection platform with excellent performance, data integrity, and room for future growth.