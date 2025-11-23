# Test Coverage Gap Analysis: Comments Feature

## Summary

- **Source Files Analyzed**: 16 total
  - 3 Action files (1 server actions, 1 facade, 1 query)
  - 8 Component files (4 UI, 2 dialogs, 2 async wrappers)
  - 3 Validation files (comment, social base, schema)
  - 2 Other (constants, type definitions)
- **Existing Tests Found**: 3 test suites
  - `tests/unit/lib/validations/comment.validation.test.ts` - Validation schemas (Comprehensive)
  - `tests/unit/validations/social.validation.test.ts` - Base drizzle-zod schemas (Adequate)
  - `tests/integration/actions/social.facade.test.ts` - Facade operations (Partial)
- **Total Coverage Gaps**: 13 major gaps across test types
- **Estimated New Tests Required**: 48-52 tests total
  - Unit tests: 12-14 tests
  - Component tests: 16-18 tests
  - Integration tests: 12-14 tests
  - E2E tests: 6-8 tests

---

## Coverage Matrix

| Source File | Unit | Component | Integration | E2E | Gap Status |
|-------------|------|-----------|-------------|-----|------------|
| `src/lib/actions/social/social.actions.ts` | ❌ | N/A | ✅ Partial | ❌ | Critical |
| `src/lib/facades/social/social.facade.ts` | ❌ | N/A | ✅ Partial | ❌ | Critical |
| `src/lib/queries/social/social.query.ts` | ❌ | N/A | ✅ Partial | ❌ | Critical |
| `src/components/feature/comments/comment-form.tsx` | N/A | ❌ | N/A | N/A | High |
| `src/components/feature/comments/comment-item.tsx` | N/A | ❌ | N/A | N/A | High |
| `src/components/feature/comments/comment-section.tsx` | N/A | ❌ | N/A | N/A | High |
| `src/components/feature/comments/comment-list.tsx` | N/A | ❌ | N/A | N/A | High |
| `src/components/feature/comments/comment-delete-dialog.tsx` | N/A | ❌ | N/A | N/A | Medium |
| `src/components/feature/comments/comment-edit-dialog.tsx` | N/A | ❌ | N/A | N/A | Medium |
| `src/components/feature/comments/async/comment-section-async.tsx` | ❌ | N/A | ❌ | N/A | Medium |
| `src/components/feature/comments/async/comment-section-client.tsx` | N/A | ❌ | N/A | ❌ | High |
| `src/lib/validations/comment.validation.ts` | ✅ | N/A | N/A | N/A | Complete |
| `src/lib/validations/social.validation.ts` | ✅ | N/A | N/A | N/A | Adequate |
| `src/lib/db/schema/social.schema.ts` | ✅ | N/A | N/A | N/A | Complete |
| Comment utilities & types | ✅ | N/A | N/A | N/A | Adequate |

---

## Coverage Gaps by Priority

### Critical Priority

#### 1. **Server Actions Layer** (`src/lib/actions/social/social.actions.ts`)

**Current Coverage**: Integration tests only (basic happy path)

**Missing Test Types**:
- Unit tests for action-level validation and error handling
- E2E tests for complete user flows

**Exports Requiring Tests**:
- `createCommentAction` - Server action with transaction, input sanitization, error mapping, cache invalidation
- `updateCommentAction` - Server action with authorization, cache invalidation
- `deleteCommentAction` - Server action with cascade deletion, cache invalidation
- `toggleLikeAction` - Like toggle with Sentry integration (exists but may need expansion)

**Key Scenarios Not Covered**:
1. **Input Validation Errors**
   - Invalid UUIDs for targetId, commentId, parentCommentId
   - Content exceeding SCHEMA_LIMITS (>5000 chars)
   - Content below minimum (empty, whitespace-only)
   - Invalid targetType values
   - Missing required fields

2. **Authorization & Permission Failures**
   - User attempting to update/delete another user's comment
   - User attempting to reply to deleted comment
   - Blocked user attempting to reply

3. **Business Rule Violations**
   - Replying at max depth (5 levels)
   - Parent comment not found
   - Parent comment from different target entity

4. **Error Handling & Recovery**
   - Database transaction failures
   - Cache invalidation failures (should log but not fail request)
   - Sentry context setting

