# Browse Categories Page Implementation Plan

**Generated**: 2025-11-09
**Original Request**: as a user I would like to use the /browse/categories page to browse collections, subcollections, and bobbleheads
**Refined Request**: As a user, I would like to use the /browse/categories page to discover and navigate through bobblehead collections, subcollections, and individual bobbleheads organized by category taxonomy, enabling streamlined content exploration across the platform's hierarchical data structure. This feature should leverage the existing Next.js App Router with server-side rendering for optimal performance and SEO, implementing a comprehensive filtering and search experience similar to the current /browse collections implementation but specifically optimized for category-based navigation.

## Analysis Summary

- Feature request refined with project context
- Discovered 49 files across 12 directories
- Generated 15-step implementation plan
- Estimated duration: 3-4 days

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Implement a comprehensive category-based browsing system that allows users to discover collections and bobbleheads organized by categories. This feature leverages the existing varchar category field on the bobbleheads table, requiring queries to extract distinct categories and filter collections by the bobbleheads they contain within selected categories. The implementation follows established patterns from the browse collections feature, adapting the architecture for category-specific navigation.

## Prerequisites

- [ ] Database schema review confirming category field structure on bobbleheads table
- [ ] Verify existing index on bobbleheads.category for query performance
- [ ] Review browse collections implementation for pattern replication
- [ ] Ensure development environment has all dependencies installed

## Implementation Steps

### Step 1: Create Category Query Methods in CollectionsQuery

**What**: Add methods to retrieve distinct categories and filter collections by category
**Why**: Provides database layer for category data extraction and collection filtering based on bobbleheads within those categories
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collections\collections.query.ts` - Add getDistinctCategoriesAsync and getBrowseCategoriesAsync methods

**Changes:**
- Add getDistinctCategoriesAsync method to retrieve all distinct non-null categories from bobbleheads table with counts
- Add getBrowseCategoriesAsync method similar to getBrowseCollectionsAsync but filtering collections by bobbleheads matching category parameter
- Implement JOIN between collections and bobbleheads tables to filter by category field
- Include same permission filtering, search, pagination, and sorting logic from browse collections
- Leverage existing bobbleheads.category index for performance

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] getDistinctCategoriesAsync returns array of category names with counts
- [ ] getBrowseCategoriesAsync filters collections containing bobbleheads in specified category
- [ ] Queries respect permission filters for public and user-owned collections
- [ ] All validation commands pass

---

### Step 2: Create Browse Categories Validation Schemas

**What**: Create Zod validation schemas for category browsing with filters, sorting, and pagination
**Why**: Ensures type-safe input validation for category-based browsing operations
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\browse-categories.validation.ts` - Category browsing validation schemas

**Files to Modify:**
- None

**Changes:**
- Create browseCategoriesSortSchema with sortBy options: name, createdAt, likeCount, followerCount, bobbleheadCount
- Create browseCategoriesPaginationSchema using CONFIG.PAGINATION.COLLECTIONS settings
- Create browseCategoriesFiltersSchema with category (varchar string), query, ownerId, dateFrom, dateTo fields
- Change categoryId from UUID to category varchar string for filtering
- Create browseCategoriesInputSchema combining filters, sorting, and pagination
- Export all types using z.infer for type safety
- Add date range validation refinement

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All validation schemas properly defined with correct field types
- [ ] Category field validates varchar strings instead of UUIDs
- [ ] Type exports match schema definitions
- [ ] Date range validation works correctly
- [ ] All validation commands pass

---

### Step 3: Create Browse Categories Facade Method

