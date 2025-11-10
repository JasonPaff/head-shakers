# Browse Collections Page - Implementation Plan

**Generated**: 2025-11-09T00:06:20Z
**Original Request**: As a user I would like to have a /browse page implemented to browse collections
**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

---

## Analysis Summary

### Feature Request Refinement
The /browse page should provide users with a comprehensive, filterable interface for discovering and exploring collections across the platform, leveraging the existing Next.js App Router architecture and TanStack React Table for structured data display. This page should be implemented as a server component at `src/app/(app)/browse/page.tsx` that fetches paginated collection data using a new query in `src/lib/queries/collections.ts` with support for filtering by collection name, owner, category, creation date, and popularity metrics (like count, follower count). The page should integrate Nuqs for URL state management to persist filter selections, sorting preferences (by name, date created, most liked, most followers), and pagination state across browser navigation. The UI should feature a responsive grid or table layout using TanStack React Table for sortable columns displaying collection thumbnails (first bobblehead image via Cloudinary), collection name, owner profile information, item count, like count, and follower count, with each row linking to the collection detail page. A sidebar filter panel built with Radix UI components should allow users to dynamically filter collections, with form validation using Zod schemas in `src/lib/validations/collections.ts`. The implementation should include a new server action in `src/lib/actions/collections.ts` to handle search queries and filter combinations efficiently, utilizing the existing database schema relationships between collections, users, and bobbleheads. Real-time indicators could show trending or newly added collections, and the page should support authenticated features like the ability to follow collections or add them to a user's favorites. Loading states should be implemented using React Suspense boundaries for the collection list and filters independently, with skeleton screens for better perceived performance. The browse page should be accessible from the main navigation and respect user authentication state through Clerk, potentially showing personalized recommendations or sorting options based on the user's own collections and followed users. Search functionality should be implemented through a dedicated search input that triggers filtering without full page reloads, maintaining a smooth user experience consistent with the existing design system and component patterns already established in the platform.

### File Discovery Results
- **Total Files Discovered**: 50 files across all architectural layers
- **Critical Files**: 17 files (database schemas, queries, facades, validations, page)
- **High Priority Files**: 19 files (UI components, services, similar page references)
- **Key Patterns Identified**: BaseQuery, QueryContext, Nuqs URL state, Suspense boundaries
- **Excellent Reference**: Search page components demonstrate Nuqs integration patterns

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Implement a comprehensive `/browse` page that allows users to discover and explore all public collections on the platform with advanced filtering, sorting, and search capabilities. The page will follow the established architecture patterns using server components, TanStack React Table for data display, Nuqs for URL state management, and the existing facade/query layer pattern.

## Prerequisites

- [ ] Verify database schema has proper indexes for collections text search (GIN indexes confirmed)
- [ ] Confirm CacheService.collections pattern exists and is functional
- [ ] Review existing search page implementation for Nuqs patterns
- [ ] Ensure TanStack React Table v8+ is installed and configured

---

## Implementation Steps

### Step 1: Create Collection Browse Validation Schema

**What**: Define Zod validation schemas for browse page filters, sorting, and pagination
**Why**: Type-safe validation of user inputs for search terms, filters, sort options, and pagination parameters
**Confidence**: High

**Files to Create:**
- `src/lib/validations/collections/browse-collections.validation.ts` - Browse-specific validation schemas

**Changes:**
- Create `BrowseCollectionsInputSchema` with fields for search query, category filter, owner filter, date range, sort by (name, createdAt, likeCount, followerCount), sort order (asc, desc), page number, and page size
- Create `BrowseCollectionsSortSchema` enum for sortBy options
- Export inferred TypeScript types from schemas for use in query layer
- Follow existing validation patterns from `collections.validation.ts`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Schema validates all filter combinations correctly
- [ ] TypeScript types are properly inferred and exported
- [ ] Schema integrates with existing validation patterns
- [ ] All validation commands pass

---

