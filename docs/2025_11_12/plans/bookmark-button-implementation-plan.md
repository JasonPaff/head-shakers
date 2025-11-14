# Implementation Plan: One-Click Bookmark Feature

**Generated**: 2025-11-12T00:15:00Z
**Original Request**: as a user I would like a one click bookmark button on the bobblehead detail page
**Feature**: One-click bookmark functionality for bobblehead detail pages with collection management

---

## Analysis Summary

- **Feature request** refined with project context (299 words from 16-word original)
- **Discovered** 40 files across all architectural layers (16 new, 17 modifications, 7 references)
- **Generated** 19-step implementation plan with comprehensive validation strategy
- **Estimated Duration**: 2-3 days
- **Complexity**: Medium
- **Risk Level**: Medium

---

## File Discovery Results

### Critical Priority (New Files - 9)

1. `src/lib/db/schema/bookmarks.schema.ts` - Bookmarks table schema
2. `src/lib/actions/bookmarks/bookmarks.actions.ts` - Server actions (toggleBookmark)
3. `src/lib/validations/bookmark.validation.ts` - Zod validation schemas
4. `src/lib/queries/bookmarks/bookmarks.query.ts` - Database query layer
5. `src/lib/facades/bookmarks/bookmarks.facade.ts` - Business logic layer
6. `src/hooks/use-bookmark.tsx` - React hook with optimistic updates
7. `src/components/ui/bookmark-button.tsx` - Reusable UI component
8. `src/app/(app)/dashboard/bookmarks/page.tsx` - Bookmarks collection page
9. `src/app/(app)/dashboard/bookmarks/route-type.ts` - Type-safe routing

### High Priority (Modifications - 11)

1. `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/page.tsx` - Detail page integration
2. `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header.tsx` - Add bookmark button
3. `src/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-header-async.tsx` - Add bookmark data fetching
4. `src/lib/db/schema/index.ts` - Export bookmarks schema
5. `src/lib/constants/enums.ts` - Add BOOKMARK enum
6. `src/lib/constants/defaults.ts` - Add IS_BOOKMARKED default
7. `src/lib/constants/action-names.ts` - Add BOOKMARKS.TOGGLE
8. `src/lib/constants/operations.ts` - Add bookmark operations
9. `src/lib/constants/error-codes.ts` - Add bookmark error codes
10. `src/lib/constants/error-messages.ts` - Add bookmark error messages
11. `src/lib/constants/cache.ts` - Add bookmark cache keys

### Medium Priority (Supporting - 6)

1. `src/lib/services/cache-revalidation.service.ts` - Bookmark cache invalidation
2. `src/lib/utils/cache-tags.utils.ts` - Bookmark cache tag generators
3. `src/lib/db/schema/relations.schema.ts` - Bookmark relations
4. `src/lib/db/schema/users.schema.ts` - Optional bookmarkCount field
5. `src/lib/db/schema/bobbleheads.schema.ts` - Optional bookmarkCount field
6. `src/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs.tsx` - Add bookmarks tab

### Reference Files (Pattern Templates - 7)

1. `src/lib/db/schema/social.schema.ts` - Blueprint for bookmarks table
2. `src/lib/actions/social.actions.ts` - Template for toggleBookmark
3. `src/lib/validations/like.validation.ts` - Validation pattern
4. `src/lib/queries/social.query.ts` - Query layer pattern
5. `src/lib/facades/social.facade.ts` - Facade pattern
6. `src/hooks/use-like.tsx` - Hook pattern
7. `src/components/ui/like-button.tsx` - Button pattern

### Test Files (New - 5)

1. `tests/lib/actions/bookmarks/bookmarks.actions.test.ts`
2. `tests/lib/queries/bookmarks/bookmarks.query.test.ts`
3. `tests/lib/facades/bookmarks/bookmarks.facade.test.ts`
4. `tests/hooks/use-bookmark.test.tsx`
5. `tests/components/ui/bookmark-button.test.tsx`

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Medium

---

## Quick Summary

