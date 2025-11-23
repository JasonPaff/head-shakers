# Browse Categories Page Redesign - Implementation Plan

**Generated**: 2025-11-23
**Original Request**: A redesigned and enhanced /browse/categories page with a clean, modern design and improved UI/UX

## Refined Feature Request

Redesign the `/browse/categories` page to deliver a modern, visually cohesive interface that improves discoverability and user engagement with bobblehead categories. The current implementation should be replaced with a clean layout featuring a responsive grid of category cards with improved visual hierarchy, leveraging Tailwind CSS 4's latest styling capabilities and Radix UI components for consistent interaction patterns. Each category card should prominently display the category name, an intuitive icon from Lucide React, a brief description, and the count of bobbleheads within that category to help users gauge content availability. Implement proper spacing, typography, and color contrast following accessibility standards while using CVA (Class Variance Authority) for component variants to ensure design consistency. The page should support multiple view options (grid and list views) with smooth transitions, and include filtering or sorting functionality to help users find categories by popularity, alphabetical order, or recency. Add breadcrumb navigation and a hero section at the top that establishes context and encourages exploration. Ensure the page is fully responsive across mobile, tablet, and desktop viewports, with touch-friendly interactive elements. Optimize the layout to reduce cognitive load by grouping related categories and providing clear calls-to-action that guide users toward their categories of interest. The implementation should follow the project's existing patterns using server components for data fetching, proper TypeScript typing, and integration with the database schema to fetch category data via Drizzle ORM queries. This redesign should improve conversion metrics by making category exploration more intuitive and visually appealing while maintaining consistency with the overall Head Shakers platform design language.

---

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

Redesign the `/browse/categories` page with a modern, visually cohesive interface featuring a hero section, category cards grid with icons and descriptions, view mode toggle (grid/list), sorting/filtering controls, and breadcrumb navigation. The implementation follows existing project patterns using server components for data fetching, CVA for component variants, and maintains full responsiveness across all viewports.

## Prerequisites

- [ ] Understand existing `CategoryRecord` type structure: `{ name: string; bobbleheadCount: number; collectionCount: number }`
- [ ] Confirm categories are derived from bobblehead `category` field (not a separate table)
- [ ] Review existing Lucide React icons for category mapping

## Implementation Steps

### Step 1: Extend Validation Schemas for View Mode and Category Sorting

**What**: Add view mode, category-specific sort options, and filtering schemas to the browse-categories validation file.
**Why**: URL state management requires validated schemas for view modes (grid/list) and additional sort options (popularity, alphabetical, recency).
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/browse-categories.validation.ts` - Add view mode enum, update sort options

**Changes:**

- Add `BROWSE_CATEGORIES_VIEW_MODE` constant array with 'grid' and 'list' values
- Add `BROWSE_CATEGORIES_CARD_SORT_BY` constant for category card sorting: 'alphabetical', 'popularity', 'recent', 'itemCount'
- Create `browseCategoriesViewModeSchema` for view mode validation
- Create `categoryCardSortSchema` for category card sorting
- Export new types: `BrowseCategoriesViewMode`, `CategoryCardSortBy`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New validation schemas compile without TypeScript errors
- [ ] Types are properly exported and accessible
- [ ] All validation commands pass

---

### Step 2: Create Category Icon Mapping Utility

**What**: Create a utility file that maps category names to appropriate Lucide React icons.
**Why**: Category cards require intuitive icons; centralizing mapping ensures consistency and maintainability.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/utils/category-icons.ts` - Icon mapping utility

**Changes:**

- Create `getCategoryIcon` function mapping category names to Lucide icons
- Include default icon fallback for unmapped categories
- Create `getCategoryDescription` function providing brief descriptions for common categories
- Create `getCategoryColor` function for category-specific color variants

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Function returns appropriate icons for known categories
- [ ] Fallback icon works for unknown categories
- [ ] All validation commands pass

---

### Step 3: Create Categories Page Breadcrumb Component

**What**: Create a breadcrumb navigation component for the categories page showing "Browse > Categories" path.
**Why**: Establishes context and improves navigation UX following project breadcrumb patterns.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/categories-breadcrumb.tsx` - Breadcrumb component

**Changes:**

- Create breadcrumb with links: Home > Browse > Categories
- Use `$path` from next-typesafe-url for type-safe routes
- Follow existing `CollectionBreadcrumb` component patterns
- Include proper accessibility with `nav` element and aria-label
- Add responsive styling for mobile/desktop views

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Breadcrumb renders correctly with proper links
- [ ] Touch targets meet 44px minimum for accessibility
- [ ] All validation commands pass

---

### Step 4: Create Categories Hero Section Component

**What**: Create an engaging hero section component with title, description, and category stats.
**Why**: Establishes page context and encourages exploration following featured page hero patterns.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/categories-hero.tsx` - Hero section component

