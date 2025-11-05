# Step 2: AI-Powered File Discovery

**Status**: Completed
**Started**: 2025-11-05T00:01:30Z
**Completed**: 2025-11-05T00:03:45Z
**Duration**: 135 seconds

## Input

**Refined Feature Request:**
Implement a comprehensive search feature that allows authenticated users to search across collections, subcollections, and bobbleheads using a unified search bar interface, integrating with the existing Next.js 15.5.3 App Router architecture and PostgreSQL database managed through Drizzle ORM. The search functionality should utilize server actions with Next-Safe-Action for secure query execution, implementing efficient database queries through Drizzle ORM that can handle full-text search or fuzzy matching across multiple tables (collections, subcollections, and bobbleheads) while maintaining optimal performance with proper indexing. The search bar component should be built using Radix UI components for accessibility and consistency with the existing design system, styled with Tailwind CSS to match the platform's visual language, and utilize Lucide React icons for search indicators. Query parameters should be managed through Nuqs for URL state management, enabling shareable search results and browser history navigation. The implementation should include proper Zod validation schemas for search input sanitization, handle empty states and loading states appropriately, and leverage TanStack Query for client-side caching of search results to minimize redundant database calls. Search results should be displayed in a unified interface that clearly distinguishes between collections, subcollections, and bobbleheads, with appropriate metadata for each result type and navigation to the respective detail pages. The feature must integrate seamlessly with Clerk authentication to respect user permissions and privacy settings, ensure type safety throughout the search flow using TypeScript and Drizzle-Zod schemas, and follow the project's established patterns for server components and data fetching while avoiding barrel file imports and maintaining code quality standards enforced by ESLint and Prettier.

## AI Discovery Prompt Sent

```
You are the file discovery agent for the Head Shakers project. Your task is to identify ALL files relevant to implementing this feature:

**Refined Feature Request:**
[Full refined request included above]

**Your Task:**
Use your AI-powered analysis to discover relevant files across the codebase. You must:

1. **Search Comprehensively** across all layers:
   - Database schemas (src/lib/db/schema/)
   - Server actions (src/lib/actions/)
   - Database queries (src/lib/queries/)
   - Validation schemas (src/lib/validations/)
   - UI components (src/components/)
   - Page components (src/app/)
   - Existing search functionality

2. **Analyze File Content** (not just names):
   - Read files to understand their purpose
   - Identify integration points
   - Find similar existing patterns
   - Discover reusable components

3. **Categorize by Priority**:
   - CRITICAL: Must modify/create for core functionality
   - HIGH: Important for complete implementation
   - MEDIUM: Helpful for integration and patterns
   - LOW: Reference files for context

4. **Minimum Requirement**: Discover at least 5 relevant files

**Output Format:**
For each discovered file, provide:
- File path
- Priority level (CRITICAL/HIGH/MEDIUM/LOW)
- Relevance explanation (why this file matters)
- Suggested action (create/modify/reference)

Return your complete analysis with detailed reasoning for each file.
```

## AI Discovery Results

### Discovery Statistics

- **Directories Explored**: 15+
- **Files Examined**: 50+
- **Total Files Discovered**: 43
- **Critical Priority**: 5 files
- **High Priority**: 11 files
- **Medium Priority**: 12 files
- **Low Priority**: 15 files

### Critical Priority Files (Must Create/Modify)

1. **src/lib/actions/content-search/content-search.actions.ts**
   - **Priority**: CRITICAL
   - **Action**: MODIFY
   - **Relevance**: Contains existing admin-only search actions that need to be adapted for authenticated user search
   - **Current State**: Implements admin search actions using `adminActionClient`
   - **Required Changes**: Add new authenticated user search actions using `actionClient`
   - **Integration Points**: Next-Safe-Action, Zod validation, ContentSearchFacade, Sentry tracking

