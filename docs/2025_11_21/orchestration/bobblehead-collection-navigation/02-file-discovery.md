# Step 2: AI-Powered File Discovery

**Step Status**: ✅ Completed
**Started**: 2025-11-21T00:01:00Z
**Completed**: 2025-11-21T00:03:00Z
**Duration**: ~120 seconds

## Refined Request Used as Input

As a user, I want a way to navigate between bobbleheads within a collection or subcollection directly from the bobblehead details page, allowing me to cycle through items sequentially without returning to the collection view. This feature should preserve the collection context through the URL using Nuqs for state management and type-safe routing via $path from next-typesafe-url, displaying previous and next navigation buttons (using Lucide React icons) that are intelligently disabled at collection boundaries. The implementation should leverage the existing App Router structure by maintaining collection/subcollection IDs in the URL query parameters alongside the current bobblehead ID, enabling seamless navigation while preserving filter, sort, and pagination states if previously applied. The detail page should fetch the sequential bobblehead data efficiently using Drizzle ORM queries that determine the previous and next items based on the collection's current sort order, with proper TypeScript typing for all data structures. Navigation should be implemented as Radix UI button components integrated into the existing detail page layout, supporting both keyboard shortcuts (arrow keys) and mouse clicks, while ensuring the feature respects user permissions through server-side validation via Next-Safe-Action before rendering navigation options. When a user navigates to an adjacent bobblehead, the page should update the URL parameters without full navigation where possible, and the component should display loading states during transitions.

## AI Analysis Process

### Discovery Method

✅ Used file-discovery-agent subagent with AI-powered content analysis

### Analysis Scope

- Explored 12+ directories across app routes, components, database schemas, queries, actions, and utilities
- Examined 35+ candidate files including pages, components, queries, actions, and schemas
- Found 23 highly relevant files for core implementation
- Identified 12 supporting files for integration and utilities

### AI Capabilities Utilized

- Context-aware analysis of feature requirements
- Codebase structure and pattern recognition
- Content-based file relevance assessment
- Smart prioritization based on implementation dependencies
- Integration point identification
- Pattern matching for similar functionality

## Discovered Files Summary

### Statistics

- **Total Discovered**: 23 files
- **Critical Priority**: 6 files
- **High Priority**: 8 files
- **Medium Priority**: 6 files
- **Low Priority**: 3 files
- **Files to Create**: 4 new files
- **Files to Modify**: 19 existing files

### File Validation Results

All 19 existing files validated successfully:

✅ `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`
✅ `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts`
✅ `src/lib/queries/bobbleheads/bobbleheads-query.ts`
✅ `src/lib/facades/bobbleheads/bobbleheads.facade.ts`
✅ `src/lib/db/schema/bobbleheads.schema.ts`
✅ `src/lib/db/schema/collections.schema.ts`
✅ `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx`
✅ `src/components/ui/button.tsx`
✅ `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx`
✅ `src/app/(app)/browse/search/components/search-page-content.tsx`
✅ `src/lib/actions/bobbleheads/bobbleheads.actions.ts`
✅ `src/lib/validations/bobbleheads.validation.ts`
✅ `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx`
✅ `src/lib/queries/base/query-context.ts`
✅ `src/lib/queries/base/base-query.ts`
✅ `src/lib/services/cache-revalidation.service.ts`
✅ `src/lib/services/cache.service.ts`
✅ `src/lib/constants/slug.ts`
✅ `src/utils/optional-auth-utils.ts`

### Files to Create

1. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx` - Client navigation component
2. `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx` - Server async wrapper
3. `src/lib/validations/bobblehead-navigation.validation.ts` - Navigation validation schemas
4. `src/lib/types/bobblehead-navigation.types.ts` - Navigation TypeScript types

## Detailed File Analysis

### Critical Priority Files (6)

#### 1. Bobblehead Detail Page

**File**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx`

- **AI Reasoning**: Main bobblehead detail page that will host navigation controls. Currently fetches bobblehead by slug and renders detail sections. Need to add collection context parameters and navigation buttons here.
- **Current Functionality**: Uses `withParamValidation`, fetches bobblehead data via `BobbleheadsFacade.getBobbleheadBySlug()`, renders header/gallery/metrics/details sections with Suspense boundaries
- **Integration Points**: Receives `bobbleheadSlug` from route params, has access to `collectionId` from `basicBobblehead.collectionId`, needs to accept collection/subcollection query params
- **Modification Required**: Add search params extraction, pass to navigation component

#### 2. Route Type Definition