**Changes:**

- Create hero section with gradient background styling
- Display page title "Browse by Category" with engaging subtitle
- Show aggregate stats (total categories, total bobbleheads across categories)
- Include decorative icon elements
- Ensure responsive layout across viewports

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hero displays correctly with stats
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All validation commands pass

---

### Step 5: Create Category Card Component with CVA Variants

**What**: Create a reusable category card component using CVA for grid and list view variants.
**Why**: Single component with variants ensures design consistency while supporting multiple view modes.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/category-card.tsx` - Category card with CVA variants

**Changes:**

- Create `categoryCardVariants` using CVA with 'grid' and 'list' variants
- Grid variant: Vertical card with icon, name, description, count badge
- List variant: Horizontal layout with compact information
- Include hover states and transitions
- Add click handler navigation to filtered categories view
- Display bobblehead count badge using project Badge component
- Include proper test IDs following project conventions

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Card renders correctly in both grid and list modes
- [ ] Hover and transition animations work smoothly
- [ ] All validation commands pass

---

### Step 6: Create View Mode Toggle Component

**What**: Create a toggle component for switching between grid and list views.
**Why**: Provides users control over how they view categories following accessibility standards.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/view-mode-toggle.tsx` - View toggle component

**Changes:**

- Create toggle using existing Tabs component from Radix UI
- Include Grid and List icons from Lucide React
- Add proper ARIA labels for accessibility
- Include smooth transition when switching views
- Accept `viewMode` and `onViewModeChange` props

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Toggle switches between grid/list views
- [ ] Accessible keyboard navigation works
- [ ] All validation commands pass

---

### Step 7: Create Categories Sort/Filter Toolbar Component

**What**: Create a toolbar component combining view toggle, sort dropdown, and search filter.
**Why**: Centralizes filtering/sorting controls for better UX and reduced cognitive load.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/categories-toolbar.tsx` - Toolbar component

**Changes:**

- Integrate ViewModeToggle component
- Add sort dropdown with options: Alphabetical (A-Z), Most Popular, Most Recent, Item Count
- Include search input for filtering categories by name
- Add clear filters button when filters are active
- Use responsive flex layout with proper spacing

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All filter controls work correctly
- [ ] Responsive layout adapts to viewport sizes
- [ ] All validation commands pass

---

### Step 8: Create Category Cards Grid Component

**What**: Create the container component that renders category cards in a responsive grid or list layout.
**Why**: Encapsulates grid layout logic and handles empty state rendering.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/category-cards-grid.tsx` - Grid/List container

**Changes:**

- Accept `categories`, `viewMode`, and `onCategoryClick` props
- Render responsive grid for grid view (2/3/4 columns based on viewport)
- Render stacked list for list view
- Include empty state using project EmptyState component
- Add animation/transition between view modes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid displays correctly with proper column counts
- [ ] List view displays correctly
- [ ] Empty state renders when no categories match filters
- [ ] All validation commands pass

---

### Step 9: Create Categories Loading Skeleton Components

**What**: Create skeleton components for loading states following project patterns.
**Why**: Provides visual feedback during data fetching, improving perceived performance.
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/categories/components/skeletons/categories-hero-skeleton.tsx` - Hero skeleton
- `src/app/(app)/browse/categories/components/skeletons/category-card-skeleton.tsx` - Card skeleton
- `src/app/(app)/browse/categories/components/skeletons/categories-content-skeleton.tsx` - Full content skeleton

**Changes:**

- Create hero skeleton matching hero section dimensions
- Create card skeleton with icon, title, description placeholders
- Create combined skeleton for full page loading state
- Use project Skeleton component with proper animations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeletons match actual component dimensions
- [ ] Animations render smoothly
- [ ] All validation commands pass

---

### Step 10: Refactor BrowseCategoriesContent to Categories Display

**What**: Significantly refactor the client content component to integrate new components and view modes.
**Why**: Central orchestration component needs to manage new state (view mode, category filtering) and render new UI.
**Confidence**: Medium

**Files to Modify:**

- `src/app/(app)/browse/categories/components/browse-categories-content.tsx` - Major refactor

**Changes:**

- Add `viewMode` URL state using nuqs `parseAsStringEnum`
- Add `categorySortBy` URL state for category card sorting
- Add `categorySearch` URL state for filtering categories by name
- Import and integrate new components: CategoriesToolbar, CategoryCardsGrid, CategoriesBreadcrumb
- Implement client-side sorting and filtering of categories based on URL state
- Update category selection to navigate to filtered collections view
- Add Sentry breadcrumbs for view mode and filter changes
- Preserve existing collection browsing functionality when category is selected

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] View mode persists in URL and updates display
- [ ] Sorting and filtering work correctly
- [ ] Category selection navigates correctly
- [ ] All validation commands pass

---

### Step 11: Update Categories Page Entry Point

**What**: Update the main categories page to include hero section and improved layout structure.
**Why**: Server component entry point needs to fetch initial data and render new page structure.
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/categories/page.tsx` - Update page structure

