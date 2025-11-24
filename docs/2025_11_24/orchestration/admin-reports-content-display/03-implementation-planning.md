# Step 3: Implementation Planning

## Step Metadata

- **Start Time**: 2025-11-24T14:31:30Z
- **End Time**: 2025-11-24T14:32:45Z
- **Duration**: 75 seconds
- **Status**: ✅ SUCCESS

## Refined Request Used as Input

The admin reports page displays a comprehensive table of all submitted reports with an actions menu on each row containing a "view details" option that opens a report details dialog. The dialog's report content section must be updated to handle different content types with appropriate rendering: when the reported content is a comment, display the actual comment text directly in the section; when the reported content is a collection, subcollection, or bobblehead, display a type-aware link to the reported content using the $path utility from next-typesafe-url to ensure type-safe routing. The implementation should leverage Drizzle ORM queries to fetch the appropriate content data based on the report's content type, utilizing the existing database schema and query patterns from the codebase, and should render the content section using Radix UI components consistent with the design system.

## File Analysis Used as Input

### Critical Priority Files
- `src/components/admin/reports/report-detail-dialog.tsx` - Main component to modify (lines 201-209 have placeholder)
- `src/lib/queries/content-reports/content-reports.query.ts` - Query with getAllReportsWithSlugsForAdminAsync
- `src/lib/validations/moderation.validation.ts` - SelectContentReportWithSlugs type

### High Priority Files
- `src/components/admin/reports/admin-reports-client.tsx` - Passes data to dialog
- `src/components/admin/reports/reports-table.tsx` - Reference implementation (lines 47-121 have link generation helpers)
- `src/lib/facades/content-reports/content-reports.facade.ts` - Business logic layer
- `src/app/(app)/admin/reports/page.tsx` - Admin page

### Existing Patterns
- Type-safe routing with $path utility from next-typesafe-url
- Content link generation logic exists in reports-table.tsx (lines 47-121)
- Comment popover display exists in reports-table.tsx (lines 305-367)
- Data already includes: commentContent, contentExists, targetSlug, parentCollectionSlug

## Agent Prompt Sent

```
Generate an implementation plan in MARKDOWN format (NOT XML) following your defined template with these sections: ## Overview (with Estimated Duration, Complexity, Risk Level), ## Quick Summary, ## Prerequisites, ## Implementation Steps (each step with What/Why/Confidence/Files/Changes/Validation Commands/Success Criteria), ## Quality Gates, ## Notes.

IMPORTANT: Include 'npm run lint:fix && npm run typecheck' validation for every step touching JS/JSX/TS/TSX files. Do NOT include code examples.

**Feature Request**: The admin reports page displays a comprehensive table of all submitted reports with an actions menu on each row containing a "view details" option that opens a report details dialog. The dialog's report content section must be updated to handle different content types with appropriate rendering: when the reported content is a comment, display the actual comment text directly in the section; when the reported content is a collection, subcollection, or bobblehead, display a type-safe link to the reported content using the $path utility from next-typesafe-url to ensure type-safe routing. The implementation should leverage Drizzle ORM queries to fetch the appropriate content data based on the report's content type, utilizing the existing database schema and query patterns from the codebase, and should render the content section using Radix UI components consistent with the design system.

**Discovered Files Analysis**:

CRITICAL PRIORITY:
- src/components/admin/reports/report-detail-dialog.tsx - Main component to modify (lines 201-209 have placeholder)
- src/lib/queries/content-reports/content-reports.query.ts - Query with getAllReportsWithSlugsForAdminAsync
- src/lib/validations/moderation.validation.ts - SelectContentReportWithSlugs type

HIGH PRIORITY:
- src/components/admin/reports/admin-reports-client.tsx - Passes data to dialog
- src/components/admin/reports/reports-table.tsx - Reference implementation (lines 47-121 have link generation helpers)
- src/lib/facades/content-reports/content-reports.facade.ts - Business logic layer
- src/app/(app)/admin/reports/page.tsx - Admin page

MEDIUM PRIORITY:
- src/lib/db/schema/moderation.schema.ts - Database schema
- src/lib/db/schema/social.schema.ts - Comments schema
- src/lib/db/schema/collections.schema.ts - Collections schema
- src/lib/db/schema/bobbleheads.schema.ts - Bobbleheads schema

**Existing Patterns to Follow**:
- Type-safe routing with $path utility from next-typesafe-url
- Content link generation logic exists in reports-table.tsx (lines 47-121)
- Comment popover display exists in reports-table.tsx (lines 305-367)
- Data already includes: commentContent, contentExists, targetSlug, parentCollectionSlug

**Project Context**:
- Next.js 16 with App Router, React 19, TypeScript
- Drizzle ORM with PostgreSQL/Neon
- Radix UI components
- Strict conventions: no barrel files, no eslint-disable, type-safe everything
- Use Conditional component for conditional rendering
- Data is already fetched with getAllReportsWithSlugsForAdminAsync
```

