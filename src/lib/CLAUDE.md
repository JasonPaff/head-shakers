# Core Business Logic (`src/lib/`)

This directory contains the core business logic and infrastructure for the Head Shakers application. It's organized into distinct layers that handle data operations, external service integrations, validation, utilities, and middleware.

## Directory Structure

```
lib/
├── actions/          # Server actions (Next Safe Action-based)
├── constants/        # Application constants and configuration
├── db/               # Database schema, migrations, and utilities  
├── middleware/       # Server action middleware
├── queries/          # Database query functions
├── services/         # External service integrations
├── utils/            # Core utility functions
└── validations/      # Zod validation schemas
```

## Key Architecture Patterns

### 1. Server Actions with Next Safe Action
All server-side operations use the Next Safe Action pattern for type safety and middleware composition:

```typescript
// Example pattern used throughout actions/
import { authActionClient } from '@/lib/utils/next-safe-action'
import { insertBobbleheadSchema } from '@/lib/validations/bobbleheads.validation'

export const createBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(insertBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    // Type-safe server action logic with full context
  })
```

### 2. Database Operations
- **Drizzle ORM** for type-safe database operations with PostgreSQL
- **Neon Database** for production reliability
- **Comprehensive schema** with proper indexing and constraints
- **Migration management** with Drizzle Kit

### 3. Middleware Architecture
Composable middleware stack for server actions:
- **Authentication** - Clerk integration with user context
- **Sanitization** - Input sanitization with DOMPurify
- **Transaction** - Database transaction management
- **Database** - Database context and monitoring
- **Rate Limiting** - Redis-based rate limiting
- **Sentry** - Error tracking and performance monitoring

### 4. Constants Management
Centralized constants for consistency:
- **Action Names** - Standardized action identifiers
- **Configuration** - Environment-specific settings
- **Defaults** - Default values for entities
- **Enums** - Type-safe enumeration values
- **Error Messages** - Consistent error messaging
- **Redis Keys** - Cache key patterns
- **Schema Limits** - Database field constraints
- **Sentry** - Monitoring configuration

## Core Components

### Actions Layer (`actions/`)
Server actions organized by domain with comprehensive middleware:

- `analytics.actions.ts` - Analytics and metrics tracking
- `bobbleheads.actions.ts` - Bobblehead CRUD operations
- `collections.actions.ts` - Collection management
- `moderation.actions.ts` - Content moderation
- `social.actions.ts` - Social features (likes, follows, comments)
- `system.actions.ts` - System-level operations
- `tags.actions.ts` - Tag management
- `users.actions.ts` - User profile operations

**Key Features:**
- **Type-safe inputs/outputs** with Zod validation
- **Authentication middleware** with Clerk integration
- **Transaction support** for data consistency
- **Error handling** with structured error types
- **Sentry integration** for monitoring
- **Rate limiting** for abuse prevention

### Constants Layer (`constants/`)
Centralized configuration and constants:

```
constants/
├── action-names.ts    # Server action identifiers
├── config.ts          # Application configuration
├── defaults.ts        # Default entity values
├── enums.ts           # Type-safe enumerations
├── error-messages.ts  # Standardized error messages
├── redis-keys.ts      # Cache key patterns
├── schema-limits.ts   # Database field constraints
├── sentry.ts          # Monitoring configuration
└── index.ts           # Consolidated exports
```

### Database Layer (`db/`)
Comprehensive database architecture with PostgreSQL:

```
db/
├── index.ts                   # Database connection and config
├── migrations/                # Database migration files
├── scripts/                   # Database utilities
│   ├── reset-db.ts            # Database reset utility
│   └── seed.ts                # Development seed data
└── schema/                    # Drizzle schema definitions
    ├── analytics.schema.ts    # Analytics and tracking
    ├── bobbleheads.schema.ts  # Core bobblehead entities
    ├── collections.schema.ts  # Collection structures
    ├── moderation.schema.ts   # Content moderation
    ├── relations.schema.ts    # Table relationships
    ├── social.schema.ts       # Social features
    ├── system.schema.ts       # System configuration
    ├── tags.schema.ts         # Tagging system
    ├── users.schema.ts        # User profiles and settings
    └── index.ts               # Schema exports
```

