# Step 3: Coverage Gap Analysis

## Step Metadata

- **Started**: 2025-11-22T00:03:00Z
- **Completed**: 2025-11-22T00:05:00Z
- **Duration**: ~120 seconds
- **Status**: Complete

## Input

- **Source Files Analyzed**: 16 critical files
- **Existing Test Files**: 3 test suites
- **Scope Filter**: all (Unit, Component, Integration, E2E)

## Agent Analysis Summary

The test-gap-analyzer examined all source files against existing tests and identified:

- **13 major coverage gaps** requiring 48-52 new tests
- **Validation tests**: Comprehensive (no gaps)
- **Facade tests**: Partial coverage (edge cases missing)
- **Component tests**: Zero coverage (critical gap)
- **E2E tests**: Zero coverage (critical gap)

---

## Coverage Matrix

| Source File                  | Unit | Component | Integration | E2E | Status       |
| ---------------------------- | ---- | --------- | ----------- | --- | ------------ |
| social.actions.ts            | ❌   | -         | ❌          | ❌  | **CRITICAL** |
| social.facade.ts             | -    | -         | ⚠️          | ❌  | PARTIAL      |
| social.query.ts              | ❌   | -         | ⚠️          | -   | PARTIAL      |
| comment-form.tsx             | -    | ❌        | -           | ❌  | **CRITICAL** |
| comment-item.tsx             | -    | ❌        | -           | ❌  | **CRITICAL** |
| comment-section.tsx          | -    | ❌        | -           | ❌  | **CRITICAL** |
| comment-list.tsx             | -    | ❌        | -           | -   | HIGH         |
| comment-delete-dialog.tsx    | -    | ❌        | -           | -   | HIGH         |
| comment-edit-dialog.tsx      | -    | ❌        | -           | -   | HIGH         |
| comment-section-async.tsx    | -    | ❌        | ❌          | -   | HIGH         |
| comment-section-client.tsx   | -    | ❌        | -           | -   | HIGH         |
| comment.validation.ts        | ✅   | -         | -           | -   | COMPLETE     |
| social.validation.ts         | ✅   | -         | -           | -   | COMPLETE     |
| social.schema.ts             | -    | -         | ⚠️          | -   | OPTIONAL     |
| comment-section-skeleton.tsx | -    | ❌        | -           | -   | LOW          |
| Constants files              | -    | -         | -           | -   | N/A          |

**Legend**: ✅ Covered | ⚠️ Partial | ❌ Missing | - Not Applicable

---

## Gaps by Priority

### Critical Priority (Must Have)

#### 1. Server Actions - Unit Tests (12-14 tests)

**File**: `src/lib/actions/social/social.actions.ts`

| Gap                                | Tests Needed | Risk                             |
| ---------------------------------- | ------------ | -------------------------------- |
| createCommentAction error handling | 4-5          | High - Invalid input not tested  |
| updateCommentAction authorization  | 3-4          | High - Auth bypass possible      |
| deleteCommentAction cascade        | 3-4          | High - Cascade failures untested |
| Cache invalidation verification    | 2-3          | Medium - Stale data possible     |

**Missing Test Cases**:

- Invalid UUID for commentId/parentCommentId
- Empty/whitespace content rejection
- Content exceeding 5000 characters
- Unauthorized edit/delete attempts
- Non-existent comment operations
- Cache tag invalidation calls

#### 2. Facade Edge Cases - Integration Tests (12-14 tests)

**File**: `src/lib/facades/social/social.facade.ts`

| Gap                            | Tests Needed | Risk                      |
| ------------------------------ | ------------ | ------------------------- |
| createCommentReply validations | 4-5          | Critical - Business rules |
| deleteComment cascade          | 3-4          | High - Data integrity     |
| Depth limit enforcement        | 2-3          | High - System limits      |
| Blocked user prevention        | 2-3          | Medium - Access control   |

**Missing Test Cases**:

- Reply to non-existent parent comment
- Reply to deleted parent comment
- Reply to comment on different target entity
- Reply when blocked by comment author
- Reply at max depth (level 5)
- Cascade delete of nested replies
- Comment count increment/decrement verification
- GREATEST(0, ...) for negative count prevention

#### 3. Core Components - Component Tests (26-30 tests)

**CommentForm** (8-10 tests):

- Renders with correct initial state
- Content validation (min 1, max 5000 chars)
- Character count display and warning at 90%
- Reply mode displays parent author
- Max depth warning when canReply=false
- Cancel reply functionality
- Form submission triggers action
- Loading state during submission

**CommentItem** (8-10 tests):

- Depth-based background/border styling (levels 0-5)
- Author display with avatar and name
- Relative time formatting
- Edit/delete buttons for comment owner
- Reply button hidden at max depth
- Report button for non-owners
- Hover state reveals actions
- Date serialization handling (Date vs ISO string)

