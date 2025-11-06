# Step 3: Implementation Planning

**Status**: Completed
**Started**: 2025-11-05T00:03:45Z
**Completed**: 2025-11-05T00:06:30Z
**Duration**: 165 seconds

## Input

**Refined Feature Request:**
Implement a comprehensive search feature that allows authenticated users to search across collections, subcollections, and bobbleheads using a unified search bar interface, integrating with the existing Next.js 15.5.3 App Router architecture and PostgreSQL database managed through Drizzle ORM.

**File Discovery Summary:**

- 43 total files discovered across all architectural layers
- 5 CRITICAL files identified for modification/creation
- 11 HIGH priority files for validation schemas, database schemas, and configuration
- 12 MEDIUM priority files for reference patterns and integration
- 15 LOW priority files for supporting context

## Agent Prompt Sent

```
You are the implementation planner for the Head Shakers project. Your task is to create a detailed implementation plan in MARKDOWN format (NOT XML).

[Full refined request and file discovery summary included]

**CRITICAL REQUIREMENTS:**
1. Generate plan in MARKDOWN format (NOT XML)
2. Follow this exact template structure:
   - ## Overview (with Estimated Duration, Complexity, Risk Level)
   - ## Quick Summary
   - ## Prerequisites
   - ## Implementation Steps (each with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria)
   - ## Quality Gates
   - ## Notes
3. Include 'npm run lint:fix && npm run typecheck' validation for EVERY step touching JS/JSX/TS/TSX files
4. Do NOT include code examples or implementations
5. Focus on actionable steps with clear validation criteria

Generate the complete implementation plan now.
```

## Full Agent Response

[The complete implementation plan is preserved below in its original markdown format]

---

# Implementation Plan: Unified Search Feature

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement a unified search feature allowing authenticated users to search across collections, subcollections, and bobbleheads through a global search bar in the header. The implementation extends existing admin search infrastructure, adds subcollection search capabilities, and creates a dedicated search results page with URL state management and client-side caching.

## Prerequisites

- [ ] Verify Clerk authentication is properly configured for user context
- [ ] Confirm GIN indexes exist on collections.search_vector and bobbleheads.search_vector
- [ ] Ensure TanStack Query is configured in the application layout
- [ ] Review existing CacheService.search.results() implementation

## Implementation Steps

### Step 1: Analyze Existing Search Infrastructure

**What**: Review and document the current admin search implementation patterns to ensure architectural consistency
**Why**: Understanding existing patterns prevents duplication and ensures the user-facing search follows established conventions
**Confidence**: High

**Files to Review:**

- `src/lib/actions/admin/content-search.actions.ts` - Server action patterns
- `src/lib/queries/admin/content-search.query.ts` - Database query patterns
- `src/lib/facades/admin/content-search.facade.ts` - Business logic patterns
- `src/lib/db/schema/collections.schema.ts` - Collection search_vector implementation
- `src/lib/db/schema/bobbleheads.schema.ts` - Bobblehead search_vector implementation

**Changes:**

- Document authentication differences between admin and user search
- Identify permission filtering requirements for user-owned content
- Map reusable query patterns for adaptation
- Note GIN index availability and search_vector columns

**Validation Commands:**

```bash
npm run typecheck
```

**Success Criteria:**

- [ ] Documented authentication context requirements
- [ ] Identified permission filtering patterns
- [ ] Confirmed database index availability
- [ ] TypeScript compilation passes

---

### Step 2: Create User-Facing Search Validation Schema

**What**: Create Zod validation schema for user search input with sanitization and constraints
**Why**: Ensures search queries are validated, sanitized, and prevent injection attacks before database execution
**Confidence**: High

**Files to Create:**

- `src/lib/validations/search/user-search.validation.ts` - Search input validation schema

**Changes:**

- Define search query validation with min/max length constraints
- Add optional filter parameters for content type (collections, subcollections, bobbleheads)
- Include pagination parameters (page, limit)
- Add sort order options (relevance, recent, alphabetical)
- Implement input sanitization for special characters

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schema validates search queries with proper constraints
- [ ] Input sanitization prevents SQL injection
- [ ] TypeScript types are properly exported
- [ ] All validation commands pass

---

### Step 3: Add Subcollection Search Vector Column

**What**: Add search_vector column to subcollections table with GIN index for full-text search
**Why**: Subcollections currently lack search functionality and need the same infrastructure as collections and bobbleheads
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/subcollections.schema.ts` - Add search_vector column definition

**Changes:**

- Add search_vector column of type `tsvector` to subcollections schema
- Configure search_vector to include name and description fields
- Document the search vector composition

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run db:generate
```

