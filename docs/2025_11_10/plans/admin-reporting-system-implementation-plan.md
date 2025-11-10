# Admin Reporting System Implementation Plan

**Generated**: 2025-11-10T00:06:00Z
**Original Request**: "as an admin I would like to be able to view and handle reports"
**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Analysis Summary

- **Feature request refined** with project context
- **Discovered 45 files** across all architectural layers
- **Backend infrastructure 90% complete** with database, actions, queries, validations ready
- **Frontend needs implementation** of admin page, 8 UI components, TanStack table integration
- **Generated 15-step implementation plan** with detailed specifications

## File Discovery Results

### Backend Infrastructure (Complete - 90%)
✅ **Database Schema**: `moderation.schema.ts` with complete content_reports table
✅ **Server Actions**: `admin-content-reports.actions.ts` with all CRUD operations
✅ **Query Layer**: `content-reports.query.ts` with comprehensive filtering
✅ **Validation**: `moderation.validation.ts` with complete Zod schemas
✅ **Authentication**: Three-layer security (route/component/action)
✅ **Business Logic**: Facade layer ready

### Frontend Requirements (To Build - 20%)
❌ **Admin Page**: Currently placeholder, needs full implementation
❌ **8 UI Components**: Table, dialogs, filters, analytics to create
❌ **TanStack Integration**: No existing pattern for React Table
❌ **User Moderation**: Warn/suspend/ban actions needed
❌ **Enhanced Analytics**: Trends and metrics queries

## Implementation Plan

---

# Implementation Plan: Admin Reporting System Dashboard

## Overview

**Estimated Duration**: 3-4 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

This plan implements a comprehensive admin reporting system dashboard that enables administrators to view, filter, sort, and manage user-generated content reports. The backend infrastructure is 90% complete; this plan focuses on completing the frontend UI, integrating TanStack React Table, implementing user moderation actions, and building analytics dashboards leveraging the existing database schema and server actions.

## Prerequisites

- [ ] Verify admin role permissions are configured in Clerk
- [ ] Confirm content_reports table is migrated and seeded with test data
- [ ] Validate existing server actions (admin-content-reports.actions.ts) are operational
- [ ] Ensure Cloudinary integration is configured for image previews
- [ ] Confirm access to admin routes requires proper authentication

## Implementation Steps

### Step 1: Create Admin Reports Page Layout and Route

**What**: Establish the main admin reports page with layout structure and routing
**Why**: Provides the entry point and container for all reporting functionality
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Main reports page component
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\layout.tsx` - Reports section layout wrapper

**Files to Modify:**
- None

**Changes:**
- Create server component page that fetches initial reports data using content-reports.query.ts
- Implement layout with header, filter sidebar, and main content area structure
- Add breadcrumb navigation for admin section
- Set up Suspense boundaries for loading states
- Configure metadata for SEO

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Admin reports route accessible at /admin/reports
- [ ] Page renders with proper layout structure
- [ ] Loading states display correctly
- [ ] All validation commands pass

---

### Step 2: Build Reports Data Table Component with TanStack React Table

**What**: Create the core data table component displaying all content reports with sorting and pagination
**Why**: Provides the primary interface for viewing and managing reports efficiently
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table.tsx` - Main table component
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-columns.tsx` - Column definitions for TanStack Table
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table-row-actions.tsx` - Action buttons for each row

**Files to Modify:**
- None

**Changes:**
- Implement TanStack React Table with column definitions for report ID, content type, reporter, reported user, category, status, timestamp
- Add sortable columns for date, status, and category
- Configure pagination with page size options
- Implement row selection for bulk actions
- Add action menu column with view, resolve, dismiss options
- Style with existing Radix UI table components

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Table displays all report data correctly
- [ ] Sorting works on all designated columns
- [ ] Pagination controls function properly
- [ ] Row actions menu is accessible and functional
- [ ] All validation commands pass

---

### Step 3: Implement Advanced Filtering System

