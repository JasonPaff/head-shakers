# Services - CLAUDE.md

## Purpose
The services layer provides business logic abstractions over database queries and external service integrations. Services act as the main interface between actions/API routes and the data layer, encapsulating complex operations and maintaining transaction boundaries.

## Key Patterns
- **Static class methods**: All services use static methods for stateless operations
- **Database injection**: Every method accepts an optional `DatabaseExecutor` parameter for transaction support
- **Query abstraction**: Services delegate to queries directory for database operations
- **Null-safe returns**: Most methods return `result?.[0] || null` for single items
- **User authorization**: Methods include userId parameters for ownership validation

## Dependencies
- **Database layer**: All services import from `@/lib/db` and use `DatabaseExecutor` type
- **Query layer**: Services import specific query functions from `@/lib/queries/*`
- **Validation schemas**: Import validated types from `@/lib/validations/*`
- **External services**: Cloudinary SDK v2, Upstash Redis for caching

## Service Categories

### Domain Services
- **BobbleheadService**: CRUD operations for bobblehead entities with photo/tag management
- **CollectionService**: User collection management (currently minimal)

### Infrastructure Services  
- **CacheService**: Redis-based caching with TTL, tagging, and namespace support
- **CloudinaryService**: Image upload, optimization, and management with two implementations

## Transaction Support
- All service methods accept optional `dbInstance: DatabaseExecutor` parameter
- Enables services to participate in transactions from actions layer
- Defaults to global `db` instance when not provided
- Critical for maintaining data consistency across multi-table operations

## Error Handling
- Services rely on underlying query layer for error handling
- Cloudinary services include custom `CloudinaryError` class extending `ActionError`
- Cache service includes graceful degradation (returns null/defaults on Redis failures)

## Cloudinary Integration Notes
- **Two implementations**: `cloudinary.ts` (comprehensive) and `cloudinary.service.ts` (utility methods)
- **Upload flow**: File validation → Buffer conversion → Cloudinary upload → Metadata extraction
- **Image management**: Supports temp folder cleanup, permanent folder moves, optimized URLs
- **Responsive URLs**: Generates thumbnail, medium, large, and original variants

## Cache Service Features
- **Tag-based invalidation**: Associate cache entries with tags for bulk invalidation
- **Namespace support**: Organize cache keys with namespace prefixes
- **Graceful degradation**: Operates normally when Redis is unavailable
- **Compression and versioning**: Built-in support for data versioning and compression flags

## Important Notes
- Services are the primary entry point for business operations - prefer these over direct query calls
- Always pass through userId for ownership validation and multi-tenancy
- Use transaction-capable database instances for operations spanning multiple entities
- Cloudinary operations require proper environment configuration (`CLOUDINARY_*` vars)
- Cache service automatically handles Redis connection failures without breaking application flow