**Schema Features:**
- **Comprehensive indexing** for query performance
- **Soft deletes** with `deletedAt` timestamps
- **Audit trails** with created/updated timestamps
- **Foreign key constraints** with proper cascade behavior
- **JSONB fields** for flexible custom data
- **Check constraints** for data integrity
- **Enum types** for controlled vocabularies

### Middleware Layer (`middleware/`)
Composable middleware for server actions:

- `auth.middleware.ts` - Authentication with Clerk
- `database.middleware.ts` - Database context and monitoring
- `rate-limit.middleware.ts` - Redis-based rate limiting
- `sanitization.middleware.ts` - Input sanitization
- `sentry.middleware.ts` - Error tracking and performance
- `transaction.middleware.ts` - Database transaction management

### Query Layer (`queries/`)
Reusable database query functions organized by domain:
- **Type-safe queries** with Drizzle ORM
- **Complex joins** and aggregations
- **Pagination utilities** for large datasets
- **Performance optimizations** with proper indexing

### Services Layer (`services/`)
External service integrations:

- `ably.ts` - Real-time messaging and updates
- `bobbleheads.service.ts` - Business logic for bobbleheads
- `cloudinary.ts` - Image management and optimization
- `redis.ts` - Caching and session storage
- `resend.ts` - Email notifications

### Utilities Layer (`utils/`)
Core utility functions and helpers:

- `action-error-handler.ts` - Comprehensive error handling
- `cache.ts` - Redis caching utilities
- `errors.ts` - Error classification and types
- `next-safe-action.ts` - Server action client configuration
- `query-optimization.ts` - Database query helpers

### Validations Layer (`validations/`)
Comprehensive Zod schemas for all data structures:

- `analytics.validation.ts` - Analytics data validation
- `bobbleheads.validation.ts` - Bobblehead entity validation
- `collections.validation.ts` - Collection validation
- `moderation.validation.ts` - Content moderation validation
- `social.validation.ts` - Social feature validation
- `system.validation.ts` - System configuration validation
- `tags.validation.ts` - Tag validation
- `users.validation.ts` - User profile validation

## Advanced Features

### Error Handling System
Comprehensive error classification and handling:

```typescript
// Structured error types with context
export class ActionError extends Error {
  constructor(
    public readonly type: ErrorType,
    public readonly code: string,
    message?: string,
    public readonly context?: Record<string, unknown>,
    public readonly isRecoverable: boolean = false,
    public readonly statusCode: number = 400,
    public readonly originalError?: Error,
  ) {
    super(message || code);
  }
}
```

### Middleware Composition
Flexible middleware stack for server actions:

```typescript
export const authActionClient = actionClient
  .use(authMiddleware)           // Authentication
  .use(sanitizationMiddleware)   // Input sanitization
  .use(transactionMiddleware)    // Database transactions
  .use(databaseMiddleware);      // Database monitoring
```

### Type Safety
End-to-end type safety from database to client:
- **Database schema** generates TypeScript types
- **Zod validation** ensures runtime type safety
- **Server actions** provide typed inputs/outputs
- **Error handling** with structured error types

### Performance Optimization
- **Database indexing** for query performance
- **Connection pooling** for concurrent access
- **Redis caching** for expensive operations
- **Query optimization** utilities
- **Sentry monitoring** for performance tracking

### Security Features
- **Input sanitization** with DOMPurify
- **Authentication** required for sensitive operations
- **Rate limiting** with Redis
- **Permission checks** in server actions
- **SQL injection prevention** with Drizzle ORM

## Development Workflow

### Adding New Features
1. **Define constants** in appropriate constant files
2. **Create Zod validation schemas** for data structures
3. **Update database schema** if needed and generate migrations
4. **Implement query functions** for data access
5. **Create server actions** with proper middleware
6. **Add external service integration** if required
7. **Update error handling** for new error cases

### Database Management
```bash
# Generate migration from schema changes
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Reset development database
npm run db:reset

# Seed development data
npm run db:seed
```

### Error Handling Best Practices
- Use **structured error types** for consistent handling
- Provide **user-friendly error messages**
- Log **detailed errors** for debugging with Sentry
- Implement **retry logic** for recoverable errors

### Performance Guidelines
- Use **appropriate database indexes** for queries
- Implement **caching** for expensive operations
- Use **transactions** for data consistency
- Monitor **performance** with Sentry

This architecture provides a robust, type-safe, and scalable foundation for the Head Shakers bobblehead collection platform with comprehensive error handling, monitoring, and security features.
