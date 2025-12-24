# Sentry Client-Side Conventions

## Overview

The project uses Sentry for client-side error tracking, session replay, and user interaction monitoring. This document covers **front-end/client-side** Sentry integration patterns used in error boundaries, route-level error pages, client components, and the client instrumentation configuration.

**Note:** For server-side Sentry patterns (server actions, facades, middleware), see the `sentry-server` skill.

## Required Imports

```typescript
import * as Sentry from '@sentry/nextjs';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_CONTEXTS, SENTRY_LEVELS, SENTRY_TAGS } from '@/lib/constants';
```

## Client Configuration

### Required Configuration (`src/instrumentation-client.ts`)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment & Release (REQUIRED for production)
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Debug mode
  debug: process.env.NODE_ENV === 'development',

  // Sampling rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Integrations
  enableLogs: true,
  integrations: [Sentry.replayIntegration(), Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })],

  // PII Scrubbing (REQUIRED)
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },

  // Filter known benign errors (optional)
  ignoreErrors: ['ResizeObserver loop limit exceeded', 'Non-Error promise rejection captured'],
});

// REQUIRED: Track route transitions
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

### Configuration Checklist

- [ ] DSN from environment variable
- [ ] Environment tag set (`development`, `production`)
- [ ] Release tag set (git commit SHA or version)
- [ ] Session replay enabled with appropriate sampling
- [ ] Console logging integration
- [ ] `beforeSend` hook for PII scrubbing
- [ ] `onRouterTransitionStart` exported for route tracking

## Global Error Handler

### Required Pattern (`src/app/global-error.tsx`)

**ALL global error handlers MUST include full Sentry integration:**

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

