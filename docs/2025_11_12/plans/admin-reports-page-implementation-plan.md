# Admin Reports Page Implementation Plan

**Generated**: 2025-11-12T00:00:00Z
**Original Request**: as an admin I would like the admins reports page implemented so that I can deal with content that has been reported

**Refined Request**: As an admin, I need a comprehensive reports management page accessible through the admin dashboard that displays all user-reported content in a filterable, sortable data table powered by TanStack React Table, allowing me to review reported bobbleheads, collections, and user profiles with details including the report reason, reporter information, report timestamp, and current moderation status. The implementation should include a PostgreSQL table schema managed through Drizzle ORM to persist report data with fields for report type, target resource ID, reporter user ID, report reason/description, severity level, and resolution status, along with corresponding database queries in `src/lib/queries/` and server actions in `src/lib/actions/` for fetching paginated reports, updating report status (pending, investigating, resolved, dismissed), and bulk actions for handling multiple reports simultaneously. The UI should be built with Radix UI components and Tailwind CSS, featuring a responsive table with columns for report summary, content preview, reported user/creator, submission date, and action buttons, along with filtering capabilities by report status, type, and date range using Nuqs for URL state management to preserve table state across navigation. Type-safe routing via next-typesafe-url should connect the admin dashboard to `/admin/reports`, and comprehensive Zod validation schemas in `src/lib/validations/` should ensure data integrity for all report submissions and status updates. The feature should integrate with Clerk for admin role verification through middleware to ensure only authorized administrators can access the reports page, and include role-based permissions for different admin levels (view-only versus full moderation authority). Server Actions should be wrapped with Next-Safe-Action for mutation safety and error handling, with appropriate error tracking through Sentry for any moderation workflow issues, enabling admins to efficiently manage content moderation workflows and maintain community standards across the Head Shakers platform.

## Analysis Summary

### Feature Request Refinement
- **Original Length**: 20 words
- **Refined Length**: 362 words
- **Expansion Ratio**: 18.1x
- **Assessment**: Feature request successfully refined with comprehensive technical context

### File Discovery Results
- **Total Files Discovered**: 35
- **Critical Priority**: 5 (backend infrastructure - 100% complete)
- **High Priority**: 8 (authentication, UI references)
- **Medium Priority**: 14 (supporting infrastructure)
- **Low Priority**: 8 (reference patterns)
- **New Files to Create**: 5
- **Files to Modify**: 2

### Key Finding
**Backend infrastructure is 100% complete and production-ready.** All database schemas, queries, server actions, facades, and validations exist and are fully functional. Implementation work is primarily frontend UI development.

---

## Overview

**Estimated Duration**: 2-3 days
**Complexity**: Medium
**Risk Level**: Low

## Quick Summary

Implementation of the admin reports management page UI layer, building upon the complete backend infrastructure (schema, queries, actions, facades, validations) that already exists. This plan focuses on creating the reports table page, interactive data table with TanStack React Table, filter controls with Nuqs URL state management, detail dialogs, and bulk action capabilities following established patterns from the trending-content-table component.

## Prerequisites

- [x] Database schema exists (`src/lib/db/schema/moderation.schema.ts`)
- [x] Queries implemented (`src/lib/queries/content-reports/content-reports.query.ts`)
- [x] Server actions ready (`src/lib/actions/admin/admin-content-reports.actions.ts`)
- [x] Business logic complete (`src/lib/facades/content-reports/content-reports.facade.ts`)
- [x] Validation schemas exist (`src/lib/validations/moderation.validation.ts`)
- [ ] Admin authentication middleware configured for `/admin/reports` route
- [ ] Type-safe route generated for `/admin/reports` path

## Implementation Steps

### Step 1: Create Report Filters Component with URL State Management

**What**: Build the filter controls component with Nuqs integration for report status, type, severity, and date range filtering
**Why**: Provides users with filtering capabilities while maintaining URL state for shareable links and browser navigation
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-filters.tsx` - Filter controls with Nuqs URL state

**Changes:**
- Create ReportFilters component using Nuqs parseAsString, parseAsArrayOf, and parseAsTimestamp for URL state
- Add filter controls for report status (pending, investigating, resolved, dismissed)
- Add filter controls for report type (bobblehead, collection, user_profile)
- Add filter controls for severity level (low, medium, high, critical)
- Add date range filters using Radix UI Popover and date picker components
- Implement reset filters functionality that clears URL search params
- Use Tailwind CSS for responsive layout and Radix UI components for dropdowns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component compiles without TypeScript errors
- [ ] Nuqs hooks properly manage URL state for all filter types
- [ ] Filter controls render with proper Radix UI components
- [ ] Reset functionality clears all URL parameters
- [ ] All validation commands pass

---

### Step 2: Create Reports Table Component with TanStack React Table

**What**: Build the main reports data table with TanStack React Table including columns, sorting, pagination, and row selection
**Why**: Core component for displaying report data with interactive table features following established table patterns
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\reports-table.tsx` - Main reports data table component

**Changes:**
- Create ReportsTable component accepting report data array and pagination metadata as props
- Define TanStack Table columns for report summary, content preview, reported user/creator, submission date, status badge, and actions
- Implement column definitions with sorting capabilities using TanStack's sorting features
- Add row selection functionality with TanStack's row selection features for bulk actions
- Integrate pagination controls using Nuqs for page and pageSize URL state
- Use status badges with appropriate color variants based on report status
- Add action buttons column with view details and quick status update options
- Follow patterns from trending-content-table.tsx for table structure and styling

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component compiles without TypeScript errors
- [ ] Table renders with all defined columns
- [ ] Sorting functionality works through TanStack Table
- [ ] Row selection enables for bulk action support
- [ ] Pagination controls update URL state via Nuqs
- [ ] All validation commands pass

---

### Step 3: Create Report Detail Dialog Component

**What**: Build the detailed report view dialog showing full report information, content preview, and action history
**Why**: Allows admins to review complete report details before taking moderation actions
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Report detail modal dialog

**Changes:**
- Create ReportDetailDialog component using Radix UI Dialog component
- Display full report information including reporter details, target content preview, reason/description, timestamps
- Show content preview based on report type (bobblehead image, collection details, user profile)
- Display report severity level with appropriate visual indicators
- Show complete action history with timestamps and admin actions
- Add action buttons for status updates and resolution options
- Use Tailwind CSS for responsive layout and consistent styling with admin theme
- Implement loading and error states for fetching additional report details

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component compiles without TypeScript errors
- [ ] Dialog properly displays using Radix UI Dialog primitives
- [ ] All report fields render correctly with appropriate formatting
- [ ] Content preview adjusts based on report type
- [ ] Action history displays chronologically
- [ ] All validation commands pass

---

### Step 4: Create Update Report Status Dialog Component

**What**: Build the status update dialog with form controls for changing report status and adding resolution notes
**Why**: Provides structured interface for admins to update report status with proper validation and error handling
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\update-report-status-dialog.tsx` - Status update dialog with form

**Changes:**
- Create UpdateReportStatusDialog component using Radix UI Dialog
- Build form using TanStack React Form for status updates
- Add status dropdown with options (pending, investigating, resolved, dismissed)
- Add textarea for resolution notes with character limit validation
- Integrate with updateReportStatusAction from admin-content-reports.actions.ts
- Implement optimistic updates for immediate UI feedback
- Add error handling and display validation errors from server action
- Show loading state during status update submission
- Close dialog and refresh table data on successful submission

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component compiles without TypeScript errors
- [ ] Form properly integrates with TanStack React Form
- [ ] Status update calls existing server action correctly
- [ ] Validation errors display appropriately
- [ ] Optimistic updates provide immediate feedback
- [ ] All validation commands pass

---

### Step 5: Create Bulk Actions Toolbar Component

**What**: Build toolbar for performing bulk operations on multiple selected reports simultaneously
**Why**: Enables efficient moderation workflow by allowing admins to process multiple reports at once
**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\bulk-actions-toolbar.tsx` - Bulk actions toolbar component