2. **src/lib/queries/content-search/content-search.query.ts**
   - **Priority**: CRITICAL
   - **Action**: MODIFY
   - **Relevance**: Core database query layer for search operations across collections, bobbleheads, and users
   - **Current State**: Implements collection, bobblehead, and user search with ILIKE text search
   - **Required Changes**: Add subcollections search and optimize queries for user-facing search
   - **Key Features**: BobbleheadSearchResult, CollectionSearchResult types, tag filtering, photo aggregation

3. **src/lib/facades/content-search/content-search.facade.ts**
   - **Priority**: CRITICAL
   - **Action**: MODIFY
   - **Relevance**: Business logic layer that orchestrates search operations with caching
   - **Current State**: Implements admin search facades with Redis caching
   - **Required Changes**: Add new facade methods for authenticated user search with permission filtering
   - **Key Features**: Photo grouping, tag enrichment, CacheService integration

4. **src/app/(app)/browse/search/page.tsx**
   - **Priority**: CRITICAL
   - **Action**: CREATE
   - **Relevance**: Currently a placeholder search page that needs full implementation
   - **Current State**: Empty placeholder with only metadata
   - **Required Changes**: Build complete search page with unified search interface
   - **Required Features**: Search bar, filters, result tabs, pagination, URL state management

5. **src/components/layout/app-header/components/app-header-search.tsx**
   - **Priority**: CRITICAL
   - **Action**: MODIFY
   - **Relevance**: Main search bar in app header - currently non-functional
   - **Current State**: Static UI component with no functionality
   - **Required Changes**: Transform into functional search component with navigation to search results page
   - **Required Features**: Debounced search, keyboard shortcuts, quick results preview, navigation

### High Priority Files (Important for Implementation)

6. **src/lib/validations/collections.validation.ts**
   - **Priority**: HIGH
   - **Action**: REFERENCE/MODIFY
   - **Relevance**: Zod schemas for collection validation, may need search-specific schemas

7. **src/lib/validations/subcollections.validation.ts**
   - **Priority**: HIGH
   - **Action**: REFERENCE
   - **Relevance**: Subcollection validation schemas needed for search results

8. **src/lib/validations/bobbleheads.validation.ts**
   - **Priority**: HIGH
   - **Action**: REFERENCE
   - **Relevance**: Bobblehead validation schemas for search functionality

9. **src/lib/db/schema/collections.schema.ts**
   - **Priority**: HIGH
   - **Action**: REFERENCE
   - **Relevance**: Database schema with GIN search indexes on name and description
   - **Key Finding**: Subcollections table exists but has no search indexes yet

10. **src/lib/db/schema/bobbleheads.schema.ts**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Bobblehead schema with comprehensive GIN indexes for search

11. **src/lib/queries/collections/subcollections.query.ts**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Contains `_getSearchCondition` method showing subcollection search patterns

12. **src/lib/constants/config.ts**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Search configuration constants (DEBOUNCE_MS: 300, MAX_QUERY_LENGTH: 500, MIN_QUERY_LENGTH: 2)

13. **src/lib/constants/operations.ts**
    - **Priority**: HIGH
    - **Action**: MODIFY
    - **Relevance**: Operation names for error handling, may need to add SEARCH.SUBCOLLECTIONS and SEARCH.UNIFIED

14. **src/lib/services/cache.service.ts**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Caching service with `search.results` method already implemented

15. **src/components/ui/input.tsx**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Input component with built-in `isSearch` and `isClearable` props

16. **src/components/ui/command.tsx**
    - **Priority**: HIGH
    - **Action**: REFERENCE
    - **Relevance**: Command palette component (cmdk) for advanced search interface or quick search dropdown

### Medium Priority Files (Supporting Integration)

17. **src/app/(app)/admin/featured-content/components/content-search.tsx**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Comprehensive search component example with debouncing, tag filtering, result display
    - **Key Patterns**: useDebouncedCallback, useAction hooks, tag filtering, result cards

18. **src/app/(app)/admin/featured-content/components/tag-filter.tsx**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Tag filtering UI component for potential tag-based search

19. **src/lib/queries/base/query-context.ts**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Query context patterns for permission handling (createUserQueryContext, PermissionLevel)

