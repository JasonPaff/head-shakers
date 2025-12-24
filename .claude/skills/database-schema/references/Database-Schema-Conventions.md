# Database Schema Conventions

## Overview

The project uses Drizzle ORM with PostgreSQL (Neon serverless). Schema definitions follow strict conventions for consistency, performance, and maintainability.

## File Structure

```
src/lib/db/schema/
├── index.ts              # Re-exports all tables
├── relations.schema.ts   # Drizzle relations definitions
├── {domain}.schema.ts    # Domain-specific tables
```

## Table Definition Template

```typescript
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { relatedTable } from '@/lib/db/schema/related.schema';

export const tableName = pgTable(
  'table_name',
  {
    // Columns (alphabetically ordered)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'), // Soft delete - null means not deleted
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: SCHEMA_LIMITS.ENTITY.NAME.MAX }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // 1. Check constraints (data validation)
    check('table_name_constraint', sql`...`),

    // 2. Single column indexes
    index('table_name_column_idx').on(table.column),

    // 3. Composite indexes
    index('table_name_col1_col2_idx').on(table.col1, table.col2),

    // 4. Covering indexes (for common queries)
    index('table_name_covering_idx').on(table.col1, table.col2, table.col3),

    // 5. GIN indexes (for search)
    index('table_name_search_idx').using('gin', sql`${table.name} gin_trgm_ops`),

    // 6. Unique indexes
    uniqueIndex('table_name_unique').on(table.col1, table.col2),
  ],
);
```

## Column Conventions

### Standard Columns (Every Table)

```typescript
// Primary key - always UUID with defaultRandom
id: uuid('id').primaryKey().defaultRandom(),

// Timestamps - always present
createdAt: timestamp('created_at').defaultNow().notNull(),
updatedAt: timestamp('updated_at').defaultNow().notNull(),
```

### Soft Delete Column

```typescript
// For entities that support soft delete (null = not deleted, timestamp = when deleted)
deletedAt: timestamp('deleted_at'),
```

**Note:** The project uses only `deletedAt` timestamp for soft deletes (not a separate boolean flag). Query filters check `isNull(deletedAt)` to find non-deleted records.

### Counter Columns

```typescript
// Social/engagement counters
likeCount: integer('like_count').default(DEFAULTS.ENTITY.LIKE_COUNT).notNull(),
viewCount: integer('view_count').default(DEFAULTS.ENTITY.VIEW_COUNT).notNull(),
commentCount: integer('comment_count').default(DEFAULTS.ENTITY.COMMENT_COUNT).notNull(),
```

### Visibility Columns

```typescript
// Public/featured flags
isPublic: boolean('is_public').default(DEFAULTS.ENTITY.IS_PUBLIC).notNull(),
isFeatured: boolean('is_featured').default(DEFAULTS.ENTITY.IS_FEATURED).notNull(),
```

### String Columns

```typescript
// Always use SCHEMA_LIMITS for length
name: varchar('name', { length: SCHEMA_LIMITS.ENTITY.NAME.MAX }).notNull(),
description: varchar('description', { length: SCHEMA_LIMITS.ENTITY.DESCRIPTION.MAX }),
slug: varchar('slug', { length: SLUG_MAX_LENGTH }).notNull().unique(),
```

### Numeric Columns

```typescript
// Decimal with precision/scale from constants
purchasePrice: decimal('purchase_price', {
  mode: 'number',
  precision: SCHEMA_LIMITS.ENTITY.PRICE.PRECISION,
  scale: SCHEMA_LIMITS.ENTITY.PRICE.SCALE,
}),

// Integer with position/order
sortOrder: integer('sort_order').default(DEFAULTS.ENTITY.SORT_ORDER).notNull(),
```

### JSON Columns

```typescript
// Typed JSON columns
customFields: jsonb('custom_fields').$type<CustomFieldsType>(),
```

## Foreign Key Patterns

### Cascade Delete (Parent Owns Child)

```typescript
// When parent is deleted, delete all children
collectionId: uuid('collection_id')
  .references(() => collections.id, { onDelete: 'cascade' })
  .notNull(),
```

### Set Null (Optional Relationship)

```typescript
// When parent is deleted, set reference to null
subcollectionId: uuid('sub_collection_id')
  .references(() => subCollections.id, { onDelete: 'set null' }),
```

### Restrict (Prevent Orphans)

```typescript
// Prevent deletion if children exist
categoryId: uuid('category_id')
  .references(() => categories.id, { onDelete: 'restrict' })
  .notNull(),
```

## Check Constraints

### Numeric Range Validation

```typescript
// Year range
check(
  'entity_year_range',
  sql`${table.year} IS NULL OR (${table.year} >= 1800 AND ${table.year} <= EXTRACT(YEAR FROM NOW()) + 5)`,
),

// Positive values
check('entity_price_positive', sql`${table.price} IS NULL OR ${table.price} >= 0`),
check('entity_height_positive', sql`${table.height} IS NULL OR ${table.height} > 0`),

// Non-negative counters
check(
  'entity_counts_non_negative',
  sql`${table.likeCount} >= 0 AND ${table.viewCount} >= 0 AND ${table.commentCount} >= 0`,
),
```