5. **Cache Invalidation**
   - Verifying correct cache tags invalidated per operation
   - Handling subcollection -> collection tag translation
   - Failure scenarios don't crash action

6. **Response Shape Validation**
   - Success response structure matches expected format
   - Error messages are user-friendly and mapped correctly
   - Action metadata properly set (isTransactionRequired)

**Risk Assessment**:
- **Severity**: HIGH - These are mutation endpoints, directly impact data
- **Complexity**: HIGH - Multiple validation layers, error mapping, cache interaction
- **User Impact**: DIRECT - Users cannot create/edit/delete comments without these

**Estimated Tests**: 12-14 unit/integration tests
- 2 tests per action (happy path variant already in integration)
- 2-3 error scenarios per action
- 1 cache invalidation test per action

---

#### 2. **Facade Layer** (`src/lib/facades/social/social.facade.ts`)

**Current Coverage**: Integration tests exist but partial

**Missing Test Types**:
- Complete edge case coverage for comment operations
- Depth calculation validation
- Cascade deletion verification

**Exports Requiring Extended Tests**:
- `createComment` - Happy path exists, needs edge cases
- `createCommentReply` - 4 validations exist, need individual failure testing
  - Parent exists/not deleted
  - Same target entity
  - Not blocked by parent author
  - Depth < MAX_COMMENT_NESTING_DEPTH (5)
- `deleteComment` - Happy path exists, needs cascade verification
- `updateComment` - Happy path exists, needs authorization
- `getCommentById` - Cache behavior
- `getComments` - Pagination edge cases
- `getCommentsWithReplies` - Nested structure correctness
- `calculateCommentDepth` (private) - Recursive depth calculation
- `deleteCommentRepliesRecursive` (private) - Full tree deletion

**Key Scenarios Not Covered**:
1. **Parent Comment Validations**
   - Non-existent parent comment (returns null)
   - Deleted parent comment (isDeleted=true)
   - Parent from different target (targetId/targetType mismatch)
   - Successful parent validation

2. **Blocked User Checks**
   - User blocked by parent author cannot reply
   - User not blocked can reply
   - Block check query execution

3. **Depth Validation**
   - Comment at depth 0, reply creates depth 1
   - Comment at depth 4, reply creates depth 5 (max allowed)
   - Comment at depth 5, reply rejected (exceeds max)
   - Depth calculation traverses tree correctly

4. **Cascade Deletion**
   - Delete top-level comment with no replies
   - Delete top-level comment with direct replies
   - Delete deeply nested comment (replies exist below)
   - All comment counts decremented correctly
   - Cache tags invalidated for all deleted comments
   - Soft delete (isDeleted=true, deletedAt set)

5. **Count Operations**
   - Comment count incremented on creation
   - Comment count decremented on deletion
   - Comment counts correct after multiple operations
   - Counts use GREATEST(0, ...) to prevent negatives

6. **Cache Behavior**
   - Correct cache tags generated per targetType
   - Subcollection comments use collection cache tags
   - Cache invalidated on mutations

**Risk Assessment**:
- **Severity**: HIGH - Core business logic for comments
- **Complexity**: HIGH - Multiple validations, transactions, recursive operations
- **User Impact**: INDIRECT - Users see failures/inconsistencies if wrong

**Estimated Tests**: 12-14 integration tests
- 5-6 for createCommentReply validations
- 3-4 for deleteComment cascade scenarios
- 2-3 for depth calculation
- 1-2 for cache/count behavior

---

#### 3. **Query Layer** (`src/lib/queries/social/social.query.ts`)

**Current Coverage**: Partial through facade integration tests

**Missing Test Types**:
- Direct unit tests for query methods
- Edge cases for pagination and recursion
- Error condition handling

**Exports Requiring Tests**:
- `createCommentAsync` - Basic insert
- `deleteCommentAsync` - Soft delete with timestamps
- `getCommentByIdAsync` - Filters deleted comments
- `getCommentByIdWithUserAsync` - Left join with user
- `getCommentCountAsync` - Count query
- `getCommentRepliesAsync` - Paginated child comments
- `getCommentReplyCountAsync` - Count direct replies
- `getCommentsAsync` - Paginated root comments
- `getCommentsWithRepliesAsync` - Recursive tree fetch
- `getCommentThreadWithRepliesAsync` - Single thread with nesting
- `hasCommentRepliesAsync` - Quick check for children
- `incrementCommentCountAsync` - Update counts
- `decrementCommentCountAsync` - Update counts with GREATEST
- `isUserBlockedByAsync` - User block check
- `updateCommentAsync` - Update with timestamps

