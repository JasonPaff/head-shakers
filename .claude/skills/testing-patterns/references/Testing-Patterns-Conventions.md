# Testing Patterns Conventions

## Overview

Head Shakers uses Vitest for unit and integration tests, Testing Library for component tests, and Playwright for E2E tests. Tests follow a consistent structure and naming convention.

## Test Structure

```
tests/
├── unit/                    # Unit tests (pure functions, utilities)
│   ├── lib/
│   └── utils/
├── integration/             # Integration tests (API, database)
│   ├── actions/
│   ├── facades/
│   └── queries/
├── components/              # Component tests
│   ├── ui/
│   └── feature/
├── e2e/                     # End-to-end tests
│   └── *.spec.ts
├── fixtures/                # Test fixtures and factories
├── mocks/                   # MSW handlers and mocks
└── setup/                   # Test setup files
```

## File Naming

- **Unit tests**: `{file-name}.test.ts`
- **Integration tests**: `{file-name}.integration.test.ts`
- **Component tests**: `{component-name}.test.tsx`
- **E2E tests**: `{feature}.spec.ts`

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
      const result = await SocialFacade.toggleLike(
        'target-123',
        'bobblehead',
        testUserId,
        db,
      );

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it('should remove like when already liked', async () => {
      // First like
      await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);

      // Toggle (unlike)
      const result = await SocialFacade.toggleLike(
        'target-123',
        'bobblehead',
        testUserId,
        db,
      );

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(false);
      expect(result.likeCount).toBe(0);
    });
  });
});
```

## Component Test Pattern

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CommentForm } from '@/components/feature/social/comment-form';

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
    render(<CommentForm {...defaultProps} />);

    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('should submit form with valid input', async () => {
    const user = userEvent.setup();
    const { createCommentAction } = await import('@/lib/actions/social/social.actions');
    vi.mocked(createCommentAction).mockResolvedValueOnce({
      data: { success: true, data: { id: 'comment-1' }, message: 'Created' },
    });

    render(<CommentForm {...defaultProps} />);

    await user.type(screen.getByLabelText(/comment/i), 'Test comment');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(createCommentAction).toHaveBeenCalledWith(
        expect.objectContaining({ content: 'Test comment' }),
      );
    });
  });

  it('should show validation error for empty input', async () => {
    const user = userEvent.setup();

    render(<CommentForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
  });
});
```

## E2E Test Pattern (Playwright)

```typescript
import { expect, test } from '@playwright/test';

test.describe('Comments Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should add a comment to bobblehead', async ({ page }) => {
    // Navigate to a bobblehead
    await page.goto('/bobbleheads/test-bobblehead-id');

    // Add comment
    await page.fill('[data-testid="comment-input"]', 'Great bobblehead!');
    await page.click('[data-testid="submit-comment"]');

    // Verify comment appears
    await expect(page.getByText('Great bobblehead!')).toBeVisible();
  });

  test('should delete own comment', async ({ page }) => {
    await page.goto('/bobbleheads/test-bobblehead-id');

    // Find and delete comment
    await page.click('[data-testid="comment-menu"]');
    await page.click('[data-testid="delete-comment"]');
    await page.click('[data-testid="confirm-delete"]');

    // Verify comment is gone
    await expect(page.getByText('Great bobblehead!')).not.toBeVisible();
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

  const [bobblehead] = await db
    .insert(bobbleheads)
    .values(defaultBobblehead)
    .returning();
  return bobblehead;
}
```

## Testing Database (Testcontainers)

```typescript
// tests/setup/database.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll } from 'vitest';

let container: PostgreSqlContainer;

beforeAll(async () => {
  container = await new PostgreSqlContainer().start();
  process.env.DATABASE_URL = container.getConnectionUri();

  // Run migrations
  await runMigrations();
});

afterAll(async () => {
  await container.stop();
});
```

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
# Run all tests
npm run test

# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests in watch mode
npm run test -- --watch

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test -- --coverage
```

## Anti-Patterns to Avoid

1. **Never test implementation details** - Test behavior, not internals
2. **Never use `test.only` in commits** - Remove focused tests
3. **Never skip cleanup** - Always reset state between tests
4. **Never use arbitrary timeouts** - Use `waitFor` and proper assertions
5. **Never hardcode test data** - Use factories and fixtures
6. **Never test multiple behaviors** - One assertion focus per test
7. **Never mock what you're testing** - Mock dependencies only
8. **Never use snapshot tests for logic** - Use explicit assertions
