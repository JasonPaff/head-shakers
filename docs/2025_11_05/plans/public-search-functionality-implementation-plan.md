# Public Search Functionality Implementation Plan

**Generated:** 2025-11-05T00:05:00Z

**Original Request:** Implement public-facing search functionality that allows unauthenticated users to search for collections, subcollections, and bobbleheads from the search bar in the app's navigation header. The search should support text search with debouncing, tag filtering (include only), and return basic info with primary photos. Results should be displayed in a dropdown for quick access and link to a full search results page with advanced filters and pagination.

**Refined Request:** Implement a public-facing search feature accessible to unauthenticated users via the navigation header search bar that enables searching across collections, subcollections, and bobbleheads with results displayed in a debounced dropdown component that links to a dedicated full search results page. The implementation should leverage Next.js Server Actions for search queries executed through the existing layered architecture (validations, queries, facades), with Zod schemas validating search input (query text with minimum length, tag array for filtering) and Upstash Redis caching search results to optimize performance for frequently searched terms. The dropdown UI component should be built with Radix UI primitives (Popover or Dialog) and Tailwind CSS, displaying up to 5 consolidated results across the three entity types with basic information (name, description snippet, primary photo URL from existing Cloudinary integration) and a "View All Results" link that navigates to a full search page. The full search results page should be a new Server Component route handling pagination via URL state with Nuqs, supporting advanced filters (tag selection with include-only logic, entity type toggles, sort options), and utilizing debounced search input to reduce server requests. Database queries should be written in the queries layer using Drizzle ORM with optimized SQL (using ILIKE for text search, filtered joins for tags) and cached appropriately at the facade layer. Authentication middleware should explicitly allow unauthenticated access to these search endpoints while maintaining existing role-based access control for other features. The search functionality should adapt or extend existing admin search patterns already implemented in the codebase, reusing validated query patterns and UI paradigms where possible, with comprehensive Zod validation for all search parameters to prevent SQL injection and ensure type safety. Test coverage should include unit tests for search queries, integration tests for the Server Actions, and component tests for the dropdown and results page interactions using Vitest and Testing Library.

---

## Analysis Summary

- Feature request refined with project context
- Discovered 42 files across all architectural layers
- Generated 11-step implementation plan

---

## File Discovery Results

### Critical Priority Files (6)
1. `src\components\layout\app-header\components\app-header-search.tsx` - Rebuild required
2. `src\lib\actions\content-search\content-search.actions.ts` - Extend with public actions
3. `src\lib\facades\content-search\content-search.facade.ts` - Add public methods
4. `src\lib\queries\content-search\content-search.query.ts` - Add public queries
5. `src\lib\validations\public-search.validation.ts` - NEW: Create validation schemas
6. `src\app\(app)\search\page.tsx` - NEW: Full search results page

### High Priority Files (13)
- Database schemas: collections, bobbleheads, subcollections, tags, users
- Configuration: config.ts, next-safe-action.ts, middleware.ts
- Constants: action-names.ts, operations.ts, error-messages.ts
- Queries: tags-query.ts, tags.actions.ts

### Medium Priority Files (19)
- UI Components: popover, input, card, badge, skeleton, empty-state, spinner
- Reference: content-search.tsx, tag-filter.tsx
- Services: cache.service.ts, cache.utils.ts, cache-tags.utils.ts
- Query utilities: query-context.ts, base-query.ts
- Error handling: action-error-handler.ts, errors.ts
- Middleware: sanitization, database

### Low Priority Files (4)
- Supporting infrastructure: transaction.middleware.ts, redis-client.ts, sentry.ts
- Integration: app-header.tsx

---

## Implementation Plan

### Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

### Quick Summary

Implement a comprehensive public search feature accessible to unauthenticated users, consisting of a header search dropdown showing top 5 results and a dedicated full search results page with advanced filtering. The implementation will extend existing admin search patterns to support public access, add Redis caching for performance, and use the established layered architecture (validations → queries → facades → actions → UI).

### Prerequisites