## Full Agent Response (Implementation Plan)

```markdown
# Implementation Plan: Report Details Dialog Content Section Enhancement

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Update the report details dialog's content section to intelligently render different content types: display comment text directly for comment reports, and generate type-safe links using $path for bobblehead, collection, and subcollection reports. The data is already fetched with all required fields through getAllReportsWithSlugsForAdminAsync.

## Prerequisites

- [ ] Verify SelectContentReportWithSlugs type includes commentContent, contentExists, targetSlug, and parentCollectionSlug fields (already confirmed)
- [ ] Ensure dialog receives SelectContentReportWithSlugs type from parent (currently uses SelectContentReport - needs update)
- [ ] Confirm $path utility is available from next-typesafe-url

## Implementation Steps

### Step 1: Update ReportDetailDialog Props Type

**What**: Change the report prop type from SelectContentReport to SelectContentReportWithSlugs
**Why**: The dialog needs access to slug data and comment content for proper rendering
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Update import and prop type

**Changes:**
- Change import from SelectContentReport to SelectContentReportWithSlugs
- Update ReportDetailDialogProps interface report property type to SelectContentReportWithSlugs

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Import statement updated to use SelectContentReportWithSlugs
- [ ] ReportDetailDialogProps interface uses correct type
- [ ] All validation commands pass

---

### Step 2: Create Content Link Generation Helper Functions

**What**: Add helper functions to generate type-safe links and check content availability
**Why**: Reuse existing pattern from reports-table.tsx for consistent behavior
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Add helper functions before component

**Changes:**
- Add isContentLinkAvailable function to check if content can be linked
- Add getContentLink function to generate $path URLs based on targetType
- Add getContentTypeLabel function to format content type display names
- Import $path from next-typesafe-url
- Import Link from next/link
- Import ExternalLinkIcon from lucide-react

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Helper functions correctly handle all target types
- [ ] Functions match patterns from reports-table.tsx
- [ ] Type safety maintained throughout
- [ ] All validation commands pass

---

### Step 3: Add Content Display Section Component Logic

**What**: Create derived variables for conditional content rendering
**Why**: Follow existing component pattern for clean conditional rendering
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Add derived variables after existing ones

**Changes:**
- Add _hasCommentContent variable checking for comment type and content availability
- Add _isContentLinkable variable using isContentLinkAvailable helper
- Add _contentLink variable using getContentLink helper
- Add _showContentPreview variable to determine if any content can be shown

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Derived variables follow existing naming pattern
- [ ] Logic correctly determines content display state
- [ ] All validation commands pass

---

### Step 4: Replace Content Preview Placeholder Section

**What**: Replace the placeholder div with dynamic content rendering logic
**Why**: Implement the actual feature requirement for type-aware content display
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Replace lines 201-209 in Reported Content section

**Changes:**
- Remove placeholder div with dashed border
- Add Conditional component for comment content display with text content in muted paragraph
- Add Conditional component for linkable content with Button asChild Link pattern
- Add Conditional component for unavailable content with muted message
- Ensure all three conditions are mutually exclusive

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Comment text displays correctly when targetType is comment
- [ ] Links generate correctly for bobblehead, collection, and subcollection
- [ ] Unavailable content shows appropriate message
- [ ] Radix UI components used consistently
- [ ] All validation commands pass

---

### Step 5: Add Content Status Indicator

**What**: Add a visual indicator showing whether content still exists or has been deleted
**Why**: Provide context to moderators about content availability
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Add content status row after Content Type badge

**Changes:**
- Add content status row showing contentExists boolean
- Use CheckCircleIcon for existing content and XCircleIcon for deleted content
- Import icons from lucide-react
- Add appropriate color coding for status

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Content status displays correctly
- [ ] Visual indicators match design system
- [ ] Icons imported and used correctly
- [ ] All validation commands pass

---

### Step 6: Verify Type-Safe Routing Integration

**What**: Test that all $path calls generate correct route parameters
**Why**: Ensure type safety and correct routing behavior across all content types
**Confidence**: High

**Files to Modify:**
- None - verification step only

**Changes:**
- Verify bobblehead routes use bobbleheadSlug parameter
- Verify collection routes use collectionSlug parameter
- Verify subcollection routes use both collectionSlug and subcollectionSlug parameters
- Confirm $path calls match existing patterns in reports-table.tsx

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All $path calls pass TypeScript validation
- [ ] Route parameters match schema requirements
- [ ] No type errors in generated routes
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] SelectContentReportWithSlugs type is used throughout
- [ ] Comment content displays correctly in dialog
- [ ] Links generate correctly for all content types using $path
- [ ] Content existence indicator displays accurately
- [ ] Conditional rendering uses Conditional component consistently
- [ ] No eslint-disable or ts-ignore comments added
- [ ] Component follows existing code patterns from reports-table.tsx

## Notes

**Data Already Available:** The parent component AdminReportsClient already fetches data using getAllReportsWithSlugsForAdminAsync which includes commentContent, contentExists, targetSlug, and parentCollectionSlug fields. The dialog just needs to be updated to use SelectContentReportWithSlugs type.

**Existing Patterns:** The reports-table.tsx file (lines 47-121 and 305-367) contains proven implementations of content link generation and comment display that should be adapted for the dialog.

**Type Safety:** All routing must use $path utility from next-typesafe-url to ensure type-safe URLs. Never use string concatenation for route generation.

**Design System Consistency:** Use existing Radix UI components (Button, Badge, Conditional) and follow the established visual hierarchy in the dialog.

**No Code Implementation Required:** This plan focuses on WHAT to do, not HOW to code it. The implementation will follow existing patterns from reports-table.tsx.
```