**File**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/route-type.ts`

- **AI Reasoning**: Type-safe route definition for bobblehead detail page. Must be extended to include optional query parameters for `collectionId`, `subcollectionId`, `sort`, `view`, etc. to maintain collection context
- **Current Functionality**: Defines `routeParams` with `bobbleheadSlug` validation using Zod
- **Required Changes**: Add `searchParams` object with optional collection context fields using `parseAsString` and Nuqs parsers

#### 3. Bobbleheads Query Layer

**File**: `src/lib/queries/bobbleheads/bobbleheads-query.ts`

- **AI Reasoning**: Database query layer for bobbleheads. Must add new query methods to fetch previous/next bobbleheads within collection context
- **Current Functionality**: Contains `BobbleheadsQuery` class with methods like `findByCollectionAsync()`, `findBySlugAsync()`, uses Drizzle ORM with standard permission filtering
- **Required New Methods**: `findNavigationContext()` - Get prev/next bobbleheads based on collection sort order. Query should determine adjacent items using window functions or indexed queries. Must respect permission filtering (isPublic, userId, isDeleted)
- **File Size**: 675 lines with extensive query methods

#### 4. Bobbleheads Facade Layer

**File**: `src/lib/facades/bobbleheads/bobbleheads.facade.ts`

- **AI Reasoning**: Business logic facade for bobblehead operations. Orchestrates the navigation query logic with caching and error handling
- **Current Functionality**: Contains methods like `getBobbleheadBySlug()`, `getBobbleheadsByCollection()`, implements caching via `CacheService`, handles errors with `createFacadeError()`
- **Required New Methods**: `getBobbleheadNavigationContext()` - Returns prev/next bobblehead slugs/IDs with collection context. Should include caching strategy for navigation data
- **File Size**: 824 lines, comprehensive caching and error handling patterns

#### 5. Bobbleheads Database Schema

**File**: `src/lib/db/schema/bobbleheads.schema.ts`

- **AI Reasoning**: Drizzle schema definition for bobbleheads table. Understanding table structure and indexes for efficient navigation queries
- **Current Structure**: Contains `collectionId`, `subcollectionId`, `slug`, `createdAt`, `name`, `isPublic`, `userId` fields with indexes on `collectionId`, sort columns
- **Key Indexes**: `bobbleheads_collection_covering_idx`, `bobbleheads_collection_public_idx` will optimize navigation queries
- **Sort Fields Available**: `createdAt`, `name`, `likeCount`, `viewCount` for different sort orders

#### 6. Collections Database Schema

**File**: `src/lib/db/schema/collections.schema.ts`

- **AI Reasoning**: Schema for collections and subcollections tables. Need to validate collection/subcollection IDs and check ownership for navigation permissions
- **Current Structure**: Collections have `id`, `slug`, `userId`, `isPublic`; SubCollections have `collectionId`, `id`, `slug`, `sortOrder`
- **Usage**: Navigation should validate collection context and check if user has permission to see navigation within collection

### High Priority Files (8)

#### 7. Bobblehead Header Component

**File**: `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header.tsx`

- **AI Reasoning**: Header component for bobblehead detail page. Ideal location to add navigation buttons (prev/next) in the header section
- **Current Functionality**: Displays bobblehead name, owner info, edit/share actions
- **Integration Point**: Add navigation arrows here alongside existing header actions

#### 8. UI Button Component

**File**: `src/components/ui/button.tsx`

- **AI Reasoning**: Reusable Radix UI button component with variants. Use for prev/next navigation buttons with icon variant
- **Current Functionality**: Provides `Button` component with `variant`, `size` props, supports `asChild` for Link components
- **Usage Pattern**: `<Button variant="ghost" size="icon"><ChevronLeft /></Button>`

#### 9-10. Navigation Components (NEW)

**Files**:

- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation.tsx`
- `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/async/bobblehead-navigation-async.tsx`

**AI Reasoning**: New components for previous/next navigation buttons. Client component to handle navigation with Nuqs URL state management, server wrapper to fetch navigation data
**Required Functionality**:

- Accept `currentBobbleheadId`, `collectionId`, `subcollectionId`, navigation data as props
- Render prev/next buttons with Lucide icons (ChevronLeft/ChevronRight)
- Use `$path()` for type-safe navigation with preserved query params
- Handle keyboard shortcuts (ArrowLeft/ArrowRight)
- Disable buttons at collection boundaries
- Show loading state during transitions

#### 11. Collection Bobblehead Controls (Reference)

**File**: `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls.tsx`

- **AI Reasoning**: Example of Nuqs implementation for filters/search. Reference pattern for using `useQueryStates` with Nuqs
- **Pattern Used**: `parseAsString.withDefault('')`, `parseAsStringEnum()`, `shallow: false` option, debounced updates
- **Key Learning**: How to maintain URL state for search, sort, view options

