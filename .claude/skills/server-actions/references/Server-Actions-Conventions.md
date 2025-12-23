# Server Actions Conventions

## Overview

Server actions in The project use the `next-safe-action` library with custom middleware chains for authentication, sanitization, transactions, and database access. Actions are thin orchestrators that delegate business logic to facades.

## File Structure

```
src/lib/actions/
├── {domain}/
│   └── {domain}.actions.ts
```

## File Naming

- **Files**: `{domain}.actions.ts` (e.g., `social.actions.ts`, `collections.actions.ts`)
- **Actions**: `{verb}{Entity}Action` (e.g., `createCommentAction`, `toggleLikeAction`)

## Required Imports

```typescript
'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { {Domain}Facade } from '@/lib/facades/{domain}/{domain}.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { {schema} } from '@/lib/validations/{domain}.validation';
```

## Action Client Types

| Client               | Use Case                       | Auth Required    |
| -------------------- | ------------------------------ | ---------------- |
| `authActionClient`   | Standard authenticated actions | Yes (user)       |
| `adminActionClient`  | Admin/moderator actions        | Yes (admin role) |
| `publicActionClient` | Public actions (no auth)       | No               |

## Action Structure Template

```typescript
export const {verb}{Entity}Action = authActionClient
  .metadata({
    actionName: ACTION_NAMES.{DOMAIN}.{ACTION},
    isTransactionRequired: true, // Set based on whether DB writes are needed
  })
  .inputSchema({validationSchema})
  .action(async ({ ctx, parsedInput }) => {
    // CRITICAL: Always parse sanitizedInput through schema, never use parsedInput directly
    const data = {validationSchema}.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    // 1. Set Sentry context first
    Sentry.setContext(SENTRY_CONTEXTS.{CONTEXT_NAME}, {
      entityId: data.id,
      userId: ctx.userId,
    });

    try {
      // 2. Delegate to facade for business logic
      const result = await {Domain}Facade.{method}(
        data,
        ctx.userId,
        dbInstance,
      );

      // 3. Handle unsuccessful results
      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.{DOMAIN}.{ERROR},
          ERROR_MESSAGES.{DOMAIN}.{ERROR},
          { ctx, operation: OPERATIONS.{DOMAIN}.{OPERATION} },
          true, // recoverable
          400,
        );
      }

      // 4. Add Sentry breadcrumb for successful operations
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          entityId: result.entity?.id,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User {action} {entity} ${result.entity?.id}`,
      });

      // 5. Invalidate cache after mutations
      CacheRevalidationService.{domain}.on{Entity}Change(
        entityType,
        entityId,
        ctx.userId,
        '{action}',
      );

      // 6. Return consistent response shape
      return {
        data: result.entity,
        message: '{Action} successful',
        success: true,
      };
    } catch (error) {
      // 7. Handle errors with utility
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.{DOMAIN}.{ACTION},
        },
        operation: OPERATIONS.{DOMAIN}.{OPERATION},
        userId: ctx.userId,
      });
    }
  });
```

## Critical Rules

### 1. Input Handling (MANDATORY)

```typescript
// WRONG - Never use parsedInput directly
const data = parsedInput;

// CORRECT - Always parse sanitizedInput through the schema
const data = validationSchema.parse(ctx.sanitizedInput);
```

The `ctx.sanitizedInput` is sanitized but typed as `unknown`. You must run it through the Zod schema to get proper types.

### 2. Database Instance

```typescript
// ctx.db is the transaction when isTransactionRequired: true, otherwise the regular db
const dbInstance = ctx.db;
```

### 3. Metadata Configuration

```typescript
.metadata({
  actionName: ACTION_NAMES.{DOMAIN}.{ACTION},  // Required for logging
  isTransactionRequired: true,                  // true for DB writes
})
```

### 4. Error Types

| ErrorType       | Use Case                           | Status Code |
| --------------- | ---------------------------------- | ----------- |
| `BUSINESS_RULE` | Validation/business logic failures | 400         |
| `AUTHORIZATION` | Permission denied                  | 403         |
| `NOT_FOUND`     | Resource not found                 | 404         |
| `DATABASE`      | Database errors                    | 500         |
| `RATE_LIMIT`    | Too many requests                  | 429         |
| `VALIDATION`    | Input validation failures          | 400         |

### 5. ActionError Construction

```typescript
throw new ActionError(
  ErrorType.BUSINESS_RULE, // Error type
  ERROR_CODES.DOMAIN.ERROR, // Unique error code
  ERROR_MESSAGES.DOMAIN.ERROR, // User-friendly message
  { ctx, operation }, // Context for logging
  true, // isRecoverable
  400, // HTTP status code
);
```

## Sentry Integration

### Using Helper Utilities (Recommended)

The recommended approach is to use the helper utilities from `@/lib/utils/sentry-server/breadcrumbs.server`:

#### `withActionErrorHandling()` - Full Wrapper (Recommended for Mutations)

Wraps your action with automatic context setting, entry/success/error breadcrumbs, and error handling:

```typescript
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';