import { SENTRY_CONTEXTS, SENTRY_TAGS } from '@/lib/constants';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error, {
      contexts: {
        [SENTRY_CONTEXTS.ERROR_DETAILS]: {
          digest: error.digest,
          errorMessage: error.message,
          errorName: error.name,
          route: 'global',
        },
      },
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'global-error',
        [SENTRY_TAGS.FEATURE]: 'error-handling',
        errorBoundary: 'global',
        hasDigest: String(!!error.digest),
      },
      level: 'fatal', // Global errors are FATAL level
    });
  }, [error]);

  return (
    <html lang={'en'}>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
```

### Global Error Checklist

- [ ] `'use client'` directive at top
- [ ] `captureException` called in `useEffect`
- [ ] Error digest included in context
- [ ] Level set to `'fatal'`
- [ ] Tags include `errorBoundary: 'global'`

## Route-Level Error Pages

### Required Pattern (`error.tsx` files)

**ALL route-level error pages MUST include Sentry integration:**

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SENTRY_CONTEXTS, SENTRY_TAGS } from '@/lib/constants';

export default function BrowseErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      contexts: {
        [SENTRY_CONTEXTS.ERROR_DETAILS]: {
          digest: error.digest,
          errorMessage: error.message,
          errorName: error.name,
          route: 'browse', // CHANGE: Use actual route name
        },
      },
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'browse-error-page', // CHANGE: Use actual component name
        [SENTRY_TAGS.FEATURE]: 'browse', // CHANGE: Use actual feature area
        errorBoundary: 'route-level',
      },
      level: 'error',
    });
  }, [error]);

  return (
    <div className={'container mx-auto space-y-6 py-8'}>
      {/* Page Header */}
      <div className={'space-y-2'}>
        <h1 className={'text-3xl font-bold tracking-tight'}>Browse Collections</h1>
      </div>

      {/* Error Display */}
      <EmptyState
        action={
          <Button onClick={reset} variant={'default'}>
            Try Again
          </Button>
        }
        description={
          error.message || 'An unexpected error occurred. Please try again later.'
        }
        icon={AlertCircle}
        title={'Something Went Wrong'}
      />
    </div>
  );
}
```

### Route Error Page Checklist

- [ ] `'use client'` directive at top
- [ ] `captureException` called in `useEffect`
- [ ] Error digest included in context
- [ ] Route name specified in context
- [ ] Component name in tags
- [ ] Feature area in tags
- [ ] Level set to `'error'`
- [ ] `errorBoundary: 'route-level'` tag

## Error Boundary Component

### Class-Based Error Boundary Pattern

```typescript
'use client';

import type { ErrorInfo, ReactNode } from 'react';

import * as Sentry from '@sentry/nextjs';
import { Component } from 'react';

import { SENTRY_CONTEXTS, SENTRY_TAGS } from '@/lib/constants';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { name = 'unknown', shouldReportToSentry = true } = this.props;

    if (shouldReportToSentry) {
      Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
          [SENTRY_CONTEXTS.ERROR_DETAILS]: {
            boundaryName: name,
            errorMessage: error.message,
            errorName: error.name,
          },
        },
        extra: {
          componentStack: errorInfo.componentStack,
          errorBoundary: name,
          errorMessage: error.message,
          errorName: error.name,
          errorStack: error.stack,
        },
        level: 'error',
        tags: {
          errorBoundary: 'true',
          [SENTRY_TAGS.COMPONENT]: name,
          [SENTRY_TAGS.FEATURE]: 'error-boundary',
        },
      });
    }

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private resetErrorBoundary = (): void => {
    const { name = 'unknown', shouldReportToSentry = true } = this.props;

    // Log reset action
    if (shouldReportToSentry) {
      Sentry.captureMessage('Error boundary reset', {
        extra: {
          action: 'reset',
          boundaryName: name,
          previousError: this.state.error?.message,
        },
        level: 'info',
      });
    }

    this.setState({ error: null, errorInfo: null, hasError: false });
    this.props.onReset?.();
  };
}
```

### Error Boundary Checklist

- [ ] `componentDidCatch` captures exception with full context
- [ ] React component stack included in contexts
- [ ] Boundary name included in tags
- [ ] Reset action logged with `captureMessage`
- [ ] `shouldReportToSentry` prop for conditional reporting

## Client Component Patterns

### User Interaction Breadcrumbs

Track significant user interactions in client components:

```typescript
'use client';

import * as Sentry from '@sentry/nextjs';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';

function FeatureComponent() {
  const handleAction = () => {
    // Add breadcrumb BEFORE the action
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
      data: {
        action: 'button-click',
        component: 'feature-component',
        feature: 'bobblehead-edit',
      },
      level: SENTRY_LEVELS.INFO,
      message: 'User clicked action button',
    });

    // ... perform action
  };

  return <button onClick={handleAction}>Action</button>;
}
```

### Form Submission Pattern

```typescript
const handleSubmit = async (values: FormValues) => {
  // Breadcrumb BEFORE submission
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data: {
      formName: 'edit-bobblehead',
      hasPhotos: values.photos.length > 0,
      fieldCount: Object.keys(values).length,
    },
    level: SENTRY_LEVELS.INFO,
    message: 'Form submission started',
  });

  try {
    await submitAction(values);

    // Breadcrumb on success
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Form submission successful',
    });
  } catch (error) {
    // Capture exception on failure
    Sentry.captureException(error, {
      tags: {
        [SENTRY_TAGS.COMPONENT]: 'edit-form',
        [SENTRY_TAGS.FEATURE]: 'bobblehead-edit',
      },
      extra: {
        formName: 'edit-bobblehead',
        operation: 'form-submit',
      },
    });
    throw error;
  }
};
```

### Dialog/Modal Tracking

```typescript
const handleOpenDialog = (dialogName: string) => {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data: { dialog: dialogName },
    level: SENTRY_LEVELS.DEBUG,
    message: `Opened ${dialogName} dialog`,
  });
};

const handleCloseDialog = (dialogName: string, action: 'cancel' | 'confirm') => {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
    data: { dialog: dialogName, action },
    level: SENTRY_LEVELS.DEBUG,
    message: `Closed ${dialogName} dialog with ${action}`,
  });
};
```

### Server Action Consumption Error Handling

```typescript
const { executeAsync, isExecuting } = useServerAction(myAction, {
  onAfterSuccess: (result) => {
    // Success breadcrumb
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      data: { action: 'my-action', result: 'success' },
      level: SENTRY_LEVELS.INFO,
      message: 'Action completed successfully',
    });
  },
  onError: (error) => {
    // Error is typically captured by server action middleware
    // Add client-side context if needed
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      data: { action: 'my-action', result: 'error' },
      level: SENTRY_LEVELS.ERROR,
      message: 'Action failed on client',
    });
  },
});
```

### Photo/Upload Operations

```typescript
const handleUploadSuccess = (photoCount: number) => {
  Sentry.captureMessage('Photo uploaded successfully', {
    extra: {
      operation: 'photo-upload-success',
      photoCount,
    },
    level: 'info',
  });
};

const handleUploadError = (error: Error, photoCount: number) => {
  const errorType = classifyUploadError(error);

  Sentry.captureException(error, {
    extra: {
      errorMessage: error.message,
      errorType,
      operation: 'cloudinary-upload',
      photoCount,
    },
    level: 'error',
    tags: {
      [SENTRY_TAGS.COMPONENT]: 'cloudinary-photo-upload',
      [SENTRY_TAGS.ERROR_TYPE]: errorType,
    },
  });
};
```

## Breadcrumb Categories for Client

| Category           | Use Case                         |
| ------------------ | -------------------------------- |
| `USER_INTERACTION` | Button clicks, form inputs, etc. |
| `NAVIGATION`       | Route changes, page loads        |
| `BUSINESS_LOGIC`   | Action results, state changes    |
| `VALIDATION`       | Form validation events           |

## Breadcrumb Levels

| Level     | Use Case                 |
| --------- | ------------------------ |
| `INFO`    | Successful user actions  |
| `DEBUG`   | Detailed UI interactions |
| `WARNING` | Recoverable issues       |
| `ERROR`   | Failed operations        |

## Error Levels for Client

| Level     | Use Case                      | Example                     |
| --------- | ----------------------------- | --------------------------- |
| `info`    | User action logging           | Form reset, retry clicked   |
| `warning` | Non-critical client issues    | Upload warning, slow action |
| `error`   | Client-side failures          | Route error, boundary catch |
| `fatal`   | Critical application failures | Global error handler        |

## Anti-Patterns to Avoid

1. **Never skip Sentry in error.tsx files** - ALL error pages need integration
2. **Never use console.error alone** - Always use `captureException` too
3. **Never include PII in breadcrumbs** - No emails, names, passwords
4. **Never use hardcoded strings for tags** - Use `SENTRY_TAGS.*` constants
5. **Never skip the digest in error contexts** - Always include if available
6. **Never use wrong error level** - Global = fatal, Route = error, Boundary = error
7. **Never forget route/component context** - Always identify WHERE the error occurred
8. **Never skip beforeSend hook** - Required for PII scrubbing
9. **Never hardcode environment** - Use `process.env.NODE_ENV`
10. **Never skip onRouterTransitionStart** - Required for route tracking

## Component Integration Checklist

When adding Sentry to a client component:

- [ ] Import Sentry and constants
- [ ] Add breadcrumbs BEFORE significant actions
- [ ] Use `captureException` for caught errors
- [ ] Use `captureMessage` for user action logging
- [ ] Use appropriate breadcrumb category
- [ ] Use appropriate error level
- [ ] Include component name in tags
- [ ] Include feature area in tags
- [ ] Never include PII or user content

## Testing Sentry Integration

### Mocking Sentry in Tests

```typescript
import { vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setContext: vi.fn(),
}));

it('should capture exception on error', async () => {
  // ... trigger error

  expect(Sentry.captureException).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({
      tags: expect.objectContaining({
        [SENTRY_TAGS.COMPONENT]: 'test-component',
      }),
    }),
  );
});

it('should add breadcrumb on user action', () => {
  // ... trigger action

  expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
    expect.objectContaining({
      category: SENTRY_BREADCRUMB_CATEGORIES.USER_INTERACTION,
      level: SENTRY_LEVELS.INFO,
    }),
  );
});
```
