# Admin Reports Data Table - Test Plan

**Generated**: 2025-11-24
**Feature**: Admin Reports Page - Data Table Functionality
**Route**: `/admin/reports`
**Component**: `ReportsTable` (src/components/admin/reports/reports-table.tsx)

## Feature Context

The admin reports page displays a data table with content reports submitted by users. The table includes:

- Pagination controls (Previous/Next buttons, page indicators)
- Page size selector (10, 25, 50, 100 rows per page)
- Column sorting (reason, status, targetType, createdAt - all sortable)
- Row selection with bulk actions
- Report details display with interactive content links

## Routes to Test

- **Primary**: `http://localhost:3000/admin/reports` (authenticated route - requires moderator role)

## Test Units

### Test Unit 1: Data Table Pagination Controls

**Focus**: Page navigation, page indicators, button state management
**Routes**: `/admin/reports`
**Key Functionality**:

- Previous/Next button state (enabled/disabled based on page)
- Page change navigation
- Current page indicator display
- URL query parameter updates (page param)

### Test Unit 2: Page Size Controls

**Focus**: Changing number of rows per page, page reset behavior
**Routes**: `/admin/reports`
**Key Functionality**:

- Page size button selection (10, 25, 50, 100)
- Data refresh on page size change
- Page reset to 1 when page size changes
- URL query parameter updates (pageSize param)
- Button active state (default vs outline)

### Test Unit 3: Column Sorting

**Focus**: All sortable columns, sort direction toggle, sort indicators
**Routes**: `/admin/reports`
**Key Functionality**:

- Sort by "Report Summary" (reason)
- Sort by "Status"
- Sort by "Content Type" (targetType)
- Sort by "Submitted" (createdAt)
- Toggle between ascending/descending
- Sort indicator arrows (up/down)
- Non-sortable columns remain non-interactive

## Test Data Available

- **Table**: content_reports
- **Records**: Multiple reports with various statuses (pending, reviewed, resolved, dismissed)
- **Filter Options**: Status, reason, targetType date range

## Authentication

- **Strategy**: Routes require moderator role
- **Handling**: Expect auth redirect if not authenticated
- **Test Context**: Assume user is authenticated as admin/moderator (Clerk test mode)

## Success Criteria

1. ✓ All pagination controls work correctly
2. ✓ Page size changes update displayed data
3. ✓ All sortable columns sort in both directions
4. ✓ Sort indicators display correctly
5. ✓ URL parameters update on interactions
6. ✓ No console errors during navigation
7. ✓ Table displays correct number of rows based on page size
8. ✓ Row selection persists through page navigation
9. ✓ Data accuracy maintained across page changes
10. ✓ Bulk action buttons appear when rows are selected

## Test Execution Strategy

- Sequential subagent testing (browser state must be maintained)
- Focus on user interactions and data consistency
- Verify both UI state and URL parameters
- Capture screenshots for failures and key interactions
