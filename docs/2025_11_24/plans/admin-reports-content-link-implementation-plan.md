# Implementation Plan: Admin Reports Table - Content Link Column

**Generated**: 2025-11-24
**Original Request**: On the admin report pages reports table there should be a column with a link (use an icon) to the content that was reported so the admin can easily find and view the offending content.

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

This implementation adds a new "View Content" column to the admin reports table that displays clickable icon links to the reported content. The solution requires enhancing the backend query to fetch slug data via JOINs and adding a new column with type-safe routing using the existing pattern from trending-content-table.tsx.

## Prerequisites

- [ ] Familiarity with the existing TanStack React Table setup in reports-table.tsx
- [ ] Understanding of the $path utility from next-typesafe-url
- [ ] Access to review the trending-content-table.tsx reference implementation

## Implementation Steps

### Step 1: Extend the Content Report Type with Slug Information

**What**: Create a new extended type that includes slug fields needed for content linking
**Why**: The current SelectContentReport type only includes targetId, but we need slugs for type-safe routing
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/validations/moderation.validation.ts` - Add new extended type for reports with slug data

**Changes:**

- Add new type `SelectContentReportWithSlugs` that extends SelectContentReport with optional slug fields:
  - `targetSlug: string | null` (for bobbleheads, collections, subcollections)
  - `parentCollectionSlug: string | null` (for subcollections only)
  - `contentExists: boolean` (to determine if content was deleted)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New type is exported from moderation.validation.ts
- [ ] Type includes all necessary slug fields for routing
- [ ] All validation commands pass

---

### Step 2: Enhance the Content Reports Query with JOIN for Slug Data

**What**: Modify getAllReportsForAdminAsync to include LEFT JOINs for fetching slug information from related tables
**Why**: The query must return slug data for generating type-safe links without additional API calls
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- `src/lib/queries/content-reports/content-reports.query.ts` - Add new query method with JOINs

**Changes:**

- Create new method `getAllReportsWithSlugsForAdminAsync` that:
  - Uses LEFT JOINs to bobbleheads table for bobblehead slugs
  - Uses LEFT JOINs to collections table for collection slugs
  - Uses LEFT JOINs to subCollections table for subcollection slugs
  - Uses additional LEFT JOIN from subCollections to collections for parent collection slug
  - Returns targetSlug, parentCollectionSlug, and contentExists fields
  - Maintains existing filtering and pagination logic
- Import the new type from moderation.validation.ts
- Use CASE expressions or COALESCE to determine the appropriate slug based on targetType

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New query method correctly fetches slug data for all target types
- [ ] Subcollections correctly include parent collection slug
- [ ] Query handles missing/deleted content gracefully (NULL slugs)
- [ ] All validation commands pass

---

### Step 3: Update the Reports Table Component Props Interface

**What**: Modify the ReportsTableProps interface to accept the new extended type with slug data
**Why**: The component needs access to slug information to render the content link column
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/admin/reports/reports-table.tsx` - Update component props and imports

**Changes:**

- Update import to use SelectContentReportWithSlugs instead of SelectContentReport
- Update ReportsTableProps interface `data` prop type to use the new extended type
- Update all type annotations within the component that reference the row data type

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component accepts the new extended type
- [ ] Type annotations are consistent throughout the component
- [ ] All validation commands pass

---

### Step 4: Implement the Content Link Helper Function

**What**: Add a getContentLink helper function that generates type-safe routes based on target type
**Why**: Centralizes the link generation logic following the pattern from trending-content-table.tsx
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/admin/reports/reports-table.tsx` - Add helper function and imports

**Changes:**

- Add import for $path from next-typesafe-url
- Add import for Link from next/link
- Add ExternalLinkIcon import from lucide-react (already has EyeIcon)
- Create getContentLink function that handles:
  - 'bobblehead': routes to `/bobbleheads/[bobbleheadSlug]` using targetSlug
  - 'collection': routes to `/collections/[collectionSlug]` using targetSlug
  - 'subcollection': routes to `/collections/[collectionSlug]/subcollection/[subcollectionSlug]` using both parentCollectionSlug and targetSlug
  - 'user': routes to `/users/[userId]` using targetId directly
  - 'comment': returns null (comments have no direct route)
- Create isContentLinkAvailable helper to check if linking is possible (contentExists and has required slugs)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Helper function generates correct links for all target types
- [ ] Subcollection links include both parent collection and subcollection slugs
- [ ] Comment type returns null appropriately
- [ ] All validation commands pass

---

### Step 5: Add the View Content Column to the Table

**What**: Insert a new column definition between Content Type and Content ID columns that displays the clickable link icon
**Why**: Provides administrators with quick access to review reported content
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/admin/reports/reports-table.tsx` - Add new column definition