**Key Scenarios Not Covered**:
1. **Soft Delete**
   - Updates isDeleted and deletedAt correctly
   - Deleted comments excluded from subsequent queries
   - getCommentByIdAsync filters deleted

2. **User Join**
   - User exists and populated
   - User deleted (left join succeeds, user null)
   - User deleted excluded from join condition

3. **Pagination**
   - Limit applied correctly
   - Offset applied correctly
   - No limit/offset parameters handled
   - Order by createdAt descending

4. **Recursive Operations**
   - getCommentsWithRepliesAsync builds correct tree
   - getCommentThreadWithRepliesAsync stops at MAX_NESTING_DEPTH
   - Replies properly nested with depth tracking
   - Empty reply arrays handled

5. **Count Operations**
   - Comment counts accurate
   - Reply counts accurate
   - Counts include/exclude deleted properly

6. **Polymorphic Behavior**
   - targetType determines which table (bobbleheads, collections, subCollections)
   - Wrong targetType throws error
   - Count updates to correct table

**Risk Assessment**:
- **Severity**: MEDIUM - Direct DB access, can cause data inconsistencies
- **Complexity**: MEDIUM - Some recursive logic, but mostly straightforward queries
- **User Impact**: INDIRECT - Data correctness depends on these

**Estimated Tests**: 8-10 unit tests
- 2 for soft delete and filtering
- 2 for pagination
- 2 for recursive tree building
- 1-2 for polymorphic operations

---

### High Priority

#### 4. **CommentForm Component** (`src/components/feature/comments/comment-form.tsx`)

**Current Coverage**: None

**Component Exports**:
- `CommentForm` - Form component for comment submission/editing

**Key Functionality Requiring Tests**:
1. **Content Validation**
   - Content between MIN (1) and MAX (5000) characters
   - Empty content disables submit
   - Whitespace-only content disables submit
   - Content exactly at limits accepted/rejected

2. **Character Counter Display**
   - Shows current length / max length
   - Turns orange at 90% of limit (4500 chars)
   - Turns red when exceeding limit (>5000 chars)
   - Counter text color changes appropriately

3. **Reply Mode**
   - Placeholder changes to "Reply to {author}..."
   - Button text changes to "Post Reply"
   - Parent comment author displayed in blue box
   - Cancel reply button visible and functional
   - Reply context box hidden when not in reply mode

4. **Max Depth Warning**
   - Warning displayed when isAtMaxDepth=true
   - Textarea disabled when at max depth
   - Submit button disabled when at max depth
   - Form styling changed (opacity 50%)

5. **Form State Management**
   - Initial content preset (for edit mode)
   - Content cleared after successful submission
   - Content preserved on validation failure
   - Content reset on cancel click

6. **Form Actions**
   - Submit button calls onSubmit with content and parentCommentId
   - Cancel button calls onCancel and resets content
   - Cancel reply button calls onCancelReply and clears content
   - Loading spinner shows when isSubmitting=true
   - All buttons disabled when submitting

7. **Accessibility**
   - Textarea has proper aria-label (Comment content / Reply content)
   - Character count has aria-describedby
   - Textarea has aria-invalid when over limit
   - Max depth warning has role="alert"
   - Buttons have proper aria-labels

8. **Form Props Integration**
   - isDisabled disables form interaction
   - isSubmitting disables buttons and shows spinner
   - isAtMaxDepth disables form submission
   - className prop applied
   - HTML form props (onSubmit) work correctly

**Risk Assessment**:
- **Severity**: MEDIUM - User-facing, affects comment UX
- **Complexity**: MEDIUM - Multiple conditional states, validation logic
- **User Impact**: DIRECT - Users need this to create/edit comments

**Estimated Tests**: 8-10 component tests
- 2 for content validation states
- 2 for character counter behavior
- 2 for reply mode display
- 1 for max depth state
- 1 for form submission and state management
- 1-2 for accessibility

---

#### 5. **CommentItem Component** (`src/components/feature/comments/comment-item.tsx`)