**What**: Add browseCategories method to CollectionsFacade with caching, error handling, and Sentry integration
**Why**: Provides business logic layer for category browsing following established facade patterns
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\collections\collections.facade.ts` - Add browseCategories and getCategories methods

**Changes:**
- Add getCategories method calling CollectionsQuery.getDistinctCategoriesAsync with public context
- Add browseCategories method following exact pattern from browseCollections method
- Implement CacheService.collections.public for caching with category-specific cache key
- Add Sentry breadcrumbs for filter tracking, pagination depth, and performance monitoring
- Transform results to include Cloudinary optimized URLs for bobblehead photos
- Add comprehensive error handling with createFacadeError
- Track active filters and slow query performance metrics

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] getCategories returns cached list of distinct categories with counts
- [ ] browseCategories implements same caching strategy as browseCollections
- [ ] Sentry integration captures performance metrics and errors
- [ ] Cloudinary URL optimization applied to results
- [ ] All validation commands pass

---

### Step 4: Create Browse Categories Server Action

**What**: Create server action for category browsing with input validation and error handling
**Why**: Provides server-side entry point for category browse operations following Next-Safe-Action patterns
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\collections\collections.actions.ts` - Add browseCategoriesAction and getCategoriesAction

**Changes:**
- Add browseCategoriesAction using publicActionClient with browseCategoriesInputSchema
- Parse ctx.sanitizedInput through browseCategoriesInputSchema for type safety
- Call CollectionsFacade.browseCategories with parsed input and optional dbInstance
- Add Sentry context for input info and breadcrumbs for results
- Implement handleActionError for error scenarios
- Add getCategoriesAction for retrieving category list
- Use ACTION_NAMES.COLLECTIONS.BROWSE_CATEGORIES constant

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] browseCategoriesAction properly validates and sanitizes input
- [ ] Action calls facade method with correct parameters
- [ ] Sentry tracking captures action execution and errors
- [ ] getCategoriesAction returns available categories
- [ ] All validation commands pass

---

### Step 5: Create Browse Categories Content Component

**What**: Create client component for category browsing UI with Nuqs state management
**Why**: Provides interactive category browsing interface following established component patterns
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\categories\components\browse-categories-content.tsx` - Main category browsing client component

**Files to Modify:**
- None

**Changes:**
- Create BrowseCategoriesContent component following exact structure of BrowseCollectionsContent
- Implement Nuqs URL state management for category filter, search, pagination, and sorting
- Add useEffect to fetch data when query params change using browseCategoriesAction
- Implement transition state management with useTransition for loading states
- Add Sentry breadcrumbs for action execution, success, and errors
- Track performance metrics for slow responses
- Reuse BrowseCollectionsFilters, BrowseCollectionsTable, and BrowseCollectionsPagination components
- Add category selector UI element using getCategories for available categories

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component properly manages URL state with Nuqs
- [ ] Data fetches on param changes using server action
- [ ] Loading, error, and success states properly handled
- [ ] Existing browse components integrated correctly
- [ ] All validation commands pass

---

### Step 6: Create Browse Categories Page Component

**What**: Create server component for categories page with metadata and Suspense boundaries
**Why**: Provides entry point for category browsing feature with proper SEO and loading states
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\categories\page.tsx` - Main categories page

**Changes:**
- Replace placeholder with full page implementation
- Add Sentry context and breadcrumbs for page load tracking
- Implement Suspense boundary wrapping BrowseCategoriesContent with Spinner fallback
- Add page header with title "Browse Categories" and description
- Update generateMetadata to include proper description and title
- Follow exact layout structure from browse collections page

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page renders with proper header and layout
- [ ] Suspense boundary provides loading state
- [ ] Metadata properly configured for SEO
- [ ] Sentry tracking captures page loads
- [ ] All validation commands pass

---

### Step 7: Create Category-Specific Page Component

**What**: Create dynamic route page for individual category viewing
**Why**: Allows deep linking to specific category views with pre-filtered results
**Confidence**: Medium

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\categories\[category]\page.tsx` - Dynamic category page

**Changes:**
- Replace placeholder with BrowseCategoriesContent component pre-filtered by category param
- Parse category param using withParamValidation from route-type
- Pass category param as default filter to BrowseCategoriesContent
- Add Sentry context for category-specific page tracking
- Implement generateMetadata with dynamic category name in title
- Add Suspense boundary with Spinner fallback

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Dynamic route properly extracts category parameter
- [ ] Content component receives category as default filter
- [ ] Metadata includes category name dynamically
- [ ] Suspense boundary provides proper loading state
- [ ] All validation commands pass

---

### Step 8: Add Category Browse Links to Navigation Components

**What**: Update header navigation components to include browse categories links
**Why**: Provides user access to category browsing feature from main navigation
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\layout\app-header\components\app-header-nav-menu.tsx` - Desktop navigation
- `C:\Users\JasonPaff\dev\head-shakers\src\components\layout\app-header\components\app-header-mobile-menu.tsx` - Mobile navigation
- `C:\Users\JasonPaff\dev\head-shakers\src\components\layout\app-header\components\app-header-auth-nav-menu.tsx` - Auth navigation