export const createCollectionAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.COLLECTIONS.CREATE, isTransactionRequired: true })
  .inputSchema(insertCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = insertCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COLLECTIONS.CREATE,
        operation: OPERATIONS.COLLECTIONS.CREATE,
        userId: ctx.userId,
        input: parsedInput,
        contextType: 'COLLECTION_DATA',
        contextData: { name: data.name, userId: ctx.userId },
      },
      async () => {
        const newCollection = await CollectionsFacade.createAsync(data, ctx.userId, dbInstance);
        if (!newCollection) {
          throw new ActionError(ErrorType.INTERNAL, 'CREATE_FAILED', 'Failed to create collection');
        }
        return { data: newCollection, success: true, message: 'Collection created' };
      },
      { includeResultSummary: (r) => ({ collectionId: r.data.id }) },
    );
  });
```

#### `trackCacheInvalidation()` - For Cache Operations

Tracks cache invalidation and automatically logs failures as warnings (non-throwing):

```typescript
import { trackCacheInvalidation } from '@/lib/utils/sentry-server/breadcrumbs.server';

// After successful mutation
trackCacheInvalidation(CacheRevalidationService.collections.onCreate(newCollection.id, ctx.userId), {
  entityType: 'collection',
  entityId: newCollection.id,
  operation: 'onCreate',
  userId: ctx.userId,
});
```

#### `withActionBreadcrumbs()` - For Read-Only Actions

Wraps action with breadcrumbs only (no error handling, errors propagate):

```typescript
import { withActionBreadcrumbs } from '@/lib/utils/sentry-server/breadcrumbs.server';

return withActionBreadcrumbs(
  { actionName: 'GET_CATEGORIES', operation: 'collections.getCategories' },
  async () => {
    return await CollectionsFacade.getCategories(dbInstance);
  },
);
```

### Manual Pattern (Fallback)

For cases requiring fine-grained control, use the manual pattern:

#### Setting Context (Start of Action)

```typescript
Sentry.setContext(SENTRY_CONTEXTS.{CONTEXT_NAME}, {
  targetId: data.targetId,
  targetType: data.targetType,
  userId: ctx.userId,
});
```

#### Adding Breadcrumbs (After Success)

```typescript
Sentry.addBreadcrumb({
  category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
  data: {
    actionType: 'created',
    entityId: result.id,
  },
  level: SENTRY_LEVELS.INFO,
  message: `User created entity ${result.id}`,
});
```

#### Capturing Warnings (Non-Fatal Issues)

```typescript
Sentry.captureException(new Error('Cache invalidation failed'), {
  extra: {
    entityId,
    error: revalidationResult.error,
    operation,
  },
  level: 'warning',
});
```

## Cache Invalidation

Always invalidate cache after mutations:

```typescript
// After create/update/delete operations
CacheRevalidationService.{domain}.on{Entity}Change(
  entityType,  // 'bobblehead' | 'collection' | etc.
  entityId,
  userId,
  action,      // 'add' | 'update' | 'delete'
);

