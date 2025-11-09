# Implementation Plan: Comment System for Collections, Subcollections, and Bobbleheads

**Generated**: 2025-11-09T00:06:20Z
**Original Request**: "as a user I would like to comment on collections,subcollections, and individual bobbleheads."
**Status**: Ready for Implementation

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Implement a commenting feature for bobbleheads, collections, and subcollections by leveraging the existing database schema and validation infrastructure. The main work involves creating query/facade/action layers, UI components, and integrating them into detail pages. A database migration is required to add commentCount fields to collections and subcollections tables.

## Analysis Summary

- **Feature request refined** with project context (Next.js, React 19, Drizzle ORM, Clerk auth)
- **Discovered 62 files** across 12 directories
- **Critical finding**: Database schema and validations already exist (40% scope reduction!)
- **Generated 23-step plan** addressing database, backend, UI, and integration

## Prerequisites

- [x] Database schema already complete (verified in src/lib/db/schema/social.schema.ts)
- [x] Zod validation schemas exist (verified in src/lib/validations/social.validation.ts)
- [x] Clerk authentication configured and working
- [ ] Development database accessible

---

## Implementation Steps

### Step 1: Add commentCount Fields to Collections Schema

**What**: Create database migration to add commentCount fields to collections and subCollections tables
**Why**: Collections and subcollections lack commentCount tracking fields that bobbleheads already have
**Confidence**: High

**Files to Create:**
- `src\lib\db\migrations\[timestamp]_add_comment_count_to_collections.sql` - SQL migration adding commentCount fields with defaults and constraints