**Current Coverage**: None

**Component Exports**:
- `CommentItem` - Individual comment display with actions

**Key Functionality Requiring Tests**:
1. **Depth-Based Styling**
   - Background progressively lighter: bg-card, muted/20, /30, /40, /50, /60
   - Border left accent with decreasing opacity
   - Depth 0 = no border, depth 1-5+ have borders
   - Avatar and font sizes smaller at depth 3+

2. **User Display**
   - Display name shown (or "Deleted User" if null)
   - Username shown with @ prefix (or "deleted" if null)
   - Avatar from user data (or fallback initials)
   - Avatar fallback uses first letters of display name
   - Avatar smaller at deep nesting (size-6 vs size-8)

3. **Timestamp & Edit Indicator**
   - createdAt formatted as relative time (Just now, X minutes ago, etc.)
   - Handles date strings (from cache) and Date objects
   - isEdited flag shows "edited" badge
   - editedAt timestamp available for display

4. **Action Buttons**
   - Edit/Delete buttons only visible on hover
   - Edit/Delete only visible to comment owner
   - Reply button visible unless at max depth
   - Reply button hidden when depth = MAX_COMMENT_NESTING_DEPTH
   - Report button visible to non-owners (when currentUserId present)
   - Report button calls ReportButton component

5. **Reply Indicator**
   - "Reply" badge shown for nested comments (depth > 0)
   - Badge not shown for root comments (depth = 0)
   - Badge includes depth info in title attribute

6. **Event Handlers**
   - onReply callback called with comment data
   - onEditClick callback called with comment data
   - onDeleteClick callback called with commentId
   - Buttons trigger correct handlers

7. **Conditional Rendering**
   - Shows avatar when imageUrl provided
   - Shows fallback when no image
   - Deleted user fallback text consistent
   - Nested reply indicator only at depth > 0

8. **Accessibility**
   - aria-label on edit/delete/reply buttons
   - datetime attribute on timestamp
   - Avatar alt text includes display name
   - Content whitespace preserved (pre-wrap)

**Risk Assessment**:
- **Severity**: MEDIUM - User-facing display, affects comment readability
- **Complexity**: MEDIUM - Multiple conditional renders, depth-based logic
- **User Impact**: DIRECT - Core comment display component

**Estimated Tests**: 8-10 component tests
- 2 for depth-based styling
- 2 for timestamp formatting and date handling
- 2 for button visibility and ownership
- 1 for user display and fallbacks
- 1 for depth limits (max depth reply button)
- 1-2 for event handlers

---

#### 6. **CommentSection Component** (`src/components/feature/comments/comment-section.tsx`)

**Current Coverage**: None

**Component Exports**:
- `CommentSection` - Main orchestrator component

**Key Functionality Requiring Tests**:
1. **State Management**
   - Edit dialog state (open/close, selected comment)
   - Delete dialog state (open/close, selected comment ID)
   - Reply state (parent comment selection, clear on submit)
   - Submit state tracking

2. **Comment Tree Navigation**
   - findCommentById searches flat and nested comments
   - countTotalReplies recursively counts all descendants
   - Selecting reply parent updates form display
   - Canceling reply clears parent state

3. **Form Integration**
   - Form shows only when authenticated and onCommentCreate present
   - Form hidden when not authenticated
   - Form disabled during submission
   - isAtMaxDepth calculated from parent depth

4. **Edit Dialog**
   - Opens when edit button clicked on comment
   - Closes after successful edit
   - Shows correct comment in dialog
   - Submits with commentId and new content
   - Clears state on close

5. **Delete Dialog**
   - Opens when delete button clicked
   - Shows reply count warning when comment has replies
   - Shows correct singular/plural text
   - Submits commentId on confirm
   - Closes after successful delete

6. **Comment Count Display**
   - Shows count in header
   - Uses comments.length or initialCommentCount
   - Updates dynamically (if implemented)

7. **Event Handlers**
   - onCommentCreate called with content and parentCommentId
   - onCommentUpdate called with commentId and content
   - onCommentDelete called with commentId
   - Reply state cleared after successful create
   - Dialog closed after successful update/delete

8. **Unauthenticated State**
   - Form not shown when isAuthenticated=false
   - "Sign in to leave a comment" message shown
   - Comment list still displays

