# Middleware Directory - CLAUDE.md

## Purpose
Contains middleware functions for next-safe-action server actions, providing authentication, authorization, database transaction management, input sanitization, rate limiting, and observability. These middleware compose into action client chains for different permission levels.

## Key Patterns

### Middleware Architecture
- **next-safe-action integration**: All middleware use `createMiddleware()` from next-safe-action
- **Context chaining**: Each middleware adds properties to context passed to `next()`
- **Type safety**: Strict TypeScript context types ensure compile-time safety
- **Error propagation**: Middleware throw errors that bubble up through the chain

### Action Client Chains
- **publicActionClient**: sanitization → transaction → database (no auth)
- **authActionClient**: auth → sanitization → transaction → database
- **adminActionClient**: admin → sanitization → transaction → database
- **Base client**: All chains start with `sentryMiddleware` for observability

## Authentication Patterns

### Auth Middleware (`auth.middleware.ts`)
- **Clerk integration**: Uses `auth()` from @clerk/nextjs/server for session verification
- **Database lookup**: Queries users table to get database user ID and profile
- **Context enhancement**: Adds `clerkUserId` and `userId` to context
- **Sentry user context**: Automatically sets Sentry user information

### Admin Middleware (`admin.middleware.ts`)
- **Role verification**: Checks user role is 'admin' or 'moderator'
- **Enhanced context**: Adds role information and permission booleans
- **Database dependency**: Requires users table with role column

## Security Middleware

### Sanitization (`sanitization.middleware.ts`)
- **DOMPurify integration**: Uses isomorphic-dompurify with no allowed tags
- **Recursive sanitization**: Handles nested objects and arrays
- **Dual variants**: Separate middleware for auth and public contexts
- **Context augmentation**: Adds `sanitizedInput` property

### Rate Limiting (`rate-limit.middleware.ts`)
- **Redis-based**: Uses Upstash Redis for distributed rate limiting
- **Factory pattern**: `createRateLimitMiddleware()` creates configured middleware
- **Sliding window**: Uses Redis INCR/EXPIRE for efficient rate limiting
- **Custom key generation**: Supports custom key generators for different rate limit scopes

## Database Integration

### Transaction Middleware (`transaction.middleware.ts`)
- **Conditional transactions**: Only wraps in transaction when `metadata.isTransactionRequired: true`
- **Database context**: Passes either transaction or regular db instance
- **Dual variants**: Separate middleware for auth and public contexts
- **Type safety**: Uses DatabaseExecutor type for db/transaction compatibility

### Database Middleware (`database.middleware.ts`)
- **Sentry spans**: Wraps database operations in performance tracking spans
- **PostgreSQL metadata**: Adds database provider and ORM information to spans
- **Error context**: Enriches database errors with operation metadata
- **Dual variants**: Separate tracking for auth and public database operations

## Observability

### Sentry Middleware (`sentry.middleware.ts`)
- **Comprehensive tracking**: Action-level spans with detailed metadata
- **Error capturing**: Automatic exception capture with context
- **Input monitoring**: Tracks payload sizes for performance insights
- **Production breadcrumbs**: Detailed logging in production environment

## Error Handling Conventions
- **ActionError throwing**: Most middleware throw ActionError with specific error types
- **HTTP status codes**: Rate limit middleware returns 429, auth failures return 401/403
- **Context preservation**: Error messages include operation metadata
- **Span status**: Database and Sentry middleware mark spans with success/failure status

## Dependencies
- **Core**: next-safe-action, @clerk/nextjs/server, @sentry/nextjs
- **Database**: drizzle-orm for queries, Neon PostgreSQL
- **Caching**: @upstash/redis/node for rate limiting
- **Sanitization**: isomorphic-dompurify for XSS prevention

## Important Notes
- **Middleware order matters**: Auth must come before sanitization, sanitization before transaction
- **Public vs. auth chains**: Public actions skip authentication but still get sanitization and database middleware
- **Rate limiting is opt-in**: Must explicitly use `createRateLimitMiddleware()` in action definitions
- **Transaction metadata**: Set `isTransactionRequired: true` in action metadata to enable automatic transaction wrapping
- **Redis configuration**: Rate limiting requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables