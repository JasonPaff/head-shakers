# Database Documentation - November 24, 2025

This folder contains comprehensive documentation about the Head Shakers database schema and specifically the `content_reports` table used by the Admin Reports page.

## Documentation Files

### 1. **database-schema-overview.md** (Main Reference)
Complete overview of all 24 tables in the head-shakers database.

**Contents**:
- Database connection details
- All tables organized by category (User Management, Content, Social, etc.)
- Field descriptions for each table
- Key relationships and foreign keys
- Constraint information
- Index strategy
- Common query patterns
- Enum definitions

**Use this for**: Understanding the complete database structure, finding related tables, understanding relationships.

### 2. **content-reports-analysis.md** (Detailed Analysis)
In-depth analysis of the `content_reports` table specifically.

**Contents**:
- Table structure with SQL definition
- All enums (reasons, statuses, target types)
- Foreign key relationships
- Index explanation and usage
- Admin Reports query details
- Admin Reports page features and workflow
- Field descriptions
- Data insertion points
- Common admin workflows
- Testing checklist

**Use this for**: Understanding how content reports work, testing the admin reports page, understanding moderation workflow.

### 3. **quick-reference.md** (Fast Lookup)
Quick reference guide for common needs.

**Contents**:
- All 24 tables listed
- content_reports quick facts
- Key fields summary
- Target types and reasons
- Admin Reports page route and components
- How to test
- File locations for all related code
- Database commands reference

**Use this for**: Quick lookups, finding file locations, remembering enum values.

### 4. **test-queries.md** (SQL Testing)
Complete set of SQL queries for testing and verification.

**Contents**:
- Basic count queries
- Sample data queries with joins
- Content-specific queries (by target type)
- Analytics and stats queries
- Admin reports page equivalent queries
- Test data verification queries
- TypeScript usage examples
- Testing notes

**Use this for**: Running actual database queries to verify data, understanding how queries work, generating reports.

---

## Content Reports Table at a Glance

### Purpose
The `content_reports` table stores user reports of content violations (offensive content, spam, copyright, etc.) for admin/moderator review and action.

### Location in Code
```
Database Schema:     src/lib/db/schema/moderation.schema.ts
Query Logic:         src/lib/queries/content-reports/content-reports.query.ts
Business Logic:      src/lib/facades/content-reports/content-reports.facade.ts
Server Actions:      src/lib/actions/admin/admin-content-reports.actions.ts
UI Components:       src/components/admin/reports/
Admin Page:          src/app/(app)/admin/reports/page.tsx
```

### Key Features
- **Polymorphic Design**: Can report any content type (bobblehead, collection, comment, etc.)
- **Status Tracking**: Reports flow through pending → reviewed → resolved/dismissed
- **Moderation Workflow**: Tracks reporter, moderator, notes, and resolution timestamp
- **Admin Dashboard**: Full-featured reporting interface with filtering, sorting, bulk actions
- **Content Linking**: Automatically handles deleted content with graceful fallbacks

### Testing
To verify the table has data and test the admin reports functionality:

1. **Access Admin Page**: Navigate to `/admin/reports` (requires admin/moderator role)
2. **Check Stats**: View total reports and breakdown by status
3. **Apply Filters**: Test filtering by status, type, reason, date
4. **Run Queries**: Use test-queries.md for database verification
5. **Test Actions**: Verify status changes, bulk operations, detail viewing

---

## Quick Stats

| Aspect | Count |
|--------|-------|
| Total Tables | 24 |
| User Tables | 7 |
| Content Tables | 5 |
| Social Tables | 4 |
| Report Tables | 1 |
| System Tables | 4 |
| Analytics Tables | 2 |
| Launch Tables | 1 |

### Table Dependencies
```
content_reports references:
  - users (reporter_id) - CASCADE DELETE
  - users (moderator_id) - SET NULL

Referenced by:
  - (none - endpoint table)
```

### Enum Values
```
Report Status:    pending, reviewed, resolved, dismissed
Target Type:      bobblehead, collection, subcollection, comment, user
Report Reason:    offensive_content, spam, copyright_violation,
                  misinformation, impersonation, harassment,
                  inappropriate_content, low_quality
```