**Success Criteria:**

- [ ] Schema includes search_vector column
- [ ] Drizzle generates migration file successfully
- [ ] TypeScript types updated correctly
- [ ] All validation commands pass

---

### Step 4: Create and Apply Database Migration for Subcollections Search

**What**: Generate and execute database migration to add search_vector column and GIN index to subcollections
**Why**: Database schema must be updated to support subcollection full-text search
**Confidence**: High

**Files to Create:**

- Migration file in `src/lib/db/migrations/` - Generated by Drizzle

**Changes:**

- Generate migration using `npm run db:generate`
- Review migration SQL for correctness
- Use `/db` command to apply migration to development branch
- Verify GIN index creation on search_vector column

**Validation Commands:**

```bash
npm run db:generate
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration applied to development database
- [ ] GIN index created on subcollections.search_vector
- [ ] search_vector column populated with existing data

---

### Step 5: Implement User Search Query Functions

**What**: Create database query functions for searching collections, subcollections, and bobbleheads with user permission filtering
**Why**: Provides the data layer for executing secure, optimized search queries with proper access control
**Confidence**: High

**Files to Create:**

- `src/lib/queries/search/user-search.query.ts` - User search query functions

**Changes:**

- Create searchCollections function with user permission filtering (public or user-owned)
- Create searchSubcollections function with parent collection permission check
- Create searchBobbleheads function with collection permission filtering
- Implement unified searchAll function combining all three queries
- Add relevance ranking using ts_rank for search results
- Include pagination support with offset and limit
- Add result count functions for each content type
- Use existing query context patterns from collections.query.ts

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All query functions properly filter by user permissions
- [ ] Full-text search uses GIN indexes efficiently
- [ ] Pagination parameters applied correctly
- [ ] TypeScript types properly inferred from Drizzle
- [ ] All validation commands pass

---

### Step 6: Implement User Search Facade Layer

**What**: Create facade layer implementing business logic for user search with authorization and result transformation
**Why**: Separates business logic from data access and provides reusable search functionality across the application
**Confidence**: High

**Files to Create:**

- `src/lib/facades/search/user-search.facade.ts` - User search business logic

**Changes:**

- Create searchContent function orchestrating query execution
- Implement permission verification for authenticated users
- Add result transformation to unified format
- Include total count calculation for pagination
- Add result deduplication if needed
- Implement error handling and logging
- Follow facade patterns from existing collection facades

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade properly validates user authentication
- [ ] Results transformed to consistent format
- [ ] Error handling covers edge cases
- [ ] TypeScript types properly exported
- [ ] All validation commands pass

---

### Step 7: Create User Search Server Action

**What**: Implement Next-Safe-Action server action for executing user search queries
**Why**: Provides secure server-side entry point for search functionality with automatic validation and error handling
**Confidence**: High

**Files to Create:**

- `src/lib/actions/search/user-search.actions.ts` - Server action for user search

**Changes:**

- Create searchContentAction using Next-Safe-Action
- Integrate user search validation schema
- Call user search facade with authenticated user context
- Implement rate limiting consideration
- Add search query caching with CacheService.search.results()
- Handle authentication errors appropriately
- Follow server action patterns from existing actions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Server action properly integrated with Next-Safe-Action
- [ ] Validation schema applied correctly
- [ ] Authentication context passed to facade
- [ ] Cache integration implemented
- [ ] All validation commands pass

---

### Step 8: Create Search Results Page Component

**What**: Build dedicated search results page at /browse/search with URL state management and result display
**Why**: Provides dedicated interface for displaying search results with shareable URLs and proper navigation
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/search/page.tsx` - Search results page component

**Changes:**

- Create server component for search results page
- Integrate Nuqs for URL query parameter management (q, type, page, sort)
- Call user search server action with URL parameters
- Implement loading states using Suspense boundaries
- Create empty state for no results
- Add error boundary for error handling
- Display categorized results (collections, subcollections, bobbleheads)
- Include pagination controls using existing pagination components
- Add filter controls for content type selection
- Implement breadcrumb navigation

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page properly handles URL query parameters
- [ ] Search results display correctly by category
- [ ] Loading and empty states render appropriately
- [ ] Pagination works correctly
- [ ] TypeScript types are properly enforced
- [ ] All validation commands pass