// Check for invalidation failures (non-blocking)
if (!revalidationResult.isSuccess) {
  Sentry.captureException(new Error('Cache invalidation failed'), {
    extra: { /* details */ },
    level: 'warning',
  });
}
```

## Response Shape

All actions must return a consistent shape:

```typescript
return {
  data: result.entity, // The result data
  message: 'Operation successful', // User-friendly message
  success: true, // Boolean success flag
};
```

## Client-Side Usage

The project uses a custom `useServerAction` hook that wraps `next-safe-action/hooks` with integrated toast notifications via Sonner.

### Hook Import

```typescript
import { useServerAction } from '@/hooks/use-server-action';
```

### Hook Options

| Option              | Type                                                                                                  | Description                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `breadcrumbContext` | `{ action: string, component: string }`                                                               | Enables automatic Sentry breadcrumb tracking |
| `toastMessages`     | `{ loading?: string, success?: string \| ((data) => string), error?: string \| ((error) => string) }` | Custom toast messages                        |
| `isDisableToast`    | `boolean`                                                                                             | Disable all toasts for silent operations     |
| `loadingMessage`    | `string`                                                                                              | Loading message shown during execution       |
| `onSuccess`         | `({ data }) => void`                                                                                  | Called with action result on success         |
| `onAfterSuccess`    | `(data: T) => void`                                                                                   | Called after success handling is complete    |
| `onBeforeSuccess`   | `(data: T) => void`                                                                                   | Called before success toast is shown         |
| `onAfterError`      | `() => void`                                                                                          | Called after error handling completes        |
| `onBeforeError`     | `() => void`                                                                                          | Called before error toast is shown           |
| `onValidationError` | `(errors) => string \| void`                                                                          | Custom handler for validation errors         |

### Hook Return Values

| Value          | Type                         | Description                            |
| -------------- | ---------------------------- | -------------------------------------- |
| `executeAsync` | `(input) => Promise<Result>` | Async execution with toast integration |
| `execute`      | `(input) => void`            | Sync execution for callbacks           |
| `isExecuting`  | `boolean`                    | Loading state indicator                |
| `result`       | `Result \| undefined`        | Last execution result                  |

---

### Client-Side Sentry Integration (breadcrumbContext)

The `breadcrumbContext` option enables automatic Sentry breadcrumb tracking for client-side action execution. When provided, the hook tracks:

- **started** - When action execution begins
- **success** - When action completes successfully
- **error** - When action fails (validation, business logic, or unexpected errors)

This creates a trail in Sentry that shows what the user was doing before an error occurred.

#### breadcrumbContext Properties

| Property    | Type     | Description                                                                  |
| ----------- | -------- | ---------------------------------------------------------------------------- |
| `action`    | `string` | Name of the action (e.g., `'newsletter-subscribe'`, `'update-bobblehead'`)   |
| `component` | `string` | Component initiating the action (e.g., `'footer-newsletter'`, `'edit-form'`) |

#### Example: Form with Sentry Tracking

```typescript
'use client';

import { useServerAction } from '@/hooks/use-server-action';
import { subscribeToNewsletterAction } from '@/lib/actions/newsletter/newsletter.actions';

export const NewsletterForm = () => {
  const { executeAsync, isExecuting } = useServerAction(subscribeToNewsletterAction, {
    // Enable Sentry breadcrumb tracking
    breadcrumbContext: {
      action: 'newsletter-subscribe',
      component: 'footer-newsletter',
    },
    loadingMessage: 'Subscribing...',
    onAfterSuccess: () => {
      // Handle success
    },
  });

  const handleSubmit = async (email: string) => {
    await executeAsync({ email });
  };

  // ... form implementation
};
```

#### When to Use breadcrumbContext

| Scenario                     | Use breadcrumbContext? | Reason                                     |
| ---------------------------- | ---------------------- | ------------------------------------------ |
| User-initiated mutations     | Yes                    | Track user actions for debugging           |
| Form submissions             | Yes                    | Understand user flow before errors         |
| Silent background operations | Optional               | May add noise but useful for complex flows |
| Search/autocomplete          | No                     | Too frequent, adds noise                   |
| Analytics/view tracking      | No                     | Not user-initiated actions                 |

#### Sentry Breadcrumb Output

When an error occurs, Sentry will show breadcrumbs like:

```
[INFO] Server action newsletter-subscribe started (component: footer-newsletter)
[INFO] Server action newsletter-subscribe success (component: footer-newsletter)
...
[ERROR] Server action update-profile error (component: settings-form)
```

This integrates with the server-side Sentry tracking from `withActionErrorHandling()` to provide end-to-end visibility.

---

### Pattern 1: Form Submissions (Dialogs, Create/Edit Forms)

Use `executeAsync` with `toastMessages` and the `useAppForm` hook.

```typescript
'use client';

import { revalidateLogic } from '@tanstack/form-core';

import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { createCollectionAction } from '@/lib/actions/collections/collections.actions';
import { insertCollectionSchema } from '@/lib/validations/collections.validation';

interface CreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: { id: string; name: string }) => void;
}

