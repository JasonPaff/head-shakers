# Integration Plan: Replace Mock Data with Real Backend in New Collection Page

## Overview

Replace mock data in the new collection page (`/user/[username]/collection/[collectionSlug]`) with real database data using existing backend facades.

## Current State

**New Page (Mock):** `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx`
- Client component with `'use client'` directive
- Uses mock data from `mock-data.ts`
- Client-side search/sort via local state
- Has 3 layout variants (grid, gallery, list)

**Old Page (Real):** `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`
- Server component with Suspense boundaries
- Uses `CollectionsFacade`, `SocialFacade`, `ViewTrackingFacade`
- URL-based search/sort via search params
- ISR with `revalidate = 60`
- Uses `withParamValidation()` HOC for type-safe params

## Key Challenge

The new route is `/user/[username]/collection/[collectionSlug]` which requires resolving both username and collection slug, while the old page only used collection slug (globally unique).

**Solution:** Chain facade calls: `username` → `userId` → `collectionId` → data

## Data Sources

| Data Need | Facade Method |
|-----------|---------------|
| Resolve username | `UsersFacade.getUserByUsername(username)` |
| Get collection by slug + owner | `CollectionsFacade.getCollectionBySlug(slug, userId)` |
| Public collection metadata | `CollectionsFacade.getCollectionForPublicView(id, viewerUserId)` |
| Bobbleheads with photos | `CollectionsFacade.getAllCollectionBobbleheadsWithPhotos(id, viewerId, options)` |
| View count | `CollectionsFacade.getCollectionViewCountAsync(id)` |
| Like status | `SocialFacade.getContentLikeData(id, type, viewerId)` |

---

## Implementation Steps

### Step 1: Update Route Types

**Specialist Agent:** `validation-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/route-type.ts`

**Task:** Update the route type file to add search params for server-side filtering following project conventions.

**Requirements:**
1. Import from `next-typesafe-url` and `zod`
2. Use slug validation constants from `@/lib/constants/slugs`
3. Add search params schema:
   - `search?: string` - Search term (optional)
   - `sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc'` - Sort option (optional)
   - `layout?: 'grid' | 'gallery' | 'list'` - Layout variant (optional, default: grid)
4. Export `Route` satisfying `DynamicRoute`
5. Export `PageProps` and `RouteType` types
6. Reference existing route-type at `src/app/(app)/collections/[collectionSlug]/(collection)/route-type.ts` for patterns

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 2: Create Type Definitions

**Specialist Agent:** `validation-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/types.ts` (new)

**Task:** Create type definitions that match component expectations using real data shapes.

**Requirements:**
1. Define interfaces that align with facade return types
2. Include all fields needed by components:

```typescript
export interface CollectionViewData {
  collectionId: string;
  coverImageUrl: string | null;
  createdAt: Date;
  description: string | null;
  isLiked: boolean;
  lastUpdatedAt: Date;
  likeCount: number;
  name: string;
  slug: string;
  totalBobbleheadCount: number;
  viewCount: number;
}

export interface CollectorData {
  avatarUrl: string | null;
  displayName: string | null;
  userId: string;
  username: string;
}

export interface BobbleheadViewData {
  category: string | null;
  collectionSlug: string;
  condition: string | null;
  description: string | null;
  featurePhoto: string | null;
  id: string;
  isLiked: boolean;
  likeCount: number;
  manufacturer: string | null;
  name: string;
  ownerUsername: string;
  slug: string;
  year: number | null;
}
```

3. Add JSDoc comments explaining data sources
4. Do NOT create barrel exports (index.ts)

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 3: Create Async Data Components

**Specialist Agent:** `server-component-specialist`

**Files to Create:**
- `src/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-header-async.tsx`
- `src/app/(app)/user/[username]/collection/[collectionSlug]/components/async/collection-bobbleheads-async.tsx`

**Task:** Create async server components that fetch and render data following the established async component pattern.

**Requirements for collection-header-async.tsx:**
1. Add `import 'server-only';` at top
2. Accept props: `{ collectionId: string; userId: string }`
3. Fetch in parallel using `Promise.all()`:
   - `CollectionsFacade.getCollectionForPublicView(collectionId, viewerUserId)`
   - `SocialFacade.getContentLikeData(collectionId, 'collection', viewerUserId)`
   - `CollectionsFacade.getCollectionViewCountAsync(collectionId)`
   - `UsersFacade.getUserByIdAsync(userId)`
4. Call `notFound()` if data is missing
5. Transform data to `CollectionViewData` and `CollectorData`
6. Render `CollectionHeader` client component with props
7. Reference pattern at `src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-header-async.tsx`