Implement a one-click bookmark feature allowing authenticated users to save bobbleheads to a personal bookmarks collection. The feature follows existing social interaction patterns (like feature) with a dedicated bookmarks table, server actions for mutations, optimistic UI updates, and a bookmarks collection page accessible from the user dashboard.

---

## Prerequisites

- [ ] Ensure development database branch is active (`br-dark-forest-adf48tll`)
- [ ] Verify Clerk authentication is functioning
- [ ] Confirm existing like feature patterns are working as reference
- [ ] Review existing social.schema.ts, social.actions.ts patterns

---

## Implementation Steps

### Step 1: Create Database Schema for Bookmarks

**What**: Define the bookmarks table schema using Drizzle ORM with proper indexes and constraints
**Why**: Establishes the database foundation for storing user bookmark relationships
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\bookmarks.schema.ts` - Bookmarks table schema following social.schema.ts pattern

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\index.ts` - Export bookmarks schema
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\relations.schema.ts` - Add bookmark relations to users and bobbleheads

**Changes:**

- Create bookmarks table with id, userId, bobbleheadId, createdAt fields
- Add unique composite index on userId and bobbleheadId
- Add foreign key constraints with cascade delete
- Export bookmarks schema in index.ts
- Define one-to-many relations from users and bobbleheads to bookmarks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Bookmarks schema matches Drizzle ORM patterns
- [ ] Schema exports properly in index.ts
- [ ] Relations defined in relations.schema.ts
- [ ] All validation commands pass

---

### Step 2: Generate and Run Database Migration

**What**: Create and execute migration to add bookmarks table to database
**Why**: Applies schema changes to the development database
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\migrations\[timestamp]_create_bookmarks_table.sql` - Auto-generated migration file

**Changes:**

- Run `npm run db:generate` to generate migration from schema
- Run `npm run db:migrate` to apply migration to development database
- Verify migration success in Neon dashboard

**Validation Commands:**

```bash
npm run db:generate && npm run db:migrate
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration applied to development database
- [ ] Bookmarks table exists with correct schema
- [ ] Indexes and constraints properly created

---

### Step 3: Create Validation Schemas

**What**: Define Zod validation schemas for bookmark operations
**Why**: Ensures type safety and input validation for bookmark mutations
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\bookmark.validation.ts` - Zod schemas for bookmark operations

**Changes:**

- Create toggleBookmarkSchema with bobbleheadId validation
- Follow pattern from like.validation.ts
- Use cuid validation for bobbleheadId

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schema properly typed
- [ ] Schema follows project validation patterns
- [ ] All validation commands pass

---

### Step 4: Create Query Layer for Bookmarks

**What**: Implement database query methods for bookmark operations
**Why**: Provides data access layer for bookmarks following BaseQuery pattern
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\bookmarks\bookmarks.query.ts` - Query class extending BaseQuery

**Changes:**

- Create BookmarksQuery class extending BaseQuery
- Implement isBookmarkedByUser method
- Implement getUserBookmarks method with pagination
- Implement getBookmarkCount method
- Follow pattern from social.query.ts methods

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] BookmarksQuery class properly extends BaseQuery
- [ ] All query methods properly typed with Drizzle ORM
- [ ] Methods follow existing query patterns
- [ ] All validation commands pass

---

### Step 5: Create Facade Layer for Bookmark Business Logic

**What**: Implement business logic layer handling bookmark transactions
**Why**: Encapsulates complex bookmark operations with transaction management
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\bookmarks\bookmarks.facade.ts` - Facade handling bookmark business logic

**Changes:**

- Create BookmarksFacade class
- Implement toggleBookmark method with transaction support
- Handle bookmark creation and deletion logic
- Return bookmark state after operation
- Follow pattern from social.facade.ts toggleLike method

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade properly encapsulates business logic
- [ ] Transaction handling implemented correctly
- [ ] Error handling follows project patterns
- [ ] All validation commands pass

---

### Step 6: Update Constants for Bookmark Feature

