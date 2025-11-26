# Sentry Monitoring Conventions

## Overview

Head Shakers uses Sentry for error tracking, performance monitoring, and debugging. Sentry integration is used across server actions, middleware, facades, error boundaries, and utility functions with consistent patterns for context, breadcrumbs, and error capture.

## Required Imports

```typescript
import * as Sentry from '@sentry/nextjs';

import {
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
  SENTRY_OPERATIONS,
  SENTRY_TAGS,
} from '@/lib/constants';
```

## Constants Reference

All Sentry values use centralized constants from `src/lib/constants/sentry.ts`:

### SENTRY_TAGS

```typescript
export const SENTRY_TAGS = {
  ACTION: 'action',
  BOBBLEHEAD_ID: 'bobblehead_id',
  COLLECTION_ID: 'collection_id',
  COMPONENT: 'component',
  ERROR_TYPE: 'error_type',
  FEATURE: 'feature',
  OPERATION: 'operation',
  USER_ID: 'user_id',
} as const;
```

### SENTRY_CONTEXTS

```typescript
export const SENTRY_CONTEXTS = {
  ACTION_METADATA: 'action_metadata',
  AGGREGATE_DATA: 'aggregate_data',
  BATCH_VIEW_DATA: 'batch_view_data',
  BOBBLEHEAD_DATA: 'bobblehead_data',
  COLLECTION_DATA: 'collection_data',
  COMMENT_DATA: 'comment_data',
  CONTENT_REPORT: 'content_report',
  DATABASE: 'database',
  DATABASE_ERROR: 'database_error',
  ERROR_DETAILS: 'error_details',
  EXTERNAL_SERVICE: 'external_service',
  FEATURED_CONTENT_DATA: 'featured_content_data',
  INPUT_INFO: 'input_info',
  LIKE_DATA: 'like_data',
  PERFORMANCE: 'performance',
  SEARCH_DATA: 'search_data',
  SUBCOLLECTION_DATA: 'subcollection_data',
  TAG_DATA: 'tag_data',
  USER_DATA: 'user_data',
  VIEW_DATA: 'view_data',
} as const;
```

### SENTRY_OPERATIONS

```typescript
export const SENTRY_OPERATIONS = {
  CACHE_OPERATION: 'cache.operation',
  DATABASE_ACTION: 'db.action',
  DATABASE_QUERY: 'db.query',
  EMAIL_SEND: 'email.send',
  EXTERNAL_API: 'external.api',
  FILE_UPLOAD: 'file.upload',
  SERVER_ACTION: 'server_action',
} as const;
```

### SENTRY_LEVELS

```typescript
export const SENTRY_LEVELS = {
  DEBUG: 'debug',
  ERROR: 'error',
  FATAL: 'fatal',
  INFO: 'info',
  WARNING: 'warning',
} as const;
```

### SENTRY_BREADCRUMB_CATEGORIES

```typescript
export const SENTRY_BREADCRUMB_CATEGORIES = {
  ACTION: 'action',
  AUTH: 'auth',
  BUSINESS_LOGIC: 'business_logic',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  NAVIGATION: 'navigation',
  USER_INTERACTION: 'user_interaction',
  VALIDATION: 'validation',
} as const;
```

## Server Action Pattern

Complete pattern for server actions with Sentry:

```typescript
export const toggleLikeAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
    isTransactionRequired: true,
  })
  .inputSchema(toggleLikeSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = toggleLikeSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    // 1. Set context at start
    Sentry.setContext(SENTRY_CONTEXTS.LIKE_DATA, {
      targetId: data.targetId,
      targetType: data.targetType,
      userId: ctx.userId,
    });

    try {
      const result = await SocialFacade.toggleLike(data.targetId, data.targetType, ctx.userId, dbInstance);

      if (!result.isSuccessful) {
        throw new ActionError(/* ... */);
      }

      const actionType = result.isLiked ? 'liked' : 'unliked';

      // 2. Add breadcrumb on success
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actionType,
          likeCount: result.likeCount,
          targetId: data.targetId,
          targetType: data.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User ${actionType} ${data.targetType} ${data.targetId}`,
      });

      // 3. Handle non-critical failures with warnings
      const revalidationResult = CacheRevalidationService.social.onLikeChange(/* ... */);
      if (!revalidationResult.isSuccess) {
        Sentry.captureException(new Error('Cache invalidation failed for like action'), {
          extra: {
            entityId: data.targetId,
            entityType: data.targetType,
            error: revalidationResult.error,
            operation: actionType,
            tagsAttempted: revalidationResult.tagsInvalidated,
            userId: ctx.userId,
          },
          level: 'warning',
        });
      }

      return { success: true, data: result, message: 'Success' };
    } catch (error) {
      // 4. Handle errors (propagates to Sentry automatically)
      handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.SOCIAL.LIKE },
        operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
        userId: ctx.userId,
      });
    }
  });
```

## Setting Context

Set context at the **start** of server actions to provide debugging information:

```typescript
Sentry.setContext(SENTRY_CONTEXTS.COMMENT_DATA, {
  parentCommentId: data.parentCommentId,
  targetId: data.targetId,
  targetType: data.targetType,
  userId: ctx.userId,
});
```

### Context Data Guidelines

| Context Type | Include                | Exclude      |
| ------------ | ---------------------- | ------------ |
| Entity Data  | IDs, types, counts     | Content, PII |
| User Context | userId, role           | Email, name  |
| Request Data | Action name, operation | Full input   |

```typescript
// GOOD - Include identifiers only
Sentry.setContext(SENTRY_CONTEXTS.LIKE_DATA, {
  targetId: data.targetId,
  targetType: data.targetType,
  userId: ctx.userId,
});

