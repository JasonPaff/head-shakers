# Implementation Plan: Subcollection Filtering Feature

**Generated**: 2025-11-24
**Feature**: Subcollection-specific filtering for bobblehead display on collection pages

## Original Request

```
the collection page has a section where the bobbleheads in the collections/subcollections get displayed. I want a way for the viewer to filter the bobblehead list to specific subcollections if the collection has subcollection in it. Right now the view can only toggle between only bobbleheads in the main collection and all bobbleheads (main collection + subcollection). The viewer should have a way to toggle to just a specific subcollection.
```

## Refined Request

The collection page currently displays bobbleheads with a limited filtering mechanism that only allows toggling between viewing bobbleheads from the main collection exclusively or all bobbleheads combined from both the main collection and all subcollections; however, users need the ability to filter and view bobbleheads belonging to specific individual subcollections. This feature should add a subcollection selector (using Radix UI components for consistency with the existing UI library) that dynamically filters the bobblehead list to show only items from the selected subcollection while maintaining the current behavior of viewing main collection and all bobbleheads as default options. The implementation should leverage the existing TanStack React Table for efficient filtering and sorting of the bobblehead dataset, integrate Nuqs for URL state management to preserve the selected subcollection filter in the query parameters (enabling shareable filtered views), and utilize the current Drizzle ORM queries to fetch bobbleheads scoped to the selected subcollection based on database relationships between collections, subcollections, and bobbleheads. The filter state should persist across navigation and page refreshes through Nuqs URL synchronization, the UI should display available subcollections as a dropdown or button group using Radix UI primitives (such as combobox or segmented control patterns), and the filtered bobblehead view should seamlessly update as users select different subcollections while maintaining performance through optimized database queries. This enhancement improves the user experience for viewers exploring large collections with multiple subcollections by enabling granular content discovery and organization browsing without resorting to the all-inclusive view, while the implementation follows the project's architecture patterns of server components for data fetching, type-safe routing with next-typesafe-url, and TypeScript validation with Zod schemas for subcollection and bobblehead data structures.

## Analysis Summary

- **Feature request refined** with project context and technical details
- **Discovered 27 files** across 7 architectural layers
- **Generated 10-step implementation plan** organized by architectural layer
- **Estimated duration**: 4-6 hours
- **Complexity**: Medium
- **Risk level**: Low

## File Discovery Results

### Critical Priority (13 files)

1. **src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx** - Main collection page entry point
2. **src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx** - Server component with fetch logic (lines 27-47 handle view filtering)
3. **src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx** - Client controls with Nuqs state management
4. **src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-bobbleheads-async.tsx** - Async wrapper for data loading
5. **src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts** - Route/search param type definitions
6. **src/lib/queries/collections/collections.query.ts** - Database queries (lines 880-935 show current filtering patterns)
7. **src/lib/queries/collections/subcollections.query.ts** - Subcollection query patterns
8. **src/lib/queries/base/base-query.ts** - Base query with permission filtering
9. **src/lib/facades/collections/collections.facade.ts** - Business logic + caching (lines 650-722, 793-865)
10. **src/lib/facades/collections/subcollections.facade.ts** - Subcollection facade patterns
11. **src/lib/db/schema/collections.schema.ts** - Collection/subcollection schemas
12. **src/lib/db/schema/bobbleheads.schema.ts** - Bobblehead schema with subcollectionId FK (line 70)
13. **src/components/ui/select.tsx** - Radix Select component pattern (lines 1-217)

### High Priority (8 files)

14. **src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-sidebar-subcollections.tsx** - Subcollection data source
15. **src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-sidebar-subcollections-async.tsx** - Async wrapper
16. **src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollections-list.tsx** - Subcollection list renderer
17. **src/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-controls.tsx** - Reference control pattern
18. **src/components/feature/bobblehead/bobblehead-gallery-card.tsx** - Individual bobblehead card
19. **src/lib/validations/collections.validation.ts** - Collection validation schemas
20. **src/lib/validations/subcollections.validation.ts** - Subcollection validation
21. **src/lib/actions/collections/collections.actions.ts** - Server actions reference

