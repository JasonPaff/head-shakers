# Implementation Plan: Browse Page Subcollection Toggle Feature

Generated: 2025-11-23
Original Request: /browse currently only has collections, there should be a toggle for including/displaying subcollections and this toggle should be enabled by default

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This feature adds a toggle to the `/browse` page that allows users to include or exclude subcollections from the browsable catalog. The toggle state will be persisted via URL query parameters using Nuqs (`?includeSubcollections=true`), defaulting to `true` for a comprehensive browsing experience. The implementation spans validation schemas, database queries, facades, server actions, and UI components.

## Prerequisites

- [ ] Verify the development environment is running (`npm run dev`)
- [ ] Confirm access to the browse page at `/browse`
- [ ] Understand existing Nuqs usage patterns in the project (see `browse-collections-content.tsx`)

## Implementation Steps

### Step 1: Extend Validation Schema for includeSubcollections Filter

**What**: Add the `includeSubcollections` boolean parameter to the browse collections filters validation schema.
**Why**: The validation layer must accept and validate the new filter parameter before it reaches the query layer.
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/browse-collections.validation.ts` - Add includeSubcollections to filters schema

**Changes:**

- Add `includeSubcollections: z.boolean().optional().default(true)` to `browseCollectionsFiltersSchema`
- Export the updated type `BrowseCollectionsFilters` will automatically include the new field

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schema accepts `includeSubcollections` boolean parameter
- [ ] Default value is `true` when not provided
- [ ] Type exports include the new field
- [ ] All validation commands pass

---

### Step 2: Create New Type for Browse Result with Subcollections

**What**: Define a new type for browse collection records that includes subcollection data.
**Why**: TypeScript requires proper typing for the new data structure returned when subcollections are included.
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts` - Add new type definition

**Changes:**

- Add new type `BrowseCollectionWithSubcollectionsRecord` that extends `BrowseCollectionRecord` with a `subCollections` array
- The subcollection array should include: `id`, `name`, `slug`, `description`, `itemCount`, `coverImageUrl`
- Add new type `BrowseCollectionsWithSubcollectionsResult` for the response type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New type properly defines subcollection structure
- [ ] Type is exportable and accessible from facade/action layers
- [ ] All validation commands pass

---

### Step 3: Extend Query Method to Support Subcollections Fetch

**What**: Modify `getBrowseCollectionsAsync` in CollectionsQuery to optionally fetch subcollection data.
**Why**: The database query layer needs to conditionally include subcollection relationships based on the filter parameter.
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts` - Modify getBrowseCollectionsAsync method

**Changes:**

- Add parameter check for `includeSubcollections` from `input.filters`
- When `includeSubcollections` is true, add a subquery to fetch subcollection data for each collection
- Use a LEFT JOIN with the `subCollections` table to fetch associated subcollection records
- Structure the returned data to include the `subCollections` array in the result
- Maintain backward compatibility when `includeSubcollections` is false or undefined (defaults to false for backward compat at query level)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Query conditionally fetches subcollections based on filter
- [ ] Subcollection data includes: id, name, slug, description, itemCount, coverImageUrl
- [ ] Performance is acceptable (no N+1 query issues)
- [ ] All validation commands pass

---

### Step 4: Update Facade to Pass Through includeSubcollections Parameter

**What**: Ensure `CollectionsFacade.browseCollections` properly passes the new filter parameter to the query layer.
**Why**: The facade layer coordinates between actions and queries, and must properly handle the new parameter.
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/collections/collections.facade.ts` - Update browseCollections method

**Changes:**

- Update Sentry breadcrumb tracking to include `includeSubcollections` filter status
- Add `includeSubcollections` to the `activeFilters` array when enabled
- Ensure cache key includes `includeSubcollections` value for proper cache invalidation
- Transform subcollection cover images through CloudinaryService if present

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade properly passes includeSubcollections to query layer
- [ ] Sentry breadcrumbs track the new filter
- [ ] Cache keys differentiate between subcollections enabled/disabled
- [ ] Cloudinary transformation applied to subcollection images
- [ ] All validation commands pass

---

### Step 5: Update Server Action to Accept includeSubcollections

**What**: Ensure `browseCollectionsAction` accepts and processes the new filter parameter.
**Why**: The server action is the entry point from the client and must properly parse and pass the new parameter.
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/collections/collections.actions.ts` - Update browseCollectionsAction

**Changes:**

- The action already uses `browseCollectionsInputSchema` which will automatically include the new field after Step 1
- Update Sentry context to log the `includeSubcollections` filter value
- No structural changes needed as the schema update propagates through

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action accepts includeSubcollections in filter input
- [ ] Sentry context includes the new filter
- [ ] All validation commands pass

---

### Step 6: Add Nuqs State for includeSubcollections Toggle

**What**: Add URL state management for the subcollection toggle using Nuqs in the browse content component.
**Why**: User preference must persist across page navigation and be shareable via URL.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/components/browse-collections-content.tsx` - Add includeSubcollections state