**Changes:**
- Create BulkActionsToolbar component accepting selected row IDs and table instance
- Add bulk status update dropdown with confirmation dialogs
- Implement bulk resolve action calling bulkUpdateReportStatusAction
- Implement bulk dismiss action with reason requirement
- Display selected count badge showing number of selected reports
- Add clear selection button
- Include confirmation dialogs using Radix UI AlertDialog for destructive actions
- Show loading states during bulk operation processing
- Handle partial success scenarios with appropriate error messaging
- Refresh table data after successful bulk operations

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Component compiles without TypeScript errors
- [ ] Bulk actions correctly call server actions for multiple reports
- [ ] Confirmation dialogs prevent accidental bulk operations
- [ ] Selected count accurately reflects table selection state
- [ ] Error handling manages partial failures appropriately
- [ ] All validation commands pass

---

### Step 6: Implement Main Reports Page with Complete Integration

**What**: Build the complete reports page integrating all components with data fetching, URL state management, and admin role verification
**Why**: Creates the main entry point tying together all report management UI components with backend queries
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Replace placeholder with full implementation

**Changes:**
- Replace placeholder content with complete reports page implementation
- Implement server component data fetching using getContentReportsQuery from content-reports.query.ts
- Extract URL search params for filters, pagination, and sorting using Nuqs
- Build query parameters object from URL state to pass to database query
- Add admin role verification using Clerk authentication
- Render ReportFilters component with current filter state
- Render ReportsTable component with fetched data and pagination metadata
- Conditionally render BulkActionsToolbar when rows are selected
- Implement error boundary for query failures
- Add loading skeleton while data fetches
- Include page header with title, description, and quick stats

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Page compiles without TypeScript errors
- [ ] Data fetching correctly uses existing queries
- [ ] URL state properly hydrates filter and table components
- [ ] Admin authentication blocks unauthorized access
- [ ] All child components render with proper props
- [ ] Loading and error states display appropriately
- [ ] All validation commands pass

---

### Step 7: Update Admin Dashboard Navigation

**What**: Add reports management link to admin dashboard navigation menu with type-safe routing
**Why**: Provides discoverable access point to the reports page from the admin dashboard
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\layout\admin-nav.tsx` - Add reports navigation link (assuming this file exists)

**Changes:**
- Add reports navigation item to admin dashboard menu
- Use $path helper for type-safe route to `/admin/reports`
- Add appropriate icon from Lucide React (ShieldAlert or Flag icon)
- Position reports link appropriately in admin navigation hierarchy
- Include badge showing count of pending reports if implemented
- Follow existing navigation item patterns for consistency

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Navigation link compiles without TypeScript errors
- [ ] Type-safe routing works correctly to reports page
- [ ] Icon renders properly in navigation menu
- [ ] Link styling matches existing admin navigation items
- [ ] All validation commands pass

---

### Step 8: Generate Type-Safe Routes and Verify Routing

**What**: Run next-typesafe-url generation to ensure `/admin/reports` route is available in $path helper
**Why**: Enables type-safe navigation throughout the application to the new reports page
**Confidence**: High

**Files to Modify:**
- None - this step runs code generation command

**Changes:**
- Run next-typesafe-url route generation command
- Verify `/admin/reports` appears in generated $path types
- Test navigation to reports page from admin dashboard
- Verify URL state management preserves route parameters

**Validation Commands:**
```bash
npm run next-typesafe-url
npm run typecheck
```

**Success Criteria:**
- [ ] Route generation completes without errors
- [ ] TypeScript recognizes $path['/admin/reports']
- [ ] Navigation to reports page works from multiple entry points
- [ ] URL parameters persist correctly during navigation
- [ ] All validation commands pass

---

### Step 9: Add Comprehensive Error Boundaries and Loading States

**What**: Implement error boundaries, loading skeletons, and error states for all report management components
**Why**: Provides graceful degradation and better user experience during failures or slow network conditions
**Confidence**: Medium

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Add error and loading boundaries
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\reports-table.tsx` - Add empty state handling
- `C:\Users\JasonPaff\dev\head-shakers\src\components\admin\reports\report-detail-dialog.tsx` - Add loading state