### Medium Priority (4 files)

22. **src/lib/utils/cache-tags.utils.ts** - Cache tag utilities
23. **src/lib/services/cache.service.ts** - Cache service
24. **src/lib/test-ids/generator.ts** - Test ID generation
25. **src/lib/test-ids/types.ts** - Test ID types

### Low Priority (2 files)

26. **src/app/(app)/browse/components/browse-collections-content.tsx** - Complex filtering pattern reference
27. **src/app/(app)/admin/reports/page.tsx** - Multi-filter state management reference

## Architecture Insights

### Current Filtering Mechanism

- **'all'**: Fetches bobbleheads from collection AND all subcollections via `getAllCollectionBobbleheadsWithPhotosAsync`
- **'collection'**: Fetches only main collection bobbleheads (where `subcollectionId IS NULL`) via `getCollectionBobbleheadsWithPhotosAsync`

### Database Relationships

```
collections (1) ──→ (n) subCollections
     │                       │
     │ (1:n)                 │ (1:n)
     ↓                       ↓
bobbleheads.collectionId   bobbleheads.subcollectionId (nullable)
```

**Key insight**: Bobbleheads have BOTH `collectionId` (required) and `subcollectionId` (optional), enabling filtering at both levels.

### Nuqs URL State Management Pattern

```typescript
const [{ search, sort, view }, setParams] = useQueryStates(
  {
    search: parseAsString.withDefault(''),
    sort: parseAsStringEnum([...sortOptions]).withDefault('newest'),
    view: parseAsStringEnum([...viewOptions]).withDefault('all'),
  },
  { shallow: false },
);
```

### Query Layer Architecture

1. **Base Query** - Permission filtering utilities
2. **Domain Query** - Raw DB queries (CollectionsQuery, SubcollectionsQuery)
3. **Facade Layer** - Business logic, caching, error handling
4. **Component Layer** - Server components (data) + client components (interactivity)

---

## Implementation Plan

### Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Low

### Quick Summary

Enhance the collection page filtering system to support viewing bobbleheads from specific subcollections. This expands the current two-state toggle ('all' or 'main collection') into a multi-option selector that includes individual subcollections, while maintaining existing URL state management and database query patterns.

### Prerequisites

- [ ] Verify current Nuqs implementation handles multiple filter states correctly
- [ ] Confirm Radix UI Select component is available in the project
- [ ] Review existing subcollection query patterns for permission filtering
- [ ] Ensure database indexes support subcollectionId filtering efficiently

---

### Implementation Steps

#### Step 1: Extend Route Types and Search Parameters

**What**: Update type definitions to support subcollection filtering in URL state
**Why**: Nuqs requires type-safe search parameter definitions before implementing UI state management
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts` - Add subcollection filter option to search params type

**Changes:**

- Extend the search params type to accept subcollection identifier (string or null)
- Update view parameter type from binary toggle to support 'all' | 'collection' | 'subcollection' states
- Add subcollectionId parameter type definition for URL state

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Route type definitions compile without errors
- [ ] Search param types support subcollection filtering
- [ ] All validation commands pass

---

#### Step 2: Update Query Layer for Subcollection Filtering

**What**: Modify database queries to filter bobbleheads by specific subcollection ID
**Why**: Query layer must support the new filtering mode before facade and UI layers can utilize it
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts` - Add subcollection filtering logic to bobblehead queries

**Changes:**

- Add optional subcollectionId parameter to existing bobblehead query functions
- Implement conditional where clause that filters by subcollectionId when provided
- Maintain existing permission filtering and pagination logic
- Ensure query handles null subcollectionId (main collection only) vs specific ID vs no filter (all)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Query functions accept optional subcollectionId parameter
- [ ] WHERE clause correctly filters by subcollectionId when provided
- [ ] Permission filtering remains intact
- [ ] All validation commands pass

