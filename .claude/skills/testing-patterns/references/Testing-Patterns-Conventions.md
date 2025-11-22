# Testing Patterns Conventions

## Overview

Head Shakers uses Vitest 4.0.3 for unit, integration, and component tests, Testing Library for component tests, and Playwright 1.56.1 for E2E tests. Tests follow a consistent structure and naming convention.

**Key Libraries**:
- **Vitest** - Test runner with v8 coverage
- **@testing-library/react** - React component testing
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - DOM matchers
- **MSW 2.x** - API mocking
- **@testcontainers/postgresql** - Database testing
- **Playwright** - E2E browser automation
- **@clerk/testing** - Clerk authentication testing

## Test Structure

```
tests/
├── unit/                           # Unit tests (pure functions, validations)
│   └── lib/
│       └── validations/            # Zod schema validation tests
├── integration/                    # Integration tests with real database
│   ├── actions/                    # Facade/business logic tests
│   └── db/                         # Database integration tests
├── components/                     # React component tests
│   ├── ui/                         # UI component tests
│   └── feature/                    # Feature-specific component tests
├── e2e/                            # End-to-end Playwright tests
│   ├── specs/                      # Test suites by user type
│   │   ├── smoke/                  # Health and basic functionality
│   │   ├── public/                 # Unauthenticated user tests
│   │   ├── user/                   # Standard user tests
│   │   ├── admin/                  # Admin user tests
│   │   └── onboarding/             # New user onboarding tests
│   ├── setup/                      # Auth setup (auth.setup.ts)
│   ├── pages/                      # Page Object Model classes
│   ├── fixtures/                   # Custom Playwright fixtures
│   ├── helpers/                    # ComponentFinder and utilities
│   ├── utils/                      # Neon branch, test data utilities
│   ├── global.setup.ts             # Global setup (DB branch creation)
│   └── global.teardown.ts          # Global teardown (cleanup)
├── setup/                          # Vitest setup files
│   ├── vitest.setup.ts             # Per-file setup (MSW, mocks, Clerk)
│   ├── vitest.global-setup.ts      # Global setup (Testcontainers)
│   ├── test-db.ts                  # Testcontainers PostgreSQL management
│   ├── msw.setup.ts                # MSW server configuration
│   └── test-utils.tsx              # Custom render with providers
├── fixtures/                       # Test data factories for database
│   ├── user.factory.ts
│   ├── collection.factory.ts
│   └── bobblehead.factory.ts
└── mocks/                          # MSW handlers and mock data
    ├── handlers/                   # API mock handlers
    │   ├── auth.handlers.ts
    │   ├── bobbleheads.handlers.ts
    │   └── collections.handlers.ts
    └── data/                       # Mock data objects
        ├── users.mock.ts
        ├── collections.mock.ts
        └── bobbleheads.mock.ts
```

## File Naming

- **Unit tests**: `{file-name}.test.ts`
- **Integration tests**: `{file-name}.test.ts` or `{file-name}.integration.test.ts`
- **Component tests**: `{component-name}.test.tsx`
- **E2E tests**: `{feature}.spec.ts`
- **Factories**: `{entity}.factory.ts`
- **Mock data**: `{entity}.mock.ts`
- **MSW handlers**: `{entity}.handlers.ts`

## Unit Test Pattern

```typescript
import { describe, expect, it } from 'vitest';

import { formatDate, parseDate } from '@/lib/utils/date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date in default format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('January 15, 2024');
    });

    it('should handle custom format', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date, 'MM/dd/yyyy');
      expect(result).toBe('01/15/2024');
    });

    it('should return empty string for invalid date', () => {
      const result = formatDate(null);
      expect(result).toBe('');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return null for invalid string', () => {
      const result = parseDate('invalid');
      expect(result).toBeNull();
    });
  });
});
```

## Integration Test Pattern

### Server Action Tests

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommentAction } from '@/lib/actions/social/social.actions';
import { db } from '@/lib/db';

// Mock authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' })),
}));