**Risk Assessment**:
- **Severity**: HIGH - Main orchestrator for comment feature
- **Complexity**: HIGH - Complex state management, nested search, conditional rendering
- **User Impact**: DIRECT - Core UX for comment interactions

**Estimated Tests**: 10-12 component tests
- 2 for state management (dialogs, reply mode)
- 2 for comment tree navigation
- 2 for form display and interaction
- 2 for edit dialog workflow
- 2 for delete dialog and warnings
- 1 for authentication states

---

#### 7. **CommentSectionClient Component** (`src/components/feature/comments/async/comment-section-client.tsx`)

**Current Coverage**: None

**Component Exports**:
- `CommentSectionClient` - Client wrapper wiring up server actions

**Key Functionality Requiring Tests**:
1. **Server Action Integration**
   - createCommentAction called with correct payload
   - updateCommentAction called with correct payload
   - deleteCommentAction called with correct payload

2. **Error Handling**
   - Checks for serverError from action result
   - Displays user-friendly error messages
   - Toast notifications on success/failure

3. **Loading States**
   - isLoading prop passed correctly
   - Disabled state during submission

4. **Props Forwarding**
   - All initial comment data passed correctly
   - currentUserId, isAuthenticated passed
   - Callbacks properly bound

**Risk Assessment**:
- **Severity**: MEDIUM - Bridges server actions to UI
- **Complexity**: MEDIUM - Async callback handling
- **User Impact**: INDIRECT - Part of comment flow

**Estimated Tests**: 4-6 component tests
- 1 for each action integration
- 1 for error handling
- 1 for loading states

---

#### 8. **CommentList Component** (`src/components/feature/comments/comment-list.tsx`)

**Current Coverage**: None

**Component Exports**:
- `CommentList` - Recursive comment thread renderer

**Key Functionality Requiring Tests**:
1. **Recursive Rendering**
   - Root comments rendered
   - Replies recursively rendered
   - Depth passed correctly to child CommentItems
   - Reply count displayed

2. **Load More Pagination**
   - Load more button shows when hasMore=true
   - Load more button hidden when hasMore=false
   - onLoadMore callback triggered on click

3. **Empty State**
   - "No comments yet" message when comments empty
   - Correct styling applied

4. **Type Normalization**
   - CommentWithUser without depth normalized to CommentWithDepth
   - CommentWithDepth passed through unchanged

**Risk Assessment**:
- **Severity**: MEDIUM - Comment display
- **Complexity**: MEDIUM - Recursive rendering
- **User Impact**: DIRECT - Comment thread visibility

**Estimated Tests**: 5-6 component tests
- 1 for recursive rendering
- 1 for depth tracking
- 1 for load more button
- 1 for empty state
- 1 for type normalization

---

### Medium Priority

#### 9. **CommentDeleteDialog Component** (`src/components/feature/comments/comment-delete-dialog.tsx`)

**Current Coverage**: None

**Key Functionality Requiring Tests**:
1. **Dialog State**
   - Opens only when isOpen=true AND commentId not null
   - Dialog remains closed when commentId=null even if isOpen=true

2. **Reply Count Warning**
   - "This comment has X replies" shown when hasReplies=true
   - Plural text when replyCount > 1
   - Singular text when replyCount = 1
   - No warning when hasReplies=false

3. **Cascade Warning**
   - Explains replies will be deleted too
   - Warning styling (alert colors)

4. **Delete Confirmation**
   - onConfirm called with commentId on confirm
   - Dialog closes after confirmation
   - onClose called

5. **Loading State**
   - Delete button disabled when isSubmitting=true
   - Loading spinner visible
   - Cancel button remains enabled

**Risk Assessment**:
- **Severity**: MEDIUM - Prevents accidental deletion
- **Complexity**: LOW - Simple dialog
- **User Impact**: DIRECT - User sees before deleting

**Estimated Tests**: 4-5 component tests
- 1 for dialog visibility
- 1 for reply count warning text
- 1 for confirmation flow
- 1 for loading state

---

#### 10. **CommentEditDialog Component** (`src/components/feature/comments/comment-edit-dialog.tsx`)

**Current Coverage**: None

**Key Functionality Requiring Tests**:
1. **Dialog State**
   - Opens only when isOpen=true AND comment not null
   - Dialog closes after submission