- [ ] Verify Upstash Redis connection is configured and accessible
- [ ] Confirm Cloudinary integration is working for image URLs
- [ ] Review existing admin search implementation patterns in `src/lib/actions/content-search.actions.ts`
- [ ] Verify GIN indexes exist on collections, subcollections, and bobbleheads name/description fields
- [ ] Confirm `publicActionClient` from next-safe-action is properly configured

---

## Implementation Steps

### Step 1: Create Public Search Validation Schemas

**What**: Define Zod schemas for public search input validation covering query text, filters, and pagination

**Why**: Establish type-safe contracts for search parameters with proper validation rules (minimum query length, allowed filter values) to prevent invalid queries and SQL injection

**Confidence**: High

**Files to Create:**
- `src/lib/validations/public-search.validation.ts` - Public search validation schemas

**Changes:**
- Create `PublicSearchQuerySchema` with minimum query length (2-3 characters), maximum length (100 characters), trimming
- Create `SearchFiltersSchema` for entity type toggles (collections, subcollections, bobbleheads), tag array filtering, sort options
- Create `SearchPaginationSchema` for page number, page size (max 50 items), offset calculation
- Create combined `PublicSearchInputSchema` merging query, filters, and pagination
- Create `SearchDropdownInputSchema` for header dropdown (query only, no pagination)
- Export all schemas with proper TypeScript types using `z.infer`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All schemas include comprehensive validation rules
- [ ] TypeScript types are properly inferred from schemas
- [ ] Schemas follow existing project validation patterns
- [ ] All validation commands pass

---

### Step 2: Extend Database Query Layer for Public Search

**What**: Add optimized database queries to content-search.query.ts supporting multi-entity search with filtering, sorting, and result limiting

**Why**: Provide efficient, type-safe database queries leveraging existing GIN indexes and optimized SQL patterns for public search access

**Confidence**: High

**Files to Modify:**
- `src/lib/queries/content-search.query.ts` - Extend with public search queries

**Changes:**
- Add `searchPublicCollections` function using Drizzle's `ilike` for name/description search with tag filtering via joins
- Add `searchPublicSubcollections` function with similar pattern, filtering by parent collection visibility
- Add `searchPublicBobbleheads` function including manufacturer/series search fields
- Add `searchPublicConsolidated` function returning top N results across all three entity types
- Add `getSearchResultCounts` function returning total counts for each entity type (for pagination)
- Implement proper null handling for optional fields (description, photos)
- Add indexes validation comments referencing existing GIN indexes
- Use parameterized queries with Drizzle's type-safe query builder to prevent SQL injection

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Queries leverage existing GIN indexes on name/description fields
- [ ] All queries return properly typed results matching schema expectations
- [ ] Tag filtering uses efficient join patterns
- [ ] Entity type filtering is implemented correctly
- [ ] All validation commands pass

---

### Step 3: Implement Search Facade Layer with Redis Caching

**What**: Extend content-search.facade.ts with public search methods implementing business logic and Redis caching strategy

**Why**: Centralize search business logic with performance optimization through Redis caching for frequently searched terms, reducing database load

**Confidence**: High

**Files to Modify:**
- `src/lib/facades/content-search.facade.ts` - Add public search facade methods

**Changes:**
- Add `searchPublicContent` method orchestrating multi-entity search with cache lookup
- Add `getPublicSearchDropdownResults` method for header dropdown (limit 5 total results)
- Add `getPublicSearchPageResults` method for full results page with pagination
- Implement Redis caching with TTL (5-15 minutes) using CacheService patterns
- Create cache key generation function combining query text, filters, and pagination params
- Add cache invalidation logic (time-based only, no mutation triggers for public search)
- Transform query results to include computed fields (photo URLs from Cloudinary)
- Handle empty results and error cases gracefully
- Add result enrichment with primary photo URL resolution

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Caching strategy reduces redundant database queries for popular searches
- [ ] Cache keys are properly namespaced and collision-free
- [ ] Photo URLs are correctly resolved from Cloudinary integration
- [ ] Error handling returns user-friendly messages
- [ ] All validation commands pass

