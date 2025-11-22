# Step 2: File Discovery Log

**Step**: 2 - AI-Powered File Discovery
**Status**: Completed
**Start Time**: 2025-01-22T00:00:20Z
**End Time**: 2025-01-22T00:01:45Z
**Duration**: ~85 seconds

## Input: Refined Feature Request

As a user, I would like to be able to report comments through the same reporting mechanism available for collections, subcollections, and bobbleheads, enabling community moderation of inappropriate or harmful comment content across the platform. This feature should allow users to flag comments that violate community guidelines, contain spam, harassment, or other problematic content, with the ability to specify a report reason and optional additional details.

## Discovery Results Summary

- **Directories Explored**: 15+
- **Files Examined**: 50+
- **Highly Relevant Files**: 35
- **Supporting Files**: 20+

## Critical Files (Require Modification)

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/db/schema/moderation.schema.ts` | schema | Contains `contentReports` table - already supports 'comment' in enum |
| `src/lib/constants/enums.ts` | constants | `CONTENT_REPORT.TARGET_TYPE` already includes 'comment' |
| `src/lib/validations/moderation.validation.ts` | validation | **Must add 'comment'** to `createContentReportSchema` targetType |
| `src/lib/queries/content-reports/content-reports.query.ts` | query | **Must add 'comment' case** to `validateTargetAsync()` |
| `src/lib/facades/content-reports/content-reports.facade.ts` | facade | **Must add 'comment' case** to `validateReportTarget()` |
| `src/components/feature/content-reports/report-button.tsx` | component | **Must add 'comment'** to `ReportTargetType` |
| `src/components/feature/comments/comment-item.tsx` | component | **Must add ReportButton** for non-owners |

## High Priority Files

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/db/schema/social.schema.ts` | schema | Contains `comments` table definition |
| `src/lib/db/schema/relations.schema.ts` | schema | Contains report relations |
| `src/lib/validations/comment.validation.ts` | validation | Comment validation patterns |
| `src/lib/queries/social/social.query.ts` | query | Contains `getCommentByIdAsync()` |
| `src/lib/facades/social/social.facade.ts` | facade | Comment-related methods |
| `src/lib/actions/content-reports/content-reports.actions.ts` | action | Report server actions |
| `src/components/feature/content-reports/report-reason-dialog.tsx` | component | Report dialog |

## Medium Priority Files (Admin UI)

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/components/admin/reports/reports-table.tsx` | admin | **Add 'comment' badge** |
| `src/components/admin/reports/report-detail-dialog.tsx` | admin | **Add 'comment' handling** |
| `src/components/admin/reports/report-filters.tsx` | admin | **Add 'comment' filter** |
| `src/app/(app)/admin/reports/page.tsx` | admin | Reports page |

## Reference Files (Pattern Examples)

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/components/feature/bobblehead/bobblehead-sticky-header.tsx` | reference | ReportButton integration example |
| `src/components/feature/collection/collection-sticky-header.tsx` | reference | ReportButton integration example |
| `src/components/feature/subcollection/subcollection-sticky-header.tsx` | reference | ReportButton integration example |

## Low Priority/Supporting Files

| File Path | Category | Description |
|-----------|----------|-------------|
| `src/lib/constants/error-codes.ts` | constants | Error codes for reports |
| `src/lib/constants/error-messages.ts` | constants | Error messages |
| `src/lib/constants/operations.ts` | constants | Operation constants |
| `src/lib/constants/action-names.ts` | constants | Action names |
| `src/components/feature/content-reports/report-status-indicator.tsx` | component | Status indicator |
| `src/components/feature/content-reports/report-status-wrapper.tsx` | component | Status wrapper |
| `src/components/feature/comments/comment-list.tsx` | component | Comment list |
| `src/components/feature/comments/comment-section.tsx` | component | Comment section |

## Key Architecture Insights

### Existing Comment Support Discovery

The database enum `ENUMS.CONTENT_REPORT.TARGET_TYPE` in `enums.ts` **already includes 'comment'**:

```typescript
TARGET_TYPE: ['bobblehead', 'comment', 'user', 'collection', 'subcollection'] as const,
```

However, the validation schema explicitly limits it:

```typescript
targetType: z.enum(['bobblehead', 'collection', 'subcollection']),
```

**This means the database is ready - only application layer needs updates.**

### Patterns to Follow

1. **Polymorphic Target Type**: Reports use `targetType` enum for multiple content types
2. **Facade + Query Separation**: Business logic in facades, data access in queries
3. **Target Validation**: `validateTargetAsync()` validates target exists and retrieves owner
4. **UI Integration**: ReportButton shown conditionally for non-owners
5. **Admin Filtering**: Target type filtering in admin reports page

### Comment Ownership

Comments have `userId` field for ownership validation:

```typescript
userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
```

## Validation Results

| Check | Result |
|-------|--------|
| Minimum Files (3+) | PASS - 35 files discovered |
| File Existence | PASS - All paths validated |
| Categorization | PASS - Proper priority assignment |
| Coverage | PASS - All layers covered |
| Pattern Recognition | PASS - Existing patterns identified |