**Changes:**
- Add "Browse Categories" navigation item to Browse dropdown menu in all three components
- Use Route.browseCategories() for type-safe routing
- Place link after "Browse Collections" menu item
- Ensure consistent styling with existing navigation items
- Add appropriate icon from Lucide React

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation links appear in all three header components
- [ ] Links use type-safe routing
- [ ] Styling matches existing navigation items
- [ ] Mobile and desktop navigation both updated
- [ ] All validation commands pass

---

### Step 9: Add Action Names and Operations Constants

**What**: Add browse categories constants to action names and operations configuration
**Why**: Ensures consistent naming and tracking across the application for category browse operations
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\action-names.ts` - Add BROWSE_CATEGORIES and GET_CATEGORIES
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\operations.ts` - Add browse categories operations

**Changes:**
- Add BROWSE_CATEGORIES and GET_CATEGORIES to ACTION_NAMES.COLLECTIONS object
- Add corresponding operations to OPERATIONS.COLLECTIONS object
- Follow naming conventions from existing browse collections constants
- Ensure constants are properly typed and exported

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Action names added to constants file
- [ ] Operations added to constants file
- [ ] Constants follow established naming patterns
- [ ] Types properly exported
- [ ] All validation commands pass

---

### Step 10: Create TypeScript Types for Category Browse Results

**What**: Add TypeScript interfaces and types for category browse data structures
**Why**: Ensures type safety across category browsing query results and component props
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\collections\collections.query.ts` - Add BrowseCategoriesResult and CategoryRecord types

**Changes:**
- Create CategoryRecord interface with name, bobbleheadCount, collectionCount fields
- Create BrowseCategoriesResult interface matching BrowseCollectionsResult structure
- Export types for use in facades, actions, and components
- Ensure types align with validation schema types from browse-categories.validation.ts

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Types properly defined for all category browse data structures
- [ ] Types align with validation schemas
- [ ] Types exported for external use
- [ ] Type checking passes without errors
- [ ] All validation commands pass

---

### Step 11: Implement Cache Keys for Category Browsing

**What**: Add category-specific cache key patterns to cache service configuration
**Why**: Enables efficient caching strategy for category browse operations with proper invalidation
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\cache.ts` - Add category browse cache key patterns

**Changes:**
- Add BROWSE_CATEGORIES pattern to cache key constants
- Add GET_CATEGORIES pattern for category list caching
- Follow existing browse collections cache key structure
- Ensure cache keys include category parameter for granular invalidation
- Add TTL configuration for category caches

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Cache key patterns added for category browse operations
- [ ] Keys support parameterized caching by category
- [ ] TTL values configured appropriately
- [ ] Keys follow established naming conventions
- [ ] All validation commands pass

---

### Step 12: Add Database Query Performance Index Verification

**What**: Verify and document that existing category index supports efficient queries
**Why**: Ensures browse categories queries perform well at scale leveraging existing database indexes
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\docs\2025_11_09\database\category-index-verification.md` - Index verification documentation

**Files to Modify:**
- None

**Changes:**
- Document existing bobbleheads_category_idx index on category column
- Verify index supports DISTINCT category queries efficiently
- Document JOIN performance with collections table using category filter
- Add query plan examples showing index usage
- Note that no additional indexes are required for initial implementation

**Validation Commands:**
- No validation needed for documentation file

**Success Criteria:**
- [ ] Documentation confirms existing index is sufficient
- [ ] Query performance expectations documented
- [ ] JOIN strategy with collections table verified
- [ ] No additional migration required

---

### Step 13: Add Category Filter Component Enhancement

**What**: Enhance BrowseCollectionsFilters to support category dropdown when used in category context
**Why**: Provides category selection UI for filtering while maintaining component reusability
**Confidence**: Medium

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\browse-collections-filters.tsx` - Add category dropdown support