**Changes:**
- Add commentCount integer field to collections table with default 0 and non-negative constraint
- Add commentCount integer field to sub_collections table with default 0 and non-negative constraint
- Update existing records to set commentCount = 0

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
npm run db:migrate
```

**Success Criteria:**
- [ ] Migration file created with proper SQL syntax
- [ ] Database migration runs successfully
- [ ] Both tables have commentCount fields with proper defaults and constraints
- [ ] All validation commands pass

---

### Step 2: Update Collections Schema TypeScript Definitions

**What**: Update TypeScript schema definitions to include commentCount fields
**Why**: Schema changes must be reflected in TypeScript for type safety
**Confidence**: High

**Files to Modify:**
- `src\lib\db\schema\collections.schema.ts` - Add commentCount field definitions to both tables

**Changes:**
- Add `commentCount: integer('comment_count').default(DEFAULTS.COLLECTION.COMMENT_COUNT).notNull()` to collections table definition
- Add `commentCount: integer('comment_count').default(DEFAULTS.SUB_COLLECTION.COMMENT_COUNT).notNull()` to subCollections table definition
- Add check constraint for commentCount non-negative validation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Schema definitions include commentCount fields
- [ ] Type checking passes without errors
- [ ] Drizzle introspection matches database schema
- [ ] All validation commands pass

---

### Step 3: Update Constants for Collections Defaults

**What**: Add commentCount defaults to COLLECTION and SUB_COLLECTION constants
**Why**: Maintain consistency with existing default value patterns
**Confidence**: High

**Files to Modify:**
- `src\lib\constants\defaults.ts` - Add COMMENT_COUNT to collection defaults

**Changes:**
- Add `COMMENT_COUNT: 0` to DEFAULTS.COLLECTION object
- Add `COMMENT_COUNT: 0` to DEFAULTS.SUB_COLLECTION object

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Constants added to defaults
- [ ] No type errors in files importing DEFAULTS
- [ ] All validation commands pass

---

### Step 4: Add Comment Operations to Constants

**What**: Add comment-specific operation names and error codes to constants
**Why**: Centralized error handling and logging require operation identifiers
**Confidence**: High

**Files to Modify:**
- `src\lib\constants\operations.ts` - Add COMMENTS section with operation names
- `src\lib\constants\error-codes.ts` - Add COMMENTS section with error codes
- `src\lib\constants\error-messages.ts` - Add COMMENTS section with error messages

**Changes:**
- Add COMMENTS object to OPERATIONS with operations: CREATE_COMMENT, UPDATE_COMMENT, DELETE_COMMENT, GET_COMMENTS, GET_COMMENT_COUNT
- Add COMMENTS error codes: COMMENT_FAILED, COMMENT_NOT_FOUND, COMMENT_UPDATE_FAILED, COMMENT_DELETE_FAILED, UNAUTHORIZED_COMMENT_ACCESS
- Add corresponding error messages with clear user-facing text

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All comment operations defined in OPERATIONS
- [ ] All error codes and messages added
- [ ] Type inference works correctly
- [ ] All validation commands pass

---

### Step 5: Create Comment Validation Schemas

**What**: Create comment-specific validation schemas for input validation
**Why**: Comment mutations need distinct input validation beyond the base schemas
**Confidence**: High

**Files to Create:**
- `src\lib\validations\comment.validation.ts` - Comment-specific validation schemas

**Changes:**
- Create createCommentSchema extending insertCommentSchema with required fields
- Create updateCommentSchema for content updates
- Create deleteCommentSchema with commentId validation
- Create getCommentsSchema with pagination and filtering
- Export all schemas and type inference helpers

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All validation schemas created with proper Zod patterns
- [ ] Schemas properly extend base social validation schemas
- [ ] Type exports work correctly
- [ ] All validation commands pass

---

### Step 6: Extend SocialQuery with Comment Methods

**What**: Add six comment query methods to SocialQuery class
**Why**: Query layer provides database access for comment operations
**Confidence**: High

**Files to Modify:**
- `src\lib\queries\social\social.query.ts` - Add comment query methods

**Changes:**
- Add `createCommentAsync` method for comment creation with user reference
- Add `updateCommentAsync` method for updating comment content with editedAt timestamp
- Add `deleteCommentAsync` method for soft-deleting comments
- Add `getCommentsAsync` method with pagination and target filtering
- Add `getCommentByIdAsync` method for single comment retrieval
- Add `incrementCommentCountAsync` method for updating target entity comment counts
- Add `decrementCommentCountAsync` method for reducing target entity comment counts

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All six query methods implemented following existing patterns
- [ ] Methods support bobblehead, collection, and subcollection target types
- [ ] Pagination and filtering work correctly
- [ ] All validation commands pass

---

### Step 7: Extend SocialFacade with Comment Methods

**What**: Add five comment facade methods providing business logic layer
**Why**: Facade layer handles authorization, caching, and error handling
**Confidence**: High

**Files to Modify:**
- `src\lib\facades\social\social.facade.ts` - Add comment facade methods

**Changes:**
- Add `createComment` method with ownership validation and transaction support
- Add `updateComment` method with authorization checks
- Add `deleteComment` method with soft-delete logic and authorization
- Add `getComments` method with caching and pagination
- Add `getCommentById` method with authorization and caching
- Add proper error handling using createFacadeError pattern
- Include cache integration following existing like patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All facade methods follow existing patterns in the file
- [ ] Proper authorization checks for ownership validation
- [ ] Cache integration matches like functionality patterns
- [ ] Error handling uses FacadeErrorContext pattern
- [ ] All validation commands pass

---

### Step 8: Create Comment Server Actions

**What**: Create five server actions for comment mutations
**Why**: Server actions provide the API layer for client components
**Confidence**: High

**Files to Modify:**
- `src\lib\actions\social\social.actions.ts` - Add comment action handlers

**Changes:**
- Add `createCommentAction` using authActionClient with transaction support
- Add `updateCommentAction` with ownership validation
- Add `deleteCommentAction` with authorization checks
- Add `getCommentsAction` using publicActionClient for public access
- Add `getCommentByIdAction` using publicActionClient
- Include Sentry context setting following existing patterns
- Add cache revalidation calls after mutations

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All actions follow Next-Safe-Action patterns
- [ ] Authentication handled correctly via authActionClient/publicActionClient
- [ ] Sentry breadcrumbs and contexts added
- [ ] Cache revalidation integrated properly
- [ ] All validation commands pass

---

### Step 9: Update Cache Revalidation Service

**What**: Add comment-specific cache invalidation methods to CacheRevalidationService
**Why**: Comment mutations must invalidate relevant caches
**Confidence**: Medium

**Files to Modify:**
- `src\lib\services\cache-revalidation.service.ts` - Extend social.onCommentChange method usage

**Changes:**
- Verify existing `social.onCommentChange` method handles all three entity types
- Update method signature if needed to support comment-specific operations
- Ensure proper tag generation for comment cache invalidation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment operations properly invalidate entity caches
- [ ] Cache tags include entity-specific and user-specific tags
- [ ] Follows existing cache invalidation patterns
- [ ] All validation commands pass

---

### Step 10: Update Cache Tags Utilities

**What**: Add comment-specific cache tag generators if needed
**Why**: Granular cache invalidation requires proper tag structure
**Confidence**: Medium

**Files to Modify:**
- `src\lib\utils\cache-tags.utils.ts` - Add comment tag generators

**Changes:**
- Add comment tag generation to CacheTagGenerators.social if not already present
- Ensure tags support bobblehead, collection, and subcollection entity types
- Follow existing tag naming conventions

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment tags follow existing patterns
- [ ] Tags support all three entity types
- [ ] Tag generation is consistent with likes/follows
- [ ] All validation commands pass

---

### Step 11: Create CommentItem Component

**What**: Create the individual comment display component
**Why**: Reusable component for rendering single comments
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-item.tsx` - Individual comment component