describe('createCommentAction', () => {
  beforeEach(async () => {
    // Reset database state
    await db.delete(comments);
  });

  it('should create a comment successfully', async () => {
    const input = {
      content: 'Test comment',
      targetId: 'target-123',
      targetType: 'bobblehead' as const,
    };

    const result = await createCommentAction(input);

    expect(result?.data?.success).toBe(true);
    expect(result?.data?.data?.content).toBe('Test comment');
  });

  it('should fail with invalid input', async () => {
    const input = {
      content: '', // Invalid: empty content
      targetId: 'target-123',
      targetType: 'bobblehead' as const,
    };

    const result = await createCommentAction(input);

    expect(result?.validationErrors).toBeDefined();
  });
});
```

### Facade Tests

```typescript
import { beforeEach, describe, expect, it } from 'vitest';

import { db } from '@/lib/db';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { createTestUser } from '@/tests/fixtures/user.factory';

describe('SocialFacade', () => {
  let testUserId: string;

  beforeEach(async () => {
    // Create test user
    const user = await createTestUser();
    testUserId = user.id;
  });

  describe('toggleLike', () => {
    it('should create a like when not liked', async () => {
      const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it('should remove like when already liked', async () => {
      // First like
      await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);

      // Toggle (unlike)
      const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(false);
      expect(result.likeCount).toBe(0);
    });
  });
});
```

## Component Test Pattern

Use the custom render from `tests/setup/test-utils.tsx` which includes all providers and pre-configured userEvent.

```typescript
// tests/components/feature/social/comment-form.test.tsx
import { waitFor } from '@testing-library/react';

import { CommentForm } from '@/components/feature/social/comment-form';

import { customRender, screen } from '@/tests/setup/test-utils';

// Mock server action
vi.mock('@/lib/actions/social/social.actions', () => ({
  createCommentAction: vi.fn(),
}));

describe('CommentForm', () => {
  const defaultProps = {
    targetId: 'target-123',
    targetType: 'bobblehead' as const,
    onSuccess: vi.fn(),
  };

  it('should render the form', () => {
    customRender(<CommentForm {...defaultProps} />);

    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should submit form with valid input', async () => {
    const { createCommentAction } = await import('@/lib/actions/social/social.actions');
    vi.mocked(createCommentAction).mockResolvedValueOnce({
      data: { success: true, data: { id: 'comment-1' }, message: 'Created' },
    });

    // customRender returns { user, ...renderResult }
    const { user } = customRender(<CommentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/comment/i), 'Test comment');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(createCommentAction).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Test comment' }),
      );
    });
  });

  it('should show validation error for empty input', async () => {
    const { user } = customRender(<CommentForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
```

**Note**: No need to import `describe`, `it`, `expect`, `vi` - globals are enabled in Vitest config.

## E2E Test Pattern (Playwright)

### Project Structure

E2E tests are organized into 5 projects with dependencies:

1. **auth-setup** - Authenticates test users (runs first)
2. **smoke** - Health and basic functionality checks
3. **user-authenticated** - Standard user tests
4. **admin-authenticated** - Admin user tests
5. **new-user-authenticated** - Onboarding tests
6. **unauthenticated** - Public route tests

### Using Custom Fixtures

Always use custom fixtures from `tests/e2e/fixtures/base.fixture.ts`:

```typescript
// tests/e2e/specs/user/comments.spec.ts
import { expect } from '@playwright/test';

import { test } from '@/tests/e2e/fixtures/base.fixture';

test.describe('Comments Feature', () => {
  // userPage fixture has pre-authenticated user context
  test('should add a comment to bobblehead', async ({ userPage, userFinder }) => {
    await userPage.goto('/bobbleheads/test-bobblehead-id');

    // Use ComponentFinder for consistent data-testid lookups
    await userPage.fill(userFinder.form('comment', 'input'), 'Great bobblehead!');
    await userPage.click(userFinder.form('submit', 'button'));

    await expect(userPage.getByText('Great bobblehead!')).toBeVisible();
  });

  // adminPage fixture has pre-authenticated admin context
  test('admin can moderate comments', async ({ adminPage, adminFinder }) => {
    await adminPage.goto('/admin/comments');

    await adminPage.click(adminFinder.feature('comment', 'menu'));
    await adminPage.click(adminFinder.feature('delete', 'button'));

    await expect(adminPage.getByText('Comment deleted')).toBeVisible();
  });
});
```

### Available Fixtures

```typescript
// Custom fixtures from tests/e2e/fixtures/base.fixture.ts
{
  adminPage,      // Separate browser context with admin auth
  userPage,       // Separate browser context with user auth
  newUserPage,    // Separate browser context with new user auth
  finder,         // ComponentFinder for default page
  adminFinder,    // ComponentFinder for adminPage
  userFinder,     // ComponentFinder for userPage
  newUserFinder,  // ComponentFinder for newUserPage
  branchInfo,     // Worker-scoped database branch info
}
```

### ComponentFinder Helper

Use ComponentFinder for standardized `data-testid` lookups:

```typescript
// All methods return Playwright locator strings
finder.feature('bobblehead', 'card')     // [data-testid="feature-bobblehead-card"]
finder.form('comment', 'input')           // [data-testid="form-comment-input"]
finder.formField('email')                 // [data-testid="form-field-email"]
finder.ui('button', 'primary')            // [data-testid="ui-button-primary"]
finder.layout('sidebar', 'nav')           // [data-testid="layout-sidebar-nav"]
finder.tableCell(0, 1)                    // [data-testid="table-cell-0-1"]
finder.component('custom', 'widget', 'main') // [data-testid="custom-widget-main"]
```

### Page Object Model

Extend `BasePage` for reusable page interactions:

```typescript
// tests/e2e/pages/collection.page.ts
import { BasePage } from './base.page';

export class CollectionPage extends BasePage {
  readonly url = '/collections';

  async addItem(name: string) {
    await this.page.click(this.byTestId('feature-add-item-button'));
    await this.page.fill(this.byTestId('form-item-name-input'), name);
    await this.page.click(this.byTestId('form-submit-button'));
  }
}
```

### Basic E2E Test (Without Custom Fixtures)

```typescript
import { expect, test } from '@playwright/test';

test.describe('Public Pages', () => {
  test('should display home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });
});
```

## MSW Mocking

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock API routes
  http.get('/api/bobbleheads/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Bobblehead',
      description: 'A test bobblehead',
    });
  }),

  http.post('/api/comments', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'new-comment-id',
      content: body.content,
      createdAt: new Date().toISOString(),
    });
  }),
];

// tests/setup/msw.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Fixtures

```typescript
// tests/fixtures/user.factory.ts
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function createTestUser(overrides = {}) {
  const defaultUser = {
    id: `user-${Date.now()}`,
    clerkId: `clerk-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    username: `testuser-${Date.now()}`,
    displayName: 'Test User',
    ...overrides,
  };

  const [user] = await db.insert(users).values(defaultUser).returning();
  return user;
}

// tests/fixtures/bobblehead.factory.ts
export async function createTestBobblehead(userId: string, overrides = {}) {
  const defaultBobblehead = {
    id: `bobblehead-${Date.now()}`,
    name: 'Test Bobblehead',
    userId,
    isPublic: true,
    ...overrides,
  };

  const [bobblehead] = await db.insert(bobbleheads).values(defaultBobblehead).returning();
  return bobblehead;
}
```

## Testing Database (Testcontainers)

The database is automatically managed via global setup. Use the helpers from `tests/setup/test-db.ts`:

```typescript
// tests/integration/actions/social.facade.test.ts
import { SocialFacade } from '@/lib/facades/social/social.facade';

import { createTestUser } from '@/tests/fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '@/tests/setup/test-db';

describe('SocialFacade', () => {
  let db: ReturnType<typeof getTestDb>;
  let testUserId: string;

  beforeAll(() => {
    db = getTestDb(); // Get Drizzle ORM instance
  });

  beforeEach(async () => {
    await resetTestDatabase(); // Truncate all tables with CASCADE
    const user = await createTestUser();
    testUserId = user.id;
  });

  it('should toggle like', async () => {
    const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);
    expect(result.isSuccessful).toBe(true);
  });
});
```

### Available Database Helpers

```typescript
import {
  getTestDb,           // Get Drizzle ORM database instance
  resetTestDatabase,   // Truncate all tables (23 tables with CASCADE)
  cleanupTable,        // Cleanup specific table
  closeTestDb,         // Close worker connection
  isTestDbInitialized, // Check initialization status
} from '@/tests/setup/test-db';
```

### Database Configuration

- **Container**: PostgreSQL 16 Alpine (Testcontainers)
- **Migrations**: Auto-run from `src/lib/db/migrations/`
- **Connection pooling**: Max 5 connections per worker
- **Timeouts**: 5s connection, 30s idle

## Test Description Conventions

```typescript
describe('ComponentName or ModuleName', () => {
  describe('methodName or feature', () => {
    // Positive cases first
    it('should [expected behavior] when [condition]', () => {});
    it('should return [expected result] for [input type]', () => {});

    // Edge cases
    it('should handle [edge case]', () => {});

    // Error cases last
    it('should throw when [error condition]', () => {});
    it('should return null for [invalid input]', () => {});
  });
});
```

## Assertion Patterns

```typescript
// Existence
expect(element).toBeInTheDocument();
expect(result).toBeDefined();
expect(result).not.toBeNull();

// Equality
expect(result).toBe(expected);
expect(result).toEqual({ key: 'value' });

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);
expect(array).toContainEqual({ id: '1' });

// Objects
expect(object).toHaveProperty('key');
expect(object).toMatchObject({ key: 'value' });

// Async
await expect(asyncFn()).resolves.toBe(expected);
await expect(asyncFn()).rejects.toThrow('error');

// Calls
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
expect(mockFn).toHaveBeenCalledTimes(1);
```

## Test Commands

```bash
# Vitest Commands
npm run test              # Run all tests (watch mode)
npm run test:run          # Run tests once (no watch)
npm run test:coverage     # Run with coverage report
npm run test:unit         # Run unit tests only (tests/unit)
npm run test:integration  # Run integration tests only (tests/integration)
npm run test:components   # Run component tests only (tests/components)
npm run test:ui           # Run with Vitest UI dashboard

# Run specific file
npm run test:run -- tests/unit/lib/validations/users.validation.test.ts

# Playwright E2E Commands
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Run with Playwright UI

# Run specific E2E test
npm run test:e2e -- tests/e2e/specs/smoke/health.spec.ts
npm run test:e2e -- --grep "user can add"
```

## Configuration Details

### Vitest Configuration

```typescript
// vitest.config.ts key settings
{
  environment: 'jsdom',
  globals: true,                    // No imports for describe/it/expect
  pool: 'forks',                    // Fork-based isolation
  fileParallelism: false,           // Sequential to prevent DB deadlocks
  testTimeout: 30000,               // 30 second timeout
  retry: process.env.CI ? 2 : 0,    // Retry in CI only
  coverage: {
    thresholds: { statements: 60, branches: 60, functions: 60, lines: 60 }
  }
}
```

### Playwright Configuration

```typescript
// playwright.config.ts key settings
{
  timeout: 60000,                   // 60 second test timeout
  expect: { timeout: 10000 },       // 10 second expect timeout
  retries: process.env.CI ? 2 : 1,  // Retries
  workers: process.env.CI ? 4 : undefined,
  webServer: {
    command: process.env.CI ? 'npm run build && npm start' : 'npm run dev'
  }
}
```

## Pre-Mocked Dependencies

The following are automatically mocked in `tests/setup/vitest.setup.ts`:

```typescript
// Clerk authentication
'@clerk/nextjs' - ClerkProvider, useAuth, useUser, UserButton, SignedIn, SignedOut, etc.
'@clerk/nextjs/server' - auth(), clerkClient(), currentUser()

// Next.js
'next/navigation' - useRouter, useParams, usePathname, redirect, notFound
'next/headers' - cookies(), headers()

// Third-party
'sonner' - Toast notifications
'next-themes' - Theme provider
```

Default test user in mocks:
- `userId: 'test-user-id'`
- `email: 'test@example.com'`

## Anti-Patterns to Avoid

1. **Never test implementation details** - Test behavior, not internals
2. **Never use `test.only` in commits** - Remove focused tests
3. **Never skip cleanup** - Always reset state between tests
4. **Never use arbitrary timeouts** - Use `waitFor` and proper assertions
5. **Never hardcode test data** - Use factories and fixtures
6. **Never test multiple behaviors** - One assertion focus per test
7. **Never mock what you're testing** - Mock dependencies only
8. **Never use snapshot tests for logic** - Use explicit assertions
9. **Never import describe/it/expect/vi** - They are globals (Vitest config)
