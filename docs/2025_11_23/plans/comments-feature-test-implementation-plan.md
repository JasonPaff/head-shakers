# Test Implementation Plan: Comments Feature

## Overview

**Scope**: Complete test coverage for the Head Shakers comments feature including server actions, facade layer, UI components, query layer, and end-to-end user flows.

**Total Tests to Create**: 80-94 tests
**Estimated Complexity**: High
**Risk Level**: Medium-High (core social feature with nested data structures)
**Estimated Effort**: 3-4 days

### Test Distribution

| Test Type   | Count | Priority      |
| ----------- | ----- | ------------- |
| Unit        | 12-14 | Critical      |
| Component   | 42-48 | Critical/High |
| Integration | 20-24 | Critical      |
| E2E         | 6-8   | High          |

## Prerequisites

- [ ] Existing test infrastructure (Testcontainers, MSW, test-utils) is working
- [ ] User, Collection, and Bobblehead factories exist (`tests/fixtures/`)
- [ ] Clerk authentication mocks are configured (`tests/setup/vitest.setup.ts`)
- [ ] Comment mock data file to be created
- [ ] Comment factory to be created for integration tests

## Implementation Steps

---

### Step 1: Create Comment Mock Data

**What**: Create mock comment data for unit and component tests
**Why**: Provides consistent test data without database dependencies for isolated testing
**Test Type**: Infrastructure
**Confidence**: High

**Files to Create:**

- `tests/mocks/data/comments.mock.ts` - Mock comment data objects

**Patterns to Follow:**

- Follow existing patterns from `tests/mocks/data/users.mock.ts`
- Include mock comments with various depths (0-5)
- Include mock comments with and without replies
- Include mock comments with edited state
- Create `createMockComment()` factory function

**Content Requirements:**

```typescript
// Required exports:
// - mockComment (basic comment)
// - mockCommentWithReplies (comment with nested replies)
// - mockCommentAtMaxDepth (comment at depth 5)
// - mockEditedComment (comment with isEdited: true)
// - mockCommentWithUser (CommentWithUser type)
// - mockCommentWithDepth (CommentWithDepth type)
// - createMockComment(overrides) - factory function
// - createMockCommentTree(depth) - creates nested structure
```

**Validation Commands:**

```bash
npm run typecheck
npm run lint:fix
```

**Success Criteria:**

- [ ] File exports all required mock objects and functions
- [ ] Types match `CommentWithUser` and `CommentWithDepth` from `social.query.ts`
- [ ] No TypeScript errors
- [ ] Mock data covers all component rendering scenarios

---

### Step 2: Create Comment Factory for Integration Tests

**What**: Create database factory for creating test comments in Testcontainers
**Why**: Required for integration tests that need real database interactions
**Test Type**: Infrastructure
**Confidence**: High

**Files to Create:**

- `tests/fixtures/comment.factory.ts` - Comment database factory

**Patterns to Follow:**

- Follow existing patterns from `tests/fixtures/user.factory.ts`
- Use `getTestDb()` from `tests/setup/test-db.ts`
- Support creating nested comment trees
- Support all comment target types (bobblehead, collection, subcollection)

**Content Requirements:**

```typescript
// Required exports:
// - createTestComment(options) - creates single comment
// - createTestCommentReply(parentCommentId, options) - creates reply
// - createTestCommentThread(depth, options) - creates nested thread
// - CreateTestCommentOptions interface
```

**Validation Commands:**

```bash
npm run typecheck
npm run lint:fix
```

**Success Criteria:**

- [ ] Factory creates valid comments in test database
- [ ] Supports all target types
- [ ] Supports nested reply creation
- [ ] Follows existing factory patterns

---

### Step 3: Server Actions Unit Tests

**What**: Create unit tests for comment server actions error handling and cache invalidation
**Why**: Critical gap - server actions must handle errors gracefully and invalidate caches correctly
**Test Type**: Unit
**Confidence**: High

**Files to Create:**

- `tests/unit/lib/actions/social.actions.test.ts` - Server action tests

**Test Cases:**