---

### Step 4: Create Public Search Server Actions

**What**: Implement Server Actions in content-search.actions.ts using publicActionClient for unauthenticated access to search functionality

**Why**: Expose type-safe server actions that validate input, execute search through facades, and return properly formatted results for client consumption

**Confidence**: High

**Files to Modify:**
- `src/lib/actions/content-search.actions.ts` - Add public search actions

**Changes:**
- Add `searchPublicContentAction` using publicActionClient with PublicSearchInputSchema validation
- Add `getPublicSearchDropdownAction` for header dropdown with SearchDropdownInputSchema
- Import and use public search facades from Step 3
- Implement proper error handling returning actionClient error responses
- Add rate limiting considerations (comment for future implementation)
- Ensure actions return serializable data only (no functions, dates as ISO strings)
- Add JSDoc comments documenting action purpose, parameters, and return types

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Actions properly use publicActionClient for unauthenticated access
- [ ] Input validation catches invalid queries before database access
- [ ] Error responses are consistent with existing action patterns
- [ ] Return types are fully serializable for client consumption
- [ ] All validation commands pass

---

### Step 5: Update Middleware for Public Search Route Access

**What**: Modify middleware.ts to explicitly allow unauthenticated access to search endpoints while maintaining existing authentication requirements

**Why**: Enable public access to search functionality without compromising security for protected routes

**Confidence**: Medium

**Files to Modify:**
- `src/middleware.ts` - Add public search routes to allowed paths

**Changes:**
- Add `/search` route to public routes list (if pattern-based matching exists)
- Ensure search API routes are accessible without authentication
- Verify existing rate limiting applies to search endpoints
- Add comments documenting public search access rationale
- Confirm no unintended side effects on other route protections

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search routes are accessible to unauthenticated users
- [ ] Existing protected routes remain properly secured
- [ ] Rate limiting is active for search endpoints
- [ ] No TypeScript errors in middleware configuration
- [ ] All validation commands pass

---

### Step 6: Build Search Dropdown UI Component

**What**: Create a reusable search dropdown component using Radix UI Popover with debounced input, loading states, and result display

**Why**: Provide instant search feedback in the header with optimized UX through debouncing and efficient result presentation

**Confidence**: High

**Files to Create:**
- `src/components/feature/search/search-dropdown.tsx` - Search dropdown component
- `src/components/feature/search/search-result-item.tsx` - Individual result item component

**Files to Modify:**
- `src/components/layout/app-header-search.tsx` - Replace existing implementation with new SearchDropdown

**Changes:**
- Create SearchDropdown component using Radix UI Popover primitive
- Implement useDebounce hook or use existing debounce utility (300-500ms delay)
- Add loading skeleton states while searching
- Display up to 5 consolidated results grouped by entity type
- Show entity type badges (Collection, Subcollection, Bobblehead) with Tailwind styling
- Include primary photo thumbnail (Cloudinary optimized URL)
- Add "View All Results" link at bottom navigating to `/search?q={query}`
- Implement keyboard navigation (arrow keys, enter to select)
- Handle empty states ("No results found" message)
- Add proper ARIA labels for accessibility
- Create SearchResultItem component for consistent result display

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Dropdown opens on input focus with smooth animation
- [ ] Debouncing reduces unnecessary server requests
- [ ] Loading states provide clear user feedback
- [ ] Results display with proper entity type differentiation
- [ ] Keyboard navigation works correctly
- [ ] All validation commands pass

---

### Step 7: Create Full Search Results Page Route

**What**: Build a new Server Component page at `/search` with comprehensive search UI, pagination, and advanced filtering

**Why**: Provide detailed search experience with full result sets, filtering capabilities, and pagination for users seeking specific content

**Confidence**: High

**Files to Create:**
- `src/app/(app)/search/page.tsx` - Main search results page Server Component
- `src/components/feature/search/search-filters.tsx` - Filter controls component
- `src/components/feature/search/search-results-grid.tsx` - Results display grid
- `src/components/feature/search/search-pagination.tsx` - Pagination controls

