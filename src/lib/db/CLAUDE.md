# Database Layer - CLAUDE.md

## Purpose

Database abstraction layer using Drizzle ORM with PostgreSQL, providing type-safe database operations for a bobblehead collection social platform. Manages schemas, migrations, seeding, and connection pooling with Neon serverless.

## Key Patterns

- **Single Export**: All database access through `db` export from `index.ts`
- **Schema Organization**: Modular schemas by domain (users, bobbleheads, collections, etc.)
- **Type Safety**: Full TypeScript integration with Drizzle schemas and Zod validation
- **Constants-Driven**: Schema limits and defaults externalized to `/lib/constants`
- **Relational Design**: Explicit relations defined in `relations.schema.ts`
- **Soft Deletes**: Uses `isDeleted` flags and `deletedAt` timestamps instead of hard deletes

## Schema Overview

- **users**: Core user management with Clerk integration, roles, settings, activity tracking
- **bobbleheads**: Main entity with photos, tags, custom fields, and metadata
- **collections**: User-owned collections containing bobbleheads with sub-collection support
- **social**: Comments, likes, follows for social interactions
- **analytics**: Content views, search queries for platform insights
- **moderation**: Content reporting and moderation workflows
- **system**: Notifications, featured content management
- **tags**: Flexible tagging system for categorization

## Database Configuration

- **Provider**: Neon serverless PostgreSQL
- **ORM**: Drizzle with connection pooling
- **Connection**: Configured with timeouts, pool size limits from `CONFIG.DATABASE`
- **Migrations**: Timestamp-prefixed migrations in `./migrations/`
- **Casing**: Snake case for database columns, camelCase in TypeScript

## Query Patterns

- **Transactions**: Use `db.transaction()` for multi-table operations
- **Relations**: Leverage Drizzle relations for joins (defined in `relations.schema.ts`)
- **Soft Deletes**: Always filter `isDeleted: false` in queries
- **UUID Primary Keys**: All tables use UUID primary keys with `defaultRandom()`
- **Timestamps**: `createdAt` and `updatedAt` fields use `defaultNow()` and update triggers

## Schema Conventions

- **Field Naming**: Snake case in database, camelCase in schema exports
- **Constraints**: Length limits from `SCHEMA_LIMITS`, defaults from `DEFAULTS` constants
- **References**: Foreign keys with cascade deletes for owned entities
- **Indexes**: Performance-critical fields indexed (userId, isPublic, etc.)
- **Enums**: PostgreSQL enums defined for controlled vocabularies

## Migration Notes

- **Generation**: `npm run db:generate` creates migrations from schema changes
- **Application**: `npm run db:migrate` applies pending migrations
- **Fresh Start**: `npm run db:fresh` resets, migrates, and seeds database
- **Directory**: Migrations stored in `./migrations/` with metadata tracking

## Scripts

- **Reset**: `reset-db.ts` truncates all tables for clean slate
- **Seed**: `seed.ts` populates database with sample data for development
- **Environment**: Requires `DATABASE_URL` and `RESET_DB=true` for destructive operations

## Important Notes

- Never bypass the exported `db` instance - always import from `@/lib/db`
- Schema changes require migration generation before deployment
- Seed script includes comprehensive test data with relationships
- Connection pooling configured for serverless deployment optimization
- All schemas export both table definitions and TypeScript types
- Use `drizzle-zod` integration for runtime validation where needed