export const CreateDialog = withFocusManagement(
  ({ isOpen, onClose, onSuccess }: CreateDialogProps) => {
    const { focusFirstError } = useFocusContext();

    // 1. Setup server action with toast messages
    const { executeAsync, isExecuting } = useServerAction(createCollectionAction, {
      onSuccess: ({ data }) => {
        // data.data contains the actual result from the action
        onSuccess?.({ id: data.data.id, name: data.data.name });
        onClose();
      },
      toastMessages: {
        error: 'Failed to create collection. Please try again.',
        loading: 'Creating collection...',
        success: 'Collection created successfully!',
      },
    });

    // 2. Setup form with TanStack Form
    const form = useAppForm({
      canSubmitWhenInvalid: true, // Allow submission to trigger proper error display
      defaultValues: {
        description: '',
        isPublic: true,
        name: '',
      },
      onSubmit: async ({ value }) => {
        await executeAsync(value); // Call server action
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi); // Focus first error field
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: insertCollectionSchema, // Zod schema for validation
      },
    });

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField name={'name'}>
          {(field) => (
            <field.TextField isRequired label={'Name'} placeholder={'Enter name'} />
          )}
        </form.AppField>

        <Button disabled={isExecuting} type={'submit'}>
          {isExecuting ? 'Creating...' : 'Create'}
        </Button>
      </form>
    );
  },
);
```

---

### Pattern 2: Delete Operations with Navigation

Use `executeAsync` with `toastMessages` and redirect after completion.

```typescript
'use client';

import { $path } from 'next-typesafe-url';
import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/use-server-action';
import { deleteItemAction } from '@/lib/actions/items/items.actions';

