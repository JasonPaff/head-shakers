# Step 6: Remove Subcollection References from Bobbleheads Query/Facade

**Timestamp**: 2025-11-26T10:35:00Z
**Specialist**: facade-specialist
**Duration**: ~3 minutes

## Step Summary

Removed subcollectionId references from bobblehead queries and facades.

## Files Modified

### src/lib/queries/bobbleheads/bobbleheads-query.ts

- Removed `subCollections` from schema imports
- Removed `subcollectionName` and `subcollectionSlug` from `BobbleheadWithRelations` type
- Updated `findByIdWithRelationsAsync`: Removed subcollection left join and fields
- Updated `findBySlugWithRelationsAsync`: Removed subcollection left join and fields
- Updated `getAdjacentBobbleheadsInCollectionAsync`: Removed `subcollectionId` parameter
- Updated `getBobbleheadPositionInCollectionAsync`: Removed `subcollectionId` parameter

### src/lib/facades/bobbleheads/bobbleheads.facade.ts

- Removed `SubcollectionsFacade` import
- Updated `getBobbleheadNavigationData` method:
  - Removed `subcollectionId` parameter
  - Simplified cache key generation
  - Simplified context data fetching to collection-only
  - Removed subcollection-related Sentry breadcrumbs

## Success Criteria

- [✓] subcollectionId removed from all bobblehead query methods
- [✓] subcollectionId removed from all bobblehead facade methods
- [✓] No subcollection joins in bobblehead queries

## Status

**SUCCESS** - Bobbleheads query and facade layers cleaned of subcollection logic.
