# Validations - CLAUDE.md

## Purpose
Centralized Zod validation schemas for the Head Shakers application, organized by domain. Uses drizzle-zod integration to generate type-safe schemas from database tables.

## Key Patterns

### Schema Generation Pattern
- **Select schemas**: Direct database table representation via `createSelectSchema()`
- **Insert schemas**: Database inserts with validation overrides and field omissions
- **Update schemas**: Partial versions of insert schemas for updates
- **Public schemas**: Filtered versions removing sensitive fields

### Naming Conventions
- `select[Entity]Schema`: Raw database select operations
- `insert[Entity]Schema`: Creating new entities with validation
- `update[Entity]Schema`: Updating existing entities (typically partial)
- `public[Entity]Schema`: Client-safe versions with sensitive fields removed

### Field Omissions Pattern
Standard fields omitted from insert schemas:
- `id` (auto-generated)
- `createdAt`/`updatedAt` (auto-managed)
- `userId` (set from session context)
- `deletedAt`/`isDeleted` (soft delete fields)

### Custom Validation Utilities
Uses `@/lib/utils/zod.utils` helpers for consistent field validation:
- `zodMinMaxString()`: String length validation with custom messages
- `zodMaxString()`: Max length with optional/required handling
- `zodDecimal()`: Currency/numeric values with 2-decimal precision
- `zodYear()`: 4-digit year validation with range checks
- `zodDateString()`: Date parsing with null handling
- `zodNullableUUID()`: Optional UUID validation

## Data Validation

### Constraint Sources
- Field limits from `SCHEMA_LIMITS` constants
- Enum values from `ENUMS` constants  
- Default values from `DEFAULTS` constants
- File upload constraints from `CONFIG` constants

### Error Handling
- Custom field-specific error messages via utility functions
- Client-side file validation helpers (photo-upload)
- Transform functions for data normalization (trim, null conversion)

## Domain Organization

### Core Entities
- **users.validation.ts**: User profiles, settings, sessions, activity tracking
- **collections.validation.ts**: Collections and subcollections
- **bobbleheads.validation.ts**: Main content entities with complex custom fields
- **tags.validation.ts**: Tagging system with color validation

### Supporting Systems  
- **social.validation.ts**: Comments, likes, follows with target type enums
- **photo-upload.validation.ts**: File validation with Cloudinary integration
- **analytics.validation.ts**: Content views and search query tracking
- **moderation.validation.ts**: Content reporting system
- **system.validation.ts**: Platform settings, notifications, featured content

## Important Notes

### Complex Schemas
- **Bobbleheads**: Most complex with custom fields, multiple photo types, and extensive metadata
- **Photo uploads**: Dual validation system (native File objects vs simplified file data)
- **System notifications**: Multiple enum types for notification categorization

### Type Exports
Each file exports comprehensive TypeScript types for all schema variants (Insert, Select, Update, Public) to maintain type safety across the application.

### Cloudinary Integration
Photo validation supports both native browser File objects and Cloudinary upload results with separate but parallel validation schemas.