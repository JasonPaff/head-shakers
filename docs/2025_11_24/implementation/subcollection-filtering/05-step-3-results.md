# Step 3: Extend Facade Layer with Subcollection Filtering Support

**Step**: 3/10
**Specialist**: facade-specialist
**Status**: ✓ Success
**Duration**: ~2 minutes

## Objective

Update facade functions to pass subcollection filter through to query layer with caching

## Skills Loaded

- **facade-layer**: Facade-Layer-Conventions.md
- **caching**: Caching-Conventions.md
- **sentry-monitoring**: Sentry-Monitoring-Conventions.md
- **drizzle-orm**: Drizzle-ORM-Conventions.md

## Changes Made

### Files Modified

**src/lib/facades/collections/collections.facade.ts**

- Added optional `subcollectionId` parameter to options object in `getAllCollectionBobbleheadsWithPhotos`
- Added optional `subcollectionId` parameter to options object in `getCollectionBobbleheadsWithPhotos`
- Updated error context to include `subcollectionId` for improved debugging and Sentry tracking

## Conventions Applied

- ✓ Facade functions pass through optional parameters to query layer
- ✓ Updated error context with subcollectionId for Sentry monitoring
- ✓ Cache key generation automatically includes subcollectionId (via options hash)
- ✓ Maintained existing caching strategy with CacheService.bobbleheads.byCollection
- ✓ Proper error handling with createFacadeError
- ✓ TypeScript type safety maintained

## Caching Strategy

**Automatic Cache Differentiation**:
Cache keys automatically differentiate between different subcollection filters because the entire `options` object (including subcollectionId) is hashed via `createHashFromObject({ options, photos: true, viewerUserId })`.

**Three-State Support**:

- `subcollectionId: undefined` → All bobbleheads (no filter)
- `subcollectionId: null` → Main collection only
- `subcollectionId: "uuid-string"` → Specific subcollection

**Cache Invalidation**:
Existing CacheRevalidationService methods handle collection-level invalidation, which properly invalidates all subcollection filter variants.

## Validation Results

### ESLint

✓ Passed with 3 expected warnings (TanStack Table)

### TypeScript

✓ Passed - No compilation errors

## Success Criteria

- [✓] Facade functions accept and pass through subcollectionId parameter
- [✓] Cache keys differentiate between different subcollection filters
- [✓] Error handling remains comprehensive
- [✓] All validation commands pass

## Notes for Next Steps

- Facade layer fully supports three-state subcollection filtering
- Cache differentiation is automatic through options hash
- Error context includes subcollectionId for Sentry debugging
- Next steps: Create UI components (Step 4) and wire up state management (Step 5)