**CommentSection** (10-12 tests):

- Renders form, list, and dialogs
- Reply state management
- findCommentById helper function
- Total reply count calculation
- Create comment workflow
- Update comment workflow
- Delete comment workflow
- Dialog coordination (edit/delete)
- Pagination handling

### High Priority (Should Have)

#### 4. Supporting Components - Component Tests (16-18 tests)

**CommentList** (4-5 tests):

- Recursive CommentThread rendering
- Empty state display
- Pagination controls
- Load more functionality

**CommentDeleteDialog** (4-5 tests):

- Cascade warning when replies exist
- Confirmation button triggers action
- Cancel closes dialog
- Reply count display

**CommentEditDialog** (4-5 tests):

- Pre-populated content
- Validation same as CommentForm
- Save triggers updateCommentAction
- Cancel closes dialog

**Async Wrappers** (3-4 tests):

- comment-section-async.tsx server data fetching
- comment-section-client.tsx action wiring

### Medium Priority (Nice to Have)

#### 5. Query Layer - Integration Tests (8-10 tests)

**File**: `src/lib/queries/social/social.query.ts`

| Gap                     | Tests Needed |
| ----------------------- | ------------ |
| Soft delete filtering   | 2            |
| Pagination edge cases   | 2-3          |
| Recursive tree building | 2-3          |
| Polymorphic operations  | 2-3          |

#### 6. E2E Tests (6-8 tests)

**File to Create**: `tests/e2e/specs/comments.spec.ts`

| Scenario                         | Tests |
| -------------------------------- | ----- |
| Complete comment thread workflow | 2     |
| Reply nesting up to max depth    | 1     |
| Edit and delete flows            | 2     |
| Permission-based UI              | 2-3   |

---

## Test Count Summary

| Category                   | Existing | New Needed | Total       |
| -------------------------- | -------- | ---------- | ----------- |
| Unit Tests (Actions)       | 0        | 12-14      | 12-14       |
| Unit Tests (Validation)    | ~30      | 0          | ~30         |
| Component Tests            | 0        | 42-48      | 42-48       |
| Integration Tests (Facade) | ~20      | 12-14      | 32-34       |
| Integration Tests (Query)  | 0        | 8-10       | 8-10        |
| E2E Tests                  | 0        | 6-8        | 6-8         |
| **TOTAL**                  | ~50      | **80-94**  | **130-144** |

---

## Test Infrastructure Needs

### New Test Files to Create

```
tests/
├── unit/
│   └── lib/
│       └── actions/
│           └── social.actions.test.ts (NEW)
├── components/
│   └── feature/
│       └── comments/
│           ├── comment-form.test.tsx (NEW)
│           ├── comment-item.test.tsx (NEW)
│           ├── comment-section.test.tsx (NEW)
│           ├── comment-list.test.tsx (NEW)
│           ├── comment-delete-dialog.test.tsx (NEW)
│           └── comment-edit-dialog.test.tsx (NEW)
├── integration/
│   └── queries/
│       └── social.query.test.ts (NEW)
└── e2e/
    └── specs/
        └── comments.spec.ts (NEW)
```

### Test Factories Needed

1. **Comment Factory**: Create comments with configurable depth, target types, deleted state
2. **User Block Factory**: Create blocked user relationships for permission tests
3. **Comment Tree Factory**: Generate nested comment structures for depth testing

### Mocks Required

- `useUser()` from Clerk for authentication state
- `useServerAction()` for action testing
- `CacheService` for cache invalidation verification
- `Sentry.captureException` for error logging verification

---

## Risk Assessment

| Gap                          | Risk Level | Impact                                |
| ---------------------------- | ---------- | ------------------------------------- |
| Server action error handling | HIGH       | Invalid operations could corrupt data |
| Cascade deletion             | HIGH       | Orphaned data or data loss            |
| Depth limit enforcement      | HIGH       | System abuse possible                 |
| Component rendering          | MEDIUM     | Poor UX, visual bugs                  |
| Permission checks            | MEDIUM     | Unauthorized access                   |
| Cache invalidation           | LOW        | Stale data temporarily                |

---

## Implementation Order Recommendation

1. **Phase 1 - Critical Infrastructure** (Week 1)
   - Server action unit tests
   - Facade edge case tests
   - Test factories

2. **Phase 2 - Core Components** (Week 2)
   - CommentForm tests
   - CommentItem tests
   - CommentSection tests

3. **Phase 3 - Supporting Components** (Week 3)
   - CommentList tests
   - Dialog tests
   - Async wrapper tests

4. **Phase 4 - E2E & Polish** (Week 4)
   - E2E tests
   - Query tests
   - Coverage verification

## Validation Results

- **All source files analyzed**: ✓
- **Gaps categorized by priority**: ✓
- **Test estimates provided**: ✓
- **Infrastructure needs identified**: ✓
