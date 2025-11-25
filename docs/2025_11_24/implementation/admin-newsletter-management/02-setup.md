# Setup and Routing

**Timestamp**: 2025-11-24

## Setup Metadata

- **Total Steps Extracted**: 18
- **Specialist Agents Required**: 6 unique types
- **Multi-domain Steps**: None identified

## Step Routing Table

| Step | Title | Specialist | Reason |
|------|-------|------------|--------|
| 1 | Create Newsletter Templates Database Schema | database-specialist | Files in src/lib/db/schema/ |
| 2 | Create Newsletter Sends Database Schema | database-specialist | Files in src/lib/db/schema/ |
| 3 | Generate and Run Database Migrations | database-specialist | Database migration commands |
| 4 | Add Newsletter Constants | general-purpose | Constants files, no specialist skills |
| 5 | Extend Newsletter Validation Schemas | validation-specialist | Files in src/lib/validations/ |
| 6 | Extend Newsletter Query Layer | database-specialist | Files in src/lib/queries/ |
| 7 | Extend Newsletter Facade Layer | facade-specialist | Files in src/lib/facades/ |
| 8 | Extend Resend Service for Bulk Newsletter Sends | general-purpose | Service file modification |
| 9 | Create Newsletter Admin Server Actions | server-action-specialist | Files in src/lib/actions/ |
| 10 | Create Newsletter Subscribers Table Component | react-component-specialist | React component with TanStack Table |
| 11 | Create Newsletter Compose Form Component | form-specialist | Form component with TanStack Form |
| 12 | Create Newsletter Statistics Component | react-component-specialist | React component |
| 13 | Create Newsletter Send History Table Component | react-component-specialist | React component with TanStack Table |
| 14 | Create Admin Newsletter Page | react-component-specialist | Page component in src/app/ |
| 15 | Create Newsletter Admin Page Client Wrapper | react-component-specialist | Client component |
| 16 | Update Schema Limits Constants | general-purpose | Constants file modification |
| 17 | Add Newsletter Admin Route to Navigation | react-component-specialist | Navigation component modification |
| 18 | Generate Type-Safe Routes | general-purpose | Command execution |

## Todo List Created

- 18 implementation steps + 1 quality gates = 19 todos
- All initialized as "pending"

## Files Per Step Summary

| Step | Files to Create/Modify |
|------|----------------------|
| 1 | src/lib/db/schema/newsletter-templates.schema.ts |
| 2 | src/lib/db/schema/newsletter-sends.schema.ts |
| 3 | Run db:generate, db:migrate |
| 4 | src/lib/constants/action-names.ts, operations.ts |
| 5 | src/lib/validations/newsletter.validation.ts |
| 6 | src/lib/queries/newsletter/newsletter.queries.ts |
| 7 | src/lib/facades/newsletter/newsletter.facade.ts |
| 8 | src/lib/services/resend.service.ts |
| 9 | src/lib/actions/newsletter/newsletter-admin.actions.ts |
| 10 | src/app/(app)/admin/newsletter/components/newsletter-subscribers-table.tsx |
| 11 | src/app/(app)/admin/newsletter/components/newsletter-compose-form.tsx, newsletter-compose-form-options.ts |
| 12 | src/app/(app)/admin/newsletter/components/newsletter-stats.tsx |
| 13 | src/app/(app)/admin/newsletter/components/newsletter-send-history-table.tsx |
| 14 | src/app/(app)/admin/newsletter/page.tsx |
| 15 | src/app/(app)/admin/newsletter/components/newsletter-admin-client.tsx |
| 16 | src/lib/constants/schema-limits.ts |
| 17 | Admin navigation component |
| 18 | Run next-typesafe-url |

## Checkpoint

Setup complete. Beginning implementation with Step 1.
