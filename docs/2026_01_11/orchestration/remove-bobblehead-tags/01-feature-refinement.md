# Step 1: Feature Request Refinement

**Started**: 2026-01-11T00:00:00Z
**Completed**: 2026-01-11T00:00:30Z
**Status**: ✅ Complete

## Original Request

> remove the tags feature from bobblheads, remove it from the add/edit bobblehead form and anywhere else. The app is not in production yet so no backwards compatable approach is needed. The entire concept of tags for bobbleheads should be removed completely.

**Word Count**: 46 words

## Context Provided

- Project: Next.js 16 with App Router, React 19, TypeScript
- Database: PostgreSQL with Neon serverless, Drizzle ORM
- Validation: Drizzle-Zod, Zod schemas
- Actions: Next-Safe-Action for server actions
- Forms: TanStack React Form
- UI: Radix UI components

## Agent Prompt

```
Refine this feature request into a SINGLE PARAGRAPH (no headers, bullet points, or sections): 'remove the tags feature from bobbleheads...'

Using the project context [CLAUDE.md and package.json details]...

Expand this request with relevant technical details while maintaining its core intent. Output ONLY the refined paragraph (200-500 words), nothing else.
```

## Agent Response

The tags feature for bobbleheads needs to be completely removed from the application, including all database schema definitions, validation schemas, server actions, queries, facade methods, and UI components related to bobblehead tags. In the database layer under `src/lib/db/`, the tags table schema and any junction tables linking tags to bobbleheads (such as a bobblehead_tags table) should be deleted, along with their corresponding Drizzle relations definitions. A new migration should be generated using `npm run db:generate` to drop these tables from the PostgreSQL database. All Zod validation schemas in `src/lib/validations/` that include tag-related fields need to be updated to remove those properties, including any schemas used for creating, updating, or filtering bobbleheads by tags. Server actions in `src/lib/actions/` that handle tag CRUD operations or include tags in bobblehead mutations must be modified or deleted entirely. Any queries in `src/lib/queries/` that fetch, filter, or join on tag data should be cleaned up, and facade methods in `src/lib/facades/` that orchestrate tag-related business logic need removal. In the UI layer, the add and edit bobblehead forms using TanStack React Form must have their tag input fields, tag selection components, and any tag-related form state removed from `src/components/feature/bobblehead/`. Any tag display components, tag filtering UI elements, or tag management interfaces throughout the application routes in `src/app/(app)/` should be deleted. This includes removing tag-related TypeScript types and interfaces, cleaning up any imports referencing deleted modules, and ensuring no orphaned code remains. Since the application is not in production, no data migration strategy for existing tags is required, and no backwards compatibility measures need to be implemented. The goal is a complete removal of the tags concept from the bobblehead feature, leaving no traces in the codebase.

## Refined Request (Extracted)

The tags feature for bobbleheads needs to be completely removed from the application, including all database schema definitions, validation schemas, server actions, queries, facade methods, and UI components related to bobblehead tags. In the database layer under `src/lib/db/`, the tags table schema and any junction tables linking tags to bobbleheads (such as a bobblehead_tags table) should be deleted, along with their corresponding Drizzle relations definitions. A new migration should be generated using `npm run db:generate` to drop these tables from the PostgreSQL database. All Zod validation schemas in `src/lib/validations/` that include tag-related fields need to be updated to remove those properties, including any schemas used for creating, updating, or filtering bobbleheads by tags. Server actions in `src/lib/actions/` that handle tag CRUD operations or include tags in bobblehead mutations must be modified or deleted entirely. Any queries in `src/lib/queries/` that fetch, filter, or join on tag data should be cleaned up, and facade methods in `src/lib/facades/` that orchestrate tag-related business logic need removal. In the UI layer, the add and edit bobblehead forms using TanStack React Form must have their tag input fields, tag selection components, and any tag-related form state removed from `src/components/feature/bobblehead/`. Any tag display components, tag filtering UI elements, or tag management interfaces throughout the application routes in `src/app/(app)/` should be deleted. This includes removing tag-related TypeScript types and interfaces, cleaning up any imports referencing deleted modules, and ensuring no orphaned code remains. Since the application is not in production, no data migration strategy for existing tags is required, and no backwards compatibility measures need to be implemented. The goal is a complete removal of the tags concept from the bobblehead feature, leaving no traces in the codebase.

## Length Analysis

| Metric              | Value |
| ------------------- | ----- |
| Original Word Count | 46    |
| Refined Word Count  | ~330  |
| Expansion Ratio     | 7.2x  |

## Scope Analysis

- ✅ Core intent preserved: Complete removal of tags feature
- ✅ No feature creep: Only removal tasks specified
- ✅ Technical context added: Specific file paths and technologies mentioned
- ✅ Actionable: Clear layers and components identified for removal

## Validation Results

- ✅ Format: Single paragraph (no headers/sections)
- ✅ Length: ~330 words (within 200-500 range)
- ✅ Scope: Focused on removal only
- ✅ Technical detail: Appropriate level added
