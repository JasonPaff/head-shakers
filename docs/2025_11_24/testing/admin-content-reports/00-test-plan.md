# Admin Content Reports Page - Test Plan

**Feature**: Admin Content Reports Management
**Route**: `/admin/reports`
**Authentication**: Requires moderator/admin role

## Feature Context

The admin content reports page allows moderators and admins to:

- View all content reports submitted by users
- Filter reports by status, content type, reason, and date range
- Sort and paginate through reports
- Select multiple reports for bulk actions
- View detailed report information in a dialog
- Update report status (reviewed, resolved, dismissed)

## Components Under Test

1. **ReportFilters** - Filter controls with multi-select capability
2. **ReportsTable** - Data table with sorting, pagination, and row selection
3. **AdminReportsClient** - Client wrapper handling state and actions
4. **ReportDetailDialog** - Modal dialog for viewing and acting on reports
5. **BulkActionsToolbar** - Actions bar for selected reports

## Filter Types to Test

### Status Filter (multi-select)

- `pending` - Yellow badge
- `reviewed` - Blue badge
- `resolved` - Green badge
- `dismissed` - Gray badge

### Content Type Filter (multi-select)

- `bobblehead` - Green badge
- `collection` - Blue badge
- `subcollection` - Purple badge
- `comment` - Orange badge

### Reason Filter (multi-select)

- `spam`
- `harassment`
- `inappropriate_content`
- `copyright_violation`
- `misinformation`
- `hate_speech`
- `violence`
- `other`

### Date Filters

- Date From - Calendar picker
- Date To - Calendar picker

## Test Units

### Test Unit 1: Individual Filter Testing

**Focus**: Each filter type individually
**Scenarios**: Apply filter, verify results update, clear filter

### Test Unit 2: Filter Combinations and Active Filter Badges

**Focus**: Multiple filters together, badge display, clearing
**Scenarios**: Multi-select within filter, cross-filter combinations, clear all

### Test Unit 3: Pagination Controls

**Focus**: Page navigation and page size selection
**Scenarios**: Page navigation, page size changes, edge cases

### Test Unit 4: Sorting Functionality

**Focus**: Column sorting with ascending/descending
**Scenarios**: Sort by different columns, toggle sort direction

### Test Unit 5: Row Selection and Bulk Actions

**Focus**: Checkbox selection and bulk action toolbar
**Scenarios**: Single/multi select, select all, bulk actions

### Test Unit 6: Report Detail Dialog

**Focus**: Dialog content and action buttons
**Scenarios**: View details, status changes, close dialog

## Success Criteria

- All filters work independently and in combination
- URL state reflects filter selections
- Pagination works correctly with filtered data
- Sorting maintains data integrity
- Bulk actions process correctly
- Dialog displays complete report information