1. `createCommentAction should create top-level comment successfully`
2. `createCommentAction should create reply when parentCommentId provided`
3. `createCommentAction should return validation error for empty content`
4. `createCommentAction should return validation error for invalid targetId`
5. `createCommentAction should handle parent comment not found error`
6. `createCommentAction should handle max depth exceeded error`
7. `updateCommentAction should update comment content successfully`
8. `updateCommentAction should fail when user is not comment owner`
9. `updateCommentAction should return validation error for content too long`
10. `deleteCommentAction should delete comment successfully`
11. `deleteCommentAction should fail when user is not comment owner`
12. `deleteCommentAction should handle comment with replies (cascade)`
13. `createCommentAction should trigger cache invalidation on success`
14. `updateCommentAction should trigger cache invalidation on success`

**Patterns to Follow:**

- Mock `@clerk/nextjs/server` auth with `vi.mock()`
- Mock `SocialFacade` methods to control responses
- Mock `CacheRevalidationService` to verify invalidation calls
- Use `describe`/`it` blocks with globals enabled
- Follow Arrange-Act-Assert pattern

**Validation Commands:**

```bash
npm run test:run -- tests/unit/lib/actions/social.actions.test.ts
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 14 test cases pass
- [ ] Error messages match user-friendly strings from action
- [ ] Cache invalidation verified for all mutation actions
- [ ] No TypeScript errors

---

### Step 4: CommentForm Component Tests

**What**: Create component tests for the CommentForm component
**Why**: Critical UI component for all comment creation and editing
**Test Type**: Component
**Confidence**: High

**Files to Create:**

- `tests/components/feature/comments/comment-form.test.tsx` - CommentForm tests

**Test Cases:**

1. `should render textarea and submit button`
2. `should show character count`
3. `should update character count as user types`
4. `should show warning color when near character limit (90%)`
5. `should show error color when over character limit`
6. `should disable submit when content is empty`
7. `should disable submit when content exceeds max length`
8. `should enable submit when content is valid`
9. `should call onSubmit with content when form submitted`
10. `should clear content after successful submission`
11. `should show reply context when parentCommentId provided`
12. `should show parentCommentAuthor in reply indicator`
13. `should call onCancelReply when cancel reply button clicked`
14. `should show max depth warning when isAtMaxDepth is true`
15. `should disable textarea when isAtMaxDepth is true`
16. `should show loading spinner when isSubmitting is true`
17. `should disable submit button when isSubmitting is true`
18. `should show Cancel button when onCancel provided`
19. `should call onCancel and reset content when Cancel clicked`
20. `should use custom placeholder when provided`

**Patterns to Follow:**

- Use custom `render` from `tests/setup/test-utils.tsx`
- Use `userEvent` for interactions (included in customRender)
- Query by role/aria-label for accessibility
- Use `waitFor` for async assertions
- Mock `SCHEMA_LIMITS` if needed for boundary tests

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-form.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 20 test cases pass
- [ ] Character count validation works correctly
- [ ] Reply mode rendering works correctly
- [ ] Accessibility attributes properly tested

---

### Step 5: CommentItem Component Tests

**What**: Create component tests for the CommentItem component
**Why**: Core display component with complex depth-based styling and action buttons
**Test Type**: Component
**Confidence**: High

**Files to Create:**

- `tests/components/feature/comments/comment-item.test.tsx` - CommentItem tests

**Test Cases:**

1. `should render comment content`
2. `should render user display name`
3. `should render user username with @ prefix`
4. `should render user avatar when avatarUrl provided`
5. `should render avatar fallback when no avatarUrl`
6. `should show relative time (Just now, X minutes ago, etc.)`
7. `should show edited indicator when isEdited is true`
8. `should apply depth-based background class for depth 0`
9. `should apply depth-based background class for depth 3`
10. `should apply depth-based border class for nested comments`
11. `should use smaller avatar for deeply nested comments (depth >= 3)`
12. `should use smaller text for deeply nested comments`
13. `should show Reply badge for nested comments (depth > 0)`
14. `should show action buttons on hover when user is owner`
15. `should hide action buttons when user is not owner`
16. `should call onEditClick when edit button clicked`
17. `should call onDeleteClick when delete button clicked`
18. `should show Reply button when depth < MAX_COMMENT_NESTING_DEPTH`
19. `should hide Reply button at max depth`
20. `should call onReply when Reply button clicked`
21. `should show ReportButton when user is not comment owner`
22. `should hide ReportButton when user is comment owner`

**Patterns to Follow:**

- Use mock comment data from `tests/mocks/data/comments.mock.ts`
- Test hover states with `fireEvent.mouseEnter/mouseLeave`
- Test depth styling with snapshot or class assertions
- Verify accessibility with role queries

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-item.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 22 test cases pass
- [ ] Depth-based styling tested at multiple levels
- [ ] User permissions correctly affect button visibility
- [ ] Time formatting tested with various date inputs

---

### Step 6: CommentList Component Tests

**What**: Create component tests for the CommentList component
**Why**: Handles recursive rendering of nested comments and pagination
**Test Type**: Component
**Confidence**: Medium

**Files to Create:**

- `tests/components/feature/comments/comment-list.test.tsx` - CommentList tests

**Test Cases:**

1. `should render empty state when no comments`
2. `should render comments when provided`
3. `should render nested replies recursively`
4. `should show collapse button for threads with replies`
5. `should collapse replies when collapse button clicked`
6. `should show expand button when replies collapsed`
7. `should show loading skeleton when isLoading is true`
8. `should show Load More button when hasMore is true`
9. `should call onLoadMore when Load More button clicked`
10. `should hide Load More button when no more comments`
11. `should pass correct props to CommentItem`
12. `should pass onReply to CommentItem when provided`
13. `should normalize comments without depth to depth 0`

**Patterns to Follow:**

- Use `createMockCommentTree()` for nested structures
- Test recursive rendering up to MAX_COMMENT_NESTING_DEPTH
- Verify collapse/expand state management
- Mock CommentItem if needed for isolation

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-list.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 13 test cases pass
- [ ] Recursive rendering works correctly
- [ ] Pagination controls work correctly
- [ ] Loading and empty states display correctly

---

### Step 7: CommentDeleteDialog Component Tests

**What**: Create component tests for the CommentDeleteDialog component
**Why**: Critical confirmation UI with cascade warning functionality
**Test Type**: Component
**Confidence**: High

**Files to Create:**

- `tests/components/feature/comments/comment-delete-dialog.test.tsx` - CommentDeleteDialog tests

**Test Cases:**

1. `should not render when isOpen is false`
2. `should not render when commentId is null`
3. `should render dialog when isOpen and commentId provided`
4. `should show delete confirmation message`
5. `should show simple message when no replies`
6. `should show cascade warning when hasReplies is true`
7. `should show reply count in warning message`
8. `should show stronger warning for many replies (>= 5)`
9. `should call onConfirm with commentId when delete clicked`
10. `should call onClose when cancel clicked`
11. `should disable buttons when isSubmitting is true`
12. `should show loading spinner when processing`
13. `should close dialog after successful deletion`

**Patterns to Follow:**

- Test AlertDialog open/close states
- Test cascade warning variations
- Use userEvent for button interactions
- Mock onConfirm to return Promise

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-delete-dialog.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 13 test cases pass
- [ ] Cascade warning displays correctly
- [ ] Loading states handled correctly
- [ ] Dialog closes after operations

---

### Step 8: CommentEditDialog Component Tests

**What**: Create component tests for the CommentEditDialog component
**Why**: Edit functionality with pre-populated content validation
**Test Type**: Component
**Confidence**: High

**Files to Create:**

- `tests/components/feature/comments/comment-edit-dialog.test.tsx` - CommentEditDialog tests

**Test Cases:**

1. `should not render when isOpen is false`
2. `should not render when comment is null`
3. `should render dialog when isOpen and comment provided`
4. `should pre-populate form with existing comment content`
5. `should show dialog title and description`
6. `should call onSubmit with commentId and new content`
7. `should call onClose when cancel clicked`
8. `should disable form when isSubmitting is true`
9. `should close dialog after successful edit`
10. `should allow editing content in textarea`

**Patterns to Follow:**

- Use mock comment data
- Test form pre-population
- Test Dialog component integration
- Verify CommentForm receives correct props

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-edit-dialog.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 10 test cases pass
- [ ] Content pre-population works
- [ ] Edit flow completes correctly
- [ ] Dialog state management correct

---

### Step 9: CommentSection Component Tests

**What**: Create component tests for the CommentSection orchestrator component
**Why**: Critical orchestration component managing all comment state and workflows
**Test Type**: Component
**Confidence**: Medium

**Files to Create:**

- `tests/components/feature/comments/comment-section.test.tsx` - CommentSection tests

**Test Cases:**

1. `should render section header with comment count`
2. `should show comment form when authenticated`
3. `should hide comment form when not authenticated`
4. `should show sign in message when not authenticated`
5. `should render CommentList with comments`
6. `should call onCommentCreate when form submitted`
7. `should clear reply state after successful comment creation`
8. `should set reply state when reply button clicked`
9. `should pass parentCommentId to form when replying`
10. `should open edit dialog when edit clicked`
11. `should call onCommentUpdate when edit submitted`
12. `should open delete dialog when delete clicked`
13. `should call onCommentDelete when delete confirmed`
14. `should show reply context in form when replying`
15. `should calculate max depth correctly for replies`
16. `should show max depth warning when at limit`
17. `should count total replies for delete warning`
18. `should pass hasMore and onLoadMore to CommentList`

**Patterns to Follow:**

- Test state orchestration between child components
- Mock async handlers (onCommentCreate, etc.)
- Test dialog open/close state management
- Test reply workflow end-to-end

**Validation Commands:**

```bash
npm run test:run -- tests/components/feature/comments/comment-section.test.tsx
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 18 test cases pass
- [ ] State flows correctly between components
- [ ] All user workflows functional
- [ ] Error handling correct

