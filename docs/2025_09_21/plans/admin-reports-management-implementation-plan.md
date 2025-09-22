# Implementation Plan: Admin Reports Management Interface

Generated: 2025-09-21T00:01:30Z
Original Request: The app currently has a report feature where users can report bobbleheads/collections/subcollections and needs an admin page where an admin can view and manage the reports
Refined Request: The Head Shakers bobblehead collection platform requires an administrative interface to manage user-generated reports on bobbleheads, collections, and subcollections that builds upon the existing report submission functionality. This admin page should be implemented as a new route within the App Router structure at `/admin/reports` using Next.js 15.5.3 with TypeScript, leveraging the existing authentication middleware to ensure only admin users can access this interface through Clerk's role-based permissions. The page will utilize TanStack Query for efficient server state management to fetch and cache report data from the PostgreSQL database via Drizzle ORM, displaying reports in a sortable and filterable data table using TanStack React Table with columns for report type, reported content, reporter information, report reason, submission timestamp, and current status. The interface should incorporate Radix UI components for consistent styling with the existing design system, including dialogs for detailed report viewing, dropdown menus for status updates, and form controls for filtering reports by type, status, or date range. Administrative actions must include the ability to mark reports as reviewed, resolved, or dismissed, with the option to take content moderation actions such as hiding reported items or suspending users, all implemented through server actions that maintain data integrity through database transactions. The page should integrate with Sentry for error tracking and monitoring of admin activities, include real-time updates using the existing Ably integration to notify when new reports are submitted, and provide bulk action capabilities for efficient report management. The implementation must follow the project's architectural patterns with proper TypeScript typing, Zod validation schemas for form inputs, and comprehensive test coverage using Vitest for unit tests and Playwright for end-to-end testing of the complete admin workflow, ensuring the feature maintains the platform's high standards for code quality and user experience while providing administrators with the tools needed to maintain community standards and content quality.

## Analysis Summary

- Feature request refined with project context
- Discovered 19 files across 3 directories
- Generated 10-step implementation plan

## File Discovery Results

### High Priority Files (Core Implementation) - 6 files
1. `src/app/(app)/admin/reports/page.tsx` - Existing minimal admin reports page (needs full implementation)
2. `src/lib/db/schema/moderation.schema.ts` - Complete content reports database schema
3. `src/lib/queries/content-reports/content-reports.query.ts` - Comprehensive query methods with admin operations
4. `src/lib/actions/content-reports/content-reports.actions.ts` - Existing user-facing actions (needs admin extensions)
5. `src/lib/facades/content-reports/content-reports.facade.ts` - Business logic facade
6. `src/lib/validations/moderation.validation.ts` - Zod validation schemas

### Supporting Infrastructure
- Admin layout pattern exists (`src/components/layout/admin/admin-layout.tsx`)
- Admin authentication/authorization (`src/components/ui/admin/admin-route-guard.tsx`)
- Table component patterns (`src/components/admin/analytics/trending-content-table.tsx`)
- UI components (Radix UI table, select, badge components)
- Admin utilities and middleware established

## Implementation Plan

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This plan implements a comprehensive admin reports management interface at `/admin/reports` for moderating user-generated content reports on bobbleheads, collections, and subcollections. The interface will feature data tables, filtering, sorting, bulk actions, and real-time updates while leveraging existing infrastructure.

## Prerequisites

- [ ] Admin authentication middleware is operational
- [ ] Content reports database schema and queries are implemented
- [ ] TanStack Query and React Table dependencies are available
- [ ] Radix UI components are configured

## Implementation Steps

### Step 1: Extend Content Reports Query with Admin Methods

