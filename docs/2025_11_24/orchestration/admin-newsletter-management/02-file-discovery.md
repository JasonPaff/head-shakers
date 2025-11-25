# Step 2: File Discovery

**Started**: 2025-11-24T00:01:00Z
**Completed**: 2025-11-24T00:02:30Z
**Status**: Success

## Input

Refined feature request from Step 1 describing comprehensive admin newsletter management interface.

## Agent Prompt

```
Feature request: [Full refined request from Step 1]

Discover all files in this Head Shakers project that are relevant to implementing this feature. Search for:

1. Existing newsletter-related files (database schemas, actions, queries, components)
2. Existing admin page patterns to follow
3. Database schema files for reference
4. Server action patterns
5. Form component patterns (TanStack Form usage)
6. Data table patterns (TanStack Table usage)
7. Email/Resend integration patterns
8. Validation schema patterns
9. UI components that will be reused

Provide a comprehensive list of discovered files with:
- File path
- Category (Critical/High/Medium/Low priority)
- Reason for relevance
- Whether it needs modification vs reference only
```

## Discovery Results

### Summary Statistics

- **Directories Explored**: 15+
- **Candidate Files Examined**: 45+
- **Highly Relevant Files Found**: 38
- **Supporting Reference Files**: 12

### CRITICAL PRIORITY (Core Implementation)

| File Path | Action | Reason |
|-----------|--------|--------|
| `src/lib/db/schema/newsletter-signups.schema.ts` | MODIFY | Existing newsletter schema, may need extensions |
| `src/lib/db/schema/newsletter-templates.schema.ts` | CREATE | Store reusable newsletter templates |
| `src/lib/db/schema/newsletter-sends.schema.ts` | CREATE | Track send history and delivery status |
| `src/lib/validations/newsletter.validation.ts` | MODIFY | Needs admin schemas for all operations |
| `src/lib/actions/newsletter/newsletter.actions.ts` | MODIFY | Needs admin actions |
| `src/lib/queries/newsletter/newsletter.queries.ts` | MODIFY | Needs admin query methods |
| `src/lib/facades/newsletter/newsletter.facade.ts` | MODIFY | Needs admin business logic |
| `src/lib/services/resend.service.ts` | MODIFY | Needs bulk send method |
| `src/app/(app)/admin/newsletter/page.tsx` | CREATE | Main admin page |
| `src/app/(app)/admin/newsletter/components/newsletter-subscribers-table.tsx` | CREATE | TanStack Table |
| `src/app/(app)/admin/newsletter/components/newsletter-compose-form.tsx` | CREATE | TanStack Form |
| `src/app/(app)/admin/newsletter/components/newsletter-stats.tsx` | CREATE | Statistics display |
| `src/app/(app)/admin/newsletter/components/newsletter-send-history-table.tsx` | CREATE | History table |
| `src/lib/constants/action-names.ts` | MODIFY | Add NEWSLETTER action names |
| `src/lib/constants/operations.ts` | MODIFY | Add NEWSLETTER operations |

### HIGH PRIORITY (Reference Patterns)

| File Path | Purpose |
|-----------|---------|
| `src/app/(app)/admin/users/page.tsx` | Admin page structure pattern |
| `src/app/(app)/admin/users/components/user-management-client.tsx` | Client wrapper pattern |
| `src/app/(app)/admin/users/components/users-data-table.tsx` | TanStack Table pattern |
| `src/app/(app)/admin/featured-content/components/featured-content-form.tsx` | TanStack Form pattern |
| `src/components/ui/form/index.tsx` | Core form system |
| `src/lib/actions/admin/admin-users.actions.ts` | Admin action pattern |
| `src/components/ui/admin/admin-route-guard.tsx` | Route protection |
| `src/lib/utils/admin.utils.ts` | Admin helper functions |
| `src/lib/utils/next-safe-action.ts` | Action client definitions |
| `src/lib/queries/base/query-context.ts` | Query context helpers |
| `src/lib/queries/base/base-query.ts` | Base query class |

### MEDIUM PRIORITY (UI Components)

| File Path | Purpose |
|-----------|---------|
| `src/components/ui/table.tsx` | Table components |
| `src/components/ui/button.tsx` | Button variants |
| `src/components/ui/badge.tsx` | Status badges |
| `src/components/ui/card.tsx` | Card containers |
| `src/components/ui/input.tsx` | Input component |
| `src/components/ui/textarea.tsx` | Textarea component |
| `src/components/ui/dialog.tsx` | Modal dialogs |
| `src/components/ui/dropdown-menu.tsx` | Dropdown menus |
| `src/components/ui/checkbox.tsx` | Checkboxes |

### LOW PRIORITY (Documentation & Related)

| File Path | Purpose |
|-----------|---------|
| `docs/2025_01_24/plans/newsletter-welcome-email-implementation-plan.md` | Related planning reference |
| `src/components/layout/app-footer/components/footer-newsletter.tsx` | Public signup form |
| `src/lib/constants/schema-limits.ts` | Field length limits |
| `src/lib/constants/error-codes.ts` | Error code constants |

## Key Pattern Discoveries

### Admin Page Pattern
- Server component with `requireModerator()` auth guard
- Parse searchParams for filters/pagination
- Server-side data fetching via Facade
- Pass initial data to client component
- Export metadata for SEO

### TanStack Table Pattern
- Client component with columns definition
- Row selection, sorting, pagination with nuqs
- Bulk actions toolbar
- Action dropdown per row
- Manual pagination with server-side count

### TanStack Form Pattern
- `useAppForm` hook from form system
- Form options with default values and validators
- Field components (TextField, TextareaField, etc.)
- Zod schema validation
- `useServerAction` hook integration
- Focus management for errors

### Server Action Pattern (Admin)
- Use `adminActionClient` from next-safe-action
- Define metadata with actionName
- Parse `ctx.sanitizedInput`
- Set Sentry context
- Call Facade for business logic
- Add Sentry breadcrumbs
- Return consistent shape

## Existing Schema Analysis

**newsletter-signups.schema.ts**:
- Fields: id (UUID), email, userId, subscribedAt, unsubscribedAt, createdAt, updatedAt
- Indexes: userId, subscribedAt, createdAt, unique email
- Check constraints for validation

## Database Schema Recommendations

**newsletter_templates table**:
- id, name, subject, body, created_by_user_id, is_default, timestamps

**newsletter_sends table**:
- id, template_id, subject, body, sent_at, total_recipients, successful_sends, failed_sends, sent_by_user_id, delivery_status, error_message, timestamps

## File Validation

All discovered existing files verified to exist in the codebase.