#### 12. Search Page Content (Reference)

**File**: `src/app/(app)/browse/search/components/search-page-content.tsx`

- **AI Reasoning**: Complex Nuqs example with pagination and filters. Shows advanced `useQueryStates` usage with multiple parsers
- **Pattern Used**: `parseAsInteger`, `parseAsArrayOf()`, `clearOnDefault: true`, `history: 'push'`
- **Key Learning**: How to handle complex URL state with proper typing

### Medium Priority Files (6)

#### 13. Bobbleheads Actions

**File**: `src/lib/actions/bobbleheads/bobbleheads.actions.ts`

- **AI Reasoning**: Server actions for bobblehead mutations. May need action for tracking navigation analytics or prefetching
- **Current Functionality**: Contains `createBobbleheadWithPhotosAction`, `updateBobbleheadWithPhotosAction`, `deleteBobbleheadAction` using Next-Safe-Action
- **Pattern**: Uses `authActionClient`, validates with Zod schemas, includes rate limiting middleware
- **Potential Use**: Could add `getBobbleheadNavigationAction` if client-side fetch needed

#### 14-16. Validation and Types (NEW + Reference)

**Files**:

- `src/lib/validations/bobblehead-navigation.validation.ts` (NEW)
- `src/lib/types/bobblehead-navigation.types.ts` (NEW)
- `src/lib/validations/bobbleheads.validation.ts` (Reference)

**AI Reasoning**: Type-safe validation for navigation requests. Reference existing bobblehead validation patterns
**Required Schemas**: `getBobbleheadNavigationSchema` - validates bobbleheadId, collectionId, subcollectionId, sortBy params
**Required Types**: NavigationContext type with prev/next bobblehead data, position, total count

#### 17. Collection Bobbleheads Component (Reference)

**File**: `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads.tsx`

- **AI Reasoning**: Shows how bobbleheads are displayed in collection context with filters. Understanding the collection view that leads to bobblehead navigation
- **Current Functionality**: Fetches bobbleheads via `CollectionsFacade.getCollectionBobbleheadsWithPhotos()`, handles search/sort params
- **Key Insight**: Sort options include 'newest', 'oldest', 'name_asc', 'name_desc' - navigation should respect these

### Low Priority Files (3)

#### 18-19. Base Query Utilities

**Files**:

- `src/lib/queries/base/query-context.ts`
- `src/lib/queries/base/base-query.ts`

**AI Reasoning**: Base query context utilities for permission handling. Understanding `createUserQueryContext()`, `createPublicQueryContext()` for navigation queries
**Usage**: Navigation query should extend or use these utility methods

#### 20-21. Cache Services

**Files**:

- `src/lib/services/cache-revalidation.service.ts`
- `src/lib/services/cache.service.ts`

**AI Reasoning**: Cache invalidation and caching service. Navigation data should be cached and revalidated appropriately
**Pattern**: Has methods like `bobbleheads.onCreate()`, `bobbleheads.onUpdate()` for cache invalidation. CacheService shows caching patterns with TTL

#### 22-23. Utility Files

**Files**:

- `src/lib/constants/slug.ts`
- `src/utils/optional-auth-utils.ts`

**AI Reasoning**: Slug validation constants and authentication utilities. Used in route-type validation and permission checking

## Architecture Patterns Discovered

### 1. Type-Safe Routing Pattern

- Uses `next-typesafe-url` with `$path()` helper
- Route-type files define `routeParams` and `searchParams` with Zod validation
- Pattern: `withParamValidation(Component, Route)`

### 2. Nuqs URL State Management

- Client components use `useQueryStates` hook
- Parsers: `parseAsString`, `parseAsInteger`, `parseAsStringEnum`, `parseAsArrayOf`
- Options: `shallow`, `clearOnDefault`, `history`, debouncing

### 3. Server/Client Component Separation

- Async server components (`*-async.tsx`) fetch data
- Pass data to client components for interactivity
- Clear separation of data fetching and UI logic

### 4. Three-Layer Query Architecture

- **Query Layer**: Database queries with Drizzle ORM
- **Facade Layer**: Business logic, caching, error handling
- **Component/Action Layer**: UI and mutations

### 5. Permission Filtering Pattern

- All queries use `QueryContext` with `buildBaseFilters()`
- Consistent permission checking across `isPublic`, `userId`, `isDeleted`
- Context-aware queries for user-specific and public data

### 6. Caching Strategy