**What**: Add comprehensive admin-specific query methods to ContentReportsQuery class
**Why**: Foundation for admin data operations including pagination, filtering, and bulk actions
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/content-reports/content-reports.query.ts` - Add admin query methods

**Changes:**

- Add getAllReportsForAdminAsync method with pagination, filtering, and sorting
- Add getReportsByStatusAsync method for status-based filtering
- Add getReportsStatsAsync method for dashboard metrics
- Add bulkUpdateReportsStatusAsync method for bulk operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All new admin query methods are properly typed
- [ ] Query methods support pagination and filtering parameters
- [ ] All validation commands pass

---

### Step 2: Create Admin Content Reports Actions

**What**: Implement server actions for admin report management operations
**Why**: Enable secure server-side operations for status updates and bulk actions
**Confidence**: High

**Files to Create:**

- `src/lib/actions/admin/admin-content-reports.actions.ts` - Admin-specific report actions

**Changes:**

- Add updateReportStatusAction for individual report status changes
- Add bulkUpdateReportsAction for batch operations
- Add getAdminReportsAction for data fetching with proper authorization
- Include rate limiting and permission checks

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All actions require proper admin authentication
- [ ] Actions include comprehensive error handling
- [ ] All validation commands pass

---

### Step 3: Create Admin Reports Data Table Component

**What**: Build a comprehensive data table component using TanStack React Table
**Why**: Provide sortable, filterable interface for managing large volumes of reports
**Confidence**: High

**Files to Create:**

- `src/components/admin/reports/admin-reports-table.tsx` - Main data table component
- `src/components/admin/reports/admin-reports-columns.tsx` - Table column definitions
- `src/components/admin/reports/admin-reports-filters.tsx` - Filter controls component

**Changes:**

- Implement sortable columns for report type, status, date, and reporter
- Add status badge components with color coding
- Include action buttons for status updates and bulk operations
- Add pagination controls and row selection

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Table displays reports with proper formatting
- [ ] Sorting and filtering functionality works correctly
- [ ] All validation commands pass

---

### Step 4: Implement Report Detail Dialog Component

**What**: Create detailed view dialog for individual report examination
**Why**: Allow admins to review complete report information before taking action
**Confidence**: Medium

**Files to Create:**

- `src/components/admin/reports/report-detail-dialog.tsx` - Report detail modal component
- `src/components/admin/reports/report-target-preview.tsx` - Previews reported content

**Changes:**

- Add dialog component showing full report details and context
- Include reported content preview with safe rendering
- Add moderator notes section with form validation
- Implement action buttons for status updates

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dialog opens and displays report information correctly
- [ ] Content preview renders safely without security issues
- [ ] All validation commands pass

---

### Step 5: Create Reports Status Management Components

**What**: Build components for status updates and bulk operations
**Why**: Enable efficient report resolution workflows for administrators
**Confidence**: High

**Files to Create:**

- `src/components/admin/reports/report-status-dropdown.tsx` - Status update dropdown
- `src/components/admin/reports/bulk-actions-toolbar.tsx` - Bulk operation controls

**Changes:**

- Add dropdown component for individual status changes
- Implement bulk action toolbar for selected reports
- Include confirmation dialogs for destructive actions
- Add loading states during operations

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Status updates work for individual and bulk operations
- [ ] Confirmation dialogs prevent accidental actions
- [ ] All validation commands pass

---

### Step 6: Implement Admin Reports Dashboard Component

**What**: Create main dashboard component integrating all report management features
**Why**: Provide comprehensive overview and management interface for administrators
**Confidence**: High

**Files to Create:**

- `src/components/admin/reports/admin-reports-dashboard.tsx` - Main dashboard component
- `src/components/admin/reports/reports-stats-cards.tsx` - Statistics overview cards

**Changes:**

- Add statistics cards showing pending, resolved, and dismissed report counts
- Integrate data table with filters and search functionality
- Include real-time updates using TanStack Query
- Add error boundaries and loading states

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Dashboard displays comprehensive report statistics
- [ ] All components integrate seamlessly
- [ ] All validation commands pass

---

### Step 7: Implement Admin Reports Page with Async Loading

**What**: Replace placeholder reports page with fully functional admin interface
**Why**: Complete the feature implementation with proper loading and error handling
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/admin/reports/page.tsx` - Replace with complete implementation

**Files to Create:**

- `src/app/(app)/admin/reports/loading.tsx` - Loading state component
- `src/components/admin/reports/async/admin-reports-async.tsx` - Async data loading wrapper

**Changes:**

- Replace placeholder content with AdminReportsDashboard component
- Add Suspense boundaries for async data loading
- Include error boundaries for graceful error handling
- Implement proper SEO metadata

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page loads admin reports interface successfully
- [ ] Loading states display properly during data fetching
- [ ] All validation commands pass

---

### Step 8: Add Real-time Updates with Ably Integration

**What**: Implement real-time notifications for new reports and status changes
**Why**: Keep admin interface updated without manual refresh when reports are submitted
**Confidence**: Medium

**Files to Create:**

- `src/lib/hooks/use-admin-reports-subscription.ts` - Ably subscription hook
- `src/components/admin/reports/real-time-notifications.tsx` - Notification component

**Changes:**

- Add Ably subscription for report creation and status updates
- Implement toast notifications for real-time events
- Update table data automatically when changes occur
- Include connection status indicators

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Real-time updates work correctly without page refresh
- [ ] Notifications display appropriately for relevant events
- [ ] All validation commands pass

---

### Step 9: Create Admin Reports Validation Schemas

**What**: Extend validation schemas for admin-specific operations
**Why**: Ensure type safety and validation for all admin operations
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/moderation.validation.ts` - Add admin validation schemas

**Changes:**

- Add adminUpdateReportSchema for status updates with moderator notes
- Add bulkUpdateReportsSchema for batch operations
- Add adminReportsFilterSchema for filtering parameters
- Add adminReportsQuerySchema for pagination and sorting

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All admin operations have proper Zod validation
- [ ] Type safety is maintained across all admin components
- [ ] All validation commands pass

---

### Step 10: Implement Comprehensive Testing Suite

**What**: Create unit and integration tests for admin reports functionality
**Why**: Ensure reliability and prevent regressions in critical moderation features
**Confidence**: High

**Files to Create:**

- `tests/components/admin/reports/admin-reports-table.test.tsx` - Table component tests
- `tests/lib/actions/admin/admin-content-reports.actions.test.ts` - Actions tests
- `tests/lib/queries/content-reports/admin-queries.test.ts` - Query tests
- `tests/app/(app)/admin/reports/page.test.tsx` - Page integration tests

**Changes:**

- Add unit tests for all new components and functions
- Create integration tests for admin workflows
- Include E2E tests for complete report management process
- Add mock data and test utilities

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**

- [ ] All new components have comprehensive test coverage
- [ ] Integration tests cover complete admin workflows
- [ ] All validation and test commands pass

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Admin authentication restricts access properly
- [ ] Real-time updates function without performance issues
- [ ] Bulk operations handle large datasets efficiently
- [ ] All user actions include proper error handling

## Notes

- Admin reports interface builds on existing content reports infrastructure
- Real-time updates may require Ably configuration verification
- Bulk operations should include progress indicators for large datasets
- Component patterns follow existing admin interface conventions
- Security validation ensures only authorized admin access to sensitive moderation features