---

### Step 10: SocialFacade Integration Tests - Edge Cases

**What**: Add missing edge case tests to existing SocialFacade integration tests
**Why**: Critical gaps in reply validation, depth enforcement, and cascade deletion
**Test Type**: Integration
**Confidence**: High

**Files to Modify:**

- `tests/integration/actions/social.facade.test.ts` - Add additional test cases

**Test Cases to Add:**

**createCommentReply edge cases:**

1. `should fail when parent comment belongs to different target`
2. `should fail when user is blocked by parent comment author`
3. `should fail when depth would exceed MAX_COMMENT_NESTING_DEPTH`
4. `should succeed at depth MAX_COMMENT_NESTING_DEPTH - 1`
5. `should return error message for deleted parent comment`

**deleteComment edge cases:** 6. `should cascade soft delete all nested replies` 7. `should decrement comment count for each deleted comment in tree` 8. `should soft delete (set isDeleted true, deletedAt)` 9. `should not hard delete comments`

**Blocked user scenarios:** 10. `should prevent reply when blocked bidirectionally` 11. `should allow reply when not blocked`

**Cache invalidation:** 12. `should invalidate cache tags after createCommentReply`

**Patterns to Follow:**

- Use existing test structure and beforeEach/afterEach
- Use `createTestUser`, `createTestCollection`, `createTestBobblehead`
- Use `createTestComment` factory (from Step 2)
- Create user block relationships for block tests

