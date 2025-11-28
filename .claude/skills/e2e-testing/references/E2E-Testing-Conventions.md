# E2E Testing Conventions

## Overview

E2E tests validate complete user flows using Playwright browser automation. They test the application as a real user would interact with it.

**File Pattern**: `tests/e2e/specs/**/*.spec.ts`

**Key Characteristics**:

- Full browser automation with Playwright
- Custom fixtures for authentication contexts
- Page Object Model for reusable interactions
- ComponentFinder for data-testid lookups

## Project Structure

E2E tests are organized into projects with dependencies:

1. **auth-setup** - Authenticates test users (runs first)
2. **smoke** - Health and basic functionality checks
3. **user-authenticated** - Standard user tests
4. **admin-authenticated** - Admin user tests
5. **new-user-authenticated** - Onboarding tests
6. **unauthenticated** - Public route tests

## Test Directory Structure

```
tests/e2e/
├── specs/
│   ├── smoke/        # Health and basic functionality
│   ├── public/       # Unauthenticated user tests
│   ├── user/         # Standard user tests
│   ├── admin/        # Admin user tests
│   └── onboarding/   # New user onboarding tests
├── pages/            # Page Object Model classes
├── fixtures/         # Custom Playwright fixtures
├── helpers/          # ComponentFinder and utilities
├── utils/            # Neon branch, test data utilities
├── setup/            # Auth setup (auth.setup.ts)
├── global.setup.ts   # Global setup (DB branch creation)
└── global.teardown.ts # Global teardown (cleanup)
```

## Using Custom Fixtures

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

## Available Fixtures

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

## ComponentFinder Helper

Use ComponentFinder for standardized `data-testid` lookups:

```typescript
// All methods return Playwright locator strings
finder.feature('bobblehead', 'card'); // [data-testid="feature-bobblehead-card"]
finder.form('comment', 'input'); // [data-testid="form-comment-input"]
finder.formField('email'); // [data-testid="form-field-email"]
finder.ui('button', 'primary'); // [data-testid="ui-button-primary"]
finder.layout('sidebar', 'nav'); // [data-testid="layout-sidebar-nav"]
finder.tableCell(0, 1); // [data-testid="table-cell-0-1"]
finder.component('custom', 'widget', 'main'); // [data-testid="custom-widget-main"]
```

## Page Object Model

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

  async deleteItem(itemId: string) {
    await this.page.click(this.byTestId(`feature-item-${itemId}-menu`));
    await this.page.click(this.byTestId('feature-delete-button'));
  }

  async getItemCount() {
    const items = await this.page.locator(this.byTestId('feature-item-card')).all();
    return items.length;
  }
}
```

### Using Page Objects

```typescript
import { expect } from '@playwright/test';

import { test } from '@/tests/e2e/fixtures/base.fixture';
import { CollectionPage } from '@/tests/e2e/pages/collection.page';

test.describe('Collection Management', () => {
  test('should add item to collection', async ({ userPage }) => {
    const collectionPage = new CollectionPage(userPage);
    await collectionPage.goto();

    await collectionPage.addItem('New Bobblehead');

    await expect(userPage.getByText('New Bobblehead')).toBeVisible();
  });
});
```

## Basic E2E Test (Without Custom Fixtures)

For public pages that don't need authentication:

```typescript
import { expect, test } from '@playwright/test';

test.describe('Public Pages', () => {
  test('should display home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/about"]');
    await expect(page.getByRole('heading', { name: /about/i })).toBeVisible();
  });
});
```

## Authentication Context Usage

```typescript
test.describe('User Dashboard', () => {
  // User is already logged in via userPage fixture
  test('should show user dashboard', async ({ userPage }) => {
    await userPage.goto('/dashboard');
    await expect(userPage.getByText('Welcome back')).toBeVisible();
  });
});

test.describe('Admin Panel', () => {
  // Admin is already logged in via adminPage fixture
  test('should access admin settings', async ({ adminPage }) => {
    await adminPage.goto('/admin');
    await expect(adminPage.getByText('Admin Dashboard')).toBeVisible();
  });
});

test.describe('New User Onboarding', () => {
  // New user (no profile) via newUserPage fixture
  test('should show onboarding flow', async ({ newUserPage }) => {
    await newUserPage.goto('/onboarding');
    await expect(newUserPage.getByText('Complete your profile')).toBeVisible();
  });
});
```

## Playwright Assertions

```typescript
// Visibility
await expect(page.getByRole('button')).toBeVisible();
await expect(page.getByText('Error')).not.toBeVisible();

// Text content
await expect(page.getByRole('heading')).toHaveText('Welcome');
await expect(page.getByTestId('count')).toContainText('5');

// Attributes
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();
await expect(page.getByRole('checkbox')).toBeChecked();

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/users\/\d+/);

// Count
await expect(page.getByRole('listitem')).toHaveCount(5);
```

## Waiting for Elements

```typescript
// Wait for element to appear
await page.waitForSelector('[data-testid="feature-card"]');

// Wait for navigation
await Promise.all([page.waitForNavigation(), page.click('a[href="/dashboard"]')]);

// Wait for network idle
await page.waitForLoadState('networkidle');

// Wait for specific response
await page.waitForResponse((response) => response.url().includes('/api/data') && response.status() === 200);
```

## Test Organization by Category

```typescript
// tests/e2e/specs/smoke/health.spec.ts
test.describe('Health Checks', () => {
  test('API health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBe(true);
  });
});

// tests/e2e/specs/public/homepage.spec.ts
test.describe('Homepage', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });
});

// tests/e2e/specs/user/profile.spec.ts
test.describe('User Profile', () => {
  test('should update display name', async ({ userPage, userFinder }) => {
    await userPage.goto('/profile/edit');
    await userPage.fill(userFinder.form('displayName', 'input'), 'New Name');
    await userPage.click(userFinder.form('submit', 'button'));
    await expect(userPage.getByText('Profile updated')).toBeVisible();
  });
});

// tests/e2e/specs/admin/users.spec.ts
test.describe('Admin User Management', () => {
  test('should list all users', async ({ adminPage }) => {
    await adminPage.goto('/admin/users');
    await expect(adminPage.getByRole('table')).toBeVisible();
  });
});
```

## Checklist

- [ ] Use Playwright for browser automation
- [ ] Place tests in appropriate `tests/e2e/specs/{category}/` folder
- [ ] Use custom fixtures (`adminPage`, `userPage`, `newUserPage`)
- [ ] Use Page Object Model pattern (extend `BasePage`)
- [ ] Use `ComponentFinder` from helpers for data-testid lookups
- [ ] Test complete user flows with proper auth context
- [ ] Use `expect` from Playwright, not Vitest
- [ ] Handle async operations with proper waits
- [ ] Organize tests by user type (smoke, public, user, admin, onboarding)
