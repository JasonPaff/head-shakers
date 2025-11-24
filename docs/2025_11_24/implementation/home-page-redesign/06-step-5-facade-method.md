# Step 5: Featured Bobbleheads Facade Method

**Timestamp**: 2025-11-24
**Specialist**: facade-specialist
**Status**: SUCCESS

## Summary

Added `getFeaturedBobbleheads` method to FeaturedContentFacade and enhanced query/transformer to include bobblehead photos and names.

## Files Modified

### `src/lib/facades/featured-content/featured-content.facade.ts`
- Added `getFeaturedBobbleheads(limit?, dbInstance?)` method
- Added Sentry breadcrumb logging
- Proper error handling with `createFacadeError`

### `src/lib/queries/featured-content/featured-content-query.ts`
- Added LEFT JOIN with `bobbleheadPhotos` (where isPrimary = true)
- Added `bobbleheadName` and `bobbleheadPrimaryPhotoUrl` to select

### `src/lib/queries/featured-content/featured-content-transformer.ts`
- Added `contentName` field to `FeaturedContentData`
- Added `determineContentName()` helper for bobblehead names
- Enhanced `determineImageUrl()` with priority: explicit > bobblehead photo > collection cover

## Method Details

```typescript
static async getFeaturedBobbleheads(
  limit?: number,
  dbInstance?: DatabaseExecutor
): Promise<Array<FeaturedContentData>>
```

**Returns**: Featured content filtered to bobblehead content type with:
- `contentName` - bobblehead name
- `contentSlug` - for URL generation
- `imageUrl` - primary photo URL
- `likes` - engagement metric
- `viewCount` - view count
- `owner` - owner user ID

**Caching**: Uses existing `CacheService.featured.content()` via `getActiveFeaturedContent()`

## Validation

- `npm run lint:fix` - PASS
- `npm run typecheck` - PASS

## Next Steps

Proceed to Step 6: Create featured bobbleheads skeleton component