**Validation Commands:**

```bash
npm run test:run -- tests/integration/actions/social.facade.test.ts
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 12 new test cases pass
- [ ] Existing tests still pass
- [ ] Edge cases properly covered
- [ ] Database state verified after operations

---

### Step 11: SocialQuery Integration Tests

**What**: Create integration tests for query layer operations
**Why**: Query layer handles critical soft delete filtering, pagination, and tree building
**Test Type**: Integration
**Confidence**: Medium

**Files to Create:**

- `tests/integration/queries/social.query.test.ts` - SocialQuery tests

**Test Cases:**

1. `getCommentsAsync should filter out soft deleted comments`
2. `getCommentsAsync should paginate correctly`
3. `getCommentsAsync should order by createdAt descending`
4. `getCommentByIdAsync should return null for deleted comment`
5. `getCommentRepliesAsync should filter deleted replies`
6. `getCommentsWithRepliesAsync should build nested tree structure`
7. `getCommentsWithRepliesAsync should limit depth to MAX_COMMENT_NESTING_DEPTH`
8. `getCommentThreadWithRepliesAsync should calculate depth correctly`
9. `hasCommentRepliesAsync should return true when has non-deleted replies`
10. `hasCommentRepliesAsync should return false when only deleted replies`

**Patterns to Follow:**

- Use `getTestDb()` and `resetTestDatabase()`
- Create comments with various deleted states
- Create nested comment structures
- Verify tree structure integrity

**Validation Commands:**

```bash
npm run test:run -- tests/integration/queries/social.query.test.ts
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All 10 test cases pass
- [ ] Soft delete filtering verified
- [ ] Tree building verified at multiple depths
- [ ] Pagination works correctly

