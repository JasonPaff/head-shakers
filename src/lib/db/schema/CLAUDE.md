# Database Schema - CLAUDE.md

## Purpose

Drizzle ORM database schemas for a bobblehead collection social platform. Defines PostgreSQL table structures, relationships, constraints, and TypeScript types for all database entities using a modular, domain-driven organization.

## Key Patterns

- **Modular Organization**: Each domain has its own schema file (users, bobbleheads, collections, social, etc.)
- **Relations File**: All table relationships centralized in `relations.schema.ts` for clarity
- **Constants Integration**: Schema limits and defaults from `@/lib/constants` for consistency
- **UUID Primary Keys**: All tables use `uuid().primaryKey().defaultRandom()`
- **Timestamp Standards**: `createdAt` and `updatedAt` fields with `defaultNow()`
- **Soft Deletes**: Uses `isDeleted` boolean flags and `deletedAt` timestamps
- **Performance Indexing**: Comprehensive single-column and composite indexes for query optimization

## Schema Overview

### Core Entities

- **users.schema.ts**: User accounts with Clerk integration, authentication, settings, activity tracking
- **bobbleheads.schema.ts**: Main collectible entity with photos, custom fields, metadata
- **collections.schema.ts**: User-owned containers with subcollection support
- **tags.schema.ts**: User-scoped tagging system with usage tracking

### Social Features

- **social.schema.ts**: Comments (threaded), likes, follows with polymorphic target support
- **system.schema.ts**: Notifications, featured content, platform settings, content metrics
- **moderation.schema.ts**: Content reporting system with moderator workflow

### Analytics & Tracking

- **analytics.schema.ts**: Content views, search queries with session tracking
- **users.schema.ts**: User activity logs, login history, session management

## Database Design Patterns

### Polymorphic Relationships

Many entities support polymorphic targets using `targetType` enum + `targetId` UUID:

- **comments**: Can target bobbleheads, collections, or other comments
- **likes**: Can target bobbleheads, collections, or comments
- **contentViews**: Tracks views across different content types

### User-Centric Design

- All user-generated content cascades on user deletion
- User settings and notification preferences in separate 1:1 tables
- User activity tracking with IP, user agent, and device info

### Content Privacy

- `isPublic` fields on collections and bobbleheads for visibility control
- User privacy settings control profile and content visibility
- Moderation system for community content management

## Schema Conventions

### Field Naming & Types

- Database: `snake_case` columns, PostgreSQL native types
- TypeScript: `camelCase` exported schemas with full type inference
- Enums: PostgreSQL enums defined with constants from `ENUMS`
- JSON Fields: Typed with `.$type<TypeName>()` for type safety

### Constraints & Validation

- **Length Limits**: All varchar fields constrained using `SCHEMA_LIMITS` constants
- **Check Constraints**: SQL-level validation for business rules (non-negative counts, date logic)
- **Unique Constraints**: Composite unique indexes for relationship tables
- **Foreign Keys**: Cascade deletes for owned entities, set null for references

### Indexing Strategy

- **Single Column**: High-cardinality fields (userId, isPublic, createdAt)
- **Composite**: Common query patterns (user+public, type+target, status+date)
- **Unique**: Prevent duplicate relationships (user+tag, follower+following)

## Important Notes

- **Relations Import**: Always import relations from `relations.schema.ts` for proper joins
- **Soft Deletes**: Filter `isDeleted: false` in all queries for active records
- **Enum Usage**: Use PostgreSQL enums for controlled vocabularies, not strings
- **Custom Fields**: `bobbleheads.customFields` uses typed JSON for extensible metadata
- **Device Tracking**: Login/session tables include structured device information
- **Content Metrics**: Separate metrics table for analytics aggregation
- **Sub-Collections**: Optional hierarchical organization within collections
- **Tag Scoping**: Tags are user-scoped to prevent conflicts
- **Moderation Workflow**: Content reports have full audit trail with moderator actions
