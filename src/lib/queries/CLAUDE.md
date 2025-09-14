# Database Queries - CLAUDE.md

## Purpose

Contains database query functions for the Head Shakers bobblehead collection application, organized by domain entities (bobbleheads, collections, users, featured content).

## Key Patterns

- **Function Naming**: All functions end with `Async` suffix
- **Caching Strategy**: React `cache()` for deduplication, Next.js `unstable_cache()` for persistence
- **Database Abstraction**: Optional `dbInstance` parameter (defaults to main `db`) for testing/transactions
- **Public/Private Separation**: Separate functions for public vs authenticated access
- **Soft Deletes**: Uses `isDeleted` flag instead of hard deletes
- **Permission Filtering**: Public queries filter by `isPublic` flag and ownership

## Dependencies

- **Database**: Drizzle ORM with PostgreSQL schema
- **Caching**: React cache + Next.js unstable_cache + custom cache service
- **Validation**: TypeScript types from validation schemas
- **Constants**: Cache keys, tags, and revalidation tags

## Query Patterns

### Standard CRUD Operations

```typescript
// Create with user ownership
createEntityAsync(data: InsertEntity, userId: string, dbInstance = db)

// Read with optional viewer context
getEntityByIdAsync(id: string, viewerUserId?: string, dbInstance = db)

// Update with ownership validation
updateEntityAsync(id: string, data: UpdateEntity, userId: string, dbInstance = db)

// Soft delete with ownership validation
deleteEntityAsync(id: string, userId: string, dbInstance = db)
```

### Public Access Patterns

- Functions ending with `ForPublicAsync` filter by public visibility
- Include viewer context for ownership-based access
- Always exclude soft-deleted records
- Collections must be public unless viewer is owner

### Search and Filtering

- `searchBobbleheadsAsync` supports full-text search across multiple fields
- Uses `like` with escaped search terms
- Supports complex filter objects with optional parameters
- Includes pagination via limit/offset

## Caching Strategy

### Three-Tier Caching

1. **React cache()**: Request-level deduplication
2. **Next.js unstable_cache()**: Persistent caching with revalidation
3. **Custom cache service**: Redis-backed with tags and TTL

### Cache Invalidation

- Uses revalidation tags from `@/lib/constants/tags`
- Featured content has sophisticated cache warming and invalidation
- View count updates trigger selective cache invalidation

## Type Exports

Functions export their return types for use across the application:

```typescript
export type GetBobbleheadById = Awaited<ReturnType<typeof getBobbleheadByIdAsync>>;
```

## Directory Structure

- **Root level**: Core entity queries (bobbleheads, collections, users, featured-content)
- **admin/**: Admin-specific queries with extended data
- **cached/**: Alternative caching implementations using custom cache service

## Important Notes

- **Permission Model**: Owner-based with public visibility flags
- **Hierarchical Data**: Collections contain subcollections contain bobbleheads
- **Photo Management**: Separate photo queries with sort ordering
- **Tag System**: Many-to-many relationship with dedicated junction table operations
- **Featured Content**: Complex queries with date-based filtering and multiple content types
- **Search Escaping**: SQL injection protection via escaped search terms
- **Database Injection**: All functions accept optional `dbInstance` for testability and transactions
