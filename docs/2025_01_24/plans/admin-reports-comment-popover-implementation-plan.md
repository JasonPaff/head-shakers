# Implementation Plan: Comment Content Popover for Admin Reports

**Generated**: 2025-01-24
**Original Request**: On the admin report pages reports table there is a column that includes a link to the reported content. This column is unable to link to comments so it uses a disabled icon. Since this column can't show a link to the comment I think it should show a different icon and that icon button would be a popover that shows the reported comment.

**Refined Request**: On the admin report pages, the reports table currently includes a "View Content" column that displays links to reported content; however, this column cannot link to comments, so it uses a disabled icon instead. Since direct linking to comments isn't feasible within the current implementation, the disabled icon should be replaced with a different icon (such as an eye or message icon from Lucide React) that triggers a Radix UI popover component. When clicked, this popover should display the full text of the reported comment in a modal-like overlay, allowing admins to review the comment content directly from the reports table without needing to navigate away.

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Low
**Risk Level**: Low

## Quick Summary

Replace the disabled icon for comment reports in the admin reports table with a clickable icon that triggers a Radix UI popover displaying the full comment text. This requires extending the database query to fetch comment content and adding a new popover component to the View Content column for comment-type reports.

## Prerequisites

- [ ] Verify development environment is running with `npm run dev`
- [ ] Confirm access to admin reports page at `/admin/reports`
- [ ] Ensure at least one comment report exists in the database for testing

## Implementation Steps

### Step 1: Extend Validation Schema to Include Comment Content

**What**: Add `commentContent` field to the `SelectContentReportWithSlugs` type definition
**Why**: The data structure needs to accommodate the comment text that will be fetched from the database and passed to the UI component
**Confidence**: High

**Files to Modify:**
- `src/lib/validations/moderation.validation.ts` - Add commentContent field to schema

**Changes:**
- Add `commentContent: z.string().nullable()` to `selectContentReportWithSlugsSchema.extend()` (around line 102-106)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] `SelectContentReportWithSlugs` type includes `commentContent: string | null`
- [ ] All validation commands pass
- [ ] No TypeScript errors in dependent files

---

### Step 2: Update Database Query to Fetch Comment Content

**What**: Modify the `getAllReportsWithSlugsForAdminAsync` query to include comment content in the SELECT clause
**Why**: The query already JOINs the comments table for existence checking; extending it to select the content field provides the data needed for the popover without additional database calls
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/content-reports/content-reports.query.ts` - Add commentContent to SELECT clause

**Changes:**
- Add a new computed field in the select object (around lines 254-291) using a CASE statement similar to existing slug fields
- The field should return `comments.content` when `targetType = 'comment'`, otherwise NULL

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Query returns `commentContent` field for all reports
- [ ] Comment reports include the actual comment text
- [ ] Non-comment reports return null for commentContent
- [ ] All validation commands pass

---

### Step 3: Update Reports Table Component with Comment Popover

**What**: Replace the disabled tooltip/button for comments with a Popover component that displays the comment content
**Why**: This provides administrators with immediate access to review reported comment content without navigating away from the reports dashboard
**Confidence**: High

**Files to Modify:**
- `src/components/admin/reports/reports-table.tsx` - Update View Content column cell renderer

**Changes:**
- Add imports for `Popover`, `PopoverContent`, `PopoverTrigger` from `@/components/ui/popover`
- Add import for `MessageSquareIcon` from `lucide-react` (as the trigger icon for comment viewing)
- Modify the `viewContent` column cell renderer (lines 268-304) to handle three cases:
  1. Link available (existing behavior for non-comments)
  2. Comment type with content available (new popover behavior)
  3. Content unavailable (existing disabled tooltip behavior)
- For comment case: Render Popover with MessageSquareIcon trigger button and PopoverContent displaying the comment text
- Add appropriate styling for the popover content (max-width, text wrapping, scroll behavior for long comments)
- Include a header in the popover identifying it as "Reported Comment"

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comments show a clickable message icon instead of disabled external link icon
- [ ] Clicking the icon opens a popover with the full comment text
- [ ] Popover displays "Comment content unavailable" when commentContent is null but targetType is comment
- [ ] Non-comment content types retain existing link/disabled behavior
- [ ] Popover has proper styling and is scrollable for long comments
- [ ] All validation commands pass

---

### Step 4: Manual Testing and Verification

**What**: Verify the feature works correctly across all scenarios
**Why**: Ensures the implementation handles edge cases and provides good user experience
**Confidence**: High

**Files to Modify:**
- None

**Changes:**
- Test with existing comment reports to verify popover displays correct content
- Test with non-comment reports to verify external links still work
- Test with deleted content reports to verify disabled state handling
- Test popover positioning and responsiveness

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**
- [ ] Comment reports show MessageSquare icon
- [ ] Clicking icon opens popover with comment text
- [ ] Popover closes when clicking outside
- [ ] Non-comment reports show external link or disabled state appropriately
- [ ] Build completes successfully
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Build succeeds with `npm run build`
- [ ] Comment popover displays correctly for comment reports
- [ ] Existing functionality for bobblehead/collection/subcollection/user links is preserved
- [ ] Disabled state for deleted content is preserved

## Notes

- The comments table already has a `content` field with `varchar` type up to `SCHEMA_LIMITS.COMMENT.CONTENT.MAX` characters
- The existing query already LEFT JOINs the comments table (lines 323-329), so adding the content selection has minimal performance impact
- The popover should include scroll handling for very long comments to prevent UI overflow
- Consider truncating extremely long comments in the popover with a "Show more" option if needed (future enhancement)
- The MessageSquareIcon from Lucide React aligns with the comment semantic and distinguishes it from the external link behavior

## File Discovery Summary

### Files to Modify (4)
| File | Purpose |
|------|---------|
| `src/lib/validations/moderation.validation.ts` | Add commentContent type |
| `src/lib/queries/content-reports/content-reports.query.ts` | Fetch comment content |
| `src/components/admin/reports/reports-table.tsx` | Add popover UI |

### Reference Files (12)
| File | Purpose |
|------|---------|
| `src/components/ui/popover.tsx` | Popover component to use |
| `src/lib/db/schema/social.schema.ts` | Comments schema reference |
| `src/components/admin/reports/report-filters.tsx` | Popover pattern reference |
| `src/lib/facades/content-reports/content-reports.facade.ts` | Data flow reference |
| `src/components/admin/reports/admin-reports-client.tsx` | Component structure |
| `src/app/(app)/admin/reports/page.tsx` | Page structure |