### Step 2: Extend Collections Query Layer

**What**: Add `getBrowseCollections` method to collections query class with filtering, sorting, and pagination
**Why**: Centralized query logic following BaseQuery pattern with proper permission filtering and caching support
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Add new browse query method

**Changes:**
- Add `getBrowseCollections` method that accepts validated browse input parameters
- Implement SQL query with WHERE clauses for search (using ILIKE on name/description), category filter, owner filter, date range filter
- Add ORDER BY clause supporting sort by name, createdAt, likeCount, followerCount with configurable direction
- Implement LIMIT/OFFSET pagination using input page and pageSize
- Include LEFT JOIN to users table for owner information
- Include aggregate subqueries for likeCount and followerCount if not materialized
- Filter to only public collections OR collections owned by current user from QueryContext
- Return paginated results with total count for pagination UI
- Follow existing query patterns and use QueryContext for permission filtering

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Query method accepts validated input parameters
- [ ] SQL query efficiently filters and sorts collections
- [ ] Permission filtering respects public/private visibility
- [ ] Returns properly typed results with total count
- [ ] All validation commands pass

---

### Step 3: Create Collections Facade Method for Browse

**What**: Add `browseCollections` method to collections facade layer
**Why**: Business logic layer that orchestrates query execution, caching, and data transformation
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/collections/collections.facade.ts` - Add browse facade method

**Changes:**
- Add `browseCollections` method that accepts browse input parameters
- Validate input using `BrowseCollectionsInputSchema` from Step 1
- Generate cache key based on filter/sort/pagination parameters
- Check CacheService.collections for cached results
- If cache miss, call `collectionsQuery.getBrowseCollections()` from Step 2
- Transform query results to include Cloudinary URLs for collection thumbnails (first bobblehead image)
- Cache results with appropriate TTL (follow existing collection caching patterns)
- Return paginated collections with metadata (total count, current page, page size, total pages)
- Handle errors with proper error transformation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Facade method properly validates inputs
- [ ] Caching logic reduces database queries for repeated requests
- [ ] Cloudinary URLs are correctly generated for thumbnails
- [ ] Returns properly structured pagination metadata
- [ ] All validation commands pass

---

### Step 4: Create Browse Page URL State Management with Nuqs

**What**: Set up Nuqs parsers for URL state management of filters, sorting, and pagination
**Why**: Persist user selections in URL for shareable links and browser navigation support
**Confidence**: High

**Files to Create:**
- `src/app/(app)/browse/browse.types.ts` - Type definitions for browse state
- `src/app/(app)/browse/browse.parsers.ts` - Nuqs parser configurations

**Changes:**
- Create type definitions for browse filters, sort state, and pagination state
- Create Nuqs parsers using `parseAsString` for search query (defaulting to empty string)
- Create parser using `parseAsString` for sortBy (defaulting to 'createdAt')
- Create parser using `parseAsString` for sortOrder (defaulting to 'desc')
- Create parser using `parseAsInteger` for page (defaulting to 1)
- Create parser using `parseAsInteger` for pageSize (defaulting to PAGINATION.COLLECTIONS constant)
- Create parser using `parseAsString` for category filter (optional)
- Create parser using `parseAsString` for owner filter (optional)
- Follow existing search page patterns for Nuqs integration
- Export parser object for use in page component

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All URL parameters have proper parsers with defaults
- [ ] Types align with validation schemas from Step 1
- [ ] Parser configuration follows existing Nuqs patterns
- [ ] All validation commands pass

---

### Step 5: Create Browse Collections Table Component

**What**: Build TanStack React Table component to display collections in sortable table format
**Why**: Reusable table component with sorting, pagination controls, and responsive design
**Confidence**: High

**Files to Create:**
- `src/components/feature/collections/browse-collections-table.tsx` - Main table component
- `src/components/feature/collections/browse-collections-columns.tsx` - Column definitions

**Changes:**
- Create column definitions for thumbnail (image), name, owner (with avatar and username), item count, like count, follower count
- Implement sortable column headers using TanStack React Table APIs
- Add click handlers to collection rows that navigate to collection detail page
- Include responsive design that collapses to card view on mobile breakpoints
- Use Radix UI components for table structure and interactive elements
- Style with Tailwind CSS following existing design patterns
- Implement loading skeleton rows for Suspense boundary
- Pass sort state and onSortChange callback from parent component
- Follow existing table patterns from search page or admin tables

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Table displays all required collection information
- [ ] Sortable columns trigger URL state updates
- [ ] Rows are clickable and navigate correctly
- [ ] Responsive design works on mobile and desktop
- [ ] Loading states render skeleton screens
- [ ] All validation commands pass

---

### Step 6: Create Browse Page Filter Panel Component

**What**: Build filter sidebar component with search input and filter controls using Radix UI
**Why**: Allows users to refine collection results with search and category/owner filters
**Confidence**: Medium

**Files to Create:**
- `src/components/feature/collections/browse-filters.tsx` - Filter panel component
- `src/components/feature/collections/browse-search-input.tsx` - Debounced search input

**Changes:**
- Create filter panel with search input that debounces at 300ms (follow DEBOUNCE constant)
- Add category filter dropdown using Radix Select component populated from database categories
- Add owner filter input with autocomplete suggestions (optional enhancement)
- Add date range filters using Radix UI date picker components
- Add clear filters button to reset all filters to defaults
- Use controlled components that sync with Nuqs URL state
- Style with Tailwind CSS to match existing filter patterns
- Make panel collapsible on mobile with hamburger toggle
- Include filter count badge showing active filter count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search input properly debounces and updates URL state
- [ ] Category filter displays available categories
- [ ] All filter changes update URL parameters
- [ ] Clear filters button resets to default state
- [ ] Mobile responsive design with collapsible panel
- [ ] All validation commands pass

---

### Step 7: Create Browse Page Pagination Component

**What**: Build pagination controls component for navigating collection pages
**Why**: Standard pagination UI to navigate through large result sets
**Confidence**: High

**Files to Create:**
- `src/components/feature/collections/browse-pagination.tsx` - Pagination controls

**Changes:**
- Create pagination component accepting total count, current page, page size, and onPageChange callback
- Display page numbers with ellipsis for large page counts (show first, last, current, and adjacent pages)
- Include previous/next buttons with disabled state on boundaries
- Add page size selector dropdown with options (12, 24, 48, 96)
- Show result count information (e.g., "Showing 1-12 of 247 collections")
- Update URL state through Nuqs when page or page size changes
- Use Radix UI Button components with proper accessibility attributes
- Style with Tailwind CSS following existing pagination patterns
- Position at top and bottom of results for better UX

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Pagination correctly calculates page numbers and ranges
- [ ] Previous/next buttons have proper disabled states
- [ ] Page size selector updates results per page
- [ ] Result count displays accurate information
- [ ] URL state updates on page navigation
- [ ] All validation commands pass

---

### Step 8: Create Browse Collections Page Layout Component

**What**: Build main page layout component that composes filter panel, table, and pagination
**Why**: Organize page structure with responsive grid layout and proper component hierarchy
**Confidence**: High

**Files to Create:**
- `src/app/(app)/browse/browse-layout.tsx` - Client component for layout structure

**Changes:**
- Create client component that uses Nuqs hooks for URL state management
- Compose filter panel (sidebar), table component, and pagination controls
- Implement responsive grid layout (sidebar collapses to drawer on mobile)
- Pass URL state values to child components as props
- Handle URL state updates from filter changes, sorting, and pagination
- Add empty state component when no collections match filters
- Include error boundary for graceful error handling
- Add loading states for individual sections (filters load independently of table)
- Follow existing layout patterns from search or dashboard pages

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Layout correctly positions all child components
- [ ] Responsive design works across breakpoints
- [ ] URL state management properly wired to all components
- [ ] Empty and error states display appropriately
- [ ] All validation commands pass

---

### Step 9: Create Browse Page Server Component

**What**: Implement main server component at `/browse` route that fetches data and renders layout
**Why**: Server-side data fetching with streaming and Suspense for optimal performance
**Confidence**: High

**Files to Create:**
- `src/app/(app)/browse/page.tsx` - Main browse page server component

**Changes:**
- Create server component that accepts searchParams from Next.js
- Call `getOptionalUserId()` from Clerk for authentication context (page works for both authenticated and unauthenticated users)
- Parse searchParams using Nuqs parsers from Step 4 to get filter/sort/pagination values
- Call `collectionsFacade.browseCollections()` from Step 3 with parsed parameters
- Wrap layout component in Suspense boundary with loading fallback
- Pass fetched collections data and metadata to layout component
- Add page metadata (title, description) for SEO
- Handle authentication-specific features (e.g., show follow buttons only for authenticated users)
- Follow existing page patterns from collections or search pages

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page successfully fetches and displays collections data
- [ ] Suspense boundaries provide smooth loading experience
- [ ] Authentication state properly handled for optional features
- [ ] SEO metadata correctly configured
- [ ] All validation commands pass

---

### Step 10: Create Browse Page Loading and Error States

**What**: Implement loading.tsx and error.tsx files for Next.js error handling
**Why**: Proper loading and error states following Next.js App Router conventions
**Confidence**: High

**Files to Create:**
- `src/app/(app)/browse/loading.tsx` - Loading state component
- `src/app/(app)/browse/error.tsx` - Error boundary component

**Changes:**
- Create loading.tsx that renders skeleton screens matching browse page layout
- Include skeleton for filter panel, table rows, and pagination
- Create error.tsx client component with error message display and retry button
- Style error state to match existing error page patterns
- Add helpful error messages for common scenarios (network errors, permission issues)
- Follow existing loading and error patterns from other app routes

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Loading state provides clear visual feedback
- [ ] Error state displays user-friendly messages
- [ ] Retry functionality works correctly
- [ ] Skeleton screens match actual content layout
- [ ] All validation commands pass

---

### Step 11: Add Browse Page Navigation Link

**What**: Add "Browse Collections" link to main navigation header
**Why**: Users need discoverable access to the browse page from anywhere in the app
**Confidence**: High

**Files to Modify:**
- `src/components/layout/header/main-nav.tsx` - Add browse link to navigation
- `src/components/layout/header/mobile-nav.tsx` - Add browse link to mobile menu

**Changes:**
- Add "Browse" navigation item to main header navigation array
- Link to `/browse` route using Next.js Link component
- Position after "Dashboard" and before "Collections" in navigation order
- Add Lucide icon (Search or Grid icon) for visual consistency
- Include in mobile navigation menu at same position
- Ensure active state highlights when on browse page
- Follow existing navigation item patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Browse link appears in desktop navigation
- [ ] Browse link appears in mobile navigation
- [ ] Link navigates to browse page correctly
- [ ] Active state properly indicates current page
- [ ] All validation commands pass

---

### Step 12: Add Database Indexes for Browse Query Performance

**What**: Create database migration to add indexes optimizing browse page queries
**Why**: Ensure fast query performance for filtered, sorted, and paginated collection queries
**Confidence**: High

**Files to Create:**
- `src/lib/db/migrations/[timestamp]_add_browse_collections_indexes.sql` - Migration file

**Changes:**
- Add composite index on collections(isPublic, createdAt DESC) for default sort
- Add composite index on collections(isPublic, likeCount DESC) for popular sort
- Verify GIN index exists on collections name and description for text search (should already exist)
- Add index on collections(categoryId, isPublic) for category filtering
- Add index on collections(userId, isPublic) for owner filtering
- Run migration using `npm run db:generate` and `npm run db:migrate` commands
- Verify indexes with EXPLAIN ANALYZE on representative queries
- Document index choices in migration comments

**Validation Commands:**
```bash
npm run db:migrate
```

**Success Criteria:**
- [ ] Migration creates all specified indexes
- [ ] EXPLAIN ANALYZE shows indexes are being used
- [ ] Query performance meets acceptable thresholds (sub-100ms)
- [ ] Migration runs without errors on development branch

---

### Step 13: Add Telemetry and Error Tracking for Browse Page

**What**: Integrate Sentry error tracking and performance monitoring for browse page
**Why**: Monitor production errors and performance metrics for browse functionality
**Confidence**: High

**Files to Modify:**
- `src/app/(app)/browse/page.tsx` - Add error tracking
- `src/lib/facades/collections/collections.facade.ts` - Add performance tracking

**Changes:**
- Add Sentry error boundary wrapping browse page components
- Add performance tracking for facade `browseCollections` method execution time
- Track custom metrics for filter usage patterns (which filters are most used)
- Track pagination patterns (average page depth, common page sizes)
- Add breadcrumbs for debugging filter and sort state changes
- Follow existing Sentry integration patterns from other features
- Configure appropriate sample rates for performance monitoring
- Add error context (search query, active filters) to Sentry error reports

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Sentry captures browse page errors with context
- [ ] Performance metrics are tracked for slow queries
- [ ] Custom metrics provide usage insights
- [ ] Error reports include relevant debugging information
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck` with no errors
- [ ] All files pass `npm run lint:fix` with no warnings or errors
- [ ] All tests pass `npm run test` with adequate coverage
- [ ] Database migrations run successfully on development branch
- [ ] Manual testing confirms all features work as expected:
  - [ ] Browse page loads with default collections
  - [ ] Search filter updates results dynamically
  - [ ] Category and owner filters work correctly
  - [ ] Sorting by all columns works correctly
  - [ ] Pagination navigates through results
  - [ ] URL state persists across browser navigation
  - [ ] Mobile responsive design works properly
  - [ ] Authenticated features (follow) work when logged in
  - [ ] Page works correctly for unauthenticated users