2. **Form Integration**
   - CommentForm shown with existing content
   - Form submission triggers onSubmit callback
   - Correct commentId and content passed

3. **Cancel Handling**
   - Cancel closes dialog and clears state

4. **Loading State**
   - isSubmitting prop passed to form
   - Dialog disabled during submission

**Risk Assessment**:
- **Severity**: MEDIUM - Comment editing
- **Complexity**: LOW - Dialog wrapper
- **User Impact**: DIRECT - Edit interface

**Estimated Tests**: 4-5 component tests
- 1 for dialog visibility
- 1 for form integration
- 1 for submission flow
- 1 for cancel handling

---

#### 11. **CommentSectionAsync Component** (`src/components/feature/comments/async/comment-section-async.tsx`)

**Current Coverage**: None

**Component Type**: Server Component

**Key Functionality Requiring Tests**:
1. **Server-Side Data Fetching**
   - Fetches initial comments with SocialFacade.getCommentsWithReplies
   - Passes correct targetId, targetType
   - Uses initialLimit (default 10) for pagination

2. **Authentication Context**
   - Calls getOptionalUserId to get current user
   - Passes currentUserId or undefined to facade and client

3. **Props Forwarding**
   - Passes fetched data to CommentSectionClient
   - Forwards className and other HTML props

**Risk Assessment**:
- **Severity**: MEDIUM - Data fetching
- **Complexity**: MEDIUM - Async server component
- **User Impact**: INDIRECT - Initial load

**Estimated Tests**: 2-3 integration tests
- 1 for successful data fetch
- 1 for authentication state
- 1 for error handling (comment fetch failure)

---

### Low Priority

#### 12. **Database Schema & Validation**

**Current Coverage**: Adequate

**Files**:
- `src/lib/db/schema/social.schema.ts` - Database schema (verified, well-indexed)
- `src/lib/validations/comment.validation.ts` - Zod schemas (280 lines, comprehensive)
- `src/lib/validations/social.validation.ts` - Base schemas (adequate)

**Status**: Complete - Schema constraints and validation schemas are well-tested through existing validation tests.

---

#### 13. **Constants & Type Definitions**

**Status**: Low priority - these are configuration and support files

**Files**:
- Comment-related constants (SCHEMA_LIMITS, MAX_COMMENT_NESTING_DEPTH)
- Comment type definitions
- Skeleton loader component

---

## Existing Test Coverage Analysis

### Tests Found

**1. `tests/unit/lib/validations/comment.validation.test.ts` (~280 lines)**

**Coverage**:
- `createCommentSchema` - Valid/invalid content, UUIDs, target types
- `updateCommentSchema` - Valid/invalid IDs and content
- `deleteCommentSchema` - Valid/invalid comment IDs
- `getCommentByIdSchema` - Valid/invalid IDs
- `getCommentsSchema` - Valid target types and pagination
- `getCommentCountSchema` - Valid/invalid targets

**Quality**: COMPREHENSIVE - Covers all schema validations and edge cases

---

**2. `tests/unit/validations/social.validation.test.ts`**

**Coverage**:
- Base drizzle-zod schemas (insertCommentSchema, insertLikeSchema)
- Like validation schemas

**Quality**: ADEQUATE - Covers base schemas

---

**3. `tests/integration/actions/social.facade.test.ts` (~440 lines)**

**Coverage**:
- `toggleLike` - Basic like/unlike flow
- `createComment` - Happy path comment creation
- `createCommentReply` - Happy path reply creation
- `updateComment` - Happy path update
- `deleteComment` - Happy path deletion
- `getComments` - Fetching comments

**Quality**: PARTIAL - Happy paths covered, edge cases and error scenarios missing

**Specific Gaps in Facade Tests**:
- No parent comment validation failures (not found, deleted, wrong target)
- No blocked user scenario
- No depth validation testing
- No cascade deletion verification
- No count increment/decrement verification
- No cache invalidation verification

---

## Test Infrastructure Notes

### Existing Fixtures

Located in `tests/fixtures/`:
- `bobblehead.factory.ts` - createTestBobblehead()
- `collection.factory.ts` - createTestCollection()
- `user.factory.ts` - createTestUser()

**Gap**: No comment factory for creating test comments

---