**Changes:**
- Add optional categories prop accepting array of category names
- Add optional onCategoryChange callback prop
- Add category dropdown/select UI element when categories prop provided
- Conditionally render category filter based on prop presence
- Maintain backward compatibility with existing browse collections usage
- Use existing Radix UI select component for category dropdown

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component accepts optional category props
- [ ] Category dropdown renders when categories provided
- [ ] Backward compatibility maintained for collections page
- [ ] Category selection triggers filter change
- [ ] All validation commands pass

---

### Step 14: Add Sentry Performance Monitoring Configuration

**What**: Add category browse operations to Sentry transaction tracking configuration
**Why**: Enables monitoring and alerting for category browse performance issues
**Confidence**: High

**Files to Create:**
- None

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\sentry.ts` - Add category browse operations

**Changes:**
- Add browse_categories operation to tracked operations list
- Add category-specific breadcrumb categories
- Configure performance thresholds for category queries
- Add custom tags for category filtering metrics
- Ensure category operations tracked at same level as collection operations

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Category operations added to Sentry configuration
- [ ] Performance thresholds configured
- [ ] Custom tags support category filtering
- [ ] Breadcrumb categories support category context
- [ ] All validation commands pass

---

### Step 15: Create Integration Tests for Category Browsing

**What**: Add integration tests for category query methods, facade, and server actions
**Why**: Ensures category browsing functionality works correctly and maintains quality over time
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\queries\collections\collections.query.browse-categories.test.ts` - Query tests
- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\facades\collections\collections.facade.browse-categories.test.ts` - Facade tests
- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\actions\collections\collections.actions.browse-categories.test.ts` - Action tests

**Files to Modify:**
- None

**Changes:**
- Create query tests for getDistinctCategoriesAsync verifying category extraction and counts
- Create query tests for getBrowseCategoriesAsync verifying collection filtering by category
- Create facade tests verifying caching, error handling, and Cloudinary URL transformation
- Create action tests verifying input validation, facade calls, and error handling
- Use Vitest and Testing Library following existing test patterns
- Mock database responses and external services appropriately

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**
- [ ] Query tests cover distinct categories and browse filtering
- [ ] Facade tests verify caching and transformations
- [ ] Action tests verify validation and error handling
- [ ] All tests pass successfully
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All integration tests pass `npm run test`
- [ ] Category queries use existing bobbleheads.category index efficiently
- [ ] Caching strategy implemented for category browse operations
- [ ] Sentry integration captures performance and error metrics
- [ ] Navigation links provide access to category browsing
- [ ] URL state management works correctly with browser back/forward
- [ ] Component reusability maintained for browse filters, table, and pagination

## Notes

**Architecture Decisions:**

- Category field stored as varchar on bobbleheads table, not separate taxonomy table - aligns with existing schema design
- Collections filtered by JOIN to bobbleheads table where category matches filter - requires database-level filtering
- Reuse existing browse components where possible to maximize code reuse and maintain consistency
- Follow exact patterns from browse collections implementation for consistency and maintainability

**Risk Mitigation:**

- **Performance Risk (Medium)**: JOIN between collections and bobbleheads for category filtering may impact query performance at scale - mitigated by existing category index and query optimization
- **Type Safety Risk (Low)**: Changing from categoryId UUID to category varchar requires careful validation schema updates - mitigated by comprehensive type checking
- **Caching Complexity (Low)**: Category-based caching adds another dimension to cache invalidation - mitigated by following established cache key patterns

**Assumptions Requiring Confirmation:**

- Category values are consistently formatted in database (no case sensitivity issues)
- Category field never contains empty strings (null or actual category name only)
- Collections should be filtered by ANY bobblehead in collection matching category (not ALL)
- Public collections shown when they contain at least one public bobblehead in category

**Future Enhancements:**

- Category taxonomy management admin interface for standardization
- Category aliases and grouping for related categories
- Category-specific metadata (descriptions, icons, featured status)
- Advanced category filtering with multiple category selection
