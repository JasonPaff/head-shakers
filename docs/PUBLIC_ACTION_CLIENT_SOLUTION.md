# Public Action Client TypeScript Solution

## Overview

This solution creates a `publicActionClient` that works alongside the existing `authActionClient` with proper TypeScript context chaining and type safety. The key innovation is creating separate context type chains for authenticated and public actions.

## Architecture

### Context Type Hierarchy

```typescript
// Authenticated Action Chain
Record<string, never>  // Base actionClient context
  ↓ authMiddleware
AuthContext           // { clerkUserId: string; userId: string }
  ↓ sanitizationMiddleware  
SanitizedContext      // extends AuthContext + { sanitizedInput: unknown }
  ↓ transactionMiddleware
TransactionContext    // extends SanitizedContext + { db: DatabaseExecutor; tx?: DatabaseExecutor }
  ↓ databaseMiddleware
TransactionContext    // Final context for authenticated actions

// Public Action Chain
Record<string, never>  // Base actionClient context
  ↓ publicSanitizationMiddleware
PublicContext         // {} (empty base context, no auth)
  ↓ PublicSanitizedContext
PublicSanitizedContext // extends PublicContext + { sanitizedInput: unknown }
  ↓ publicTransactionMiddleware
PublicTransactionContext // extends PublicSanitizedContext + { db: DatabaseExecutor; tx?: DatabaseExecutor }
  ↓ publicDatabaseMiddleware
PublicTransactionContext // Final context for public actions
```

## Type Definitions

### Core Context Types

```typescript
// Base context for public actions (no auth required)
export interface PublicContext {}

// Context after sanitization middleware (public chain)
export interface PublicSanitizedContext extends PublicContext {
  sanitizedInput: unknown;
}

// Context after transaction middleware (public chain)
export interface PublicTransactionContext extends PublicSanitizedContext {
  db: DatabaseExecutor;
  tx?: DatabaseExecutor;
}

// Type aliases for final contexts
export type ActionContext = TransactionContext;        // Authenticated
export type PublicActionContext = PublicTransactionContext; // Public
```

## Middleware Implementation

### Public Sanitization Middleware

```typescript
export const publicSanitizationMiddleware = createMiddleware<{
  ctx: PublicContext;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, next }) => {
  // Same sanitization logic as auth middleware
  const sanitizeValue = (value: unknown): unknown => {
    // Sanitization implementation...
  };

  return next({
    ctx: {
      sanitizedInput: sanitizeValue(clientInput),
    },
  });
});
```

### Public Transaction Middleware

```typescript
export const publicTransactionMiddleware = createMiddleware<{
  ctx: PublicSanitizedContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  // Same transaction logic as auth middleware
  if (metadata?.isTransactionRequired) {
    return await db.transaction(async (tx) => {
      return await next({
        ctx: {
          db: tx,
          tx,
        },
      });
    });
  }

  return await next({
    ctx: {
      db,
    },
  });
});
```

### Public Database Middleware

```typescript
export const publicDatabaseMiddleware = createMiddleware<{
  ctx: PublicTransactionContext;
  metadata: ActionMetadata;
}>().define(async ({ metadata, next }) => {
  // Same Sentry tracking with public action indicators
  return await Sentry.startSpan(
    {
      attributes: {
        'action.name': metadata?.actionName,
        'action.type': 'public', // Distinguishes from auth actions
        'db.name': 'neon',
        'db.system': 'postgresql',
      },
      name: `db_public_${metadata?.actionName || 'unknown'}`,
      op: SENTRY_OPERATIONS.DATABASE_ACTION,
    },
    async (span) => {
      // Implementation with public-specific context...
    }
  );
});
```

## Action Client Creation

```typescript
// Base client with Sentry middleware
export const actionClient = createSafeActionClient({
  // Error handling configuration...
}).use(sentryMiddleware);

// Authenticated action client
export const authActionClient = actionClient
  .use(authMiddleware)
  .use(sanitizationMiddleware)
  .use(transactionMiddleware)
  .use(databaseMiddleware);

// Public action client (skips authentication)
export const publicActionClient = actionClient
  .use(publicSanitizationMiddleware)
  .use(publicTransactionMiddleware)
  .use(publicDatabaseMiddleware);
```

## Usage Examples

### Authenticated Action

```typescript
export const createUserPost = authActionClient
  .metadata({ actionName: 'createUserPost', isTransactionRequired: true })
  .schema(postSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx has full typing: clerkUserId, userId, sanitizedInput, db, tx?
    const { userId, clerkUserId, sanitizedInput, db, tx } = ctx;
    const executor = tx || db;
    
    // Authenticated database operations...
    return { success: true };
  });
```

### Public Action

```typescript
export const submitContactForm = publicActionClient
  .metadata({ actionName: 'submitContactForm', isTransactionRequired: false })
  .schema(contactSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx has public typing: sanitizedInput, db (no user context)
    const { sanitizedInput, db } = ctx;
    
    // Public database operations...
    return { success: true };
  });
```

### Public Action with Transaction

```typescript
export const publicDataOperation = publicActionClient
  .metadata({ actionName: 'publicDataOperation', isTransactionRequired: true })
  .schema(dataSchema)
  .action(async ({ parsedInput, ctx }) => {
    // ctx has public typing with transaction: sanitizedInput, db, tx?
    const { sanitizedInput, db, tx } = ctx;
    const executor = tx || db;
    
    // Transactional public operations...
    return { success: true };
  });
```

## Benefits

1. **Type Safety**: Full TypeScript support with proper context inference
2. **Code Reuse**: Shared sanitization and database logic between auth and public chains
3. **Separation of Concerns**: Clear distinction between authenticated and public actions
4. **Monitoring**: Sentry integration with action type distinction
5. **Flexibility**: Same transaction and database patterns for both action types
6. **Maintainability**: Consistent middleware patterns across both chains

## Key Design Decisions

1. **Separate Context Chains**: Instead of making auth context optional, we created entirely separate type chains to ensure type safety and prevent runtime errors.

2. **Middleware Duplication**: While there's some code duplication in middleware, this ensures proper typing and allows for future customization of public vs. authenticated behavior.

3. **Empty PublicContext**: The base `PublicContext` is intentionally empty, providing a clean starting point for the public chain without auth-related properties.

4. **Consistent API**: Both action clients use the same patterns, making it easy for developers to switch between authenticated and public actions.

This solution provides robust type safety while maintaining the flexibility and patterns established in the existing codebase.