# Admin Reports Content Display Implementation Plan

**Generated**: 2025-11-24T14:32:45Z

**Original Request**: the admin reports page has a table with all the reports. Each report row has an actions menu with a view details menu item. The report details dialog has a report content section that needs updating. When the reported content is a comment the comment text should display in this section. When the reported content is a collection, subcollection, or bobblehead then a link to the report content should appear in this section. There should be no placeholder content. There should be no backwards compatible approaches used (if applicable)

**Refined Request**: The admin reports page displays a comprehensive table of all submitted reports with an actions menu on each row containing a "view details" option that opens a report details dialog. The dialog's report content section must be updated to handle different content types with appropriate rendering: when the reported content is a comment, display the actual comment text directly in the section; when the reported content is a collection, subcollection, or bobblehead, display a type-aware link to the reported content using the $path utility from next-typesafe-url to ensure type-safe routing. The implementation should leverage Drizzle ORM queries to fetch the appropriate content data based on the report's content type, utilizing the existing database schema and query patterns from the codebase, and should render the content section using Radix UI components consistent with the design system. The component should be properly typed with TypeScript throughout, avoiding any use of the any type, and should follow the project's strict conventions including no barrel file imports, no eslint-disable comments, and type-safe implementations. There should be no placeholder content displayed in the report content section—only actual fetched content or the appropriate link should be rendered. The solution should not use backwards-compatible approaches; instead, it should implement the feature cleanly for the current architecture without maintaining legacy patterns or conditional logic for different implementation strategies. The report details dialog component should handle loading states appropriately while fetching the content data, manage error states gracefully, and ensure that the content section integrates seamlessly with the existing dialog layout and styling using Tailwind CSS classes consistent with the application's design tokens.

---

## Analysis Summary

**File Discovery Results**:

- Discovered 18 files across 4 priority levels
- Found existing reference implementation in reports-table.tsx (lines 47-121)
- Data already includes all required fields via getAllReportsWithSlugsForAdminAsync
- No additional database queries needed

**Key Findings**:

- The parent component already fetches data with `SelectContentReportWithSlugs` type
- Existing link generation patterns available in reports-table.tsx
- Comment display patterns available in reports-table.tsx (lines 305-367)
- Dialog just needs type update and content rendering logic

---

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

- Add \_hasCommentContent variable checking for comment type and content availability
- Add \_isContentLinkable variable using isContentLinkAvailable helper
- Add \_contentLink variable using getContentLink helper
- Add \_showContentPreview variable to determine if any content can be shown

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

---

## File Discovery Results

### CRITICAL PRIORITY (Core Implementation)

**`src/components/admin/reports/report-detail-dialog.tsx`**

- The report details dialog component that must be modified to handle different content types with appropriate rendering
- Current functionality: Displays report information with a placeholder for content preview (lines 201-209)
- Key integration: Uses SelectContentReport type from validation schemas
- Must be updated: Add conditional rendering logic based on targetType, fetch content data, and display comment text or type-safe links

**`src/lib/queries/content-reports/content-reports.query.ts`**

- Query layer for fetching report data with slug information
- Current functionality: `getAllReportsWithSlugsForAdminAsync` method (lines 240-367) uses LEFT JOINs to fetch slug data for bobbleheads, collections, subcollections, and comment content
- Key features: Returns `SelectContentReportWithSlugs` type with targetSlug, parentCollectionSlug, commentContent, and contentExists fields
- Must be used: To fetch individual report details with content data when dialog opens

**`src/lib/validations/moderation.validation.ts`**

- Type definitions and validation schemas for content reports
- Current types: `SelectContentReport`, `SelectContentReportWithSlugs` (lines 110-127)
- Key fields in extended schema: commentContent (nullable string), contentExists (boolean), targetSlug (nullable string), parentCollectionSlug (nullable string)
- Must be used: For type-safe handling of report data with content information

### HIGH PRIORITY (Supporting Implementation)

**`src/components/admin/reports/admin-reports-client.tsx`**

- Client component that manages report table and dialog state
- Current functionality: Passes `SelectContentReportWithSlugs` to dialog component (line 211)
- Integration point: Needs to ensure fetched data includes content information

**`src/components/admin/reports/reports-table.tsx`**

- Reports table with existing content link generation logic
- Reference implementation: Lines 47-121 contain helper functions for link generation using $path
- Key patterns: `getContentLink()`, `isContentLinkAvailable()`, type-safe routing with $path utility
- Can be adapted: Logic for generating links based on targetType to be reused in dialog

### MEDIUM PRIORITY (Database & Schema Reference)

- `src/lib/db/schema/moderation.schema.ts` - Content reports database schema
- `src/lib/db/schema/social.schema.ts` - Comments database schema
- `src/lib/db/schema/collections.schema.ts` - Collections and subcollections schema
- `src/lib/db/schema/bobbleheads.schema.ts` - Bobbleheads database schema

### LOW PRIORITY (UI Components & Utilities)

- `src/components/ui/dialog.tsx` - Radix UI Dialog component wrapper
- `src/components/ui/badge.tsx` - Badge component
- `src/lib/constants/enums.ts` - Application-wide enums

---

**Orchestration Logs**: See `docs/2025_11_24/orchestration/admin-reports-content-display/` for detailed execution logs.