**What**: Add bookmark-related constants across all constant files
**Why**: Centralizes configuration and ensures consistency
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\enums.ts` - Add BOOKMARK enum
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\defaults.ts` - Add IS_BOOKMARKED default (false)
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\action-names.ts` - Add BOOKMARKS.TOGGLE action name
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\operations.ts` - Add bookmark operation constants
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\error-codes.ts` - Add bookmark error codes
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\error-messages.ts` - Add bookmark error messages
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\constants\cache.ts` - Add bookmark cache key patterns

**Changes:**

- Add BOOKMARK to enums
- Add IS_BOOKMARKED: false to defaults
- Add BOOKMARKS.TOGGLE to action names
- Add bookmark operation types
- Add BOOKMARK_NOT_FOUND, BOOKMARK_CREATE_FAILED error codes
- Add corresponding error messages
- Add cache key generators for bookmarks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All bookmark constants added
- [ ] Constants follow existing naming conventions
- [ ] All validation commands pass

---

### Step 7: Update Cache Infrastructure

**What**: Add bookmark cache revalidation logic to cache service
**Why**: Ensures bookmark data stays fresh across related pages
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\services\cache-revalidation.service.ts` - Add revalidateBookmark method
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\cache-tags.utils.ts` - Add getBookmarkCacheTags function

**Changes:**

- Implement revalidateBookmark method in cache service
- Invalidate user bookmarks, bobblehead details, and bookmark collection caches
- Add getBookmarkCacheTags utility function
- Follow pattern from existing cache revalidation methods

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Cache revalidation logic implemented
- [ ] Cache tag generation follows patterns
- [ ] All validation commands pass

---

### Step 8: Create Server Action for Toggle Bookmark

**What**: Implement Next-Safe-Action server action for bookmark toggling
**Why**: Provides secure, authenticated endpoint for bookmark mutations
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\bookmarks\bookmarks.actions.ts` - Server action using authActionClient

**Changes:**

- Create toggleBookmarkAction using authActionClient
- Validate input with toggleBookmarkSchema
- Call BookmarksFacade.toggleBookmark
- Revalidate bookmark caches
- Return success response with new bookmark state
- Follow pattern from social.actions.ts toggleLike

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action properly uses authActionClient
- [ ] Input validation with Zod schema
- [ ] Cache revalidation called after mutation
- [ ] Error handling follows project patterns
- [ ] All validation commands pass

---

### Step 9: Create Bookmark UI Hook with Optimistic Updates

**What**: Build React hook managing bookmark state with optimistic UI
**Why**: Provides instant feedback while handling server state synchronization
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\hooks\use-bookmark.tsx` - Custom React hook

**Changes:**

- Create useBookmark hook accepting bobbleheadId and initialIsBookmarked
- Implement optimistic state updates
- Handle action execution with toggleBookmarkAction
- Implement rollback on error
- Return isBookmarked state, isPending state, and toggleBookmark function
- Follow pattern from use-like.tsx

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Hook properly manages optimistic state
- [ ] Error handling with rollback implemented
- [ ] Loading states properly exposed
- [ ] All validation commands pass

---

### Step 10: Create Bookmark Button Component

**What**: Build reusable BookmarkButton UI component with Radix UI and Tailwind
**Why**: Provides consistent bookmark interaction across the application
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\ui\bookmark-button.tsx` - Bookmark button component

**Changes:**

- Create BookmarkButton component using Radix UI Button
- Accept bobbleheadId and initialIsBookmarked props
- Use useBookmark hook for state management
- Use Lucide React Bookmark and BookmarkCheck icons
- Apply Class Variance Authority for icon state variants
- Style with Tailwind CSS 4
- Add accessibility attributes
- Follow pattern from like-button.tsx

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component properly uses Radix UI and Tailwind
- [ ] Icon states toggle correctly
- [ ] Loading states displayed
- [ ] Accessibility attributes present
- [ ] All validation commands pass

---

### Step 11: Integrate Bookmark Button into Bobblehead Detail Page