**Changes:**

- Import `parseAsBoolean` from `nuqs`
- Add `includeSubcollections` to the `useQueryStates` configuration with `parseAsBoolean.withDefault(true)`
- Add `includeSubcollections` to the action input when calling `browseCollectionsAction`
- Add `queryParams.includeSubcollections` to the useEffect dependency array
- Create handler function `handleIncludeSubcollectionsChange` to update the toggle state
- Pass the state and handler to `BrowseCollectionsFilters` component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] URL updates with `?includeSubcollections=true/false` parameter
- [ ] Default value is `true` when parameter is absent
- [ ] State persists across page navigation
- [ ] All validation commands pass

---

### Step 7: Add Toggle UI to Browse Filters Component

**What**: Add a Switch toggle component to the filters section for controlling subcollection visibility.
**Why**: Users need a visual control to toggle subcollection inclusion.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/components/browse-collections-filters.tsx` - Add Switch toggle UI

**Changes:**

- Import `Switch` from `@/components/ui/switch`
- Import `Label` from `@/components/ui/label`
- Add new props to interface: `includeSubcollections: boolean` and `onIncludeSubcollectionsChange: (value: boolean) => void`
- Add a flex container with the Switch and Label components positioned after the search input
- Label text should be "Include Subcollections"
- Switch should be checked when `includeSubcollections` is true
- Call `onIncludeSubcollectionsChange` when switch state changes
- Update `hasFilters` calculation to consider `includeSubcollections` state for clear filters button

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Switch toggle renders in the filter section
- [ ] Toggle state reflects URL parameter
- [ ] Toggling updates URL and triggers data refetch
- [ ] Visual styling consistent with existing filter controls
- [ ] All validation commands pass

---

### Step 8: Update Browse Table to Render Subcollections with Hierarchy

**What**: Modify the browse collections table to display subcollections with appropriate visual hierarchy when the toggle is enabled.
**Why**: Users need to see and navigate to subcollections within the browse view.
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/browse/components/browse-collections-table.tsx` - Add subcollection rendering

**Changes:**

- Update component props interface to accept collections with optional subcollections data
- Add conditional rendering logic: if collection has subcollections, render them below the main collection card
- Style subcollections with visual hierarchy (indentation, smaller cards, connecting visual elements)
- Use existing `SubcollectionCard` component or create inline rendering based on its patterns
- Subcollection links should use `$path` for type-safe routing to `/collections/[collectionSlug]/subcollection/[subcollectionSlug]`
- Add appropriate spacing and visual differentiation using Tailwind CSS
- Handle empty subcollections array gracefully (don't render extra elements)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Subcollections render below their parent collection
- [ ] Visual hierarchy clearly shows parent-child relationship
- [ ] Subcollection links navigate correctly
- [ ] Layout remains clean when subcollections are empty
- [ ] All validation commands pass

---

### Step 9: Integration Testing and Final Validation

**What**: Perform end-to-end testing of the complete feature flow.
**Why**: Ensure all layers work together correctly and the user experience is seamless.
**Confidence**: High

**Files to Modify:**

- None - testing only

**Changes:**

- Manual testing of the following scenarios:
  - Navigate to `/browse` - verify toggle defaults to ON
  - Toggle OFF - verify subcollections disappear and URL updates to `?includeSubcollections=false`
  - Toggle ON - verify subcollections reappear and URL parameter is cleared or set to true
  - Direct URL navigation with `?includeSubcollections=false` - verify toggle state reflects URL
  - Combine with other filters - verify subcollection toggle works alongside search, category, etc.
  - Pagination with subcollections enabled - verify correct data loads

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] All manual test scenarios pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Production build succeeds
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Production build succeeds with `npm run build`
- [ ] Toggle state persists correctly in URL
- [ ] Default state is `true` (subcollections included)
- [ ] Visual hierarchy clearly distinguishes collections from subcollections
- [ ] No performance degradation when loading subcollections

## Notes

**Architectural Decisions:**

- Using Nuqs `parseAsBoolean` for URL state ensures the toggle preference is shareable and persists across sessions
- Default to `true` provides comprehensive browsing experience out of the box
- Subcollection data is fetched conditionally at the query level to avoid unnecessary database load when disabled
- Cache keys must include the toggle state to prevent stale data issues

**Potential Risks:**

- Query performance may degrade with large collections having many subcollections - monitor query times
- Cache invalidation complexity increases slightly due to new cache key variant

**Assumptions to Confirm:**

- The subcollection data structure matches existing `SubcollectionCard` component expectations
- Nuqs `parseAsBoolean` behaves as expected with default values (need to verify URL state when default is used)
