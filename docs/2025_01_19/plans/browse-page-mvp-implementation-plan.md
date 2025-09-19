# Browse Page MVP Implementation Plan

**Generated**: 2025-01-19T10:04:00Z
**Original Request**: I want to implement the MVP version of the browse page. This will be the area of the site where people can easily and intuitively browse through collection and bobbleheads using filters and search fields. I don't want this to be the fully fleshed out super styled version of the browse page, I want to get the basic layout and everything working before we go crazy on styling and optimization.

**Refined Request**: Implement the MVP version of the browse page as a comprehensive discovery interface where users can intuitively explore collections and bobbleheads through dynamic filtering and search capabilities. The implementation should leverage the existing Next.js 15.5.3 App Router structure under `/src/app/(app)/browse/page.tsx`, integrating with the established Drizzle ORM schema for bobbleheads and collections tables that include searchable fields like category, manufacturer, series, characterName, and description. Utilize TanStack Query for efficient data fetching with the existing content-search.query.ts infrastructure, implementing server-side pagination and filtering to handle large datasets. Build the UI using Radix UI components for accessibility, incorporating existing form field components (select-field, text-field, checkbox-field) for filter controls, and leverage the established search functionality patterns from the admin featured-content components. The page should display results in a responsive grid layout using Tailwind CSS 4, showing collection cards with cover images via Cloudinary integration and bobblehead cards with primary photos, names, and basic metadata. Implement URL state management with Nuqs for shareable filter states, ensure proper TypeScript typing with Drizzle-Zod validation, and maintain the existing error boundary and loading state patterns. Focus on functional completeness over visual polish - basic filter sidebar with category, manufacturer, and condition dropdowns, simple search input with debounced queries, and straightforward card-based results display with pagination controls, while ensuring integration with Clerk authentication for user-specific visibility permissions and maintaining performance through the existing query optimization patterns.

## Analysis Summary

- Feature request refined with project context
- Discovered 21 files across 3 priority levels
- Generated 8-step implementation plan

## File Discovery Results

### High Priority Files (Core Implementation)

- `/src/app/(app)/browse/page.tsx` - Main browse page (needs implementation)
- `/src/lib/queries/content-search/content-search.query.ts` - Existing search infrastructure
- `/src/lib/db/schema/bobbleheads.schema.ts` - Bobblehead schema with searchable fields
- `/src/lib/db/schema/collections.schema.ts` - Collection schema
- `/src/lib/validations/bobbleheads.validation.ts` - Validation schemas
- `/src/lib/constants/enums.ts` - Enum definitions
- `/src/app/(app)/admin/featured-content/components/content-search.tsx` - Search patterns
- `/src/app/(app)/browse/featured/components/featured-content-display.tsx` - Display patterns

### Supporting Files (Integration)

- `/src/lib/actions/content-search/content-search.actions.ts` - Server actions
- `/src/lib/queries/collections/collections.query.ts` - Collection queries
- Form field components (text-field, select-field, checkbox-field)
- Tag filtering and badge components
- URL state management patterns from collection controls

## Implementation Plan

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Implement a comprehensive browse page that enables users to discover collections and bobbleheads through dynamic filtering, search capabilities, and pagination, leveraging existing infrastructure including ContentSearchQuery, form components, and TanStack Query patterns.

## Prerequisites

- [ ] Verify existing content-search query infrastructure is functional
- [ ] Confirm Cloudinary integration for image handling
- [ ] Validate Clerk authentication permissions setup

## Implementation Steps

### Step 1: Create Browse Query Infrastructure

**What**: Extend ContentSearchQuery with pagination and browse-specific methods
**Why**: Need dedicated methods for public content browsing with proper pagination
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\content-search\content-search.query.ts` - Add browseBobbleheadsAsync and browseCollectionsAsync methods with pagination

**Changes:**

- Add browseBobbleheadsAsync method with filters for category, manufacturer, condition, pagination
- Add browseCollectionsAsync method with pagination and sorting options
- Add getTotalCountAsync methods for both content types
- Implement proper permission filtering for public browse context
- Add sorting options including newest, oldest, most liked, most viewed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New browse methods accept pagination, filtering, and sorting parameters
- [ ] Methods return properly typed results with pagination metadata
- [ ] All validation commands pass
- [ ] Permission filtering correctly shows only public content

---

### Step 2: Create Browse Validation Schemas

**What**: Define TypeScript-safe validation schemas for browse filters and pagination
**Why**: Ensure type safety and URL state management for filter parameters
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\browse.validation.ts` - Browse-specific validation schemas

**Changes:**

- Create browseFiltersSchema with category, manufacturer, condition, search query
- Create browsePaginationSchema with page, limit, sort order
- Create browse result types extending existing search result types
- Export type definitions for components

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All browse parameters have proper Zod validation
- [ ] TypeScript types are exported for component usage
- [ ] Schema integrates with existing validation patterns
- [ ] All validation commands pass

