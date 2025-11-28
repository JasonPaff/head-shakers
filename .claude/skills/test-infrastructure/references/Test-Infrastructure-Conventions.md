# Test Infrastructure Conventions

## Overview

Test infrastructure provides reusable foundations for all test types including factories for database entities, MSW handlers for API mocking, mock data objects, and Page Object Model classes.

## File Patterns

- **Factories**: `tests/fixtures/*.factory.ts`
- **MSW handlers**: `tests/mocks/handlers/*.handlers.ts`
- **Mock data**: `tests/mocks/data/*.mock.ts`
- **Shared mocks**: `tests/mocks/*.mock.ts`
- **Page Objects**: `tests/e2e/pages/*.page.ts`
- **E2E helpers**: `tests/e2e/helpers/*.ts`

## Factory Pattern

Factories create database entities for integration tests using Testcontainers.

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
    role: 'user' as const,
    ...overrides,
  };

  const [user] = await db.insert(users).values(defaultUser).returning();
  return user;
}

// tests/fixtures/bobblehead.factory.ts
import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';

export async function createTestBobblehead(userId: string, overrides = {}) {
  const defaultBobblehead = {
    id: `bobblehead-${Date.now()}`,
    name: 'Test Bobblehead',
    description: 'A test bobblehead for testing',
    userId,
    isPublic: true,
    ...overrides,
  };

  const [bobblehead] = await db.insert(bobbleheads).values(defaultBobblehead).returning();
  return bobblehead;
}

// tests/fixtures/collection.factory.ts
export async function createTestCollection(userId: string, overrides = {}) {
  const defaultCollection = {
    id: `collection-${Date.now()}`,
    name: 'Test Collection',
    description: 'A test collection',
    userId,
    isPublic: true,
    ...overrides,
  };

  const [collection] = await db.insert(collections).values(defaultCollection).returning();
  return collection;
}
```

### Factory Guidelines

- Use async functions returning database entities
- Accept `overrides` parameter for customization
- Generate unique IDs using timestamps: `${prefix}-${Date.now()}`
- Use database insert with `.returning()` to get created entity
- Export named factory functions (not default exports)
- Include sensible defaults for required fields

## MSW Handler Pattern

MSW handlers mock API endpoints for component and integration tests.

```typescript
// tests/mocks/handlers/bobbleheads.handlers.ts
import { http, HttpResponse } from 'msw';

export const bobbleheadHandlers = [
  // GET single bobblehead
  http.get('/api/bobbleheads/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Bobblehead',
      description: 'A test bobblehead',
      userId: 'user-123',
      isPublic: true,
    });
  }),

  // GET list of bobbleheads
  http.get('/api/bobbleheads', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';

    return HttpResponse.json({
      data: [
        { id: 'bobblehead-1', name: 'Bobblehead 1' },
        { id: 'bobblehead-2', name: 'Bobblehead 2' },
      ],
      pagination: {
        page: parseInt(page),
        totalPages: 5,
        totalItems: 50,
      },
    });
  }),

  // POST create bobblehead
  http.post('/api/bobbleheads', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: 'new-bobblehead-id',
        ...body,
        createdAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  // PUT update bobblehead
  http.put('/api/bobbleheads/:id', async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  // DELETE bobblehead
  http.delete('/api/bobbleheads/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];

// tests/mocks/handlers/auth.handlers.ts
export const authHandlers = [
  http.get('/api/auth/session', () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
      },
    });
  }),
];
```

### Handler Setup

```typescript
// tests/mocks/handlers/index.ts
import { authHandlers } from './auth.handlers';
import { bobbleheadHandlers } from './bobbleheads.handlers';
import { collectionHandlers } from './collections.handlers';

export const handlers = [...authHandlers, ...bobbleheadHandlers, ...collectionHandlers];

// tests/setup/msw.setup.ts
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Mock Data Pattern

Mock data provides consistent test data objects.

```typescript
// tests/mocks/data/users.mock.ts
import type { User } from '@/lib/db/schema';

export const mockUser: User = {
  id: 'user-123',
  clerkId: 'clerk-user-123',
  email: 'test@example.com',
  username: 'testuser',
  displayName: 'Test User',
  role: 'user',
  bio: null,
  avatarUrl: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  clerkId: 'clerk-admin-123',
  email: 'admin@example.com',
  username: 'adminuser',
  displayName: 'Admin User',
  role: 'admin',
};

export const mockUserList: User[] = [
  mockUser,
  mockAdminUser,
  {
    ...mockUser,
    id: 'user-456',
    username: 'anotheruser',
  },
];

// tests/mocks/data/bobbleheads.mock.ts
import type { Bobblehead } from '@/lib/db/schema';

export const mockBobblehead: Bobblehead = {
  id: 'bobblehead-123',
  name: 'Test Bobblehead',
  description: 'A test bobblehead for unit tests',
  userId: 'user-123',
  isPublic: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockPrivateBobblehead: Bobblehead = {
  ...mockBobblehead,
  id: 'bobblehead-private',
  name: 'Private Bobblehead',
  isPublic: false,
};
```