**Changes:**

- Add new column definition in the columns useMemo array (after targetType column, before targetId column)
- Column should have id 'viewContent' and header 'View'
- Cell renderer should:
  - Check if content link is available using isContentLinkAvailable helper
  - If available: render Button with Link using ExternalLinkIcon
  - If unavailable (deleted content or comment): render disabled button with Tooltip explaining why
- Set size to approximately 70-80 pixels
- Disable sorting for this column

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New column appears in the table between Content Type and Content ID
- [ ] Clickable links work for bobbleheads, collections, subcollections, and users
- [ ] Disabled state shows for comments and deleted content
- [ ] All validation commands pass

---

### Step 6: Add Tooltip Component for Disabled State

**What**: Import and implement Tooltip component for explaining disabled link states
**Why**: Provides user feedback when links are unavailable due to deleted content or unsupported content types
**Confidence**: High

**Files to Create:**

- None

**Files to Modify:**

- `src/components/admin/reports/reports-table.tsx` - Add Tooltip imports and usage

**Changes:**

- Add import for Tooltip, TooltipContent, TooltipTrigger from @/components/ui/tooltip
- Wrap the disabled button in Tooltip components
- Display appropriate message based on condition:
  - For comments: "Comments cannot be viewed directly"
  - For deleted content: "Content no longer exists"
- Style the disabled button appropriately (reduced opacity, cursor-not-allowed)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Tooltip appears on hover for disabled states
- [ ] Messages are contextually appropriate
- [ ] Visual styling indicates disabled state clearly
- [ ] All validation commands pass

---

### Step 7: Update Calling Code to Use New Query Method

**What**: Update any server components or API routes that fetch admin reports to use the new query method
**Why**: Ensures the table receives data with slug information included
**Confidence**: Medium

**Files to Create:**

- None

**Files to Modify:**

- Identify and modify files that call `getAllReportsForAdminAsync` to use `getAllReportsWithSlugsForAdminAsync` (likely in admin reports page or API route)

**Changes:**

- Search for usages of getAllReportsForAdminAsync
- Update to use the new getAllReportsWithSlugsForAdminAsync method
- Ensure the returned data is properly typed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All calling code uses the new query method
- [ ] Data flows correctly from query to component
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual testing: Verify bobblehead links navigate to correct pages
- [ ] Manual testing: Verify collection links navigate to correct pages
- [ ] Manual testing: Verify subcollection links include both collection and subcollection slugs
- [ ] Manual testing: Verify user links navigate to user profile pages
- [ ] Manual testing: Verify comment reports show disabled state with tooltip
- [ ] Manual testing: Verify deleted content shows disabled state with tooltip
- [ ] Visual verification: New column displays correctly in table layout

## Notes

**Architecture Decisions:**

1. **Separate Query Method**: Creating a new query method rather than modifying the existing one preserves backward compatibility and keeps the original method lightweight for use cases that do not need slug data.

2. **LEFT JOINs Strategy**: Using LEFT JOINs ensures that reports for deleted content are still returned (with NULL slugs), allowing the UI to handle the disabled state gracefully.

3. **Subcollection Parent Slug**: The subcollection route requires both the parent collection slug and subcollection slug. The query must JOIN through the subCollections table to the collections table to retrieve the parent collection slug.

4. **Comment Handling**: Comments do not have a direct public route in this application architecture. The implementation should show a disabled state with an explanatory tooltip rather than attempting to link to the parent content (which would require additional complexity).

5. **User Handling**: Users are identified by userId in reports, which maps directly to the route parameter, eliminating the need for slug lookups.

**Potential Risks:**

- Query performance impact from additional JOINs (mitigated by LEFT JOINs and existing indexes on slug columns)
- Edge case where subcollection exists but parent collection was deleted (handled by checking contentExists flag)

**Reference Pattern:**

The `trending-content-table.tsx` component provides the exact pattern to follow for implementing the `getContentLink` helper function.