**Changes:**
- Add error.tsx file in admin/reports route for error boundary
- Add loading.tsx file in admin/reports route for loading skeleton
- Implement table empty state with helpful messaging when no reports exist
- Add loading skeletons for table rows during data fetching
- Handle query errors with user-friendly error messages
- Add retry functionality for failed queries
- Implement Sentry error tracking for moderation workflow issues

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Error boundaries catch and display errors gracefully
- [ ] Loading states provide visual feedback during operations
- [ ] Empty states guide users when no data exists
- [ ] Sentry properly tracks errors in moderation workflow
- [ ] Retry mechanisms work for transient failures
- [ ] All validation commands pass

---

### Step 10: Final Integration Testing and Validation

**What**: Comprehensive testing of the complete reports management flow including all interactions and edge cases
**Why**: Ensures all components work together correctly and the feature meets requirements before deployment
**Confidence**: High

**Files to Modify:**
- None - this step focuses on manual testing and validation

**Changes:**
- Test complete report review workflow from dashboard to detail view
- Verify filtering works correctly with all combinations
- Test sorting on all sortable columns
- Verify pagination navigates correctly and preserves filters
- Test bulk actions with multiple selections
- Verify status updates reflect immediately in table
- Test role-based access controls block non-admin users
- Verify URL state management maintains state across navigation
- Test responsive design on mobile and tablet viewports
- Verify all server actions properly validate with Zod schemas
- Test error scenarios and verify Sentry tracking

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
npm run build
```

**Success Criteria:**
- [ ] All user flows complete successfully
- [ ] Filtering, sorting, and pagination work correctly
- [ ] Bulk actions process multiple reports accurately
- [ ] Authentication properly restricts access
- [ ] URL state persists across navigation
- [ ] Responsive design works on all screen sizes
- [ ] Production build completes without errors
- [ ] All validation commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Production build succeeds with `npm run build`
- [ ] Manual testing confirms all user flows work correctly
- [ ] Admin role verification blocks unauthorized access
- [ ] URL state management preserves filters and pagination
- [ ] Error boundaries handle failures gracefully
- [ ] Sentry integration tracks moderation workflow errors

## Notes

**Backend Completeness**: The backend infrastructure is 100% complete including database schema, queries, server actions, business logic facades, and validation schemas. This implementation focuses entirely on UI development.

**Reference Patterns**: Follow existing patterns from `trending-content-table.tsx` for TanStack React Table implementation and `search-page-content.tsx` for Nuqs URL state management.

**No forwardRef Required**: React 19 does not require forwardRef - pass refs directly through props.

**Admin Authentication**: Verify that Clerk middleware properly restricts `/admin/reports` route to admin users only. Update middleware configuration if needed.

**Performance Considerations**: The reports table may contain large datasets - ensure pagination is properly implemented to avoid loading excessive data. Consider implementing virtual scrolling if table performance becomes an issue.

**Accessibility**: Ensure all interactive elements have proper ARIA labels, keyboard navigation works correctly, and screen reader announcements are appropriate for table interactions and status updates.

**Future Enhancements**: Consider adding real-time updates using Ably for new report notifications, advanced filtering with saved filter presets, and export functionality for report data.

---

## Orchestration Details

For detailed orchestration logs including feature refinement, file discovery analysis, and implementation planning process, see:
- `docs/2025_11_12/orchestration/admin-reports-page/00-orchestration-index.md`
- `docs/2025_11_12/orchestration/admin-reports-page/01-feature-refinement.md`
- `docs/2025_11_12/orchestration/admin-reports-page/02-file-discovery.md`
- `docs/2025_11_12/orchestration/admin-reports-page/03-implementation-planning.md`