// BAD - Don't include content or PII
Sentry.setContext('comment', {
  content: data.content, // Don't include content
  email: user.email, // Don't include PII
});
```

## Adding Breadcrumbs

Add breadcrumbs **after successful operations** to create an audit trail:

```typescript
Sentry.addBreadcrumb({
  category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
  data: {
    actionType: 'created',
    commentId: result.comment?.id,
    isReply: Boolean(data.parentCommentId),
    targetId: data.targetId,
    targetType: data.targetType,
  },
  level: SENTRY_LEVELS.INFO,
  message: `User created comment on ${data.targetType} ${data.targetId}`,
});
```

### Breadcrumb Categories

| Category           | Use Case                        |
| ------------------ | ------------------------------- |
| `ACTION`           | Server action execution         |
| `BUSINESS_LOGIC`   | Core operations (CRUD, toggles) |
| `DATABASE`         | Database operations             |
| `AUTH`             | Authentication events           |
| `EXTERNAL_SERVICE` | Third-party API calls           |
| `NAVIGATION`       | Route changes                   |
| `USER_INTERACTION` | User-initiated actions          |
| `VALIDATION`       | Input validation                |

### Breadcrumb Levels

| Level     | Use Case                |
| --------- | ----------------------- |
| `INFO`    | Successful operations   |
| `WARNING` | Non-critical issues     |
| `ERROR`   | Caught errors           |
| `DEBUG`   | Detailed debugging info |

## Capturing Exceptions

### Non-Critical Issues (Warnings)

Use for failures that shouldn't fail the main operation:

```typescript
// Cache invalidation failures - don't fail the request
if (!revalidationResult.isSuccess) {
  Sentry.captureException(new Error('Cache invalidation failed for like action'), {
    extra: {
      entityId: data.targetId,
      entityType: data.targetType,
      error: revalidationResult.error,
      operation: actionType,
      tagsAttempted: revalidationResult.tagsInvalidated,
      userId: ctx.userId,
    },
    level: 'warning',
  });
}
```

### Facade Non-Blocking Operations

```typescript
// In facades - non-blocking Cloudinary cleanup
try {
  const deletionResults = await CloudinaryService.deletePhotosByUrls(photoUrls);
  const failedDeletions = deletionResults.filter((result) => !result.success);

  if (failedDeletions.length > 0) {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      data: { bobbleheadId: bobblehead.id, count: failedDeletions.length, failures: failedDeletions },
      level: SENTRY_LEVELS.WARNING,
      message: `Failed to delete ${failedDeletions.length} photos from Cloudinary`,
    });
  }
} catch (error) {
  // Don't fail the entire operation if Cloudinary cleanup fails
  Sentry.captureException(error, {
    extra: { bobbleheadId: bobblehead.id, operation: 'cloudinary-cleanup' },
    level: 'warning',
  });
}
```

### Utility Function Pattern

```typescript
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator?.clipboard) {
      const error = new Error('Clipboard API not available');
      Sentry.captureException(error, {
        extra: { operation: 'copy-to-clipboard' },
        level: 'warning',
      });
      return false;
    }

    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    Sentry.captureException(error, {
      extra: { operation: 'copy-to-clipboard', textLength: text.length },
      level: 'warning',
    });
    return false;
  }
}
```

### Extra Data Guidelines

```typescript
Sentry.captureException(error, {
  extra: {
    // Identifiers
    entityId: 'id',
    entityType: 'type',
    userId: 'userId',

    // Operation context
    operation: 'operationName',
    actionType: 'create',

    // Error details
    error: error.message,
    errorCode: error.code,

    // State
    attemptedTags: ['tag1', 'tag2'],
    retryCount: 2,
  },
  level: 'warning', // or 'error', 'fatal'
  tags: {
    domain: 'social',
    feature: 'comments',
  },
});
```

## Error Levels

| Level     | Use Case              | Example                   |
| --------- | --------------------- | ------------------------- |
| `warning` | Non-critical failures | Cache invalidation failed |
| `error`   | Recoverable errors    | Business rule violation   |
| `fatal`   | Critical failures     | Database connection lost  |

## Middleware Integration

The action client uses Sentry middleware for automatic span tracking:

```typescript
// In src/lib/middleware/sentry.middleware.ts
export const sentryMiddleware = createMiddleware<{
  ctx: Record<string, never>;
  metadata: ActionMetadata;
}>().define(async ({ clientInput, metadata, next }) => {
  return Sentry.withScope(async (scope) => {
    // Set action context
    scope.setTag(SENTRY_TAGS.ACTION, metadata?.actionName || 'unknown');
    scope.setTag(SENTRY_TAGS.COMPONENT, SENTRY_OPERATIONS.SERVER_ACTION);
    scope.setContext(SENTRY_CONTEXTS.ACTION_METADATA, { ...metadata });

    // Add input size for monitoring
    if (clientInput) {
      scope.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
        hasInput: true,
        inputSize: JSON.stringify(clientInput).length,
      });
    }

    // Create performance span
    return await Sentry.startSpan(
      {
        attributes: {
          'action.component': SENTRY_OPERATIONS.SERVER_ACTION,
          'action.name': metadata?.actionName || 'unknown',
        },
        name: `action_${metadata?.actionName || 'unknown'}`,
        op: SENTRY_OPERATIONS.SERVER_ACTION,
      },
      async (span) => {
        try {
          const result = await next();
          span.setStatus({ code: 1, message: 'ok' });

          if (process.env.NODE_ENV === 'production') {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.ACTION,
              level: 'info',
              message: `Action ${metadata?.actionName} completed successfully`,
            });
          }

          return result;
        } catch (error) {
          span.setStatus({ code: 2, message: 'internal_error' });
          span.recordException(error as Error);

          Sentry.captureException(error, {
            extra: {
              inputSize: clientInput ? JSON.stringify(clientInput).length : 0,
              metadata,
            },
            tags: {
              [SENTRY_TAGS.ACTION]: metadata?.actionName,
              [SENTRY_TAGS.COMPONENT]: SENTRY_OPERATIONS.SERVER_ACTION,
            },
          });

          throw error;
        }
      },
    );
  });
});
```

## Error Boundary Pattern

For React error boundaries:

```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo.componentStack,
      },
    },
    extra: {
      componentStack: errorInfo.componentStack,
      errorBoundary: 'PhotoManagementErrorBoundary',
      errorMessage: error.message,
      errorName: error.name,
      errorStack: error.stack,
      errorType: this.getErrorType(error),
    },
    level: 'error',
    tags: {
      component: 'photo-management',
      errorBoundary: 'true',
    },
  });
}
```

### User Action Logging in Error Boundaries

```typescript
// Log when user chooses to continue without photos
Sentry.captureMessage('User continued editing without photos', {
  extra: {
    action: 'continue-without-photos',
    previousError: this.state.error?.message,
  },
  level: 'info',
});