**Requirements for collection-bobbleheads-async.tsx:**
1. Add `import 'server-only';` at top
2. Accept props: `{ collectionId: string; ownerUsername: string; collectionSlug: string; searchParams?: SearchParams }`
3. Use `getUserIdAsync()` for current viewer
4. Fetch bobbleheads with search/sort options from searchParams
5. Transform to `BobbleheadViewData[]`
6. Render `BobbleheadGrid` component with data
7. Reference pattern at `src/app/(app)/collections/[collectionSlug]/(collection)/components/async/collection-bobbleheads-async.tsx`

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 4: Convert Page to Server Component

**Specialist Agent:** `server-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx`

**Task:** Convert the page from client component to server component with proper data fetching, Suspense boundaries, and SEO metadata.

**Requirements:**
1. Remove `'use client'` directive
2. Add `async` to component function
3. Use `withParamValidation(CollectionPage, Route)` HOC pattern
4. Add `export const revalidate = 60;` for ISR
5. Implement `generateMetadata()` function:
   - Fetch user and collection metadata
   - Generate canonical URL using `$path()`
   - Use `CloudinaryService.generateOgImageUrl()` for OG images
   - Return proper `Metadata` object with title, description, openGraph, twitter
6. In page component:
   - Extract and await `routeParams` and `searchParams`
   - Resolve username to user via `UsersFacade.getUserByUsername()`
   - Get collection via `CollectionsFacade.getCollectionBySlug()`
   - Call `notFound()` if user or collection doesn't exist
   - Wrap content in `Suspense` with skeleton fallbacks
   - Wrap async components in `ErrorBoundary` inside `Suspense`
7. Keep layout param handling (read from searchParams, default to 'grid')
8. Reference old page at `src/app/(app)/collections/[collectionSlug]/(collection)/page.tsx`

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass
- Run `npm run build` - must pass

---

### Step 5: Create Layout Switcher Component

**Specialist Agent:** `client-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/components/layout-switcher.tsx` (new)

**Task:** Create a client component for URL-based layout switching.

**Requirements:**
1. Add `'use client'` directive
2. Use `nuqs` for URL state management (follow existing patterns in codebase)
3. Accept props: `{ currentLayout: 'grid' | 'gallery' | 'list' }`
4. Render layout toggle buttons (Grid, Gallery, List icons from Lucide)
5. Update URL search param when user switches layout
6. Use `useTransition` for pending state during navigation
7. Follow UI component patterns from `src/components/ui/`
8. Add proper ARIA labels for accessibility
9. Reference existing URL state patterns in codebase (search for `nuqs` usage)

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 6: Update Collection Header Component

**Specialist Agent:** `client-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/components/collection-header.tsx`

**Task:** Update the collection header to use real data types and wire up the like button.

**Requirements:**
1. Change props interface from `MockCollection`/`MockCollector` to `CollectionViewData`/`CollectorData`
2. Accept `initialIsLiked` and `initialLikeCount` as props for optimistic updates
3. Wire up like button to existing `toggleLikeAction` server action:
   - Reference like patterns at `src/components/feature/like/`
   - Use optimistic updates with `useOptimistic` or local state
4. Use `$path()` for collector profile link (route: `/user/[username]`)
5. Use `$path()` for share links
6. Format dates using existing date utilities
7. Handle loading/error states for like action

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 7: Update Search Controls Component

**Specialist Agent:** `client-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/components/search-controls.tsx`

**Task:** Convert search controls to URL-based search using nuqs.

**Requirements:**
1. Add `'use client'` directive (if not present)
2. Remove local state management for search/sort
3. Use `nuqs` for URL state:
   - `useQueryState('search')` for search term
   - `useQueryState('sort')` for sort option
4. Debounce search input (300ms) to avoid excessive URL updates
5. Use `useTransition` for pending state indication
6. Reference existing search patterns in codebase (e.g., `src/app/(app)/bobbleheads/`)
7. Integrate layout switcher component
8. Maintain existing styling and UX

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 8: Update Bobblehead Grid Component

**Specialist Agent:** `client-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-grid.tsx`

**Task:** Update bobblehead grid to use real data types and remove client-side filtering.

**Requirements:**
1. Change props interface from `MockBobblehead[]` to `BobbleheadViewData[]`
2. Remove client-side filtering/sorting logic (now handled server-side)
3. Keep layout variant rendering logic (grid, gallery, list)
4. Accept layout as prop (from server component)
5. Handle empty state when no bobbleheads match filter
6. Ensure proper key props on mapped items

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 9: Update Bobblehead Card Component