## Shared Mocks Pattern

```typescript
// tests/mocks/clerk.mock.ts
export const mockClerkUser = {
  id: 'test-user-id',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
};

export const mockAuth = {
  userId: 'test-user-id',
  sessionId: 'session-123',
  getToken: vi.fn().mockResolvedValue('mock-token'),
};

// tests/mocks/cloudinary.mock.ts
export const mockCloudinaryUploadResult = {
  public_id: 'test-image-123',
  secure_url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
  width: 800,
  height: 600,
  format: 'jpg',
};

export const mockCloudinaryService = {
  uploadImage: vi.fn().mockResolvedValue(mockCloudinaryUploadResult),
  deleteImage: vi.fn().mockResolvedValue({ result: 'ok' }),
  getImageUrl: vi.fn().mockReturnValue('https://res.cloudinary.com/test/image/upload/test.jpg'),
};
```

## Page Object Model Pattern

Page Objects encapsulate page interactions for E2E tests.

```typescript
// tests/e2e/pages/base.page.ts
import type { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract readonly url: string;

  async goto() {
    await this.page.goto(this.url);
  }

  byTestId(testId: string) {
    return `[data-testid="${testId}"]`;
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }
}

// tests/e2e/pages/home.page.ts
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly url = '/';

  async clickGetStarted() {
    await this.page.click(this.byTestId('hero-cta-button'));
  }

  async searchBobbleheads(query: string) {
    await this.page.fill(this.byTestId('search-input'), query);
    await this.page.click(this.byTestId('search-button'));
  }

  async getFeaturedCount() {
    const items = await this.page.locator(this.byTestId('featured-item')).all();
    return items.length;
  }
}

// tests/e2e/pages/collection.page.ts
import { BasePage } from './base.page';

export class CollectionPage extends BasePage {
  readonly url = '/collections';

  constructor(
    page: Page,
    private readonly collectionId?: string,
  ) {
    super(page);
    if (collectionId) {
      this.url = `/collections/${collectionId}`;
    }
  }

  async addItem(name: string) {
    await this.page.click(this.byTestId('feature-add-item-button'));
    await this.page.fill(this.byTestId('form-item-name-input'), name);
    await this.page.click(this.byTestId('form-submit-button'));
  }

  async deleteItem(itemId: string) {
    await this.page.click(this.byTestId(`feature-item-${itemId}-menu`));
    await this.page.click(this.byTestId('feature-delete-button'));
  }
}
```

## ComponentFinder Helper

```typescript
// tests/e2e/helpers/component-finder.ts
export class ComponentFinder {
  // Feature components: feature-{domain}-{element}
  feature(domain: string, element: string) {
    return `[data-testid="feature-${domain}-${element}"]`;
  }

  // Form elements: form-{name}-{type}
  form(name: string, type: string) {
    return `[data-testid="form-${name}-${type}"]`;
  }

  // Form fields: form-field-{name}
  formField(name: string) {
    return `[data-testid="form-field-${name}"]`;
  }

  // UI components: ui-{component}-{variant}
  ui(component: string, variant: string) {
    return `[data-testid="ui-${component}-${variant}"]`;
  }

  // Layout: layout-{section}-{element}
  layout(section: string, element: string) {
    return `[data-testid="layout-${section}-${element}"]`;
  }

  // Table cells: table-cell-{row}-{col}
  tableCell(row: number, col: number) {
    return `[data-testid="table-cell-${row}-${col}"]`;
  }

  // Generic component: {prefix}-{name}-{suffix}
  component(prefix: string, name: string, suffix: string) {
    return `[data-testid="${prefix}-${name}-${suffix}"]`;
  }
}
```

## Checklist

### Factory Checklist

- [ ] Use async functions returning database entities
- [ ] Accept `overrides` parameter for customization
- [ ] Generate unique IDs using timestamps
- [ ] Use database insert with `.returning()`
- [ ] Export named factory functions

### MSW Handler Checklist

- [ ] Use `http` from MSW for route handlers
- [ ] Return `HttpResponse.json()` for JSON responses
- [ ] Handle request body with `await request.json()`
- [ ] Export handlers array for server setup
- [ ] Include error response handlers for testing error states

### Page Object Checklist

- [ ] Extend `BasePage` class
- [ ] Define abstract `url` property
- [ ] Use `byTestId` helper for element location
- [ ] Create methods for common page interactions
- [ ] Keep methods focused and reusable

### Mock Data Checklist

- [ ] Export typed mock objects
- [ ] Use realistic data patterns
- [ ] Include edge case variations (empty, null, etc.)
- [ ] Keep mock data in sync with schema types