// Log when user retries after error
Sentry.captureMessage('Photo management error boundary reset', {
  extra: {
    action: 'retry',
    previousError: this.state.error?.message,
  },
  level: 'info',
});
```

## Performance Monitoring

For long-running operations:

```typescript
return await Sentry.startSpan(
  {
    attributes: {
      'action.component': SENTRY_OPERATIONS.SERVER_ACTION,
      'action.name': actionName,
    },
    name: `action_${actionName}`,
    op: SENTRY_OPERATIONS.SERVER_ACTION,
  },
  async (span) => {
    try {
      const result = await operation();
      span.setStatus({ code: 1, message: 'ok' });
      return result;
    } catch (error) {
      span.setStatus({ code: 2, message: 'internal_error' });
      span.recordException(error as Error);
      throw error;
    }
  },
);
```

## Anti-Patterns to Avoid

1. **Never include PII in context** - No emails, names, passwords
2. **Never include content** - No user-generated content in context
3. **Never use hardcoded strings** - Use constants for categories, contexts, tags
4. **Never skip context setting** - Always set context at action start
5. **Never throw for warnings** - Use `captureException` with `level: 'warning'`
6. **Never ignore non-critical failures** - Log them as warnings
7. **Never include full input** - Only include IDs, types, and sizes
8. **Never fail operations for non-critical errors** - Capture and continue
9. **Never use string literals for tags** - Use `SENTRY_TAGS.*`
10. **Never use string literals for operations** - Use `SENTRY_OPERATIONS.*`

## Facade Integration Requirements (MANDATORY)

When implementing facades, Sentry monitoring is NOT optional:

### Breadcrumb Requirements

**ALL facade methods MUST add Sentry breadcrumbs** for successful operations:

```typescript
static async updateAsync(data: UpdateEntity, userId: string, dbInstance?: DatabaseExecutor) {
  try {
    const result = await (dbInstance ?? db).transaction(async (tx) => {
      // ... operation
    });

    // REQUIRED: Add breadcrumb on success
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      data: {
        entityId: result.id,
        operation: 'update',
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: `Updated entity ${result.id}`,
    });

    return result;
  } catch (error) {
    throw createFacadeError({ /* ... */ }, error);
  }
}
```

### Non-Blocking Failure Pattern

For non-critical operations (cleanup, cache invalidation), use warning-level capture:

```typescript
// Non-blocking cleanup - don't fail main operation
try {
  await CloudinaryService.deletePhotosFromCloudinary([publicId]);
} catch (error) {
  Sentry.captureException(error, {
    extra: { entityId, publicId, operation: 'cloudinary-cleanup' },
    level: 'warning',  // WARNING, not error
  });
  // Continue execution - don't throw
}
```

### Checklist for Facades

- [ ] ALL facade methods add breadcrumb on success
- [ ] Use `SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC` for facade operations
- [ ] Include relevant IDs in breadcrumb data (entityId, userId, operation)
- [ ] Non-critical failures captured with `level: 'warning'`
- [ ] Never fail main operations due to Sentry/monitoring errors
