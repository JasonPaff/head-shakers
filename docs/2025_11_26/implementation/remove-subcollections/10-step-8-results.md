# Step 8: Remove Subcollection References from Search Query/Facade

**Timestamp**: 2025-11-26T10:45:00Z
**Specialist**: facade-specialist
**Duration**: ~3 minutes

## Step Summary

Removed subcollection from content search functionality.

## Files Modified

### src/lib/queries/content-search/content-search.query.ts

- Removed `subCollections` import from schema
- Removed `SubcollectionSearchResult` type export
- Removed `subcollections` field from `ConsolidatedSearchResults` type
- Removed `subcollections` field from `PublicSearchCounts` type
- Removed subcollection counting logic from `getSearchResultCounts`
- Updated `searchPublicConsolidated` to only search collections and bobbleheads
- Removed `searchPublicSubcollections` method entirely

### src/lib/facades/content-search/content-search.facade.ts

- Removed `SubcollectionSearchResult` from imports
- Removed `subcollections` field from `PublicSearchDropdownResponse` interface
- Removed `subcollections` field from `PublicSearchPageResponse` interface
- Updated `getPublicSearchDropdownResults` - removed subcollection handling
- Updated `getPublicSearchPageResults` - changed entity types to only collection/bobblehead
- Updated `enrichPublicSearchResults` return type

## Success Criteria

- [✓] Subcollection search removed from content-search.query.ts
- [✓] Subcollection result type removed from search results

## Status

**SUCCESS** - Content search query and facade layers cleaned of subcollection logic.
