# Step 2: Source & Test Discovery

## Step Metadata

- **Started**: 2025-11-22T00:01:00Z
- **Completed**: 2025-11-22T00:03:00Z
- **Duration**: ~120 seconds
- **Status**: Complete

## Input

- **Refined Scope**: Comments feature - threading system for user interaction across bobbleheads, collections, subcollections
- **Scope Filter**: all

## Agent Prompt Summary

Discover all source files AND existing test files for comments feature including:

- Components (CommentForm, CommentItem, CommentSection, dialogs)
- Server Actions (create, update, delete)
- Business Logic (Facade methods)
- Data Operations (queries, schema)
- Any existing tests

## Discovery Results

### Summary Statistics

- **Source Files Discovered**: 21
- **Existing Test Files Found**: 3
- **Validation**: All files verified to exist

---

## SOURCE FILES (21 total)

### Critical Priority (7 files)

| File Path                                             | Category   | Description                                                                      |
| ----------------------------------------------------- | ---------- | -------------------------------------------------------------------------------- |
| `src/lib/actions/social/social.actions.ts`            | action     | Server actions for createCommentAction, updateCommentAction, deleteCommentAction |
| `src/lib/facades/social/social.facade.ts`             | facade     | Business logic with depth validation, blocked user checks, cascade deletion      |
| `src/lib/queries/social/social.query.ts`              | query      | Database operations for comments CRUD, reply fetching, count aggregates          |
| `src/components/feature/comments/comment-form.tsx`    | component  | Comment submission/editing with content validation, character count, reply mode  |
| `src/components/feature/comments/comment-item.tsx`    | component  | Individual comment display with action buttons, depth-based styling              |
| `src/components/feature/comments/comment-section.tsx` | component  | Main orchestrator with state management for replies                              |
| `src/lib/validations/comment.validation.ts`           | validation | Zod schemas for all comment operations                                           |

### High Priority (7 files)

| File Path                                                          | Category   | Description                                                   |
| ------------------------------------------------------------------ | ---------- | ------------------------------------------------------------- |
| `src/components/feature/comments/comment-list.tsx`                 | component  | Comment list container with recursive CommentThread rendering |
| `src/components/feature/comments/comment-delete-dialog.tsx`        | component  | Confirmation dialog with cascade deletion warning             |
| `src/components/feature/comments/comment-edit-dialog.tsx`          | component  | Modal dialog for editing comments                             |
| `src/components/feature/comments/async/comment-section-async.tsx`  | component  | Server component wrapper fetching initial comments            |
| `src/components/feature/comments/async/comment-section-client.tsx` | component  | Client wrapper wiring up server actions                       |
| `src/lib/validations/social.validation.ts`                         | validation | Base drizzle-zod schemas for comments                         |
| `src/lib/db/schema/social.schema.ts`                               | schema     | Database table definition for comments                        |

### Medium Priority (7 files)

| File Path                                                                | Category  | Description                                        |
| ------------------------------------------------------------------------ | --------- | -------------------------------------------------- |
| `src/components/feature/comments/skeletons/comment-section-skeleton.tsx` | component | Loading skeleton for comment section               |
| `src/lib/constants/enums.ts`                                             | constants | MAX_COMMENT_NESTING_DEPTH (5) and target type enum |
| `src/lib/constants/schema-limits.ts`                                     | constants | Content length limits for validation               |
| `src/lib/constants/action-names.ts`                                      | constants | Action names for Sentry tracking                   |
| `src/lib/constants/error-codes.ts`                                       | constants | Error codes for comment operations                 |
| `src/lib/constants/error-messages.ts`                                    | constants | User-facing error messages                         |
| `src/lib/constants/operations.ts`                                        | constants | Operation tracking constants                       |

---

## EXISTING TEST FILES (3 total)

| File Path                                               | Type             | Lines | Description                                 |
| ------------------------------------------------------- | ---------------- | ----- | ------------------------------------------- |
| `tests/unit/lib/validations/comment.validation.test.ts` | unit-test        | ~280  | Comprehensive validation schema tests       |
| `tests/unit/validations/social.validation.test.ts`      | unit-test        | -     | Additional validation tests including likes |
| `tests/integration/actions/social.facade.test.ts`       | integration-test | ~440  | Facade tests with Testcontainers            |

### Existing Test Coverage Analysis

**Well Covered**:

- Validation schemas (createCommentSchema, updateCommentSchema, deleteCommentSchema)
- Pagination validation
- UUID validation
- Content limits
- Target types

**Partially Covered**:

- Facade methods (basic CRUD tested)
- Permission checks (owner-only operations)

**Not Covered**:

- Component tests (0 component tests exist)
- Server action tests (actions not directly tested)
- E2E tests (no E2E specs for comments)
- Max depth enforcement
- Cascade deletion edge cases
- Blocked user reply prevention
- Cache invalidation

---

## Architecture Insights

### Layered Architecture

```
Server Actions → Facade → Query → Database
     ↓              ↓        ↓
 Validation    Business   Drizzle
   (Zod)        Logic      ORM
```

### Key Patterns

1. **Polymorphic Comments**: Support bobblehead, collection, subcollection targets
2. **Nested Threading**: Max 5 levels with recursive reply fetching
3. **Soft Deletion**: isDeleted flag with cascade to nested replies
4. **Cache Integration**: Tag-based invalidation via CacheTagGenerators.social
5. **Authorization**: Owner-only edit/delete, blocked user checks

---

## Test-to-Source Mapping

| Source File               | Existing Tests             | Gap                         |
| ------------------------- | -------------------------- | --------------------------- |
| comment-form.tsx          | None                       | Component tests needed      |
| comment-item.tsx          | None                       | Component tests needed      |
| comment-section.tsx       | None                       | Component tests needed      |
| comment-list.tsx          | None                       | Component tests needed      |
| comment-delete-dialog.tsx | None                       | Component tests needed      |
| comment-edit-dialog.tsx   | None                       | Component tests needed      |
| social.actions.ts         | None                       | Unit tests needed           |
| social.facade.ts          | social.facade.test.ts      | More edge cases needed      |
| social.query.ts           | Indirect via facade        | Direct query tests optional |
| comment.validation.ts     | comment.validation.test.ts | Well covered                |
| social.schema.ts          | None                       | Schema tests optional       |

## Validation Results

- **Minimum Files**: 21 source files > 5 required ✓
- **Both Categories**: Source and test files discovered ✓
- **File Existence**: All paths verified ✓