---

### Step 12: E2E Tests - Comment User Flows

**What**: Create end-to-end tests for complete comment user journeys
**Why**: Validates full stack integration and real user experience
**Test Type**: E2E
**Confidence**: Medium

**Files to Create:**

- `tests/e2e/specs/user/comments.spec.ts` - Authenticated user comment tests

**Test Cases:**

1. `should add a comment to a bobblehead`
2. `should add a comment to a collection`
3. `should reply to an existing comment`
4. `should edit own comment`
5. `should delete own comment`
6. `should delete comment with cascade warning when has replies`
7. `should not see edit/delete buttons on other user comments`
8. `should show max depth warning when replying at limit`

**Patterns to Follow:**

- Use custom fixtures from `tests/e2e/fixtures/base.fixture.ts`
- Use `userPage` and `userFinder` fixtures
- Use ComponentFinder for `data-testid` lookups
- Follow Page Object Model if complex

**Validation Commands:**

```bash
npm run test:e2e -- tests/e2e/specs/user/comments.spec.ts
```

**Success Criteria:**

- [ ] All 8 test cases pass
- [ ] Tests run in isolated browser context
- [ ] Real database interactions verified
- [ ] UI updates correctly after operations

---

## Quality Gates

### Phase 1: Infrastructure (Steps 1-2)

- [ ] Mock data file created and exports correct types
- [ ] Factory creates valid database records
- [ ] TypeScript compilation passes

### Phase 2: Unit Tests (Step 3)

- [ ] All server action tests pass
- [ ] Error handling verified
- [ ] Cache invalidation verified

### Phase 3: Component Tests (Steps 4-9)

- [ ] All component tests pass
- [ ] Coverage threshold met (60%+ for new files)
- [ ] No accessibility regressions

### Phase 4: Integration Tests (Steps 10-11)

- [ ] All integration tests pass with Testcontainers
- [ ] Edge cases properly covered
- [ ] Database state verified

### Phase 5: E2E Tests (Step 12)

- [ ] All E2E tests pass
- [ ] No flaky tests
- [ ] Full user workflows verified

## Test Infrastructure Notes

### Fixtures to Create

- `tests/fixtures/comment.factory.ts` - Creates comments in test database
  - `createTestComment(options)` - Single comment
  - `createTestCommentReply(parentId, options)` - Reply to comment
  - `createTestCommentThread(depth, options)` - Nested thread

### Mocks to Create

- `tests/mocks/data/comments.mock.ts` - Mock comment data
  - `mockComment` - Basic comment
  - `mockCommentWithReplies` - With nested structure
  - `mockCommentWithDepth` - CommentWithDepth type
  - `createMockComment(overrides)` - Factory function

### Shared Utilities

- Reuse `customRender` from `tests/setup/test-utils.tsx`
- Reuse `getTestDb`, `resetTestDatabase` from `tests/setup/test-db.ts`
- Reuse existing user/collection/bobblehead factories

### Mocking Strategy

| Dependency   | Unit Tests | Component Tests | Integration Tests |
| ------------ | ---------- | --------------- | ----------------- |
| Clerk auth   | Mock       | Mock            | Mock              |
| SocialFacade | Mock       | Not needed      | Real              |
| SocialQuery  | Mock       | Not needed      | Real              |
| CacheService | Mock       | Mock            | Mock              |
| Database     | N/A        | N/A             | Testcontainers    |

## Notes

- **Depth calculations**: The `MAX_COMMENT_NESTING_DEPTH` constant (5) affects multiple tests. Import from `@/lib/constants/enums`.
- **Soft delete verification**: Always verify `isDeleted` flag and `deletedAt` timestamp, not record absence.
- **Cache invalidation**: Use `vi.spyOn` on `CacheRevalidationService` to verify tag invalidation.
- **Time formatting**: The `getRelativeTime` function handles both Date objects and ISO strings (cache compatibility).
- **Blocked user tests**: Requires creating user block relationships in the database.
- **Component mocking**: CommentItem uses `ReportButton` which may need mocking in isolation tests.
- **E2E data**: Tests require seeded bobbleheads/collections with comments enabled.