---

#### Step 3: Extend Facade Layer with Subcollection Filtering Support

**What**: Update facade functions to pass subcollection filter through to query layer with caching
**Why**: Facade layer orchestrates business logic and must handle the new filtering parameter while maintaining cache coherence
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/collections/collections.facade.ts` - Add subcollection filtering parameter to bobblehead fetch functions

**Changes:**

- Add optional subcollectionId parameter to facade functions that fetch bobbleheads
- Pass subcollectionId through to query layer
- Update cache key generation to include subcollectionId in cache tags
- Ensure error handling covers subcollection filtering scenarios

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade functions accept and pass through subcollectionId parameter
- [ ] Cache keys differentiate between different subcollection filters
- [ ] Error handling remains comprehensive
- [ ] All validation commands pass

---

#### Step 4: Create Subcollection Selector Component

**What**: Build new Radix UI Select component for choosing subcollection filter
**Why**: Users need a dedicated UI control to select which subcollection to view
**Confidence**: High

**Files to Create:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollection-filter.tsx` - Client component for subcollection selection

**Changes:**

- Create client component using Radix Select pattern matching existing sort dropdown
- Implement options for 'All Bobbleheads', 'Main Collection Only', and individual subcollections
- Accept subcollections array and current filter state as props
- Emit selection changes via callback prop
- Include proper accessibility labels and keyboard navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders Radix Select with all filter options
- [ ] Matches existing Radix Select styling patterns
- [ ] Properly typed props interface
- [ ] All validation commands pass

---

#### Step 5: Integrate Nuqs State Management in Controls Component

**What**: Update controls component to manage subcollection filter state with Nuqs
**Why**: URL state management ensures filter persistence across navigation and browser refresh
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx` - Add subcollection filter to Nuqs state

**Changes:**

- Add subcollectionId to useQueryStates hook configuration
- Implement state parser and serializer for subcollection filter
- Update view state logic to coordinate with subcollection selection
- Wire subcollection selector component into controls layout
- Handle state transitions between 'all', 'collection', and specific subcollection modes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Nuqs manages subcollectionId in URL query parameters
- [ ] State updates propagate correctly to URL
- [ ] View and subcollectionId states coordinate properly
- [ ] All validation commands pass

---

#### Step 6: Update Server Component Data Fetching

**What**: Modify server component to extract and pass subcollection filter to facade layer
**Why**: Server component must read URL state and fetch filtered data before rendering
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Extract subcollection filter from search params and fetch filtered data

**Changes:**

- Extract subcollectionId from search params in server component
- Pass subcollectionId to facade function call
- Handle loading states for subcollection filtering
- Maintain existing pagination and sorting integration

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server component reads subcollectionId from URL
- [ ] Filtered data request includes subcollection parameter
- [ ] Component renders filtered bobblehead list correctly
- [ ] All validation commands pass

---

#### Step 7: Pass Subcollection Data to Client Components

**What**: Ensure subcollection list is available to filter selector component
**Why**: Selector needs current collection's subcollections to populate filter options
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx` - Fetch subcollections and pass to controls component
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx` - Accept and pass subcollections to selector

**Changes:**

- Add subcollection query to page component data fetching
- Pass subcollections array through component props chain
- Ensure permission filtering applies to subcollection list
- Handle empty subcollections case gracefully

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page component fetches subcollections with proper permissions
- [ ] Subcollections reach filter selector component
- [ ] Empty state handled when no subcollections exist
- [ ] All validation commands pass

---

#### Step 8: Update Validation Schemas

**What**: Add validation schemas for subcollection filter parameters
**Why**: Type-safe validation ensures data integrity for subcollection filtering throughout the stack
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/collections.validation.ts` - Add subcollection filter validation schema