**What**: Add bookmark button to bobblehead detail page header
**Why**: Makes bookmark functionality accessible on bobblehead detail pages
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\async\bobblehead-header-async.tsx` - Fetch bookmark status
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\components\bobblehead-header.tsx` - Add bookmark button to header
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\page.tsx` - Pass bookmark data to header

**Changes:**

- Add isBookmarkedByUser query in bobblehead-header-async.tsx
- Pass isBookmarked prop to BobbleheadHeader component
- Add BookmarkButton component to header actions section
- Position near existing like button or share actions
- Handle authentication state for bookmark button visibility

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Bookmark status fetched on page load
- [ ] Bookmark button integrated into header
- [ ] Button positioned appropriately
- [ ] Authentication handled correctly
- [ ] All validation commands pass

---

### Step 12: Create Bookmarks Collection Page

**What**: Build dedicated page displaying user's bookmarked bobbleheads
**Why**: Allows users to view and manage their bookmark collection
**Confidence**: Medium

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\bookmarks\page.tsx` - Bookmarks collection page
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\bookmarks\route-type.ts` - Type-safe routing

**Changes:**

- Create server component fetching user bookmarks with pagination
- Display bookmarked bobbleheads in grid layout
- Include BookmarkButton for removal functionality
- Add empty state when no bookmarks exist
- Use next-typesafe-url for type-safe routing
- Follow pattern from dashboard collection pages

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page fetches and displays bookmarks
- [ ] Pagination implemented if needed
- [ ] Remove bookmark functionality works
- [ ] Empty state shown appropriately
- [ ] Type-safe routing configured
- [ ] All validation commands pass

---

### Step 13: Add Bookmarks Tab to Dashboard Navigation

**What**: Add bookmarks tab to dashboard navigation for easy access
**Why**: Makes bookmark collection discoverable from user dashboard
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\dashboard\collection\(collection)\components\dashboard-tabs.tsx` - Add bookmarks tab

**Changes:**

- Add Bookmarks tab to dashboard tab list
- Use Lucide React Bookmark icon
- Link to /dashboard/bookmarks using $path
- Position appropriately among existing tabs

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Bookmarks tab added to navigation
- [ ] Icon and label display correctly
- [ ] Link routes to bookmarks page
- [ ] Tab highlighting works on active page
- [ ] All validation commands pass

---

### Step 14: Update Type-Safe Routes

**What**: Generate type-safe routes for bookmark collection page
**Why**: Ensures type safety for navigation to bookmarks page
**Confidence**: High

**Changes:**

- Run npm run next-typesafe-url to regenerate $path object
- Verify /dashboard/bookmarks route is included in generated types

**Validation Commands:**

```bash
npm run next-typesafe-url && npm run typecheck
```

**Success Criteria:**

- [ ] Type-safe routes regenerated successfully
- [ ] Bookmarks route available in $path object
- [ ] No TypeScript errors in routing
- [ ] All validation commands pass

---

### Step 15: Create Unit Tests for Query Layer

**What**: Write comprehensive tests for BookmarksQuery class
**Why**: Ensures database queries work correctly with proper isolation
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\queries\bookmarks\bookmarks.query.test.ts` - Query tests using Testcontainers

**Changes:**

- Test isBookmarkedByUser with existing and non-existing bookmarks
- Test getUserBookmarks with pagination scenarios
- Test getBookmarkCount method
- Use Testcontainers for database isolation
- Follow pattern from existing query tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test tests/lib/queries/bookmarks/bookmarks.query.test.ts
```

**Success Criteria:**

- [ ] All query methods tested
- [ ] Edge cases covered
- [ ] Tests use Testcontainers properly
- [ ] All tests pass
- [ ] All validation commands pass

---

### Step 16: Create Unit Tests for Facade Layer

**What**: Write tests for BookmarksFacade business logic
**Why**: Validates bookmark toggle logic and transaction handling
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\facades\bookmarks\bookmarks.facade.test.ts` - Facade tests

**Changes:**

- Test toggleBookmark creates bookmark when not bookmarked
- Test toggleBookmark removes bookmark when bookmarked
- Test transaction rollback on errors
- Mock query layer dependencies
- Follow pattern from existing facade tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test tests/lib/facades/bookmarks/bookmarks.facade.test.ts
```

