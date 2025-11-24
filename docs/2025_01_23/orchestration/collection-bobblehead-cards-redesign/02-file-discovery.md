# Step 2: AI-Powered File Discovery

**Status**: Completed
**Started**: 2025-01-23T00:00:20Z
**Completed**: 2025-01-23T00:01:00Z
**Duration**: ~40 seconds

## Input: Refined Feature Request

The bobblehead cards displayed on the collection page (accessible via `/collection/[collectionSlug]`) require a comprehensive visual redesign to enhance the platform's overall aesthetic and user experience. Currently, the cards need to be modernized with a clean, colorful, and visually appealing design that aligns with contemporary UI/UX standards while leveraging the existing Head Shakers design system.

## Discovery Statistics

| Metric                  | Value |
| ----------------------- | ----- |
| Directories Explored    | 15+   |
| Files Examined          | 50+   |
| Highly Relevant Files   | 32    |
| Supporting Files        | 15    |
| Minimum Requirement (5) | PASS  |

## Discovered Files by Priority

### Critical Priority (3 files - Core Implementation)

| File Path                                                                                                   | Relevance                                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/feature/bobblehead/bobblehead-gallery-card.tsx`                                             | **Primary target** - The main bobblehead card component (510 lines). Contains photo carousel, likes, share, action menu. Core file to redesign. |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx`             | **Parent container** - Renders grid of BobbleheadGalleryCard components. Controls layout and passes props.                                      |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/bobblehead-card-skeleton.tsx` | **Loading state** - Skeleton component must match new card design structure.                                                                    |

### High Priority (10 files - UI Components)

| File Path                                                              | Relevance                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `src/components/ui/card.tsx`                                           | Base Card component with CardHeader, CardContent, CardFooter     |
| `src/components/ui/badge.tsx`                                          | CVA badge variants for metadata display (category, year, status) |
| `src/components/ui/button.tsx`                                         | CVA button variants for card actions                             |
| `src/components/ui/dropdown-menu.tsx`                                  | Radix dropdown for card action menus                             |
| `src/components/ui/tooltip.tsx`                                        | Radix tooltips for enhanced UX                                   |
| `src/components/ui/skeleton.tsx`                                       | Loading placeholder with pulse animation                         |
| `src/components/ui/like-button.tsx`                                    | Like button variants with animations                             |
| `src/components/feature/bobblehead/bobblehead-photo-gallery-modal.tsx` | Full-screen photo gallery integration                            |
| `src/components/feature/bobblehead/bobblehead-share-menu.tsx`          | Share functionality dropdown                                     |
| `src/components/feature/bobblehead/bobblehead-delete-dialog.tsx`       | Delete confirmation dialog                                       |

### Medium Priority (10 files - Page Context & Types)

| File Path                                                                                                          | Relevance                            |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------ |
| `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`                                                 | Collection page orchestrator         |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-bobbleheads-async.tsx`        | Async data fetcher                   |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/collection-bobbleheads-skeleton.tsx` | Section skeleton                     |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx`            | Filter controls                      |
| `src/lib/validations/bobbleheads.validation.ts`                                                                    | Zod schemas for bobblehead types     |
| `src/lib/db/schema/bobbleheads.schema.ts`                                                                          | Database schema with all fields      |
| `src/lib/test-ids/index.ts`                                                                                        | Test ID utilities                    |
| `src/app/globals.css`                                                                                              | CSS custom properties and animations |
| `src/utils/tailwind-utils.ts`                                                                                      | cn() function for class merging      |
| `src/lib/utils/cloudinary.utils.ts`                                                                                | Cloudinary image helpers             |

### Low Priority (9 files - Reference Patterns)

| File Path                                                                                                               | Relevance                         |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `src/components/feature/subcollections/subcollection-card.tsx`                                                          | Similar card pattern reference    |
| `src/app/(app)/dashboard/collection/(collection)/components/collection-card.tsx`                                        | Dashboard card layout reference   |
| `src/components/admin/analytics/engagement-metrics-card.tsx`                                                            | Metrics card with CVA patterns    |
| `src/components/ui/conditional.tsx`                                                                                     | Conditional rendering helper      |
| `src/components/ui/empty-state.tsx`                                                                                     | Empty state design complement     |
| `src/components/ui/spinner.tsx`                                                                                         | Loading spinner for photos        |
| `src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-bobbleheads.tsx` | Subcollection variant consistency |

## Architecture Insights Discovered

### Key Patterns

1. **CVA (Class Variance Authority)** - Used for component variants in button.tsx, badge.tsx
2. **Radix UI Integration** - All interactive components use Radix primitives
3. **Test ID System** - generateTestId() function for standardized testids
4. **Conditional Rendering** - `<Conditional isCondition={...}>` wrapper pattern
5. **$path Navigation** - next-typesafe-url for type-safe routing
6. **Cloudinary Images** - CldImage with extractPublicIdFromCloudinaryUrl()
7. **CSS Animations** - Custom animations in globals.css

### Current Card Structure (BobbleheadGalleryCard)

```
Fixed 580px height:
├── CardHeader (h-14): Name + subcollection link
├── Photo Container (h-64): Image with carousel controls
├── CardContent (h-20): Description
├── Visual Separator: Border
└── CardFooter: Like button, share, view details, action menu
```

### Integration Points

- **Props Interface**: BobbleheadGalleryCardProps with bobblehead data, isOwner flag
- **Server Actions**: getBobbleheadPhotosAction for photo fetching
- **Hooks**: useToggle, useServerAction
- **Photo Loading**: Lazy loads on hover, tracks loaded images

## Validation Results

| Check                         | Result          |
| ----------------------------- | --------------- |
| Minimum 5 files discovered    | PASS (32 files) |
| File paths validated          | PASS            |
| Categorization complete       | PASS            |
| Priority assignment           | PASS            |
| Integration points identified | PASS            |

---

_Auto-generated by /plan-feature orchestrator_
