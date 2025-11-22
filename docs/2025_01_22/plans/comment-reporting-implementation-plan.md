# Implementation Plan: Comment Reporting Functionality

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Low
**Risk Level**: Low

## Quick Summary

This plan adds comment reporting functionality to the existing content reports system. The database already supports 'comment' as a target type in the `ENUMS.CONTENT_REPORT.TARGET_TYPE` enum, so only application-layer changes are required. Users will be able to report inappropriate comments through the same ReportButton component used for bobbleheads, collections, and subcollections.

## Prerequisites

- [ ] Understanding of existing content reports architecture (validation schemas, query layer, facade layer, UI components)
- [ ] Familiarity with `SocialQuery.getCommentByIdAsync()` method for comment validation
- [ ] Access to all files identified in this plan

---

## Implementation Steps

### Step 1: Update Validation Schemas to Include 'comment' Target Type

**What**: Add 'comment' to the targetType enum in validation schemas for creating reports and checking report status.
**Why**: The validation layer currently restricts targetType to only 'bobblehead', 'collection', and 'subcollection'. Adding 'comment' enables the API to accept comment reports.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\moderation.validation.ts`

**Changes:**

- In `createContentReportSchema.extend()`, add 'comment' to the `targetType` enum array (line 39)
- In `checkReportStatusSchema`, add 'comment' to the `targetType` enum array (line 47)
- In `adminReportsFilterSchema`, add 'comment' to the `targetType` enum array (line 91)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] The `createContentReportSchema` accepts 'comment' as a valid targetType
- [ ] The `checkReportStatusSchema` accepts 'comment' as a valid targetType
- [ ] The `adminReportsFilterSchema` accepts 'comment' as a valid targetType
- [ ] All validation commands pass

---

### Step 2: Update Query Layer to Validate Comments

**What**: Add 'comment' case to the `validateTargetAsync()` method in ContentReportsQuery.
**Why**: The query layer must validate that a comment exists before allowing a report to be created, and must retrieve the comment owner (userId) to prevent self-reporting.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\content-reports\content-reports.query.ts`

**Changes:**

- Import `comments` table from `@/lib/db/schema`
- Add a new 'comment' case in the `validateTargetAsync()` switch statement (after line 437)
- Query the comments table using the existing pattern from `SocialQuery.getCommentByIdAsync()`
- Return `{ isExists: !!comment, ownerId: comment?.userId || null }`
- Update the type definitions: Add 'comment' to the `AdminReportsFilterOptions.targetType` union (line 15)
- Update type signatures for methods that use targetType: `checkExistingReportAsync`, `countReportsForTargetAsync`, `getReportsByTargetAsync`, `getReportStatusAsync`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] The `validateTargetAsync` method handles 'comment' target type
- [ ] Comment existence is verified using the comments table
- [ ] Comment owner (userId) is correctly returned for self-report prevention
- [ ] All validation commands pass

---

### Step 3: Update Facade Layer to Validate Comments

**What**: Add 'comment' case to the `validateReportTarget()` method in ContentReportsFacade.
**Why**: The facade layer performs business logic validation. Currently, the 'comment' case exists but returns "Target type not yet supported". This needs to be updated to perform actual comment validation.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\lib\facades\content-reports\content-reports.facade.ts`

**Changes:**

- Import `SocialQuery` from `@/lib/queries/social/social.query`
- Update the 'comment' case in `validateReportTarget()` switch statement (lines 481-486)
- Replace the placeholder implementation with actual comment validation using `SocialQuery.getCommentByIdAsync()`
- Check if comment exists and prevent self-reporting by comparing `comment.userId` with the current user
- Update type signatures for methods that use targetType to include 'comment': `getReportStatusAsync`, `validateReportTargetAsync`, `createReportAsync`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] The `validateReportTarget` method validates comments correctly
- [ ] Self-reporting prevention works for comments
- [ ] No "Target type not yet supported" error for comments
- [ ] All validation commands pass

---

### Step 4: Update ReportButton Component to Support Comments

**What**: Add 'comment' to the `ReportTargetType` union type and update the aria-label function.
**Why**: The UI component needs to recognize 'comment' as a valid report target to display the report button on comments.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\content-reports\report-button.tsx`

**Changes:**

- Add 'comment' to the `ReportTargetType` union type (line 13)
- Add a 'comment' case in the `getAriaLabel()` function returning 'Report this comment' (after line 40)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] `ReportTargetType` includes 'comment'
- [ ] The aria-label correctly describes "Report this comment"
- [ ] All validation commands pass

---