---

### Step 9: Create Search Result Card Components

**What**: Build reusable card components for displaying collection, subcollection, and bobblehead search results
**Why**: Provides consistent, accessible UI for different content types in search results
**Confidence**: High

**Files to Create:**

- `src/components/feature/search/search-result-collection-card.tsx` - Collection result card
- `src/components/feature/search/search-result-subcollection-card.tsx` - Subcollection result card
- `src/components/feature/search/search-result-bobblehead-card.tsx` - Bobblehead result card

**Changes:**

- Create CollectionSearchResultCard with thumbnail, title, owner, item count
- Create SubcollectionSearchResultCard with parent collection context
- Create BobbleheadSearchResultCard with image, name, collection context
- Add navigation links to respective detail pages
- Include relevance score indicator if applicable
- Use Lucide React icons for visual indicators
- Style with Tailwind CSS matching existing card patterns
- Ensure accessibility with proper ARIA labels

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All card components render correctly
- [ ] Navigation links work properly
- [ ] Components are accessible
- [ ] Styling matches existing design system
- [ ] All validation commands pass

---

### Step 10: Implement Global Search Bar Component

**What**: Create or modify header search bar component with autocomplete suggestions and keyboard navigation
**Why**: Provides primary entry point for search functionality accessible from any page
**Confidence**: Medium

**Files to Create:**

- `src/components/layout/header/global-search-bar.tsx` - Global search bar component

**Files to Modify:**

- `src/components/layout/header/app-header-search.tsx` - Integrate new global search bar

**Changes:**

- Create search input component using Radix UI Dialog or Combobox
- Add Search icon from Lucide React
- Implement debounced search input to reduce API calls
- Add keyboard shortcuts (Cmd/Ctrl+K to focus)
- Implement autocomplete suggestions using search action
- Add recent searches storage in localStorage
- Handle navigation to search results page on submit
- Use Nuqs to construct search URL with parameters
- Style with Tailwind CSS matching header design
- Integrate into existing app-header-search component

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Search bar appears in application header
- [ ] Keyboard shortcuts work correctly
- [ ] Debouncing prevents excessive API calls
- [ ] Navigation to results page functions properly
- [ ] Component is accessible
- [ ] All validation commands pass

---

### Step 11: Add TanStack Query Integration for Client-Side Caching

**What**: Implement TanStack Query hooks for search results caching and optimistic updates
**Why**: Reduces redundant database calls and improves user experience with instant navigation
**Confidence**: High

**Files to Create:**

- `src/lib/hooks/search/use-search-query.ts` - TanStack Query hook for search

**Changes:**

- Create useSearchQuery hook wrapping search server action
- Configure cache time and stale time appropriately
- Implement query key structure based on search parameters
- Add prefetching for common searches
- Handle loading and error states
- Integrate with global search bar for autocomplete
- Follow existing query hook patterns from the project

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Query hook properly caches search results
- [ ] Cache invalidation works correctly
- [ ] Loading and error states handled
- [ ] TypeScript types properly inferred
- [ ] All validation commands pass

---

### Step 12: Implement Search Analytics Tracking

**What**: Add analytics tracking for search queries, result clicks, and no-result searches
**Why**: Provides insights into user search behavior for future optimization and content discovery
**Confidence**: Medium

**Files to Create:**

- `src/lib/utils/analytics/search-analytics.ts` - Search analytics helper functions

**Changes:**

- Create trackSearchQuery function logging search terms
- Create trackSearchResultClick function tracking clicked results
- Create trackNoResults function for failed searches
- Integrate with existing analytics or logging infrastructure
- Add privacy-conscious data collection
- Consider integration with Sentry for error tracking
- Store analytics data appropriately (database or external service)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Search events tracked correctly
- [ ] Privacy requirements met
- [ ] Data stored appropriately
- [ ] No performance impact on search
- [ ] All validation commands pass

---

### Step 13: Add Search URL State Management Tests

**What**: Create unit tests for Nuqs integration and URL parameter handling
**Why**: Ensures URL state management works correctly and search URLs are shareable
**Confidence**: High

**Files to Create:**

- `tests/unit/lib/hooks/search/use-search-url-state.test.ts` - URL state tests

**Changes:**

- Test query parameter parsing and validation
- Test URL construction from search parameters
- Test browser history navigation
- Test parameter sanitization
- Verify shareable URL generation
- Use Testing Library for React hooks testing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All URL state tests pass
- [ ] Edge cases covered (invalid params, special characters)
- [ ] Test coverage meets project standards
- [ ] All validation commands pass