**Changes:**
- Create component displaying comment content, author, timestamp
- Include edit/delete buttons with ownership checks
- Add Radix UI Avatar for user profile display
- Include edited indicator when isEdited is true
- Support soft-deleted comment display
- Use Tailwind CSS for styling following project patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component renders comment data correctly
- [ ] Ownership-based UI elements show conditionally
- [ ] Timestamps formatted properly
- [ ] Follows existing component patterns
- [ ] All validation commands pass

---

### Step 12: Create CommentForm Component

**What**: Create comment submission form component
**Why**: Handles new comment and edit comment input
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-form.tsx` - Comment form component

**Changes:**
- Create form using TanStack React Form for state management
- Include Radix UI textarea field component
- Add validation using Zod schema from validations
- Implement character count display
- Add submit button with loading state
- Handle both create and edit modes
- Include proper error handling and display

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Form validates input using Zod schemas
- [ ] Character count updates in real-time
- [ ] Loading states prevent double submission
- [ ] Error messages display appropriately
- [ ] All validation commands pass

---

### Step 13: Create CommentList Component

**What**: Create comment list container component with pagination
**Why**: Manages collection of comments with infinite scroll or pagination
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-list.tsx` - Comment list component

**Changes:**
- Create component rendering array of CommentItem components
- Implement pagination using Nuqs for URL state management
- Add empty state when no comments exist
- Include loading states during data fetching
- Support sorting options if needed
- Handle real-time updates if using Ably (otherwise use standard polling)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comments render in correct order
- [ ] Pagination works with URL state
- [ ] Empty states display appropriately
- [ ] Loading states show during fetches
- [ ] All validation commands pass

---

### Step 14: Create CommentEditDialog Component

**What**: Create dialog component for editing comments
**Why**: Separate edit interface from inline display
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-edit-dialog.tsx` - Edit dialog component

**Changes:**
- Create Radix UI Dialog wrapper for edit interface
- Include CommentForm in edit mode
- Add cancel and save actions
- Handle dialog open/close state
- Include proper accessibility attributes

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Dialog opens and closes correctly
- [ ] Form pre-populates with existing comment content
- [ ] Save action updates comment
- [ ] Cancel action discards changes
- [ ] All validation commands pass

---

### Step 15: Create CommentDeleteDialog Component

**What**: Create confirmation dialog for comment deletion
**Why**: Prevent accidental deletions with confirmation step
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-delete-dialog.tsx` - Delete confirmation dialog