**What**: Create filter components for status, category, content type, and date range
**Why**: Enables admins to quickly narrow down reports based on multiple criteria
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-filters.tsx` - Main filter panel component
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-filter-status.tsx` - Status filter dropdown
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-filter-category.tsx` - Category filter dropdown
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-filter-date-range.tsx` - Date range picker

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Integrate filters with data fetching

**Changes:**
- Build filter panel using Radix UI Select and Popover components
- Implement multi-select for status and category filters
- Add date range picker with preset options (today, last 7 days, last 30 days, custom)
- Use Nuqs for URL state management to persist filter selections
- Connect filters to server-side query parameters
- Add clear all filters button

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All filter options display correctly
- [ ] Filter selections persist in URL
- [ ] Table data updates based on applied filters
- [ ] Clear filters resets to default state
- [ ] All validation commands pass

---

### Step 4: Build Report Details Dialog

**What**: Create detailed view dialog showing full report information with content preview
**Why**: Allows admins to review complete report context before taking action
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Main dialog component
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-content-preview.tsx` - Content preview component with Cloudinary images
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-user-info.tsx` - Reporter and reported user information cards

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table.tsx` - Add click handler to open dialog

**Changes:**
- Create dialog using Radix UI Dialog component
- Display complete report details including ID, timestamps, category, status, comments
- Integrate Cloudinary for optimized image previews of reported content
- Show reporter and reported user profile information fetched via Clerk
- Include report history and previous actions taken
- Add navigation between reports within dialog

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Dialog opens with complete report information
- [ ] Images load with Cloudinary optimization
- [ ] User profile data displays correctly
- [ ] Dialog is accessible and keyboard navigable
- [ ] All validation commands pass

---

### Step 5: Implement Report Status Management Actions

**What**: Build UI for updating report status (pending, under review, resolved, dismissed) with resolution notes
**Why**: Enables admins to track and manage the lifecycle of each report
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\update-report-status-dialog.tsx` - Status update dialog with form
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\resolution-notes-form.tsx` - Form for adding resolution notes

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Add status update trigger button
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table-row-actions.tsx` - Add quick status update actions

**Changes:**
- Create status update dialog with Radix UI Select for status options
- Implement resolution notes textarea with character limit
- Connect to updateReportStatus server action from admin-content-reports.actions.ts
- Add validation using Zod schema from moderation.validation.ts
- Display success/error feedback with toast notifications
- Update table data optimistically after successful action

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Status can be updated from all available states
- [ ] Resolution notes save correctly
- [ ] Validation errors display appropriately
- [ ] Table reflects updated status immediately
- [ ] All validation commands pass

---

### Step 6: Create Content Moderation Actions (Remove Content)