### Step 5: Add ReportButton to CommentItem Component

**What**: Integrate the ReportButton into the CommentItem component for non-owners.
**Why**: Users need a UI element to report comments. The report button should appear for authenticated users who are not the comment owner.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\comments\comment-item.tsx`

**Changes:**

- Import `ReportButton` from `@/components/feature/content-reports/report-button`
- Add a new derived variable `_canReport` that is true when: `currentUserId` exists AND `currentUserId !== comment.userId`
- Add ReportButton in the comment footer section (near line 240, after the Reply button)
- Wrap with `<Conditional isCondition={_canReport}>` to only show for non-owners
- Use props: `targetId={comment.id}`, `targetType="comment"`, `variant="ghost"`
- Apply styling consistent with the Reply button (small size, muted text)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] ReportButton appears on comments for logged-in users who are not the comment owner
- [ ] ReportButton does not appear for comment owners
- [ ] ReportButton does not appear for unauthenticated users
- [ ] Clicking the button opens the ReportReasonDialog
- [ ] All validation commands pass

---

### Step 6: Update Admin Reports Table to Display Comment Badge

**What**: Add styling for 'comment' badge in the reports table targetType column.
**Why**: Admin users need to visually identify comment reports in the reports list.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\reports-table.tsx`

**Changes:**

- Add `_isComment` derived variable in the targetType cell (line 115): `const _isComment = targetType === 'comment';`
- Add conditional styling for comment badge: `_isComment && 'bg-orange-100 text-orange-800'`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Comment reports display with an orange badge in the admin table
- [ ] Badge styling is consistent with other content types
- [ ] All validation commands pass

---

### Step 7: Update Admin Report Detail Dialog to Handle Comments

**What**: Add styling for 'comment' content type in the report detail dialog.
**Why**: Admin users viewing report details need to see the content type correctly styled.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx`

**Changes:**

- Add `_isComment` derived variable (around line 62): `const _isComment = report?.targetType === 'comment';`
- Add conditional styling in the Content Type Badge (line 179-188): `_isComment && 'bg-orange-100 text-orange-800'`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Comment content type displays with orange badge in report details
- [ ] Styling is consistent with the reports table
- [ ] All validation commands pass

---

### Step 8: Update Admin Report Filters to Include Comment Option

**What**: Add 'comment' to the content type filter dropdown in the admin reports page.
**Why**: Admins need to filter reports by content type, including comments.
**Confidence**: High

**Files to Modify:**

- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-filters.tsx`

**Changes:**

- Add 'comment' to the `parseAsArrayOf` for targetType (line 35): Update to include 'comment' in the array
- Add 'comment' to the type assertion in `handleTargetTypeChange` (line 67-68): Add 'comment' to the union
- Add SelectItem for comment in the Target Type Filter dropdown (around line 250): `<SelectItem value={'comment'}>Comment</SelectItem>`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] 'Comment' appears as a filter option in the Content Type dropdown
- [ ] Selecting 'Comment' correctly filters the reports
- [ ] Filter badge displays correctly when comment filter is active
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Manual testing: Create a report on a comment and verify it appears in admin reports
- [ ] Manual testing: Verify report button does not appear for own comments
- [ ] Manual testing: Verify report button does not appear for unauthenticated users
- [ ] Manual testing: Verify admin filters work with comment type

---

## Notes

### Key Insight: Database Already Supports Comments

The database enum `ENUMS.CONTENT_REPORT.TARGET_TYPE` already includes 'comment' (confirmed at line 35 of `src/lib/constants/enums.ts`):

```
TARGET_TYPE: ['bobblehead', 'comment', 'user', 'collection', 'subcollection'] as const
```

This means NO database migrations are required. All changes are application-layer only.

### Comment Validation Strategy

The `SocialQuery.getCommentByIdAsync()` method already exists and returns the comment with its `userId` field, which is exactly what's needed for:

1. Verifying the comment exists
2. Preventing self-reporting (comparing comment.userId with reporter's userId)

### UI Placement Consideration

The ReportButton is placed in the comment footer alongside the Reply button. This keeps the action buttons grouped together and maintains consistency with how other content types display their report buttons.

### Badge Color Consistency

Orange was chosen for comment badges to differentiate from:

- Green: Bobbleheads
- Blue: Collections
- Purple: Subcollections

This creates a distinct visual hierarchy for admins reviewing reports.

### Excluded from Scope

- 'user' target type reporting (mentioned in enum but not implemented)
- Comment content preview in admin report detail dialog (placeholder exists for future implementation)
- Real-time notification when comments are reported