**Changes:**
- Create Radix UI AlertDialog for delete confirmation
- Include warning message about permanent action
- Add cancel and confirm delete buttons
- Handle loading state during deletion
- Close dialog on successful deletion

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Dialog shows clear warning message
- [ ] Cancel button dismisses dialog
- [ ] Confirm button triggers delete action
- [ ] Loading state prevents duplicate clicks
- [ ] All validation commands pass

---

### Step 16: Create CommentSection Component

**What**: Create main comment section orchestrator component
**Why**: Top-level component integrating form and list
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\comment-section.tsx` - Main comment section component

**Changes:**
- Create component accepting targetId and targetType props
- Include CommentForm for new comments
- Include CommentList for displaying existing comments
- Add section header with comment count display
- Handle authentication state for conditional form display
- Support both authenticated and public viewing

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component integrates form and list correctly
- [ ] Comment count displays accurately
- [ ] Authenticated users see form
- [ ] Public users see read-only view
- [ ] All validation commands pass

---

### Step 17: Create CommentSectionAsync Component

**What**: Create async wrapper for server-side comment data fetching
**Why**: Server Components enable better performance and SEO
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\async\comment-section-async.tsx` - Async comment section

**Changes:**
- Create async Server Component fetching initial comment data
- Use SocialFacade methods for data retrieval
- Pass data to client CommentSection component
- Include error boundary handling
- Support optional authentication context

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component fetches data server-side
- [ ] Data passes correctly to client component
- [ ] Error handling works appropriately
- [ ] Authentication context flows properly
- [ ] All validation commands pass

---

### Step 18: Create CommentSectionSkeleton Component

**What**: Create loading skeleton for comment section
**Why**: Improved perceived performance during data loading
**Confidence**: High

**Files to Create:**
- `src\components\feature\comments\skeletons\comment-section-skeleton.tsx` - Skeleton component

**Changes:**
- Create skeleton matching CommentSection layout
- Include skeleton for form area
- Include skeleton for comment list items
- Use Tailwind CSS for skeleton animations
- Match dimensions of actual components

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Skeleton matches actual component layout
- [ ] Animation provides visual feedback
- [ ] Dimensions closely match real components
- [ ] All validation commands pass

---

### Step 19: Integrate Comments into Bobblehead Detail Page

**What**: Add comment section to bobblehead detail page
**Why**: Enable commenting on individual bobbleheads
**Confidence**: High

**Files to Modify:**
- `src\app\(app)\bobbleheads\[bobbleheadId]\(bobblehead)\page.tsx` - Add comment section

**Changes:**
- Import CommentSectionAsync and CommentSectionSkeleton components
- Add new section after existing secondary cards section
- Wrap in Suspense with skeleton fallback
- Include BobbleheadErrorBoundary for error handling
- Pass bobbleheadId as targetId and 'bobblehead' as targetType

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment section renders on bobblehead page
- [ ] Suspense boundary works correctly
- [ ] Error boundary catches component errors
- [ ] Target ID and type passed correctly
- [ ] All validation commands pass

---

### Step 20: Integrate Comments into Collection Detail Page

**What**: Add comment section to collection detail page
**Why**: Enable commenting on collections
**Confidence**: High

**Files to Modify:**
- `src\app\(app)\collections\[collectionId]\(collection)\page.tsx` - Add comment section

**Changes:**
- Import CommentSectionAsync and CommentSectionSkeleton components
- Add new section in appropriate location within page layout
- Wrap in Suspense with skeleton fallback
- Include error boundary for error handling
- Pass collectionId as targetId and 'collection' as targetType

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment section renders on collection page
- [ ] Layout integrates smoothly with existing sections
- [ ] Suspense and error boundaries work
- [ ] Target ID and type passed correctly
- [ ] All validation commands pass

---

### Step 21: Integrate Comments into Subcollection Detail Page

