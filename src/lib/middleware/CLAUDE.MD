# CLAUDE.MD - Middleware Directory

## Project Overview 

This is a Next.js application featuring middleware-based architecture for server actions with comprehensive monitoring,
authentication, and data handling capabilities. The project implements a robust middleware pipeline for handling
server-side operations with built-in security, rate limiting, database transactions, and observability features.

**Core Purpose**: Provide a secure, monitored, and scalable server action framework with authentication, sanitization,
and database transaction support.

**Key Features**:

- Server action middleware pipeline
- Sentry integration for monitoring and error tracking
- Authentication via Clerk
- Rate limiting with Redis
- Database transaction management
- Input sanitization and validation

## Architecture & Technology Stack

### Framework & Core Technologies

- **Next.js** with TypeScript
- **React Server Actions** via `next-safe-action`
- **Drizzle ORM** for database operations
- **PostgreSQL** via Neon provider

### Authentication & Security

- **Clerk** for authentication and user management
- **DOMPurify** (`isomorphic-dompurify`) for input sanitization
- Custom middleware for authorization and ownership verification

### Database & Caching

- **PostgreSQL** (Neon provider)
- **Redis** via Upstash for rate limiting and caching
- **Drizzle ORM** for type-safe database operations

### Monitoring & Observability

- **Sentry** (`@sentry/nextjs`) for error tracking, performance monitoring, and tracing
- Custom span creation for database and action monitoring
- Breadcrumb logging for action flow tracking

### Development Tools

- **TypeScript** for type safety
- **ESLint** and code quality tools

## Project Structure

```
src/
├── lib/
│   ├── middleware/          # Server action middleware pipeline
│   │   ├── auth.middleware.ts
│   │   ├── database.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── sanitization.middleware.ts
│   │   ├── sentry.middleware.ts
│   │   └── transaction.middleware.ts
│   ├── utils/
│   │   └── next-safe-action/ # Type definitions for action contexts
│   ├── constants/           # Application constants and configuration
│   └── db/                  # Database configuration and schema
```

### Key Directories

- **`lib/middleware/`**: Contains all middleware components for the server action pipeline
- **`lib/utils/next-safe-action/`**: Type definitions for action contexts and metadata
- **`lib/constants/`**: Centralized constants for Sentry tags, Redis keys, and error messages
- **`lib/db/`**: Database configuration, schema definitions, and connection setup

## Key Features & Functionality

### Middleware Pipeline

- **Authentication Middleware**: Clerk integration with automatic Sentry user context
- **Rate Limiting Middleware**: Configurable Redis-based rate limiting with custom key generators
- **Sanitization Middleware**: DOMPurify-based input sanitization for both auth and public contexts
- **Transaction Middleware**: Optional database transaction wrapping with Drizzle
- **Database Middleware**: Automatic database operation monitoring with Sentry spans
- **Sentry Middleware**: Comprehensive error tracking, performance monitoring, and span creation

### Security Features

- Input sanitization removing all HTML tags
- Rate limiting with configurable thresholds
- Authentication verification with database user lookup
- Context-aware middleware for public and authenticated actions

### Monitoring & Observability

- Automatic Sentry span creation for all actions and database operations
- Error tracking with full context and metadata
- Performance monitoring with custom attributes
- Breadcrumb logging for successful operations
- Input size monitoring for payload analysis

### Database Operations

- Transaction support with opt-in middleware
- Separate handling for public and authenticated database operations
- Error context enrichment for database failures
- PostgreSQL via Neon with Drizzle ORM

## Development Patterns & Conventions

### Middleware Architecture

```typescript
// Middleware composition pattern
const middleware = createMiddleware<{
  ctx: ContextType;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, metadata, next }) => {
  // Middleware logic
  return next({ ctx: { /* context */ } });
});
```

### Context Types

- **`AuthContext`**: For authenticated actions with user ID and Clerk ID
- **`PublicContext`**: For public actions without authentication
- **`TransactionContext`**: Includes database/transaction instances
- **`SanitizedContext`**: Contains sanitized input data

### Error Handling

- Custom `ActionError` class with structured error information
- Sentry integration for automatic error capturing
- HTTP status code mapping (e.g., 429 for rate limiting)
- Context preservation through error boundaries

### Rate Limiting Pattern

```typescript
// Configurable rate limiting
createRateLimitMiddleware(
  requests
:
number,
  windowInSeconds
:
number,
  keyGenerator ? : (ctx: ActionContext) => string
)
```

### Database Transaction Pattern

```typescript
// Conditional transaction wrapping
if (metadata?.isTransactionRequired) {
  return await db.transaction(async (tx) => {
    return await next({ ctx: { db: tx, tx } });
  });
}
```

## Environment & Configuration

### Required Environment Variables

```bash
# Clerk Authentication
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Sentry Monitoring
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Database (inferred from Neon usage)
DATABASE_URL=

# Environment Detection
NODE_ENV= # Used for production-specific Sentry breadcrumbs
```

### Configuration Constants

- **`SENTRY_TAGS`**: Action tracking and component identification
- **`SENTRY_CONTEXTS`**: Structured context data for monitoring
- **`SENTRY_OPERATIONS`**: Operation type definitions for spans
- **`REDIS_KEYS`**: Standardized Redis key patterns
- **`ERROR_MESSAGES`**: Centralized error message constants

## Current Development Stage

### Completed Features

- ✅ Complete middleware pipeline architecture
- ✅ Authentication integration with Clerk
- ✅ Rate limiting with Redis
- ✅ Input sanitization with DOMPurify
- ✅ Database transaction management
- ✅ Comprehensive Sentry monitoring and error tracking
- ✅ Type-safe context passing between middleware
- ✅ Separate handling for public and authenticated flows

### Architecture Strengths

- Modular middleware design for easy extension
- Comprehensive error handling and monitoring
- Type-safe context management
- Production-ready observability features
- Security-first approach with multiple layers of protection

### Development Focus Areas

The current implementation provides a solid foundation for server actions with enterprise-grade monitoring, security,
and reliability features. The middleware pipeline is designed for scalability and maintainability, with clear separation
of concerns and comprehensive type safety.