**What**: Implement functionality to remove reported content (bobbleheads, collections, user profiles)
**Why**: Provides admins ability to take action on violating content
**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\remove-content-dialog.tsx` - Confirmation dialog for content removal
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-content-moderation.actions.ts` - Server actions for content removal

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Add remove content button
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\moderation.validation.ts` - Add content removal validation schemas

**Changes:**
- Create confirmation dialog with reason selection and notes
- Implement server actions for removing bobbleheads, collections, and user content
- Add validation schemas for content removal operations
- Connect to existing database queries for content deletion
- Implement soft delete where appropriate for audit trail
- Update report status to resolved after content removal
- Log all removal actions to audit log

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Content removal dialog requires explicit confirmation
- [ ] Server actions successfully remove content by type
- [ ] Report status updates to resolved automatically
- [ ] Audit log captures removal actions
- [ ] All validation commands pass

---

### Step 7: Build User Moderation Actions (Warn, Suspend, Ban)

**What**: Create interfaces and server actions for warning, suspending, and banning users
**Why**: Enables admins to take graduated disciplinary actions against violating users
**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\user-moderation-dialog.tsx` - Dialog for user moderation actions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-user-moderation.actions.ts` - Server actions for user moderation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\user-moderation.validation.ts` - Validation schemas for moderation actions

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Add user moderation action buttons
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\moderation.schema.ts` - Add user_moderation_actions table if not exists

**Changes:**
- Create moderation dialog with action type selector (warn, suspend, ban)
- Add duration picker for temporary suspensions
- Implement reason selection and custom notes
- Build server actions for each moderation type with Clerk integration
- Create validation schemas with duration limits and reason requirements
- Update user metadata in Clerk with moderation status
- Store moderation history in database
- Send notification to moderated user (email via Clerk)
- Automatically resolve related reports

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All three moderation types (warn, suspend, ban) function correctly
- [ ] Duration selection works for temporary suspensions
- [ ] User status updates in Clerk successfully
- [ ] Moderation history is recorded in database
- [ ] All validation commands pass

---

### Step 8: Implement Bulk Actions for Multiple Reports

**What**: Add functionality to perform actions on multiple selected reports simultaneously
**Why**: Improves admin efficiency when handling similar reports
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\bulk-actions-toolbar.tsx` - Toolbar for bulk actions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-bulk-reports.actions.ts` - Server actions for bulk operations

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table.tsx` - Add row selection state management
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\validations\moderation.validation.ts` - Add bulk action validation schemas

**Changes:**
- Add checkbox column to table for row selection
- Create toolbar that appears when rows are selected
- Implement bulk status update (mark as under review, resolved, dismissed)
- Add bulk assignment to admin reviewer
- Create confirmation dialogs for bulk actions
- Build server actions that handle transaction-based bulk operations
- Add validation to prevent conflicting bulk actions
- Show progress indicator for bulk operations
- Display summary of successful and failed operations

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Multiple reports can be selected via checkboxes
- [ ] Bulk actions toolbar displays with correct options
- [ ] Bulk operations complete successfully with transaction safety
- [ ] Results summary shows success and failure counts
- [ ] All validation commands pass

---

### Step 9: Create Reports Analytics Dashboard

**What**: Build analytics view showing report trends, resolution times, and moderation effectiveness metrics
**Why**: Provides insights into content moderation patterns and admin team performance
**Confidence**: Medium

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\analytics\page.tsx` - Analytics dashboard page
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\analytics\reports-overview-cards.tsx` - Summary statistics cards
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\analytics\reports-trends-chart.tsx` - Trends visualization
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\analytics\category-breakdown-chart.tsx` - Category distribution chart
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\admin\reports-analytics.query.ts` - Database queries for analytics

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\layout.tsx` - Add analytics navigation link

**Changes:**
- Create analytics page with key metrics (total reports, pending, average resolution time)
- Build overview cards showing current statistics
- Implement trend chart showing reports over time by category
- Add category breakdown visualization
- Create resolution time analysis component
- Build database queries for aggregating analytics data
- Add date range selector for analytics period
- Include export functionality for analytics reports

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Analytics page displays all key metrics correctly
- [ ] Charts render with accurate data
- [ ] Date range filtering affects analytics calculations
- [ ] Analytics queries perform efficiently
- [ ] All validation commands pass

---

### Step 10: Implement Search Functionality for Reports

**What**: Add search capabilities to filter reports by content, reporter, or reported user
**Why**: Allows admins to quickly locate specific reports or patterns
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-search-bar.tsx` - Search input component

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Integrate search with data fetching
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\queries\admin\content-reports.query.ts` - Add search query parameters

**Changes:**
- Create search bar component with debounced input
- Implement search across report comments, reporter names, and reported usernames
- Use Nuqs to sync search term with URL
- Update database queries to include full-text search
- Add search suggestions based on recent searches
- Include clear search button
- Show search results count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Search input debounces properly
- [ ] Search term persists in URL
- [ ] Search results return accurate matches
- [ ] Search works across all searchable fields
- [ ] All validation commands pass

---

### Step 11: Add Audit Logging for All Admin Actions

**What**: Implement comprehensive audit trail for all moderation and report management actions
**Why**: Provides accountability and compliance documentation for all admin decisions
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\db\schema\audit-log.schema.ts` - Audit log table schema
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\utils\audit-logger.ts` - Audit logging utility functions
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\audit\page.tsx` - Audit log viewer page

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-content-reports.actions.ts` - Add audit logging to all actions
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-content-moderation.actions.ts` - Add audit logging
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-user-moderation.actions.ts` - Add audit logging
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-bulk-reports.actions.ts` - Add audit logging

**Changes:**
- Create audit_log table with fields for admin ID, action type, target type, target ID, details, timestamp
- Implement audit logging utility function that captures context
- Add audit log entries to all server actions
- Create audit log viewer page with filtering by admin, action type, and date
- Include detailed view for each audit entry
- Add export functionality for audit logs

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All admin actions create audit log entries
- [ ] Audit logs capture complete action context
- [ ] Audit viewer displays logs with proper filtering
- [ ] Audit logs are immutable and tamper-evident
- [ ] All validation commands pass

---

### Step 12: Create Admin Role Validation Middleware

**What**: Implement robust role-based access control validation for all admin routes and actions
**Why**: Ensures only authorized admins can access reporting system features
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\auth\admin-authorization.ts` - Admin role validation utilities

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\layout.tsx` - Add admin role check
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-content-reports.actions.ts` - Add role validation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-content-moderation.actions.ts` - Add role validation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-user-moderation.actions.ts` - Add role validation
- `C:\Users\JasonPaff\dev\head-shakers\src\lib\actions\admin\admin-bulk-reports.actions.ts` - Add role validation

**Changes:**
- Create admin authorization utility using Clerk role checks
- Implement isAdmin helper function
- Add requireAdmin wrapper for server actions
- Validate admin role in all report-related server actions
- Add role check to admin layout for route protection
- Return 403 Forbidden for unauthorized access attempts
- Log unauthorized access attempts to audit log

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Only users with admin role can access admin routes
- [ ] All server actions validate admin role before execution
- [ ] Unauthorized attempts are logged and rejected
- [ ] Error messages are appropriate for security
- [ ] All validation commands pass

---

### Step 13: Implement Loading States and Error Boundaries

**What**: Add comprehensive loading states and error handling throughout the reporting interface
**Why**: Provides better user experience and graceful degradation when issues occur
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\loading.tsx` - Loading state for reports page
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\error.tsx` - Error boundary for reports page
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table-skeleton.tsx` - Skeleton loader for table

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\page.tsx` - Add Suspense boundaries
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Add loading state for content preview

**Changes:**
- Create loading skeleton component matching table structure
- Implement error boundary with retry functionality
- Add Suspense boundaries around async components
- Create loading states for dialogs and async actions
- Implement error handling in all server action calls
- Add toast notifications for success and error states
- Include fallback UI for failed image loads

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Loading states display during data fetching
- [ ] Error boundaries catch and display errors gracefully
- [ ] Users can retry failed operations
- [ ] All async operations show appropriate loading indicators
- [ ] All validation commands pass

---

### Step 14: Add Responsive Design and Mobile Optimization

**What**: Ensure all reporting interface components are fully responsive and mobile-friendly
**Why**: Enables admins to manage reports from any device
**Confidence**: High

**Files to Modify:**
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-table.tsx` - Add responsive table behavior
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\reports-filters.tsx` - Make filters responsive
- `C:\Users\JasonPaff\dev\head-shakers\src\components\feature\admin\reports\report-details-dialog.tsx` - Optimize dialog for mobile
- `C:\Users\JasonPaff\dev\head-shakers\src\app\(app)\admin\reports\layout.tsx` - Implement responsive layout

**Changes:**
- Convert table to card view on mobile breakpoints
- Make filter panel collapsible on mobile
- Optimize dialog sizing for mobile screens
- Ensure all interactive elements meet touch target sizes
- Test responsive behavior at common breakpoints
- Optimize image loading for mobile networks
- Add mobile-specific navigation patterns

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Interface is fully functional on mobile devices
- [ ] All components adapt to different screen sizes
- [ ] Touch interactions work correctly
- [ ] Performance is acceptable on mobile networks
- [ ] All validation commands pass

---

### Step 15: Integration Testing and Final Validation

**What**: Create comprehensive tests and perform end-to-end validation of the reporting system
**Why**: Ensures all features work together correctly and meet requirements
**Confidence**: High

**Files to Create:**
- `C:\Users\JasonPaff\dev\head-shakers\tests\integration\admin\reports\reports-workflow.test.ts` - Integration tests for report workflow
- `C:\Users\JasonPaff\dev\head-shakers\tests\integration\admin\reports\user-moderation.test.ts` - Tests for user moderation actions
- `C:\Users\JasonPaff\dev\head-shakers\tests\unit\admin\reports\audit-logger.test.ts` - Unit tests for audit logging

**Files to Modify:**
- None

**Changes:**
- Create integration tests covering complete report management workflow
- Test all user moderation actions (warn, suspend, ban)
- Verify bulk actions work correctly
- Test authorization and role validation
- Validate audit logging captures all actions
- Test error handling and edge cases
- Verify analytics calculations are accurate
- Test search and filtering functionality
- Validate database transactions and rollback scenarios

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck && npm run test
```

