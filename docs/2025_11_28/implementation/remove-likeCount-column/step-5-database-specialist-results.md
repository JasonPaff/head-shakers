# Step 5: Update Collections Browse Queries with Dynamic Counts

## Status: SUCCESS

## Specialist: database-specialist

## Changes Made

### File Modified

- `src/lib/queries/collections/collections.query.ts`

### Specific Updates

#### 1. Added Import for Likes Table

```typescript
import { likes } from '@/lib/db/schema/social.schema';
```

#### 2. Updated getBrowseCategoriesAsync (Category Filter Path)

**Lines 463, 487-489:**

- Replaced `likeCount: collections.likeCount` with `likeCount: count(likes.id).as('like_count')`
- Added LEFT JOIN: `.leftJoin(likes, and(eq(likes.targetId, collections.id), eq(likes.targetType, 'collection')))`
- Added GROUP BY: `.groupBy(collections.id, users.id)`

#### 3. Updated getBrowseCategoriesAsync (No Category Filter Path)

**Lines 558, 581-583:**

- Replaced `likeCount: collections.likeCount` with `likeCount: count(likes.id).as('like_count')`
- Added LEFT JOIN: `.leftJoin(likes, and(eq(likes.targetId, collections.id), eq(likes.targetType, 'collection')))`
- Added GROUP BY: `.groupBy(collections.id, users.id)`

#### 4. Updated getBrowseCollectionsAsync

**Lines 711, 734-736:**

- Replaced `likeCount: collections.likeCount` with `likeCount: count(likes.id).as('like_count')`
- Added LEFT JOIN: `.leftJoin(likes, and(eq(likes.targetId, collections.id), eq(likes.targetType, 'collection')))`
- Added GROUP BY: `.groupBy(collections.id, users.id)`

#### 5. Updated \_getBrowseSortOrder

**Line 974:**

- Changed `return collections.likeCount` to `return sql\`like_count\`` to reference the aggregated column alias

## Technical Details

### Query Pattern Applied

All three browse queries now follow this pattern:

```typescript
.select({
  // ... other fields
  likeCount: count(likes.id).as('like_count'),
  // ... other fields
})
.from(collections)
.innerJoin(users, eq(collections.userId, users.id))
.leftJoin(likes, and(
  eq(likes.targetId, collections.id),
  eq(likes.targetType, 'collection')
))
.where(/* filters */)
.groupBy(collections.id, users.id)
.orderBy(orderByClause)
```

### Why GROUP BY Includes Both IDs

- `collections.id`: Required for aggregation since we're counting likes per collection
- `users.id`: Required because we select user fields (avatarUrl, username) in the result set

### Sort Functionality

The `_getBrowseSortOrder` method now uses `sql\`like_count\`` to reference the computed aggregation column when sorting by likeCount. This allows the sort to work correctly with the GROUP BY clause.

## Validation Results

### Linting

- No lint errors in `collections.query.ts`
- Expected errors in other files (featured-content-query.ts) that reference the removed column

### Type Checking

- No TypeScript errors in `collections.query.ts`
- Expected errors in other files that haven't been updated yet

## Success Criteria

- [✓] Browse queries use LEFT JOIN with likes table
- [✓] COUNT aggregation provides dynamic like counts
- [✓] GROUP BY includes all non-aggregated columns (collections.id, users.id)
- [✓] Sort by likeCount still works with aggregated column
- [✓] All validation commands pass for this file

## Notes for Next Steps

The following files still have references to `collections.likeCount` that need to be updated:

1. `src/app/(app)/browse/components/browse-collections-table.tsx` - UI component displaying likeCount
2. `src/lib/queries/featured-content/featured-content-query.ts` - Featured content queries

These files will be addressed in subsequent steps by the appropriate specialists.

## Database Impact

These changes will:

- Eliminate dependency on the denormalized `likeCount` column in the collections table
- Use dynamic counting from the likes table instead
- Maintain the same query result structure (likeCount field still present)
- Ensure accurate like counts even if the denormalized column becomes stale