### Existing Mocks

**Database**:
- vi.mock('@/lib/db') - Points to test database
- Test database setup: `tests/setup/test-db`
- Database reset: resetTestDatabase()

**External Services**:
- Sentry mocked
- Cache service mocked
- Redis client mocked

**Quality**: Good - Most external dependencies mocked, real database used for integration tests

---

### Setup Requirements

For new tests:

1. **Comment Factory Needed**
   ```typescript
   // tests/fixtures/comment.factory.ts
   export async function createTestComment(
     overrides?: Partial<InsertComment>,
     userId?: string
   ): Promise<SelectComment | null>
   ```

2. **User Block Factory Needed**
   ```typescript
   // Add to user.factory.ts or create block.factory.ts
   export async function createTestUserBlock(
     blockerUserId: string,
     blockedUserId: string
   ): Promise<SelectUserBlock | null>
   ```

3. **Test Database Seeding**
   - Ensure test database has proper indexes (matching production schema)
   - Verify composite indexes on (parentCommentId, createdAt) work correctly

---

## Recommendations

### Start With (Highest Value)

1. **Server Actions Tests** (12-14 tests)
   - Input validation failures (invalid UUIDs, content limits)
   - Authorization failures (update/delete wrong user)
   - Business rule violations (max depth, blocked user, parent not found)
   - Cache invalidation verification
   - Error message mapping

2. **CommentForm Component Tests** (8-10 tests)
   - Content validation state
   - Character counter behavior
   - Reply mode display
   - Accessibility

### Quick Wins (Easy, High Value)

1. **CommentDeleteDialog** (4-5 tests) - Simple dialog, lots of value
2. **CommentEditDialog** (4-5 tests) - Simple dialog, lots of value
3. **CommentItem Component** (8-10 tests) - Core display, straightforward logic

### Implementation Order

1. Create comment factory
2. Write server action unit tests
3. Expand facade integration tests
4. Write component tests (start with forms and dialogs)
5. Write E2E tests for complete user flows
6. Add query layer unit tests

---

## Test Type Breakdown

### Unit Tests (12-14 tests)

**Server Actions** (6-8 tests):
- Input validation: 1 test (all invalid scenarios)
- Authorization: 1 test (update/delete wrong user)
- Business rules: 2 tests (max depth, blocked user, parent not found)
- Error mapping: 1 test (error -> user-friendly message)
- Cache invalidation: 1 test
- Transaction behavior: 1 test

**Query Layer** (6-8 tests):
- Soft delete filtering: 1 test
- Pagination: 1 test
- Recursive tree building: 1 test
- Polymorphic behavior: 1 test
- User join (deleted user): 1 test
- Count operations: 1-2 tests

---

### Component Tests (16-18 tests)

**CommentForm** (8-10 tests):
- Content validation states: 2 tests
- Character counter: 2 tests
- Reply mode: 2 tests
- Max depth: 1 test
- Form actions: 1-2 tests
- Accessibility: 1 test

**CommentItem** (8-10 tests):
- Depth styling: 2 tests
- User display/fallbacks: 1-2 tests
- Timestamps: 1 test
- Action buttons: 2 tests
- Depth limits: 1 test
- Event handlers: 1-2 tests

**CommentSection** (10-12 tests):
- State management: 2 tests
- Tree navigation: 1 test
- Form integration: 1-2 tests
- Edit workflow: 2 tests
- Delete workflow: 2 tests
- Authentication: 1 test

**CommentList** (5-6 tests):
- Recursive rendering: 1 test
- Pagination: 1 test
- Empty state: 1 test
- Type normalization: 1 test
- Load more: 1 test

**Dialogs** (8-10 tests):
- CommentDeleteDialog: 4-5 tests
- CommentEditDialog: 4-5 tests

**AsyncComponents** (4-6 tests):
- CommentSectionClient: 3-4 tests
- CommentSectionAsync: 2-3 tests

---

### Integration Tests (12-14 tests)

**Facade Extended** (8-10 tests):
- createCommentReply validations: 5 tests (parent exists, same target, blocked, depth, success)
- deleteComment cascade: 3-4 tests (no replies, with replies, counts)
- Cache behavior: 1-2 tests

**Async Components** (2-3 tests):
- CommentSectionAsync data fetch: 1 test
- Error handling: 1 test
- Authentication: 1 test

