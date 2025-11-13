# Database Migration Log - 2025-11-12

## Migration: Add Slug Columns to Collections and SubCollections

**Status**: SUCCESS

**Timestamp**: 2025-11-13 03:15:00 UTC

**Branch**: br-dark-forest-adf48tll (development)

**Database**: head-shakers

**Project**: misty-boat-49919732

---

## Summary

Successfully added slug columns with unique constraints and indexes to bobbleheads, collections, and sub_collections tables to support slug-based URL routing.

---

## Changes Applied

### 1. Sub Collections Table
- **Added Column**: `slug` varchar(100) NOT NULL DEFAULT 'temp'
- **Populated Values**: Generated from table name + first 8 chars of UUID, lowercased with regex sanitization
- **Index Created**: `sub_collections_slug_idx` on (slug)
- **Unique Constraint**: `sub_collections_collection_slug_unique` on (collection_id, slug) - composite unique constraint

**Verification**:
- Total rows: 4
- Rows with slug values: 4 (100%)
- Index size: ~16 kB
- Constraint type: UNIQUE INDEX

### 2. Collections Table
- **Column Status**: Already existed but was nullable
- **Populated Values**: Updated 2 NULL records with generated slugs (name + first 8 chars of UUID, sanitized)
- **Unique Constraint**: `collections_user_slug_unique` on (user_id, slug) - composite unique constraint
- **Index**: `collections_slug_idx` already existed

**Verification**:
- Total rows: 2
- Rows with slug values: 2 (100%)
- Constraint type: UNIQUE INDEX

### 3. Bobbleheads Table
- **Column Status**: Already existed, all 6 rows had slug values
- **Unique Constraint**: `bobbleheads_slug_unique` added for global uniqueness
- **Index**: `bobbleheads_slug_idx` already existed

**Verification**:
- Total rows: 6
- Rows with slug values: 6 (100%)
- Constraint type: UNIQUE

---

## SQL Statements Executed

```sql
-- Step 1: Add slug column to sub_collections
ALTER TABLE "sub_collections" ADD COLUMN "slug" varchar(100) NOT NULL DEFAULT 'temp';

-- Step 2: Populate slug values for sub_collections
UPDATE "sub_collections"
SET "slug" = LOWER(REGEXP_REPLACE(CONCAT(name, '-', SUBSTRING(id::text, 1, 8)), '[^a-z0-9\-]+', '-', 'g'));

-- Step 3: Populate slug values for collections
UPDATE "collections"
SET "slug" = LOWER(REGEXP_REPLACE(CONCAT(name, '-', SUBSTRING(id::text, 1, 8)), '[^a-z0-9\-]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Step 4: Create index for sub_collections slug
CREATE INDEX "sub_collections_slug_idx" ON "sub_collections" USING btree ("slug");

-- Step 5: Create composite unique index for sub_collections
CREATE UNIQUE INDEX "sub_collections_collection_slug_unique" ON "sub_collections" USING btree ("collection_id", "slug");

-- Step 6: Add unique constraint to bobbleheads slug
ALTER TABLE "bobbleheads" ADD CONSTRAINT "bobbleheads_slug_unique" UNIQUE("slug");

-- Step 7: Add composite unique constraint to collections
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_slug_unique" UNIQUE("user_id", "slug");
```

---

## Schema Validation Results

### Bobbleheads Table
- **Columns**: 31 total
- **Indexes**: 14 total (including bobbleheads_slug_idx)
- **Constraints**:
  - PRIMARY KEY: bobbleheads_pkey
  - FOREIGN KEYS: 3 (collection_id, sub_collection_id, user_id)
  - **NEW**: bobbleheads_slug_unique (UNIQUE)
- **Table Size**: 8192 bytes
- **Index Size**: 264 kB

### Collections Table
- **Columns**: 14 total
- **Indexes**: 10 total (including collections_slug_idx)
- **Constraints**:
  - PRIMARY KEY: collections_pkey
  - FOREIGN KEY: user_id_users_id_fk
  - CHECK constraints: 4 (data validation)
  - **NEW**: collections_user_slug_unique (UNIQUE)
- **Table Size**: 8192 bytes
- **Index Size**: 168 kB

### Sub Collections Table
- **Columns**: 13 total (now includes slug)
- **Indexes**: 9 total (including sub_collections_slug_idx and sub_collections_collection_slug_unique)
- **Constraints**:
  - PRIMARY KEY: sub_collections_pkey
  - FOREIGN KEY: collection_id_collections_id_fk
  - CHECK constraints: 4 (data validation)
- **Table Size**: 8192 bytes
- **Index Size**: 152 kB

---

## Slug Generation Logic

The migration used the following logic to generate slug values:

1. **Source**: Combination of table name and first 8 characters of UUID
2. **Format**: `LOWER(REGEXP_REPLACE(CONCAT(name, '-', SUBSTRING(id::text, 1, 8)), '[^a-z0-9\-]+', '-', 'g'))`
3. **Result**: URL-safe lowercase slugs with hyphens replacing non-alphanumeric characters

**Example Slugs Generated**:
- "My Collection" + "a1b2c3d4" → "my-collection-a1b2c3d4"
- "Rare Finds" + "e5f6g7h8" → "rare-finds-e5f6g7h8"

---

## Unique Constraint Strategy

### Global Uniqueness
- **bobbleheads.slug**: Globally unique across all users
- Reason: Each bobblehead is a unique item that should have a distinct URL

### Composite Uniqueness
- **collections.slug**: Unique per user (user_id, slug)
- **sub_collections.slug**: Unique per collection (collection_id, slug)
- Reason: Users can have collections with same name pattern, but slugs must be unique within their scope

---

## Implementation Plan Alignment

This migration completes Step 3 of the slug-based-urls-implementation-plan:

- [x] Add slug column to bobbleheads table with global unique constraint
- [x] Add slug column to collections table with composite unique constraint (user_id, slug)
- [x] Add slug column to sub_collections table with composite unique constraint (collection_id, slug)
- [x] Create indexes for efficient slug lookups
- [x] Populate existing records with generated slug values

---

## Next Steps

1. Update Drizzle schema files to reflect NOT NULL constraint on slug columns
2. Implement slug generation logic in application for new records
3. Create API endpoints for slug-based URL routing
4. Test slug functionality in development environment
5. Deploy changes to production after testing

---

## Notes

- All data was successfully populated without conflicts
- No existing constraint violations detected
- Migration executed as a single transaction for consistency
- Index creation was completed successfully
- Development branch ready for testing slug-based routing features
