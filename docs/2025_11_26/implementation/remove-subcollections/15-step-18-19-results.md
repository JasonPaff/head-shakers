# Steps 18-19: Middleware and Remaining References

**Timestamp**: 2025-11-26T11:10:00Z
**Specialist**: general-purpose
**Duration**: ~5 minutes

## Step 18: Update Middleware

**File Modified**: `src/middleware.ts`

- Removed subcollection route pattern from public routes
- Updated search comment to remove subcollection reference

**Success Criteria**:

- [✓] Subcollection routes removed from middleware

## Step 19: Search and Remove Remaining Subcollection References

**Files Modified** (20 files):

### Validation Schemas (8 files)

- `src/lib/validations/bobblehead-navigation.validation.ts` - Updated comment
- `src/lib/validations/public-search.validation.ts` - Removed 'subcollection' from entity types
- `src/lib/validations/moderation.validation.ts` - Removed from report target types
- `src/lib/validations/like.validation.ts` - Updated error message
- `src/lib/validations/comment.validation.ts` - Removed from target types
- `src/lib/validations/collections.validation.ts` - Removed SubcollectionFilter
- `src/lib/validations/browse-collections.validation.ts` - Removed includeSubcollections
- `src/lib/validations/bobbleheads.validation.ts` - Removed subcollectionId

### Component Files (3 files)

- `src/app/(app)/dashboard/collection/(collection)/components/dashboard-header.tsx` - Removed subcollection count
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-stats.tsx` - Removed subcollections stat
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` - Removed subcollectionId param

### Test IDs (2 files)

- `src/lib/test-ids/types.ts` - Removed 11 subcollection test ID types
- `src/lib/test-ids/generator.ts` - Removed same test IDs from validation

### Utility & Service Files (4 files)

- `src/lib/seo/cache.utils.ts` - Removed subcollection metadata handling
- `src/lib/facades/analytics/analytics.facade.ts` - Removed from trending content
- `src/lib/services/cache.service.ts` - Updated comment
- `src/lib/services/cache-revalidation.service.ts` - Removed subcollection case

### Route Files (3 files)

- `src/app/(app)/browse/search/route-type.ts` - Updated entity types
- `src/app/(app)/browse/search/page.tsx` - Removed subcollection labels
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts` - Removed subcollectionId

## Status

**SUCCESS** - Middleware updated and remaining references cleaned.