**Success Criteria:**
- [ ] All integration tests pass
- [ ] All unit tests pass
- [ ] Code coverage meets project standards
- [ ] Manual testing confirms all features work
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All integration and unit tests pass `npm run test`
- [ ] Admin role validation prevents unauthorized access
- [ ] All database operations use transactions where appropriate
- [ ] Audit logs capture all admin actions correctly
- [ ] All forms validate using Zod schemas
- [ ] UI components follow existing Radix UI patterns
- [ ] Responsive design works on mobile and desktop
- [ ] Performance is acceptable with large datasets

## Notes

**Important Considerations:**

- **Real-time Updates**: The plan intentionally excludes Ably real-time features per project rules ("use very sparingly and only when truly necessary"). Real-time status updates for concurrent admin activity can be added as a future enhancement if the need is validated through usage metrics.

- **Database Migrations**: If user_moderation_actions table or audit_log table do not exist, database migrations must be generated using `npm run db:generate` and applied with `npm run db:migrate` before implementing Steps 7 and 11.

- **Cloudinary Configuration**: Ensure Cloudinary optimization settings are configured for admin preview contexts to balance quality with loading performance.

- **Performance Considerations**: With large report volumes, implement cursor-based pagination instead of offset-based for better performance. Consider adding database indexes on frequently queried columns (status, created_at, category).

- **Security**: All server actions must validate admin role before execution. Never expose report details or moderation actions to non-admin users. Implement rate limiting for bulk operations to prevent abuse.

- **Audit Compliance**: Audit logs should be immutable and stored separately from operational data if compliance requirements demand it. Consider archiving strategy for old audit logs.

- **User Notifications**: When implementing user moderation actions, ensure users receive clear communication about actions taken and appeal processes where applicable.

- **Testing Strategy**: Focus integration tests on critical paths (report submission to resolution). Use Testcontainers for database testing to ensure schema changes don't break queries.

**Assumptions Requiring Confirmation:**

- Admin users are identified via Clerk roles (confirm role name: "admin" or "administrator")
- Content soft delete is preferred over hard delete for audit trail (confirm with compliance requirements)
- Suspension durations can range from 1 day to permanent (confirm business rules)
- Analytics require data from last 90 days by default (confirm retention policy)

**Risk Mitigation:**

- **Medium Risk - User Moderation Actions**: Implement confirmation dialogs and undo functionality for first 5 minutes after action
- **Medium Risk - Bulk Operations**: Add transaction rollback on any failure and implement operation limits
- **Low Risk - Analytics Performance**: Implement caching for analytics queries with 1-hour TTL