- Redis caching via `CacheService` with TTL (typically 1800s/30min)
- Context-aware cache keys
- Automatic invalidation on CRUD operations via `CacheRevalidationService`

### 7. Error Handling Pattern

- Centralized via `createFacadeError()`
- Sentry integration for error tracking
- Try/catch blocks in all facade methods

### 8. Validation Pattern

- Drizzle-Zod for schema validation
- Custom Zod utilities (`zodMaxString`, `zodDateString`)
- Extensive use of SCHEMA_LIMITS constants

## Integration Points Identified

1. **Route Parameter Extension**: Add `searchParams` to `route-type.ts`
2. **Page Component Enhancement**: Extract search params in `page.tsx`, pass to navigation
3. **Header Integration**: Add navigation buttons to `bobblehead-header.tsx`
4. **Query Layer Addition**: Add navigation queries to `BobbleheadsQuery` class
5. **Facade Method Addition**: Add `getBobbleheadNavigationContext()` to `BobbleheadsFacade`
6. **Client Component Creation**: Build `BobbleheadNavigation` with Nuqs and keyboard shortcuts

## Similar Functionality Reference

### Collection Bobblehead Controls

Shows how to maintain search/sort/filter state in URL using Nuqs with debouncing and shallow navigation control

### Search Page Content

Complex example of Nuqs with pagination and multiple filter types, demonstrating proper TypeScript typing for URL state

### Bobblehead Gallery Card

Shows how to link to bobblehead detail pages with collection context preserved

## AI Analysis Metrics

- **Discovery Duration**: ~120 seconds
- **Directories Explored**: 12+
- **Files Examined**: 35+
- **Relevant Files Found**: 23
- **Files Validated**: 19/19 existing files ✓
- **New Files Required**: 4
- **Pattern Recognition**: 8 architectural patterns identified
- **Integration Points**: 6 identified

## Recommended Implementation Phases

### Phase 1: Data Layer (Critical Priority)

1. Extend `route-type.ts` with search params definition
2. Add navigation query methods to `BobbleheadsQuery`
3. Create `BobbleheadsFacade.getBobbleheadNavigationContext()`
4. Create validation schemas and types

### Phase 2: UI Layer (High Priority)

1. Create `BobbleheadNavigation` client component with Nuqs
2. Create `BobbleheadNavigationAsync` server wrapper
3. Integrate navigation into `page.tsx` and `bobblehead-header.tsx`
4. Implement keyboard shortcuts and loading states

### Phase 3: Optimization (Medium Priority)

1. Add caching for navigation queries
2. Implement prefetching for adjacent bobbleheads
3. Add analytics tracking for navigation usage
4. Performance testing with large collections

## Coverage Analysis

✅ **Database Layer**: Schemas, queries identified
✅ **Business Logic Layer**: Facade identified
✅ **Validation Layer**: Validation patterns identified
✅ **UI Component Layer**: Components and references identified
✅ **Routing Layer**: Route types and $path usage identified
✅ **State Management**: Nuqs patterns identified
✅ **Caching Layer**: Cache services identified
✅ **Permission Layer**: Auth utilities identified

## Quality Metrics

- **Comprehensive Coverage**: ✅ All architectural layers represented
- **Minimum Files Requirement**: ✅ 23 files (exceeds minimum of 5)
- **AI Content Analysis**: ✅ Analyzed actual file contents, not just filenames
- **Smart Prioritization**: ✅ Files categorized by implementation priority
- **Pattern Recognition**: ✅ Identified 8 existing patterns to follow
- **File Validation**: ✅ All 19 existing files verified to exist

## Step 2 Success Criteria

✅ **AI-Powered Discovery Completed**: Used file-discovery-agent with comprehensive analysis
✅ **Minimum Files Discovered**: 23 files (exceeds 3 minimum)
✅ **AI Analysis Quality**: Detailed reasoning for each file's relevance and priority
✅ **File Validation**: All 19 existing files validated to exist and be accessible
✅ **Smart Categorization**: Files properly categorized by AI-determined implementation priority
✅ **Comprehensive Coverage**: AI discovery covers all major components affected by feature
✅ **Content Validation**: AI analysis based on actual file contents, not just filenames
✅ **Pattern Recognition**: AI identified 8 existing patterns and similar functionality

## Notes

The AI-powered file discovery successfully identified all relevant files across the entire application architecture, from database schemas to UI components. The analysis revealed strong existing patterns for URL state management (Nuqs), type-safe routing, and three-layer query architecture that this feature should follow. All discovered files were validated to exist, and 4 new files were identified for creation. The comprehensive analysis provides a complete roadmap for implementation with clear priorities and integration points.