**Changes:**

- Create Zod schema for subcollection filter parameter (nullable string with UUID format)
- Add validation for view state that coordinates with subcollection selection
- Export schema for use in server actions and API routes
- Ensure schema handles 'all', 'collection', and specific subcollection ID cases

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Zod schema validates subcollection filter parameter correctly
- [ ] Schema handles all filter modes (all/collection/specific)
- [ ] Type exports available for use across application
- [ ] All validation commands pass

---

#### Step 9: Handle Filter State Coordination Logic

**What**: Implement logic to coordinate between view toggle and subcollection selector
**Why**: Prevent conflicting filter states and ensure intuitive user experience when switching between filters
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx` - Add state coordination logic

**Changes:**

- When subcollection selected, automatically set view to appropriate mode
- When view toggled to 'all' or 'collection', clear subcollection selection
- Maintain URL state consistency during filter transitions
- Preserve other filters (search, sort) during subcollection changes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Selecting subcollection updates view state appropriately
- [ ] Toggling view clears subcollection when needed
- [ ] No conflicting filter states possible
- [ ] Search and sort filters remain stable
- [ ] All validation commands pass

---

#### Step 10: Add Visual Feedback and Empty States

**What**: Implement UI indicators for active subcollection filter and handle no-results case
**Why**: Users need clear feedback about which filter is active and what to do when no bobbleheads match
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-subcollection-filter.tsx` - Add visual active state indicator
- `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx` - Update empty state messaging

**Changes:**

- Add visual indicator (icon, badge, or styling) showing selected subcollection
- Update empty state message to reflect subcollection filtering context
- Provide clear action for users to clear filter when no results
- Ensure accessibility for screen readers with filter status announcements

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Active filter clearly visible in UI
- [ ] Empty state message context-appropriate
- [ ] Clear action available to reset filter
- [ ] Accessibility attributes present
- [ ] All validation commands pass

---

### Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] URL state persists correctly across navigation
- [ ] Filter state coordinates properly between controls
- [ ] Database queries use proper indexes for subcollectionId filtering
- [ ] Permission filtering applies to both bobbleheads and subcollection list
- [ ] Empty states handle all filter combinations gracefully
- [ ] Component follows existing Radix UI patterns in codebase

---

### Notes

#### Assumptions Requiring Confirmation

- Subcollection data is already accessible via existing queries (confidence: High - `subcollections.query.ts` exists)
- Database has index on bobbleheads.subcollectionId for efficient filtering (confidence: Medium - should verify)
- Current permission model applies same rules to subcollection filtering (confidence: High - existing patterns)

#### Risk Mitigation

- **Query performance**: Verify index exists on subcollectionId before deployment
- **State management complexity**: Nuqs already handles complex state; following existing patterns minimizes risk
- **Cache invalidation**: Include subcollectionId in cache keys to prevent stale data

#### Edge Cases to Consider

- User selects subcollection that gets deleted (handle gracefully with fallback to 'all')
- Collection with no subcollections (hide/disable subcollection selector)
- Very large number of subcollections (consider grouping or search if >20)
- Subcollection with no bobbleheads (show appropriate empty state)

#### Performance Considerations

- Ensure database query plan uses index for subcollectionId filtering
- Cache subcollection list to avoid repeated fetches
- Consider pagination impact when filtering reduces result set

---

## Orchestration Logs

For detailed logs of the planning process, see:

- `docs/2025_11_24/orchestration/subcollections-view-filter/00-orchestration-index.md` - Workflow overview
- `docs/2025_11_24/orchestration/subcollections-view-filter/01-feature-refinement.md` - Feature refinement with project context
- `docs/2025_11_24/orchestration/subcollections-view-filter/02-file-discovery.md` - AI-powered file discovery analysis
- `docs/2025_11_24/orchestration/subcollections-view-filter/03-implementation-planning.md` - Implementation planning details