**Changes:**
- Create search page Server Component accepting searchParams from URL
- Use Nuqs for URL state management (query, filters, page number)
- Implement SearchFilters component with entity type toggles, tag multi-select, sort dropdown
- Create SearchResultsGrid displaying paginated results with entity type sections
- Add SearchPagination component with previous/next buttons and page indicators
- Implement debounced search input updating URL query parameter
- Show result counts for each entity type
- Add empty state when no results found
- Include loading states during search execution
- Use existing Card, Badge, and Button components from UI library
- Implement responsive grid layout (1 column mobile, 2-3 columns desktop)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] URL state properly syncs with search parameters using Nuqs
- [ ] Pagination works correctly with server-side rendering
- [ ] Filters update results without full page reload
- [ ] Responsive layout works on mobile and desktop
- [ ] Loading states prevent layout shift
- [ ] All validation commands pass

---

### Step 8: Integrate Search Components with App Header

**What**: Update app-header-search.tsx to use new SearchDropdown component with proper state management and navigation

**Why**: Complete the user-facing integration by replacing placeholder search with fully functional dropdown search

**Confidence**: High

**Files to Modify:**
- `src/components/layout/app-header-search.tsx` - Integrate SearchDropdown component

**Changes:**
- Import and render SearchDropdown component from Step 6
- Remove any existing placeholder search implementation
- Add proper spacing and styling to match header design
- Ensure search input is visible and accessible on mobile/desktop
- Add focus management for keyboard accessibility
- Implement proper cleanup on component unmount
- Connect to searchPublicContentAction from Step 4

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search dropdown appears correctly in header on all screen sizes
- [ ] Input focus behavior works intuitively
- [ ] Component integrates seamlessly with existing header layout
- [ ] No layout shift when dropdown opens
- [ ] All validation commands pass

---

### Step 9: Implement Search Result Caching Service Integration

**What**: Configure Redis caching patterns in CacheService specifically for search results with appropriate TTL and invalidation

**Why**: Optimize search performance by caching frequently accessed results while balancing freshness and storage costs

**Confidence**: Medium

**Files to Modify:**
- `src/lib/services/cache.service.ts` - Add search-specific caching methods

**Changes:**
- Add `cacheSearchResults` method with configurable TTL (default 10 minutes)
- Add `getSearchResultsFromCache` method with proper deserialization
- Add `invalidateSearchCache` method for manual cache clearing if needed
- Implement cache key namespacing (`search:public:{hash}`) to avoid collisions
- Add cache hit/miss logging for monitoring
- Consider implementing cache warming for popular search terms (future enhancement)
- Document caching strategy in code comments

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cache methods integrate with existing CacheService patterns
- [ ] TTL configuration is appropriate for search use case
- [ ] Cache keys are properly namespaced and unique
- [ ] Serialization/deserialization handles all search result data types
- [ ] All validation commands pass

---

### Step 10: Add Comprehensive Test Coverage for Search Features

**What**: Create unit, integration, and component tests covering validation schemas, queries, facades, actions, and UI components

**Why**: Ensure search functionality is reliable, maintainable, and regression-proof with comprehensive test coverage

**Confidence**: High

**Files to Create:**
- `tests/lib/validations/public-search.validation.test.ts` - Schema validation tests
- `tests/lib/queries/content-search.query.test.ts` - Database query tests
- `tests/lib/facades/content-search.facade.test.ts` - Facade logic tests
- `tests/lib/actions/content-search.actions.test.ts` - Server Action tests
- `tests/components/feature/search/search-dropdown.test.tsx` - Dropdown component tests
- `tests/app/search/page.test.tsx` - Search page integration tests