**Changes:**

- Add async server component pattern for fetching category stats
- Import CategoriesHero and CategoriesBreadcrumb components
- Update layout with proper spacing and structure
- Add Suspense boundaries with skeleton fallbacks
- Update metadata for better SEO
- Keep existing Sentry context setup

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page renders hero and content sections
- [ ] Suspense fallbacks display during loading
- [ ] SEO metadata is properly configured
- [ ] All validation commands pass

---

### Step 12: Add Test IDs for New Components

**What**: Add test ID definitions for new components in the test-ids types file.
**Why**: Ensures consistent test ID generation and enables E2E testing.
**Confidence**: High

**Files to Modify:**

- `src/lib/test-ids/types.ts` - Add new component test IDs

**Changes:**

- Add 'category-card' to ComponentTestId union
- Add 'categories-hero' to ComponentTestId union
- Add 'categories-toolbar' to ComponentTestId union
- Add 'view-mode-toggle' to ComponentTestId union
- Add 'categories-grid' to ComponentTestId union

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] New test IDs are recognized by TypeScript
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Build completes successfully with `npm run build`
- [ ] Manual verification: Grid view displays correctly on all viewports
- [ ] Manual verification: List view displays correctly on all viewports
- [ ] Manual verification: View mode toggle works with smooth transitions
- [ ] Manual verification: Sort and filter controls update display correctly
- [ ] Manual verification: Category selection navigates to filtered collections
- [ ] Manual verification: Breadcrumb navigation works correctly
- [ ] Manual verification: Hero section displays with proper stats
- [ ] Manual verification: Loading skeletons match final component dimensions
- [ ] Manual verification: Touch targets meet 44px minimum on mobile

## Notes

**Architecture Decisions:**

- **Server Component Strategy**: The main page.tsx remains a server component for initial data fetching (category stats for hero), while BrowseCategoriesContent handles client-side interactivity
- **CVA for Variants**: Using CVA for CategoryCard variants aligns with existing project patterns (Badge, Button components)
- **URL State Management**: All filter/sort/view state persisted in URL using nuqs for shareability and bookmarking

**Risk Mitigations:**

- **Category Icon Mapping**: Default fallback icon ensures graceful handling of new/unknown categories
- **Empty States**: Dedicated empty state handling when filters return no results
- **Backward Compatibility**: Existing URL parameters for collection browsing preserved

**Assumptions Requiring Confirmation:**

- Category descriptions will be generated from category names (no database field exists)
- Icon mapping is hardcoded based on common bobblehead category names
- Category count statistics can be computed from existing query results

**Performance Considerations:**

- Category cards use optimized grid layout without expensive animations on scroll
- View mode transitions use CSS transforms for GPU acceleration
- Filtering/sorting performed client-side to avoid additional server requests

---

## File Discovery Results

### Critical Priority (Must Modify)

- `src/app/(app)/browse/categories/page.tsx`
- `src/app/(app)/browse/categories/components/browse-categories-content.tsx`

### High Priority

- `src/app/(app)/browse/components/browse-collections-filters.tsx`
- `src/app/(app)/browse/components/browse-collections-table.tsx`
- `src/lib/validations/browse-categories.validation.ts`

### Reference Files

- `src/app/(app)/browse/featured/page.tsx` - Hero section patterns
- `src/components/ui/card.tsx` - Card components
- `src/components/ui/badge.tsx` - Badge variants
- `src/components/ui/skeleton.tsx` - Loading states

### Database Context

- Categories derived from `category` field on bobbleheads
- `CategoryRecord` type: `{ name: string; bobbleheadCount: number; collectionCount: number }`