### String Validation

```typescript
// Non-empty required string
check('entity_name_not_empty', sql`length(trim(${table.name})) > 0`),
```

### Date Logic

```typescript
// Created before updated
check('entity_dates_logic', sql`${table.createdAt} <= ${table.updatedAt}`),
```

### Dimension Validation

```typescript
// Positive dimensions when present
check(
  'photos_dimensions_positive',
  sql`(${table.width} IS NULL OR ${table.width} > 0) AND (${table.height} IS NULL OR ${table.height} > 0)`,
),
```

## Index Strategy

### Single Column Indexes

```typescript
// For columns frequently used in WHERE clauses
index('entity_category_idx').on(table.category),
index('entity_user_id_idx').on(table.userId),
index('entity_is_public_idx').on(table.isPublic),
index('entity_status_idx').on(table.status),
index('entity_created_at_idx').on(table.createdAt),
```

### Composite Indexes

```typescript
// For multi-column WHERE conditions
index('entity_collection_public_idx').on(table.collectionId, table.isPublic),
index('entity_user_created_idx').on(table.userId, table.createdAt),
index('entity_public_featured_idx').on(table.isPublic, table.isFeatured),
```

### Covering Indexes

```typescript
// Include all columns needed for common queries to avoid table lookups
index('entity_listing_covering_idx').on(
  table.userId,
  table.isPublic,
  table.id,
  table.name,
  table.createdAt,
  table.likeCount,
  table.viewCount,
  table.commentCount,
),
```

### Descending Indexes (for ORDER BY)

```typescript
// For queries with ORDER BY ... DESC
index('entity_user_created_desc_idx').on(table.userId, sql`${table.createdAt} DESC`),
index('entity_public_created_desc_idx').on(table.isPublic, sql`${table.createdAt} DESC`),
```

### GIN Indexes (for Text Search)

```typescript
// Trigram search (requires pg_trgm extension)
index('entity_name_search_idx').using('gin', sql`${table.name} gin_trgm_ops`),
index('entity_description_search_idx').using('gin', sql`${table.description} gin_trgm_ops`),

// JSONB indexes
index('entity_custom_fields_gin_idx').using('gin', table.customFields),
index('entity_custom_fields_path_idx').using('gin', sql`(${table.customFields} jsonb_path_ops)`),
```

### Unique Indexes

```typescript
// For unique constraints on multiple columns
uniqueIndex('entity_tags_unique').on(table.entityId, table.tagId),
```

## Junction Tables (Many-to-Many)

```typescript
export const entityTags = pgTable(
  'entity_tags',
  {
    createdAt: timestamp('created_at').defaultNow().notNull(),
    entityId: uuid('entity_id')
      .references(() => entities.id, { onDelete: 'cascade' })
      .notNull(),
    id: uuid('id').primaryKey().defaultRandom(),
    tagId: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // Single column indexes
    index('entity_tags_entity_id_idx').on(table.entityId),
    index('entity_tags_tag_id_idx').on(table.tagId),

    // Unique constraint on the pair
    uniqueIndex('entity_tags_unique').on(table.entityId, table.tagId),
  ],
);
```

## Column Naming

| Pattern         | Example                  | Use Case               |
| --------------- | ------------------------ | ---------------------- |
| `snake_case`    | `created_at`             | All database columns   |
| `{entity}Id`    | `collectionId`           | Foreign key references |
| `is{Adjective}` | `isPublic`, `isFeatured` | Boolean flags          |
| `{noun}Count`   | `likeCount`, `viewCount` | Counter columns        |
| `{noun}At`      | `createdAt`, `deletedAt` | Timestamp columns      |

## Constants Usage

Always use constants from `@/lib/constants`:

```typescript
import { DEFAULTS, SCHEMA_LIMITS } from '@/lib/constants';
import { SLUG_MAX_LENGTH } from '@/lib/constants/slug';

// Length limits
varchar('name', { length: SCHEMA_LIMITS.ENTITY.NAME.MAX })
  // Defaults
  .default(DEFAULTS.ENTITY.IS_PUBLIC)
  .default(DEFAULTS.ENTITY.LIKE_COUNT);
```

## Anti-Patterns to Avoid

1. **Never hardcode lengths** - Use `SCHEMA_LIMITS` constants
2. **Never hardcode defaults** - Use `DEFAULTS` constants
3. **Never skip timestamps** - Always include `createdAt`, `updatedAt`
4. **Never use auto-increment** - Use UUID primary keys
5. **Never skip indexes** - Index all foreign keys and filter columns
6. **Never cascade delete without consideration** - Choose appropriate delete behavior
7. **Never skip check constraints** - Validate data at database level
8. **Never use `text` type** - Use `varchar` with explicit length
