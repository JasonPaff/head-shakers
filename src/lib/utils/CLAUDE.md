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

## Caching Strategy
- **Dual caching**: Both Redis (via Upstash) and Next.js cache integration
- **Cache invalidation**: Supports both key-based and tag-based invalidation across both systems
- **Performance monitoring**: Cache operations are tracked with hit/miss metrics
- **Error resilience**: Cache failures fallback gracefully without breaking operations

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
- **Cache keys**: Use consistent naming patterns like `featured-content:${type}` for cache keys
- **Service detection**: External service errors are automatically categorized by service name for better monitoring
- **PostgreSQL focus**: Database error handling is specifically designed for PostgreSQL error codes and patterns