**Changes:**
- Write validation tests covering valid/invalid inputs, edge cases (empty query, special characters)
- Create database query tests using Testcontainers with seeded test data
- Add facade tests mocking query layer and verifying caching logic
- Implement action tests verifying input validation and error handling
- Write component tests for SearchDropdown covering user interactions, debouncing, keyboard navigation
- Add search page tests verifying pagination, filtering, and URL state management
- Use MSW for mocking Server Actions in component tests
- Achieve minimum 80% code coverage for new search functionality

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**
- [ ] All validation schema edge cases are tested
- [ ] Database queries return expected results with test data
- [ ] Caching logic correctly stores and retrieves results
- [ ] Component tests cover user interactions and edge cases
- [ ] Test suite runs successfully without flaky tests
- [ ] All validation commands pass

---

### Step 11: Performance Optimization and Final Quality Checks

**What**: Review and optimize search performance, verify accessibility standards, and conduct final integration testing

**Why**: Ensure production-ready performance, accessibility compliance, and seamless integration with existing features

**Confidence**: Medium

**Files to Modify:**
- Multiple files from previous steps for optimization refinements

**Changes:**
- Verify GIN indexes are utilized by running EXPLAIN ANALYZE on search queries
- Optimize Cloudinary image loading with appropriate transformations and lazy loading
- Add performance monitoring comments for future Sentry integration
- Verify ARIA labels and keyboard navigation meet WCAG 2.1 AA standards
- Test search functionality with various network conditions (slow 3G, offline)
- Verify rate limiting doesn't block legitimate search usage
- Check mobile responsive behavior across device sizes
- Validate all links navigate correctly to entity detail pages
- Review error messages for user-friendliness
- Confirm no console errors or warnings in browser

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test && npm run build
```

**Success Criteria:**
- [ ] Search queries execute within 500ms for cached results, 2s for uncached
- [ ] Database query plans show index usage
- [ ] Images load efficiently with proper optimization
- [ ] Accessibility audit passes with no critical issues
- [ ] Mobile experience is smooth and responsive
- [ ] Production build completes without errors
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix` with no remaining warnings
- [ ] Test suite passes with `npm run test` achieving >80% coverage for new code
- [ ] Production build succeeds with `npm run build`
- [ ] Manual testing confirms search works for unauthenticated users
- [ ] Manual testing confirms existing authenticated features remain unaffected
- [ ] Redis cache properly stores and retrieves search results
- [ ] Search results link correctly to entity detail pages
- [ ] Performance benchmarks meet defined criteria (sub-2s search response)

---

## Notes

### Important Considerations

- **Rate Limiting**: Consider implementing rate limiting specifically for search endpoints to prevent abuse. Current plan includes comment placeholders for future implementation.
- **Cache Strategy**: 10-minute TTL for search results balances freshness with performance. Monitor cache hit rates and adjust if needed.
- **Database Performance**: Existing GIN indexes on name/description fields are critical. Verify indexes exist before deployment.
- **Accessibility**: Keyboard navigation and ARIA labels are mandatory for search dropdown and results page.
- **Mobile Experience**: Search is a primary discovery feature; mobile UX must be seamless with responsive design.
- **Future Enhancements**: Consider implementing search analytics, autocomplete suggestions, and trending searches in future iterations.

### Assumptions Requiring Validation

- publicActionClient is properly configured and allows unauthenticated access
- Upstash Redis is provisioned with sufficient capacity for search caching
- Cloudinary image URLs are publicly accessible for unauthenticated users
- Existing entity detail pages (collections, subcollections, bobbleheads) support public access
- GIN indexes exist on all searched text fields (verify with `/db` command)

### Risk Mitigation

- **Medium Risk - Performance**: Mitigated by Redis caching, debouncing, and query optimization. Monitor query performance in production.
- **Low Risk - Cache Invalidation**: Time-based TTL prevents stale data; no complex invalidation needed for public search.
- **Low Risk - Security**: Using publicActionClient and Zod validation prevents SQL injection; middleware ensures proper route access control.

---

## Orchestration Logs

For detailed logs of the planning process, see:
- [Feature Refinement](../orchestration/public-search-functionality/01-feature-refinement.md)
- [File Discovery](../orchestration/public-search-functionality/02-file-discovery.md)
- [Implementation Planning](../orchestration/public-search-functionality/03-implementation-planning.md)