---

### Step 14: Create Search Query Function Tests

**What**: Create integration tests for search query functions using Testcontainers
**Why**: Validates database queries execute correctly with proper permissions and indexing
**Confidence**: High

**Files to Create:**

- `tests/integration/lib/queries/search/user-search.query.test.ts` - Query integration tests

**Changes:**

- Test searchCollections with various user permissions
- Test searchSubcollections with parent collection access
- Test searchBobbleheads with collection permissions
- Test searchAll unified query
- Verify GIN index usage with EXPLAIN ANALYZE
- Test pagination and result ordering
- Test edge cases (empty results, special characters, SQL injection attempts)
- Use Testcontainers for isolated database testing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All query tests pass
- [ ] Permission filtering validated
- [ ] Index usage confirmed
- [ ] Edge cases covered
- [ ] All validation commands pass

---

### Step 15: Create Search Server Action Tests

**What**: Create unit tests for search server action validation and error handling
**Why**: Ensures server action properly validates input, handles errors, and manages authentication
**Confidence**: High

**Files to Create:**

- `tests/unit/lib/actions/search/user-search.actions.test.ts` - Server action tests

**Changes:**

- Test validation schema enforcement
- Test authentication requirement
- Test successful search execution
- Test error handling and edge cases
- Mock facade layer responses
- Verify cache integration
- Test rate limiting if implemented

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All server action tests pass
- [ ] Validation errors properly handled
- [ ] Authentication enforced
- [ ] Error cases covered
- [ ] All validation commands pass

---

### Step 16: Create Search UI Component Tests

**What**: Create component tests for search bar, results page, and result cards
**Why**: Ensures UI components render correctly, handle user interactions, and maintain accessibility
**Confidence**: High

**Files to Create:**

- `tests/unit/components/layout/header/global-search-bar.test.tsx` - Search bar tests
- `tests/unit/components/feature/search/search-result-cards.test.tsx` - Result card tests
- `tests/unit/app/(app)/browse/search/page.test.tsx` - Search page tests

**Changes:**

- Test search bar rendering and keyboard shortcuts
- Test autocomplete functionality
- Test result card rendering for all content types
- Test search page with various states (loading, empty, error, results)
- Test pagination controls
- Test filter interactions
- Verify accessibility with Testing Library queries
- Mock server actions and query hooks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All component tests pass
- [ ] Accessibility requirements validated
- [ ] User interactions tested
- [ ] Test coverage meets project standards
- [ ] All validation commands pass

---

### Step 17: Create End-to-End Search Flow Test

**What**: Create E2E test covering complete search user journey from input to result navigation
**Why**: Validates entire search feature works correctly in realistic usage scenarios
**Confidence**: Medium

**Files to Create:**

- `tests/e2e/search/search-flow.test.ts` - E2E search flow test

**Changes:**

- Test complete search flow: open search, enter query, view results, click result
- Test keyboard navigation and shortcuts
- Test pagination through results
- Test filter application
- Test URL sharing and direct navigation to search results
- Test authentication requirements
- Use Testing Library for user interactions
- Mock Clerk authentication if needed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] E2E test covers complete user journey
- [ ] All user interactions work correctly
- [ ] URL state properly managed
- [ ] Authentication properly enforced
- [ ] All validation commands pass

---

### Step 18: Performance Optimization and Index Validation

**What**: Validate search performance with database query analysis and optimize if needed
**Why**: Ensures search remains performant with large datasets and proper index utilization
**Confidence**: Medium

**Files to Modify:**

- Query files if optimization needed based on EXPLAIN ANALYZE results

**Changes:**

- Use `/db` command to run EXPLAIN ANALYZE on search queries
- Verify GIN indexes are used for full-text search
- Check query execution times with realistic data volumes
- Add missing indexes if identified
- Optimize query structure if performance issues found
- Document performance benchmarks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All search queries use appropriate indexes
- [ ] Query execution times within acceptable range (<100ms)
- [ ] No N+1 query problems identified
- [ ] Performance benchmarks documented
- [ ] All validation commands pass

---

### Step 19: Update Search Documentation

**What**: Create comprehensive documentation for search feature implementation and usage
**Why**: Provides reference for future maintenance and helps team understand search architecture
**Confidence**: High

**Files to Create:**

- `docs/2025_11_05/specs/UnifiedSearchFeature.md` - Search feature specification
- `docs/2025_11_05/design/SearchArchitecture.md` - Architecture documentation

