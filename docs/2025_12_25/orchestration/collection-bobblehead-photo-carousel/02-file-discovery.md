# Step 2: File Discovery

**Started**: 2025-12-25T00:00:30Z
**Completed**: 2025-12-25T00:01:30Z
**Status**: Success

## Input

Refined feature request from Step 1 regarding multi-photo carousel on bobblehead cards in collection dashboard.

## Discovery Statistics

- Directories explored: 12
- Candidate files examined: 45
- Highly relevant files found: 15
- Supporting files identified: 10

## Discovered Files by Priority

### Critical Priority (Core Implementation)

| File                                                                                  | Reason                                                                                                                                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx` | Primary target file. Current bobblehead card that displays single featured photo. Must be modified to include carousel.                                 |
| `src/components/ui/carousel.tsx`                                                      | Existing Embla Carousel component with CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots. Has keyboard nav and accessibility. |
| `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts`                          | Dashboard query that only returns `featurePhoto`. Must be modified to return all photos.                                                                |

### High Priority (Data Layer & Display)

| File                                                                                             | Reason                                                                                       |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| `src/app/(app)/dashboard/collection/(collection)/components/display/bobblehead-grid-display.tsx` | Client wrapper that renders grid of BobbleheadCard. Passes data to cards.                    |
| `src/lib/db/schema/bobbleheads.schema.ts`                                                        | Database schema with `bobbleheadPhotos` table (url, sortOrder, isPrimary, altText, caption). |
| `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts`                                    | Facade layer with `getListByCollectionSlugAsync`. May need modification for photo data.      |
| `src/lib/utils/cloudinary.utils.ts`                                                              | Cloudinary utilities for `extractPublicIdFromCloudinaryUrl` and `generateBlurDataUrl`.       |

### Medium Priority (Reference & Patterns)

| File                                                                                              | Reason                                                                            |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery.tsx` | Reference implementation showing CldImage with photo galleries and navigation.    |
| `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx`                            | Photo gallery modal with navigation arrows and dot indicators. Pattern reference. |
| `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-grid.tsx`             | Grid layout component wrapping card grid.                                         |
| `src/app/(app)/dashboard/collection/(collection)/components/async/bobblehead-grid-async.tsx`      | Server component fetching bobblehead data.                                        |
| `src/components/ui/button.tsx`                                                                    | Button component with variants for navigation controls.                           |

### Low Priority (Supporting/Tests)

| File                                                             | Reason                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `tests/components/dashboard/collection/bobblehead-card.test.tsx` | Existing tests for BobbleheadCard. Must be updated.                   |
| `tests/fixtures/bobblehead-grid.factory.ts`                      | Test factory for mock bobblehead data.                                |
| `src/components/ui/conditional.tsx`                              | Utility for conditional rendering (hiding controls for single photo). |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`               | Full bobblehead queries with `getPhotosAsync` method.                 |
| `src/app/(app)/dashboard/collection/(collection)/page.tsx`       | Page component for understanding data flow.                           |

## Architecture Insights

### Key Patterns Discovered

1. **Client/Server Component Split**: Server components for data fetching (`*-async.tsx`), client components for interactivity (`*-display.tsx`)
2. **Existing Carousel Infrastructure**: Full Embla-based carousel with touch/drag, keyboard nav, dot indicators, accessibility
3. **CldImage Usage**: Uses `extractPublicIdFromCloudinaryUrl()` and `generateBlurDataUrl()` for optimized images
4. **CVA Styling Pattern**: All components use class-variance-authority for variants
5. **Data Structure Gap**: `BobbleheadDashboardListRecord` only has `featurePhoto: string | null`, needs `photos` array

### Integration Points

1. Query modification needed to return all photos (not just primary)
2. Type extension for `BobbleheadDashboardListRecord` to include photos array
3. Carousel should wrap existing image container, preserving overlay actions

### Potential Challenges

1. Performance: Loading all photos for all cards in grid
2. Layout preservation: Must maintain `aspect-square` container
3. Interaction conflicts: Carousel swipe must not conflict with card selection mode

## Validation Results

- Minimum Files Check: PASS (15 relevant files discovered, minimum was 5)
- File Existence: All paths validated
- Coverage: All major architectural layers covered (schema, queries, facades, components, UI)