---

## Key Queries Reference

### Count Total Reports
```sql
SELECT COUNT(*) FROM content_reports;
```

### Get Reports by Status
```sql
SELECT status, COUNT(*) FROM content_reports GROUP BY status;
```

### Get Sample Reports with Reporter
```sql
SELECT cr.*, u.display_name as reporter_name
FROM content_reports cr
LEFT JOIN users u ON cr.reporter_id = u.id
ORDER BY cr.created_at DESC
LIMIT 5;
```

See `test-queries.md` for many more examples.

---

## Database Configuration

**Project ID**: misty-boat-49919732
**Database Name**: head-shakers
**Development Branch**: br-dark-forest-adf48tll
**Production Branch**: br-dry-forest-adjaydda

Connection string uses environment variable: `DATABASE_URL`

---

## Common Tasks

### "I want to understand all the tables"
→ Read `database-schema-overview.md`

### "I need to test the admin reports page"
→ Read `content-reports-analysis.md` and use `test-queries.md`

### "I need to find where content_reports is used"
→ Check `content-reports-analysis.md` File Locations section or `quick-reference.md`

### "I need to verify data in the database"
→ Use queries from `test-queries.md`

### "I need the SQL to understand a feature"
→ Check `content-reports-analysis.md` or `test-queries.md` for specific queries

### "I'm new to the schema and need quick reference"
→ Start with `quick-reference.md` then dig into other docs as needed

---

## Related Files in Codebase

**Schema Definitions**
- `src/lib/db/schema/moderation.schema.ts` - content_reports table
- `src/lib/db/schema/users.schema.ts` - users table (referenced)
- `src/lib/db/schema/comments.schema.ts` - for comment reports

**Query & Data Access**
- `src/lib/queries/content-reports/content-reports.query.ts` - ContentReportsQuery class
- `src/lib/facades/content-reports/content-reports.facade.ts` - Business logic

**Actions & Mutations**
- `src/lib/actions/moderation/content-reports.actions.ts` - Create reports
- `src/lib/actions/admin/admin-content-reports.actions.ts` - Admin updates

**UI Components**
- `src/components/admin/reports/admin-reports-client.tsx` - Main client component
- `src/components/admin/reports/reports-table.tsx` - Data table with sorting/pagination
- `src/components/admin/reports/report-detail-dialog.tsx` - Detail view
- `src/components/admin/reports/report-filters.tsx` - Filter interface
- `src/components/feature/content-reports/report-reason-dialog.tsx` - User report form

**Validations & Types**
- `src/lib/validations/moderation.validation.ts` - Zod schemas and types

**Admin Pages**
- `src/app/(app)/admin/reports/page.tsx` - Admin reports page

---

## Performance Considerations

### Indexes on content_reports
```
content_reports_status_idx                  - Fast status filtering
content_reports_created_at_idx              - Order by date
content_reports_reporter_id_idx             - Find reports by user
content_reports_moderator_id_idx            - Find reports by moderator
content_reports_reason_idx                  - Filter by reason
content_reports_reporter_status_idx         - Common combined filter
content_reports_status_created_idx          - Moderator queue
content_reports_target_idx                  - Find reports on content
```

### Query Optimization
- Admin page uses LEFT JOINs to handle deleted content
- Pagination with LIMIT/OFFSET (never full table scans)
- Indexes on all common filter columns
- Composite indexes for multi-column queries

---

## Version Information
Created: November 24, 2025
Database: head-shakers (PostgreSQL on Neon)
Schema Version: Current (as of above date)

---

## Next Steps

1. **For Understanding**: Read the documentation in order of specificity:
   - `quick-reference.md` for overview
   - `database-schema-overview.md` for complete schema
   - `content-reports-analysis.md` for detailed feature info

2. **For Testing**:
   - Use queries from `test-queries.md`
   - Follow checklist in `content-reports-analysis.md`
   - Access admin page at `/admin/reports`

3. **For Development**:
   - Reference file locations in `quick-reference.md`
   - Use SQL examples from `test-queries.md`
   - Check TypeScript examples in test-queries.md

---

**Questions?** Check the specific documentation file for your need or search for the content type/feature in the relevant doc.

