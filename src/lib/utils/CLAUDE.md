# Utils Directory - CLAUDE.md

## Purpose

Contains core utility functions for server actions, error handling, caching, authentication, and validation. This directory provides the foundational infrastructure for the application's backend operations.

## Key Patterns

### Error Handling System

- **ActionError class**: Structured error class with type classification, HTTP status codes, and recovery information
- **Error classification**: Uses `ErrorType` enum (AUTHORIZATION, BUSINESS_RULE, DATABASE, EXTERNAL_SERVICE, INTERNAL, NOT_FOUND, RATE_LIMIT, VALIDATION)
- **Database error detection**: Comprehensive PostgreSQL error code mapping and classification
- **Sentry integration**: All errors are automatically captured with contextual metadata

### Server Action Architecture

- **next-safe-action integration**: Three action client types - `publicActionClient`, `authActionClient`, `adminActionClient`
- **Middleware chain**: Consistent pipeline of authentication → sanitization → transaction → database middleware
- **Context types**: Typed contexts passed through middleware chain (PublicActionContext, ActionContext, AdminActionContext)
- **Transaction support**: Automatic database transaction wrapping when `isTransactionRequired: true`

### Authentication & Authorization

- **Role-based permissions**: Three-tier system (user → moderator → admin) with numeric hierarchy
- **Clerk integration**: All auth utilities use Clerk's `auth()` for session management
- **Database lookup**: Role checks require database queries to users table
- **Helper functions**: Provides both check functions (`checkIsAdmin`) and requirement functions (`requireAdmin`)

## Authentication Patterns

- **Context enrichment**: Auth middleware adds `clerkUserId`, `userId` to action context
- **Role hierarchy**: Uses numeric values (admin: 3, moderator: 2, user: 1) for permission comparisons
- **Error handling**: Auth failures throw structured ActionError with appropriate HTTP status codes

## Error Handling Conventions

- **Comprehensive classification**: Database errors are detected by PostgreSQL error codes and message patterns
- **Retry logic**: Errors marked as `isRecoverable` for transient failures (connections, deadlocks, timeouts)
- **Service identification**: External service errors auto-detect service names (Cloudinary, Clerk, Redis, etc.)
- **Validation errors**: Zod validation errors are transformed into structured ActionError format

## Enterprise Cache Management System

### Core Cache Utilities

- **Cache Key Generation**: `createCacheKey()` function with automatic length validation and truncation
- **Secure Hashing**: `createHashFromObject()` using collision-resistant djb2-variant algorithm
- **Key Sanitization**: `sanitizeCacheKey()` for safe cache key formatting
- **Object Normalization**: Deterministic object serialization for consistent cache keys

### Cache Tag Management

- **Type-Safe Tags**: Strict TypeScript unions for entity types (`CacheEntityType`, `CacheFeatureType`, etc.)
- **CacheTagBuilder**: Fluent builder pattern with memory leak protection (50 tag limit)
- **Smart Generators**: Pre-built tag generators for common scenarios (bobbleheads, collections, users)
- **Hierarchical Tags**: Entity-based, feature-based, and relationship-based tag organization

### Cache Tag Patterns

- **Entity Tags**: `bobblehead:${id}`, `collection:${id}`, `user:${id}`
- **Feature Tags**: `featured-content`, `popular-content`, `public-content`
- **Relationship Tags**: `user-bobbleheads:${userId}`, `collection-bobbleheads:${collectionId}`
- **Aggregate Tags**: `global-stats`, `trending`, `user-stats:${userId}`

### Memory Management

- **Tag Limits**: Maximum 50 tags per builder instance to prevent memory leaks
- **Builder Reset**: `reset()` method for builder reuse and memory cleanup
- **Length Validation**: Cache keys auto-truncated at 250 characters with hash suffixes
- **Resource Protection**: Hard limits and validation throughout the system

## Performance Monitoring

- **PerformanceMonitor class**: Tracks operation duration, memory usage, and metadata
- **Sentry integration**: Slow operations (>1s) automatically reported to Sentry
- **Specialized monitoring**: Dedicated functions for cache operations and database queries
- **Diagnostic tools**: Built-in cache performance diagnostics with hit rates and error tracking

## Validation Utilities

- **Custom Zod schemas**: Pre-built schemas for common patterns (dates, decimals, UUIDs, years)
- **Regex patterns**: Standardized patterns for decimal validation, years, UUIDs
- **Transformation**: Schemas automatically transform string inputs to appropriate types
- **Nullable support**: Consistent patterns for optional/nullable field handling

## Database Utilities

- **Query optimization**: Simple pagination utility for Drizzle ORM queries
- **Transaction context**: Database executor type that works with both direct DB and transaction contexts

## Important Notes

- **Error security**: Action error handler strips sensitive input data from logs while preserving structure
- **Memory monitoring**: Performance utilities include Node.js memory usage tracking
- **Cache Security**: Secure hash functions replace unsafe btoa() with collision-resistant algorithms
- **Environment Safety**: Environment validation with safe fallbacks to production configuration
- **Service detection**: External service errors are automatically categorized by service name for better monitoring
- **PostgreSQL focus**: Database error handling is specifically designed for PostgreSQL error codes and patterns
- **Cache Key Patterns**: Use `CACHE_KEYS` builders for consistent naming: `CACHE_KEYS.BOBBLEHEADS.BY_ID(id)`
- **Tag Generation**: Use `CacheTagGenerators` for type-safe, validated tag creation
- **Memory Protection**: All cache builders include automatic memory leak prevention