- [ ] Performance testing shows sub-100ms query times for typical browse queries
- [ ] Accessibility testing confirms keyboard navigation and screen reader support

---

## Notes

### Assumptions
- Collections table already has likeCount and followerCount materialized or can be calculated via subqueries
- GIN indexes for text search on collection name/description already exist (confirmed in discovery)
- CacheService.collections pattern is established and functional
- PAGINATION.COLLECTIONS constant is defined and accessible

### Risk Mitigation
- Database indexes in Step 13 are critical for performance - prioritize early in implementation
- Caching strategy in Step 3 should be tested under load to ensure cache hit rates are acceptable
- URL state management in Step 4 needs careful testing to prevent infinite loops or state conflicts
- Follow feature in Step 12 is optional and can be deferred if timeline is tight

### Future Enhancements
- Add saved search functionality to persist favorite filter combinations
- Implement trending collections algorithm based on recent activity
- Add personalized recommendations based on user's followed collections
- Support bulk follow/unfollow operations
- Add export functionality to download browse results as CSV

### Performance Considerations
- Consider implementing cursor-based pagination for very large result sets (>10k collections)
- Monitor cache memory usage and implement cache eviction policies if needed
- Lazy load collection thumbnails with Cloudinary progressive loading
- Implement virtual scrolling if table row count exceeds 100 items per page

---

## Orchestration Logs

Full orchestration logs available at:
- `docs/2025_11_09/orchestration/browse-collections-page/00-orchestration-index.md`
- `docs/2025_11_09/orchestration/browse-collections-page/01-feature-refinement.md`
- `docs/2025_11_09/orchestration/browse-collections-page/02-file-discovery.md`
- `docs/2025_11_09/orchestration/browse-collections-page/03-implementation-planning.md`