**Success Criteria:**

- [ ] Toggle logic tested both directions
- [ ] Transaction handling verified
- [ ] Error scenarios covered
- [ ] All tests pass
- [ ] All validation commands pass

---

### Step 17: Create Unit Tests for Server Actions

**What**: Write tests for toggleBookmarkAction server action
**Why**: Ensures authentication, validation, and cache invalidation work correctly
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\tests\lib\actions\bookmarks\bookmarks.actions.test.ts` - Action tests with MSW

**Changes:**

- Test authentication requirement
- Test input validation with invalid bobbleheadId
- Test successful bookmark toggle
- Test cache revalidation calls
- Mock facade and cache service dependencies
- Follow pattern from existing action tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test tests/lib/actions/bookmarks/bookmarks.actions.test.ts
```

**Success Criteria:**

- [ ] Authentication tested
- [ ] Validation errors handled
- [ ] Cache revalidation verified
- [ ] All tests pass
- [ ] All validation commands pass

---

### Step 18: Create Unit Tests for useBookmark Hook

**What**: Write tests for useBookmark React hook
**Why**: Validates optimistic updates and error handling in hook
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\tests\hooks\use-bookmark.test.tsx` - Hook tests using Testing Library

**Changes:**

- Test initial state rendering
- Test optimistic update on toggle
- Test rollback on action failure
- Test loading states during action
- Use renderHook from Testing Library
- Follow pattern from existing hook tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test tests/hooks/use-bookmark.test.tsx
```

**Success Criteria:**

- [ ] Optimistic updates tested
- [ ] Error rollback verified
- [ ] Loading states validated
- [ ] All tests pass
- [ ] All validation commands pass

---

### Step 19: Create Component Tests for BookmarkButton

**What**: Write tests for BookmarkButton UI component
**Why**: Ensures component renders correctly and handles interactions
**Confidence**: High

**Files to Create:**

- `C:\Users\JasonPaff\dev\head-shakers\tests\components\ui\bookmark-button.test.tsx` - Component tests using Testing Library

**Changes:**

- Test component renders with correct icon based on state
- Test click handler triggers toggle
- Test loading state disables button
- Test accessibility attributes
- Mock useBookmark hook
- Follow pattern from existing component tests

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test tests/components/ui/bookmark-button.test.tsx
```

**Success Criteria:**

- [ ] Render states tested
- [ ] Click interactions verified
- [ ] Accessibility validated
- [ ] All tests pass
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migration applied successfully to development branch
- [ ] All unit tests pass with `npm run test`
- [ ] Bookmark button visible and functional on bobblehead detail pages
- [ ] Bookmarks collection page accessible from dashboard
- [ ] Optimistic UI updates work without page refresh
- [ ] Cache invalidation working correctly after bookmark actions
- [ ] Authentication properly gates bookmark actions
- [ ] Type-safe routing updated and working

---

## Notes

### Assumptions Requiring Confirmation

- Bookmark count display on bobbleheads or user profiles is NOT required (assumed based on feature request)
- Toast notification system exists or needs to be added for confirmation messages
- Bookmark icon preference (Bookmark vs Star vs Heart) - using Lucide Bookmark/BookmarkCheck

### Risk Mitigation

- Follow existing like feature patterns to reduce implementation risk
- Use optimistic updates to ensure responsive UI even with network latency
- Implement comprehensive error handling with rollback logic
- Tag-based cache invalidation prevents stale data issues

### Performance Considerations

- Add composite index on userId and bobbleheadId for fast bookmark lookups
- Use pagination for bookmarks collection page if bookmark counts grow large
- Cache bookmark status on bobblehead detail pages with appropriate invalidation

### Future Enhancements Not Included

- Bookmark collections or folders for organizing bookmarks
- Bookmark sharing or collaborative bookmark lists
- Bookmark export functionality
- Bulk bookmark operations
- Real-time bookmark notifications

---

**Implementation plan ready for execution with `/implement-plan` command**
