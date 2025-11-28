# Testing Base Conventions

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