**Specialist Agent:** `client-component-specialist`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/components/bobblehead-card.tsx`

**Task:** Update bobblehead card to use real data types and wire up interactions.

**Requirements:**
1. Change props interface from `MockBobblehead` to `BobbleheadViewData`
2. Wire up like button to `toggleLikeAction`:
   - Use optimistic updates
   - Reference existing like button patterns at `src/components/feature/like/`
3. Add link to bobblehead detail page using `$path()`:
   - Route: `/user/[username]/collection/[collectionSlug]/bobblehead/[bobbleheadSlug]`
   - Use `ownerUsername` and `collectionSlug` from props
4. Use `CldImage` for photos with proper transformations
5. Handle loading states and image fallbacks
6. Maintain layout variant styling (grid, gallery, list)

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 10: Create Skeleton Components

**Specialist Agent:** `server-component-specialist`

**Files to Create:**
- `src/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-header-skeleton.tsx`
- `src/app/(app)/user/[username]/collection/[collectionSlug]/components/skeletons/collection-bobbleheads-skeleton.tsx`

**Task:** Create skeleton loading components for Suspense fallbacks.

**Requirements:**
1. Match the layout/dimensions of actual components
2. Use `Skeleton` component from `@/components/ui/skeleton`
3. Include appropriate aria-label for accessibility
4. Reference existing skeleton patterns in codebase:
   - `src/app/(app)/collections/[collectionSlug]/(collection)/components/skeletons/`
5. Export from individual files (no barrel exports)

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass

---

### Step 11: Delete Mock Data

**Specialist Agent:** `general-purpose`

**File:** `src/app/(app)/user/[username]/collection/[collectionSlug]/mock-data.ts`

**Task:** Remove the mock data file after all components use real data.

**Requirements:**
1. Verify no imports of `mock-data.ts` exist in the codebase
2. Delete the file
3. Run full build to ensure nothing is broken

**Validation:**
- Run `npm run typecheck` - must pass
- Run `npm run lint:fix` - must pass
- Run `npm run build` - must pass

---

### Step 12: Final Integration Testing

**Specialist Agent:** `test-executor`

**Task:** Run all tests and perform manual verification.

**Requirements:**
1. Run existing test suite: `npm run test`
2. Run type checking: `npm run typecheck`
3. Run linting: `npm run lint:fix`
4. Run build: `npm run build`

**Manual Testing Checklist:**
- [ ] Navigate to `/user/{username}/collection/{slug}` with real user/collection
- [ ] Verify collection header displays correct data (name, description, cover image)
- [ ] Verify collector info displays correctly (avatar, display name, username link)
- [ ] Verify bobblehead grid shows real items with photos
- [ ] Test search functionality updates URL and filters results
- [ ] Test sort functionality (newest, oldest, name asc/desc)
- [ ] Test like button on collection (toggles, updates count)
- [ ] Test like button on bobbleheads (toggles, updates count)
- [ ] Test all 3 layout variants (grid, gallery, list)
- [ ] Test layout persistence via URL param
- [ ] Test empty collection state
- [ ] Test non-existent user (404)
- [ ] Test non-existent collection (404)
- [ ] Test unauthenticated user can view public collection
- [ ] Verify SEO metadata (check page source or React DevTools)

---

## Files Summary

| File | Action | Specialist Agent |
|------|--------|------------------|
| `route-type.ts` | Modify | validation-specialist |
| `types.ts` | Create | validation-specialist |
| `components/async/collection-header-async.tsx` | Create | server-component-specialist |
| `components/async/collection-bobbleheads-async.tsx` | Create | server-component-specialist |
| `page.tsx` | Modify | server-component-specialist |
| `components/layout-switcher.tsx` | Create | client-component-specialist |
| `components/collection-header.tsx` | Modify | client-component-specialist |
| `components/search-controls.tsx` | Modify | client-component-specialist |
| `components/bobblehead-grid.tsx` | Modify | client-component-specialist |
| `components/bobblehead-card.tsx` | Modify | client-component-specialist |
| `components/skeletons/collection-header-skeleton.tsx` | Create | server-component-specialist |
| `components/skeletons/collection-bobbleheads-skeleton.tsx` | Create | server-component-specialist |
| `mock-data.ts` | Delete | general-purpose |

## Dependencies Between Steps

```
Step 1 (route-type) ─┐
                     ├─→ Step 4 (page.tsx)
Step 2 (types) ──────┤
                     │
Step 3 (async) ──────┤
                     │
Step 10 (skeletons) ─┘

Step 2 (types) ──────┬─→ Step 6 (collection-header)
                     ├─→ Step 8 (bobblehead-grid)
                     └─→ Step 9 (bobblehead-card)

Step 5 (layout-switcher) ─→ Step 7 (search-controls)

All Steps (1-10) ─→ Step 11 (delete mock) ─→ Step 12 (testing)
```

## Parallel Execution Groups

**Group 1 (can run in parallel):**
- Step 1: route-type.ts
- Step 2: types.ts

**Group 2 (can run in parallel after Group 1):**
- Step 3: async components
- Step 5: layout-switcher
- Step 10: skeleton components

**Group 3 (can run in parallel after Group 2):**
- Step 6: collection-header
- Step 7: search-controls
- Step 8: bobblehead-grid
- Step 9: bobblehead-card

**Group 4 (after Group 3):**
- Step 4: page.tsx (integrates all components)

**Group 5 (after Group 4):**
- Step 11: delete mock data

**Group 6 (after Group 5):**
- Step 12: final testing