**What**: Add comment section to subcollection detail page
**Why**: Enable commenting on subcollections
**Confidence**: High

**Files to Modify:**
- `src\app\(app)\collections\[collectionId]\subcollection\[subcollectionId]\page.tsx` - Add comment section

**Changes:**
- Import CommentSectionAsync and CommentSectionSkeleton components
- Add new section in appropriate location within page layout
- Wrap in Suspense with skeleton fallback
- Include error boundary for error handling
- Pass subcollectionId as targetId and 'subcollection' as targetType

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment section renders on subcollection page
- [ ] Layout integrates smoothly with existing sections
- [ ] Suspense and error boundaries work
- [ ] Target ID and type passed correctly
- [ ] All validation commands pass

---

### Step 22: Create Comment Action Name Constants

**What**: Add comment action names to ACTION_NAMES constant
**Why**: Centralized action naming for Sentry and logging
**Confidence**: High

**Files to Modify:**
- `src\lib\constants\action-names.ts` - Add COMMENTS section

**Changes:**
- Add COMMENTS object to ACTION_NAMES constant
- Include CREATE, UPDATE, DELETE, GET_LIST, GET_BY_ID action names
- Follow existing naming patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Action names added to constants
- [ ] Names follow existing patterns
- [ ] Type inference works correctly
- [ ] All validation commands pass

---

### Step 23: Add Comment Sentry Context Constants

**What**: Add comment-specific Sentry context identifiers
**Why**: Structured error tracking requires context constants
**Confidence**: Medium

**Files to Modify:**
- `src\lib\constants\sentry.ts` - Add COMMENT_DATA context

**Changes:**
- Add COMMENT_DATA to SENTRY_CONTEXTS constant
- Follow existing context naming patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Sentry context constant added
- [ ] Follows existing patterns
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migrations run successfully on development database
- [ ] Manual testing: Create comment on bobblehead succeeds
- [ ] Manual testing: Edit own comment works correctly
- [ ] Manual testing: Delete own comment works correctly
- [ ] Manual testing: Unauthorized users cannot edit/delete others' comments
- [ ] Manual testing: Comment counts update accurately
- [ ] Manual testing: Pagination loads additional comments
- [ ] Manual testing: Comments display on all three entity types

---

## Notes

### Critical Pre-Implementation Discovery

The database schema and validation infrastructure for comments **already exists completely**. This significantly reduces implementation risk and timeline. The main work focuses on business logic, UI components, and integration.

### Database Migration Priority

Step 1 (adding commentCount to collections) must complete before any other steps, as the schema changes are foundational.

### Component Architecture

The component structure follows the existing pattern used for likes and other social features, ensuring consistency across the codebase.

### Real-time Consideration

The plan defaults to standard polling without Ably integration to keep the system lightweight. If real-time comment visibility becomes critical, Ably integration can be added in a future enhancement phase.

### Authorization Pattern

Comment ownership validation follows the existing pattern in `src/utils/optional-auth-utils.ts` for consistency with other features.

### Cache Strategy

Comment cache invalidation follows the established patterns in CacheRevalidationService, ensuring proper cache freshness after mutations.

### Type Safety

All steps maintain strict TypeScript type safety without using `any` types, following project rules.

### Testing Recommendation

After implementation, consider adding:
- Integration tests for comment CRUD operations
- E2E tests for the comment UI flows using the existing Vitest and Testing Library setup

---

## File Discovery Results

For detailed file discovery analysis, see:
`docs/2025_11_09/orchestration/comments-feature/02-file-discovery.md`

**Summary**: 62 relevant files discovered across 12 directories
- **CRITICAL - Already Complete**: 6 files (schema, validations, constants)
- **HIGH PRIORITY - Extend**: 3 files (actions, queries, facades)
- **HIGH PRIORITY - Create**: 8 files (UI components)
- **HIGH PRIORITY - Integrate**: 3 files (detail pages)
- **MEDIUM PRIORITY - Update**: 7 files (constants, cache, utilities)