20. **src/lib/queries/base/permission-filters.ts**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Permission filtering logic to ensure search respects privacy settings

21. **src/lib/utils/next-safe-action.ts**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: actionClient setup (authenticated), adminActionClient (admin/moderator), publicActionClient

22. **src/lib/middleware/auth.middleware.ts**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Authentication middleware for server actions

23. **src/app/(app)/collections/[collectionId]/(collection)/components/collection-bobblehead-controls.tsx**
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Example of nuqs usage with parseAsString, parseAsStringEnum, useQueryStates for URL state

24-28. **UI Components** (card.tsx, badge.tsx, tag-badge.tsx, skeleton.tsx, empty-state.tsx)
    - **Priority**: MEDIUM
    - **Action**: REFERENCE
    - **Relevance**: Supporting UI components for search results display

### Low Priority Files (Context and Reference)

29-43. **Supporting Files** (constants, utilities, schemas, query patterns)
    - **Priority**: LOW
    - **Action**: REFERENCE
    - **Relevance**: Context files for patterns, error codes, cache configuration, Sentry tracking, etc.

## File Validation Results

✅ **All critical files validated and exist**
✅ **Path accessibility confirmed**
✅ **File content analyzed for relevance**
✅ **Integration points identified**
✅ **Existing patterns documented**

## Architecture Insights

### Existing Similar Functionality

**Admin Content Search Infrastructure**:
- Full-text search using PostgreSQL ILIKE with GIN indexes
- Tag-based filtering (include/exclude)
- Photo aggregation for bobbleheads
- Tag enrichment for all result types
- Redis caching via CacheService
- Debounced search with loading states

### Missing Components

1. **Subcollection Search**: Subcollections table exists but has NO search functionality implemented
2. **User-Facing Search Actions**: Only admin search actions exist currently
3. **Search Page Implementation**: Browse search page is a placeholder
4. **Functional Header Search**: App header search is static UI only

### Integration Points

1. **Authentication Flow**: Use `actionClient` (not `adminActionClient`) with Clerk authentication
2. **URL State Management**: Nuqs pattern for shareable search URLs
3. **Caching Strategy**: Use existing `CacheService.search.results()` method
4. **Component Patterns**: Adapt admin content-search component for user-facing search

## Recommended Approach

### Phase 1 - Query Layer
- Extend `ContentSearchQuery` to add `searchSubcollectionsAsync` method
- Create unified search method that queries all three types
- Add permission filtering for user context

### Phase 2 - Facade & Actions
- Extend `ContentSearchFacade` with user-facing search methods
- Create new actions in `content-search.actions.ts` using `actionClient`
- Add validation schema for search input (query, filters, pagination)

### Phase 3 - UI Components
- Create reusable search result card components
- Build search page with tabs and filters
- Make header search bar functional with navigation

### Phase 4 - Optimization
- Add GIN indexes to subcollections if needed
- Implement TanStack Query for client-side caching
- Add keyboard shortcuts and quick search

## AI Analysis Metrics

- **Discovery Method**: AI-powered file content analysis
- **Coverage**: Comprehensive across all architectural layers
- **Accuracy**: High - all files validated to exist and contain relevant code
- **Completeness**: Exceeded minimum requirement (43 files vs 5 minimum)

## Potential Challenges Identified

1. **Subcollection Privacy**: Subcollections inherit collection privacy but need proper joins
2. **Performance**: Searching across 3 tables - use proper indexes and limit results
3. **Type Safety**: Need to create union types for mixed search results
4. **Deduplication**: Ensure no duplicate results when searching across related entities

## Summary

AI-powered file discovery completed successfully with 43 relevant files discovered across all architectural layers. Critical files identified for modification include the existing content-search infrastructure (actions, queries, facades) and key UI components (search page, header search bar). High-priority files provide essential validation schemas, database schemas, configuration constants, and caching services. The discovery revealed existing admin search infrastructure that can be adapted for user-facing search, with the main gaps being subcollection search functionality and the actual search page implementation.