## Plan Format Validation Results

- ✅ **Format Check**: Output is markdown format (not XML)
- ✅ **Auto-Conversion**: N/A - no conversion needed
- ✅ **Template Compliance**: Includes Overview, Prerequisites, Implementation Steps, Quality Gates, Notes
- ✅ **Section Validation**: All required sections contain appropriate content
- ✅ **Command Validation**: Every step includes `npm run lint:fix && npm run typecheck`
- ✅ **Content Quality**: No code examples or implementations included
- ✅ **Completeness Check**: Plan addresses all aspects of the refined request
- ✅ **Error Recovery**: N/A - no errors occurred

## Template Compliance Validation

### Required Sections Present

- ✅ **Overview**: Includes Estimated Duration (2-3 hours), Complexity (Medium), Risk Level (Low)
- ✅ **Quick Summary**: One paragraph summary of the feature
- ✅ **Prerequisites**: 3 prerequisite items with checkboxes
- ✅ **Implementation Steps**: 6 detailed steps with What/Why/Confidence/Files/Changes/Validation/Success Criteria
- ✅ **Quality Gates**: 9 quality gate items with checkboxes
- ✅ **Notes**: 4 note sections with detailed context

### Step Structure Validation

Each of the 6 implementation steps includes:
- ✅ **What**: Clear description of the change
- ✅ **Why**: Rationale for the change
- ✅ **Confidence**: High confidence level for all steps
- ✅ **Files to Modify**: Specific file paths
- ✅ **Changes**: Bullet list of changes
- ✅ **Validation Commands**: `npm run lint:fix && npm run typecheck` for all TypeScript steps
- ✅ **Success Criteria**: Checkboxes with specific criteria

## Complexity Assessment

- **Feature Complexity**: Medium
- **Time Estimate**: 2-3 hours
- **Risk Level**: Low
- **Number of Steps**: 6 steps
- **Files to Modify**: 1 file (report-detail-dialog.tsx)
- **Files to Reference**: 5 files
- **Dependencies**: Existing data structure, $path utility, Radix UI components

## Quality Gate Results

### Technical Quality

- ✅ Type safety validation required for all steps
- ✅ ESLint validation required for all steps
- ✅ No code implementation included (plan only)
- ✅ Pattern reuse from existing codebase emphasized
- ✅ Design system consistency enforced

### Plan Quality

- ✅ Clear step-by-step progression
- ✅ Each step builds on previous steps
- ✅ Validation commands specified for each step
- ✅ Success criteria clearly defined
- ✅ Notes section provides helpful context

## Status

✅ **Step 3 PASSED** - Implementation plan generated in correct markdown format

### Success Criteria Met

- ✅ **Format Compliance**: Plan is in markdown format (not XML)
- ✅ **Template Adherence**: Includes all required sections
- ✅ **Validation Commands**: Every TypeScript step includes lint/typecheck commands
- ✅ **No Code Examples**: Plan contains no implementation code, only instructions
- ✅ **Actionable Steps**: 6 concrete, actionable implementation steps
- ✅ **Complete Coverage**: Plan addresses the refined feature request completely
- ✅ **Quality Gates**: 9 quality gates defined for final validation
- ✅ **Existing Patterns**: References existing code patterns from reports-table.tsx
