# Step 2: AI-Powered File Discovery

## Step Metadata

| Field      | Value                |
| ---------- | -------------------- |
| Step       | 2 - File Discovery   |
| Start Time | 2025-11-22T00:00:20Z |
| End Time   | 2025-11-22T00:01:30Z |
| Duration   | ~70 seconds          |
| Status     | Completed            |

## Input (Refined Feature Request)

When users navigate between bobbleheads within a collection context using the sequential navigation buttons, implement hover tooltips that provide a preview of the destination bobblehead before they click, displaying the next or previous bobblehead's name and cover photo to help users make informed navigation decisions. The implementation should use Radix UI's hover card component (@radix-ui/react-hover-card) for the tooltip UI.

## Discovery Statistics

| Metric                   | Value |
| ------------------------ | ----- |
| Directories Explored     | 8+    |
| Candidate Files Examined | 25+   |
| Highly Relevant Files    | 12    |
| Supporting Files         | 5     |
| Total Discovered         | 17    |

## Discovered Files by Priority

### Critical Priority (3 files)

| File                                                                                           | Reason                                                                           |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` | Main navigation component with previous/next links - PRIMARY modification target |
| `src/components/ui/hover-card.tsx`                                                             | Existing HoverCard component wrapper using @radix-ui/react-hover-card            |
| `src/lib/types/bobblehead-navigation.types.ts`                                                 | Defines AdjacentBobblehead type with photoUrl field                              |

### High Priority (4 files)

| File                                                                                                       | Reason                                                              |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/lib/facades/bobbleheads/bobbleheads.facade.ts`                                                        | Contains getBobbleheadNavigationData() - needs to populate photoUrl |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`                                                         | Contains getAdjacentBobbleheadsInCollectionAsync() - query layer    |
| `src/lib/validations/bobblehead-navigation.validation.ts`                                                  | Zod schemas for navigation validation                               |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` | Server component that fetches navigation data                       |

### Medium Priority (4 files)

| File                                                                                                              | Reason                                              |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `src/lib/utils/cloudinary.utils.ts`                                                                               | Contains extractPublicIdFromCloudinaryUrl() utility |
| `src/components/ui/button.tsx`                                                                                    | Contains buttonVariants used by navigation          |
| `src/lib/test-ids/generator.ts`                                                                                   | Test ID generation utilities                        |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-navigation-skeleton.tsx` | Navigation skeleton component                       |

### Low Priority (6 files)

| File                                                                                             | Reason                                |
| ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `src/components/feature/bobblehead/bobblehead-gallery-card.tsx`                                  | Reference for CldImage patterns       |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card.tsx` | Reference for CldImage usage          |
| `src/components/ui/tooltip.tsx`                                                                  | Alternative tooltip (not recommended) |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`                               | Page context reference                |
| `src/lib/db/schema/bobbleheads.schema.ts`                                                        | Database schema reference             |
| `src/components/ui/conditional.tsx`                                                              | Conditional rendering component       |

## Architecture Insights

### Key Patterns Discovered

1. **Data is pre-fetched on server**: BobbleheadNavigationAsync server component fetches data before rendering
2. **photoUrl field exists but is null**: Type supports it, facade sets it to null - optimization opportunity
3. **Cloudinary Integration Pattern**: Uses CldImage with extractPublicIdFromCloudinaryUrl()
4. **HoverCard already implemented**: Radix UI wrapper exists following project conventions
5. **Type-safe routing**: Uses $path from next-typesafe-url
6. **Test ID patterns**: Uses generateTestId() function

### Implementation Strategy Identified

1. Modify facade layer to populate photoUrl with primary photo
2. Update query layer to join bobbleheadPhotos table
3. Wrap navigation links with HoverCard components
4. Create preview card content with bobblehead name and CldImage thumbnail
5. Handle edge cases (no photo, no adjacent bobblehead)

## File Validation Results

All discovered files validated to exist in the codebase.