---

### Step 3: Create Browse Server Actions

**What**: Implement server actions for browse operations using Next-Safe-Action
**Why**: Provide type-safe server-side data fetching with validation
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\browse\browse.actions.ts` - Browse server actions

**Changes:**

- Create browseBobbleheadsAction with input validation and error handling
- Create browseCollectionsAction with proper permission context
- Implement proper error handling and success response patterns
- Add action for getting filter options (categories, manufacturers)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Actions follow established patterns from content-search actions
- [ ] Proper input validation using browse schemas
- [ ] Error handling matches project conventions
- [ ] All validation commands pass

---

### Step 4: Create Browse Filter Components

**What**: Build reusable filter sidebar components using existing form field components
**Why**: Provide intuitive filtering interface leveraging established UI patterns
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\browse-filters.tsx` - Filter sidebar component

**Changes:**

- Create BrowseFilters component using SelectField for dropdowns
- Implement search input using existing TextField pattern
- Add filter reset functionality
- Integrate with ENUMS for condition and category options
- Use existing form field components for consistency

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component uses existing form field components consistently
- [ ] Filter options are properly typed using project enums
- [ ] Reset functionality clears all filters
- [ ] All validation commands pass

---

### Step 5: Create Browse Results Components

**What**: Build grid layout components for displaying search results
**Why**: Provide responsive display of collections and bobbleheads with proper image handling
**Confidence**: Medium

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\browse-results.tsx` - Results grid component
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\collection-card.tsx` - Collection display card
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\bobblehead-card.tsx` - Bobblehead display card

**Changes:**

- Create responsive grid layout using Tailwind CSS Grid
- Implement CollectionCard with cover image, name, owner, item count
- Implement BobbleheadCard with primary photo, name, manufacturer, year
- Add loading states and error boundaries
- Integrate Cloudinary image optimization

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid layout is responsive across device sizes
- [ ] Cards display essential information clearly
- [ ] Images load properly with Cloudinary optimization
- [ ] Loading and error states function correctly
- [ ] All validation commands pass

---

### Step 6: Create Pagination Component

**What**: Build pagination controls with page navigation
**Why**: Handle large result sets efficiently with proper navigation
**Confidence**: Medium

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\components\browse-pagination.tsx` - Pagination controls

**Changes:**

- Create pagination component with first, previous, next, last buttons
- Add page number display and total results count
- Implement URL state synchronization for sharable links
- Add proper accessibility attributes
- Handle edge cases for first/last pages

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Pagination correctly updates URL state
- [ ] Navigation buttons work as expected
- [ ] Accessibility attributes are properly implemented
- [ ] Edge cases handled gracefully
- [ ] All validation commands pass

---

### Step 7: Implement Browse Page with URL State Management

**What**: Create the main browse page integrating all components with Nuqs for URL state
**Why**: Provide complete browse experience with shareable filter states
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\page.tsx` - Main browse page implementation

**Changes:**

- Implement URL state management using Nuqs for filters and pagination
- Integrate TanStack Query for data fetching with proper error handling
- Add content type toggle (Collections vs Bobbleheads)
- Connect all filter, results, and pagination components
- Implement debounced search functionality
- Add loading states and error boundaries

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] URL state properly manages all filter parameters
- [ ] Content type toggle functions correctly
- [ ] Search queries are properly debounced
- [ ] Error states display meaningful messages
- [ ] Loading states provide good user experience
- [ ] All validation commands pass

---

### Step 8: Add Browse Page Loading and Error States

**What**: Create proper loading.tsx and error.tsx files for the browse route
**Why**: Provide consistent loading and error handling following Next.js App Router patterns
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\loading.tsx` - Loading page
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\browse\error.tsx` - Error page

**Changes:**

- Create loading page with skeleton components matching browse layout
- Implement error page with retry functionality
- Use existing skeleton patterns from admin components
- Add proper error logging and user-friendly messages

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Loading page matches browse layout structure
- [ ] Error page provides retry functionality
- [ ] Skeleton components align with final layout
- [ ] Error messages are user-friendly
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Browse functionality works with authentication permissions
- [ ] URL state management preserves filter states correctly
- [ ] Pagination and search perform efficiently with large datasets
- [ ] Error boundaries handle edge cases gracefully

## Notes

**Critical Assumptions:**

- Existing ContentSearchQuery infrastructure supports browse modifications
- Cloudinary integration handles image optimization properly
- Clerk authentication provides proper permission context for public content
- Database indexes support efficient filtering and pagination queries

**Performance Considerations:**

- Implement proper pagination limits to prevent large result sets
- Use debounced search to minimize database queries
- Leverage existing database indexes for filtering operations
- Consider implementing virtual scrolling for very large result sets

**Integration Points:**

- Must maintain consistency with existing admin featured-content search patterns
- Filter components should reuse established form field component patterns
- URL state management should follow existing collection controls implementation