interface DeleteDialogProps {
  itemId: string;
  parentSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteDialog = ({ itemId, parentSlug, isOpen, onClose }: DeleteDialogProps) => {
  const router = useRouter();

  const { executeAsync } = useServerAction(deleteItemAction, {
    toastMessages: {
      error: 'Failed to delete item. Please try again.',
      loading: 'Deleting item...',
      success: '', // Empty string for silent success (redirect handles feedback)
    },
  });

  const handleDelete = async () => {
    await executeAsync({ itemId }).then(() => {
      // Navigate after successful deletion
      router.push($path({ route: '/collections/[slug]', routeParams: { slug: parentSlug } }));
    });
    onClose();
  };

  return (
    <ConfirmDeleteAlertDialog
      isOpen={isOpen}
      onClose={onClose}
      onDeleteAsync={handleDelete}
    >
      This will permanently delete this item.
    </ConfirmDeleteAlertDialog>
  );
};
```

---

### Pattern 3: Search/Autocomplete (Debounced Input)

Use `execute` (sync) with `isDisableToast` for silent background operations.

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';

import { useServerAction } from '@/hooks/use-server-action';
import { searchAction } from '@/lib/actions/search/search.actions';
import { CONFIG } from '@/lib/constants';

export const SearchDropdown = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Setup server action without toasts (silent search)
  const { execute, isExecuting, result } = useServerAction(searchAction, {
    isDisableToast: true, // No toasts for search
  });

  // Debounce the query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, CONFIG.SEARCH.DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [query]);

  // Execute search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH) {
      execute({ query: debouncedQuery }); // Sync call for search
    }
  }, [debouncedQuery, execute]);

  // Access results (nested due to next-safe-action wrapping)
  const searchResults = result?.data?.data;

  return (
    <div>
      <Input value={query} onChange={(e) => setQuery(e.target.value)} />

      {isExecuting && <Skeleton />}

      {searchResults?.items.map((item) => (
        <SearchResultItem key={item.id} result={item} />
      ))}
    </div>
  );
};
```

---

### Pattern 4: Silent Background Operations

Use `execute` with `isDisableToast` for operations that don't need user feedback.

```typescript
'use client';

import { useServerAction } from '@/hooks/use-server-action';
import { recordViewAction } from '@/lib/actions/analytics/view-tracking.actions';

export const ViewTracker = ({ targetId, targetType }: ViewTrackerProps) => {
  const { execute: recordView, isExecuting } = useServerAction(recordViewAction, {
    isDisableToast: true, // Silent analytics tracking
    onSuccess: ({ data }) => {
      // Handle success silently (e.g., update local state)
      console.log('View recorded:', data.data.viewId);
    },
  });

  const handleRecordView = useCallback(
    (duration: number) => {
      if (isExecuting) return; // Prevent duplicate calls

      recordView({
        targetId,
        targetType,
        viewDuration: Math.round(duration / 1000),
      });
    },
    [targetId, targetType, recordView, isExecuting],
  );

  // ... visibility tracking logic
};
```

---

### Pattern 5: Availability Checks (Multiple Actions)

Use multiple `useServerAction` hooks for different operations.

```typescript
'use client';

import { useServerAction } from '@/hooks/use-server-action';
import { checkAvailabilityAction, updateAction } from '@/lib/actions/users/user.actions';

export const EditForm = ({ currentValue, onSuccess }: EditFormProps) => {
  // Silent availability check
  const {
    execute: checkAvailability,
    isExecuting: isCheckingAvailability,
    result: availabilityResult,
  } = useServerAction(checkAvailabilityAction, {
    isDisableToast: true, // Silent availability checks
  });

  // Main update action with toasts
  const { executeAsync: update, isExecuting: isUpdating } = useServerAction(updateAction, {
    onSuccess: () => onSuccess?.(),
    toastMessages: {
      error: 'Failed to update',
      loading: 'Updating...',
      success: 'Updated successfully!',
    },
  });

  // Check availability on input change (debounced)
  useEffect(() => {
    if (debouncedValue && debouncedValue !== currentValue) {
      checkAvailability({ value: debouncedValue });
    }
  }, [debouncedValue, currentValue, checkAvailability]);

  // Show availability status
  const isAvailable = availabilityResult?.data?.available;

  return (
    <form onSubmit={handleSubmit}>
      <Input disabled={!canChange || isUpdating} />
      {isCheckingAvailability && <span>Checking...</span>}
      {isAvailable && <span className={'text-green-600'}>Available</span>}
      {isAvailable === false && <span className={'text-destructive'}>Taken</span>}
      <Button disabled={isUpdating || isCheckingAvailability}>Update</Button>
    </form>
  );
};
```

---

### Pattern 6: Post-Submit Navigation with Refresh

Use `onAfterSuccess` for operations that happen after toast completion.

```typescript
'use client';

import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/use-server-action';
import { updateItemAction } from '@/lib/actions/items/items.actions';

export const EditDialog = ({ item, onClose }: EditDialogProps) => {
  const router = useRouter();

  const { executeAsync, isExecuting } = useServerAction(updateItemAction, {
    onAfterSuccess: () => {
      router.refresh(); // Refresh page data after success
      onClose();
    },
    toastMessages: {
      error: 'Failed to update. Please try again.',
      loading: 'Updating...',
      success: 'Updated successfully!',
    },
  });

  // ... form implementation
};
```

---

### Accessing Action Results

Server actions return `{ success, message, data }`. Due to next-safe-action wrapping:

```typescript
// In onSuccess callback
onSuccess: ({ data }) => {
  // data.success - boolean success flag
  // data.message - user-friendly message
  // data.data - the actual result entity
  const entity = data.data;
};

// From result object (for sync execute)
const entity = result?.data?.data;
const message = result?.data?.message;
const isSuccess = result?.data?.success;
```

---

### Loading State Patterns

```typescript
// Button disabled during execution
<Button disabled={isExecuting} type={'submit'}>
  {isExecuting ? 'Saving...' : 'Save'}
</Button>

// Loading skeleton
{isExecuting && <Skeleton />}

// Conditional content
<Conditional isCondition={!isExecuting && hasResults}>
  {/* Content */}
</Conditional>
```

## Anti-Patterns to Avoid

### Server-Side Anti-Patterns

1. **Never use parsedInput directly** - Always parse `ctx.sanitizedInput`
2. **Never put business logic in actions** - Delegate to facades
3. **Never skip Sentry context** - Always set context at start
4. **Never skip error handling** - Always use `handleActionError`
5. **Never forget cache invalidation** - Always invalidate after mutations
6. **Never return inconsistent shapes** - Always return `{ success, message, data }`
7. **Never skip metadata** - Always include `actionName` and `isTransactionRequired`

### Client-Side Anti-Patterns

8. **Never use `useAction` directly** - Always use `useServerAction` hook from `@/hooks/use-server-action`
9. **Never access `result.data` directly** - Action results are `result?.data?.data` due to wrapping
10. **Never skip loading states** - Always disable buttons with `isExecuting` and show loading indicators
11. **Never forget `'use client'` directive** - Components using hooks must be client components
12. **Never skip form validation** - Always use `validators: { onSubmit: zodSchema }` with forms
13. **Never call `execute`/`executeAsync` in render** - Always call in event handlers or useEffect
14. **Never omit toast messages for user-initiated mutations** - Only use `isDisableToast` for background operations