**Changes:**

- Document search feature architecture and data flow
- Explain permission filtering logic
- Document URL state management patterns
- Include performance considerations and optimization notes
- Add troubleshooting guide for common issues
- Document analytics tracking implementation
- Include screenshots or diagrams of UI components
- List all new files created and their purposes

**Validation Commands:**

```bash
npm run lint:fix
```

**Success Criteria:**

- [ ] Architecture clearly documented
- [ ] All components and flows explained
- [ ] Troubleshooting guide included
- [ ] Documentation saved in correct location (docs/2025_11_05/)
- [ ] Markdown formatting validated

---

### Step 20: Final Integration Testing and Validation

**What**: Perform comprehensive manual testing of search feature across all user scenarios
**Why**: Ensures feature works correctly in production-like environment before deployment
**Confidence**: High

**Changes:**

- Test search with authenticated users
- Test permission filtering (user-owned vs public content)
- Test all content types (collections, subcollections, bobbleheads)
- Test edge cases (empty search, special characters, very long queries)
- Test pagination and filtering
- Test keyboard navigation and accessibility
- Test on different browsers and devices
- Verify URL sharing works correctly
- Test cache behavior
- Verify analytics tracking

**Validation Commands:**

```bash
npm run build && npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All manual test scenarios pass
- [ ] No console errors or warnings
- [ ] Accessibility validated with screen reader
- [ ] URL sharing works correctly
- [ ] Production build succeeds
- [ ] All validation commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All tests pass `npm run test`
- [ ] Production build succeeds `npm run build`
- [ ] Database migrations applied successfully to development branch
- [ ] GIN indexes verified on all search_vector columns
- [ ] Search performance benchmarks meet requirements (<100ms query time)
- [ ] Accessibility validated for all UI components
- [ ] Documentation complete and saved in docs/2025_11_05/

## Notes

**Critical Assumptions:**

- Clerk authentication provides user context through server components and actions
- CacheService.search.results() is properly configured for Redis caching
- TanStack Query is already set up in the application layout providers
- GIN indexes on collections and bobbleheads are properly maintained

**Risk Mitigation:**

- **Medium Risk**: Subcollection search vector migration requires data backfill - use `/db` command to verify successful migration
- **Medium Risk**: Performance with large datasets - validate index usage with EXPLAIN ANALYZE early
- **Low Risk**: Cache invalidation complexity - follow existing CacheService patterns

**Performance Considerations:**

- Search queries should complete in <100ms with proper indexing
- Debounce autocomplete requests to 300ms minimum
- Cache search results for 5 minutes client-side
- Consider implementing search result pagination limit (e.g., max 100 results per query)

**Security Considerations:**

- All search queries must filter by user permissions (public or user-owned content)
- Input sanitization prevents SQL injection through Zod validation
- Rate limiting should be considered for search endpoints
- Search analytics must respect user privacy

**Future Enhancements:**

- Advanced filters (date range, collection type, visibility)
- Search suggestions based on popular queries
- Saved searches for authenticated users
- Search highlighting in results
- Fuzzy matching for typo tolerance

---

## Plan Validation Results

✅ **Format Check**: Plan generated in markdown format (not XML)
✅ **Template Compliance**: All required sections included (Overview, Quick Summary, Prerequisites, Implementation Steps, Quality Gates, Notes)
✅ **Step Structure**: All 20 steps include What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria
✅ **Validation Commands**: Every step touching code files includes `npm run lint:fix && npm run typecheck`
✅ **No Code Examples**: Plan contains instructions only, no implementation code
✅ **Actionable Steps**: All steps are concrete and actionable with clear deliverables
✅ **Quality Gates**: Comprehensive quality checks included
✅ **Content Quality**: Plan addresses all aspects of refined feature request

## Complexity Assessment

- **Estimated Duration**: 2-3 days
- **Total Steps**: 20 implementation steps
- **Critical Steps**: 5 (schema updates, query layer, facade layer, UI components)
- **Testing Steps**: 6 (unit, integration, E2E, performance)
- **Documentation Steps**: 1
- **Risk Level**: Medium (database migration, performance optimization)

## Summary

Implementation plan successfully generated with 20 detailed steps covering the complete search feature implementation. The plan follows established project patterns, extends existing admin search infrastructure, adds subcollection search capabilities, and creates a comprehensive user-facing search experience with proper authentication, caching, and performance optimization.
