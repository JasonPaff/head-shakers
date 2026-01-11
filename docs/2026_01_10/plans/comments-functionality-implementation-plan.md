# Implementation Plan: Collection Page Comments Integration

**Generated**: 2026-01-10
**Original Request**: finish the comments functionality on the /user/[username]/collections/[collectionSlug] page.

## Analysis Summary

- Feature request refined with project context
- Discovered 21 files across 8 directories
- Generated 3-step implementation plan

## File Discovery Results

### Critical Priority (Must Modify)

| File                                                                                            | Action                                   |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx`                            | Add Suspense-wrapped CommentSectionAsync |
| `src/app/(app)/user/[username]/collection/[collectionSlug]/components/comments-placeholder.tsx` | Delete after integration                 |

### High Priority (Must Import)

| File                                                                     | Usage                         |
| ------------------------------------------------------------------------ | ----------------------------- |
| `src/components/feature/comments/async/comment-section-async.tsx`        | Server component to integrate |
| `src/components/feature/comments/skeletons/comment-section-skeleton.tsx` | Suspense fallback             |

### Reference (Integration Pattern)

| File                                                               | Usage                           |
| ------------------------------------------------------------------ | ------------------------------- |
| `src/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/page.tsx` | Shows exact integration pattern |
| `src/components/ui/error-boundary/error-boundary.tsx`              | Error wrapper                   |
| `src/components/layout/content-layout.tsx`                         | Layout wrapper                  |

---

## Implementation Plan

## Overview

**Estimated Duration**: 30 minutes
**Complexity**: Low
**Risk Level**: Low

## Quick Summary

Replace the mock CommentsPlaceholder component on the collection page with the fully-functional CommentSectionAsync server component. The existing comment infrastructure is complete, so this integration simply wires the server component into the collection page using the established pattern from the bobblehead page.

## Prerequisites

- [ ] Verify the collection page currently renders correctly at `/user/[username]/collection/[collectionSlug]`
- [ ] Confirm the bobblehead comments are working properly at `/bobbleheads/[bobbleheadSlug]` to validate infrastructure
- [ ] Ensure development server can be started with `npm run dev`

## Implementation Steps

### Step 1: Add Comment Section to Collection Page

**What**: Import and render CommentSectionAsync within a Suspense boundary on the collection page, following the exact pattern from the bobblehead page.

**Why**: This connects the existing comment infrastructure to the collection page, replacing placeholder functionality with real threaded comments.

**Confidence**: High

**Files to Modify:**

- `src/app/(app)/user/[username]/collection/[collectionSlug]/page.tsx` - Add imports and render comment section

**Changes:**

- Add import for `CommentSectionAsync` from `@/components/feature/comments/async/comment-section-async`
- Add import for `CommentSectionSkeleton` from `@/components/feature/comments/skeletons/comment-section-skeleton`
- Add import for `ContentLayout` from `@/components/layout/content-layout`
- Add import for `ErrorBoundary` from `@/components/ui/error-boundary/error-boundary`
- Add a new comments section after the CollectionBobbleheadsAsync Suspense block (after the bobbleheads grid)
- Wrap the section in a div with `className={'mt-8'}`
- Inside the div, add ContentLayout wrapping ErrorBoundary with `name={'collection-comments'}`
- Inside ErrorBoundary, add Suspense with `fallback={<CommentSectionSkeleton />}`
- Inside Suspense, render `<CommentSectionAsync targetId={collectionId} targetType={'collection'} />`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] CommentSectionAsync renders with correct props (targetId=collectionId, targetType='collection')
- [ ] Comments section appears below bobbleheads grid on collection pages
- [ ] Loading skeleton displays during data fetch

---

### Step 2: Remove CommentsPlaceholder Component File

**What**: Delete the CommentsPlaceholder component file that is no longer needed after the integration.

**Why**: The placeholder used mock data and is now superseded by the real comment infrastructure. Removing it prevents confusion and dead code.

**Confidence**: High

**Files to Delete:**

- `src/app/(app)/user/[username]/collection/[collectionSlug]/components/comments-placeholder.tsx`

**Changes:**

- Delete the entire file from the filesystem
- Verify no other files import CommentsPlaceholder (it was never imported in page.tsx based on current code)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] File is deleted from filesystem
- [ ] No import errors anywhere in the codebase
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors

---

### Step 3: Manual Verification of Comments Functionality

**What**: Verify the comments section functions correctly on collection pages with both authenticated and unauthenticated states.

**Why**: Ensures the integration works end-to-end with the existing backend infrastructure.

**Confidence**: High

**Files to Review:**

- None (manual testing step)

**Changes:**

- Navigate to a collection page (e.g., `/user/[username]/collection/[collectionSlug]`)
- Verify the comment section renders below the bobbleheads grid
- Verify loading skeleton appears briefly during data fetch
- Verify existing comments display with proper threading (if any exist)
- Verify authenticated users can add new comments
- Verify authenticated users can reply to existing comments (up to 5 levels deep)
- Verify authenticated users can edit and delete their own comments
- Verify unauthenticated users see appropriate messaging

**Validation Commands:**

```bash
npm run dev
```

**Success Criteria:**

- [ ] Comment section renders in correct position on page
- [ ] Loading skeleton displays during initial data fetch
- [ ] ErrorBoundary gracefully handles any rendering errors
- [ ] Comment form is functional for authenticated users
- [ ] Reply functionality works with proper nesting
- [ ] Edit and delete dialogs function correctly
- [ ] Unauthenticated state handled appropriately

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] No console errors when loading collection pages
- [ ] Comments display correctly with server-side rendering
- [ ] Suspense fallback skeleton provides smooth loading experience

## Notes

- The `collectionId` variable already exists on line 131 of page.tsx and can be used directly as the `targetId` prop
- The `ENUMS.COMMENT.TARGET_TYPE` already includes 'collection' as a valid value, so no backend changes are needed
- The CommentsPlaceholder component was never imported in the page.tsx file, so no import removal is needed in Step 1
- The integration pattern follows the exact structure used on the bobblehead detail page (lines 222-231 of bobblehead/page.tsx)
- ErrorBoundary provides graceful degradation if the comment section encounters errors