**Server Actions with Transaction** (2-3 tests):
- Transaction rollback on error: 1 test
- Multiple concurrent actions: 1 test

---

### E2E Tests (6-8 tests)

**Complete User Flows**:
1. User creates comment on bobblehead (4-step flow)
2. User replies to comment (validations + depth warning)
3. User edits own comment (success + unauthorized attempt)
4. User deletes comment with replies (cascade warning)
5. User cannot reply to deleted comment
6. User blocked from replying to comment
7. Comment thread displays with proper nesting
8. Load more comments pagination

---

## Critical Implementation Notes

### Key Testing Challenges

1. **Depth Calculation**
   - Must traverse the comment tree recursively
   - Test needs comments at various depths
   - MAX_COMMENT_NESTING_DEPTH = 5 hard limit

2. **Cascade Deletion**
   - Deleting parent must delete all nested replies
   - Comment counts must be decremented for entire tree
   - Soft delete (isDeleted=true) not hard delete

3. **Cache Invalidation**
   - Subcollection comments use collection cache tags
   - Must test that correct tags are passed to cache service
   - Failures should not break the request (logged to Sentry)

4. **Date Serialization**
   - Comments can be cached as JSON (dates become strings)
   - UI must handle both Date objects and ISO date strings
   - RelativeTime formatter must work with both

5. **Blocked User Check**
   - Requires userBlocks table query
   - Only blocks reply, not comment creation
   - Test factory must create block relationships

### Code Patterns to Test

1. **Transaction Pattern**
   ```typescript
   await db.transaction(async (tx) => {
     // All operations use tx instead of db
   });
   ```

2. **Cache Key Generation**
   ```typescript
   const cacheKey = `${CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId)}:list:${limit}:${offset}`;
   ```

3. **Type Mapping for Cache**
   ```typescript
   targetType === 'subcollection' ? 'collection' : targetType
   ```

---

## Risk Assessment Summary

| Component | Risk Level | Reason |
|-----------|-----------|--------|
| Server Actions | **CRITICAL** | Direct mutations, no tests for error cases |
| Facade Layer | **CRITICAL** | Complex validations, cascade deletion |
| Comment Form | **HIGH** | Core user interaction, no tests |
| Comment Section | **HIGH** | State management, dialog coordination |
| Comment Item | **HIGH** | Display component, depth logic |
| Query Layer | **MEDIUM** | Mostly simple queries, some recursive |
| Dialogs | **MEDIUM** | Supporting components |
| Async Wrappers | **MEDIUM** | Data fetching layer |

---

## Success Criteria for Complete Coverage

1. **Unit Tests**: All validation scenarios and error paths
2. **Component Tests**: All UI states and user interactions
3. **Integration Tests**: Multi-layer workflows and cascade operations
4. **E2E Tests**: Complete user journeys including edge cases
5. **Coverage Metrics**: >80% line coverage, >90% for critical paths

---

## Estimated Timeline

- **Phase 1** (Factories & Server Actions): 8-12 hours
- **Phase 2** (Facade & Query Tests): 6-8 hours
- **Phase 3** (Component Tests): 10-14 hours
- **Phase 4** (E2E Tests): 6-8 hours
- **Total**: 30-42 hours of test writing

---

## Files to Create

1. `tests/fixtures/comment.factory.ts` - Comment factory
2. `tests/unit/lib/actions/social.actions.test.ts` - Server actions
3. `tests/unit/lib/queries/social.query.test.ts` - Query layer
4. `tests/components/feature/comments/comment-form.test.tsx` - Form component
5. `tests/components/feature/comments/comment-item.test.tsx` - Item component
6. `tests/components/feature/comments/comment-section.test.tsx` - Section component
7. `tests/components/feature/comments/comment-list.test.tsx` - List component
8. `tests/components/feature/comments/comment-delete-dialog.test.tsx` - Delete dialog
9. `tests/components/feature/comments/comment-edit-dialog.test.tsx` - Edit dialog
10. `tests/components/feature/comments/async/comment-section-client.test.tsx` - Client wrapper
11. `tests/integration/facades/social.facade.comments.test.ts` - Facade extended
12. `tests/e2e/specs/comments/comment-flows.spec.ts` - Complete flows
