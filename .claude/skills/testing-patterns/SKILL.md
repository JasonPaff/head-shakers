---
name: testing-patterns
description: Enforces Head Shakers testing conventions when creating or modifying tests using Vitest, Testing Library, and Playwright. This skill ensures consistent patterns for unit tests, integration tests, component tests, E2E tests, mocking, and test organization.
---

# Testing Patterns Skill

## Purpose

This skill enforces the Head Shakers testing conventions automatically during test development. It ensures consistent patterns for unit tests, integration tests, component tests, E2E tests, mocking, fixtures, and test organization.

## Activation

This skill activates when:

- Creating new test files in `tests/`
- Modifying existing test files (`.test.ts`, `.test.tsx`, `.spec.ts`)
- Setting up test mocks or fixtures in `tests/mocks/` or `tests/fixtures/`
- Working with Testing Library or Playwright
- Implementing database tests with Testcontainers
- Creating E2E page objects or fixtures

## File Patterns

- **Unit tests**: `tests/unit/**/*.test.ts`
- **Component tests**: `tests/components/**/*.test.tsx`
- **Integration tests**: `tests/integration/**/*.test.ts` or `*.integration.test.ts`
- **E2E tests**: `tests/e2e/specs/**/*.spec.ts`
- **Factories**: `tests/fixtures/*.factory.ts`
- **MSW handlers**: `tests/mocks/handlers/*.handlers.ts`
- **Mock data**: `tests/mocks/data/*.mock.ts`

## Workflow

1. Detect testing work (file path contains `tests/` or matches test file patterns)
2. Load `references/Testing-Patterns-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of testing patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

### Vitest (Unit/Integration/Component)
- Use `describe`/`it` blocks with clear descriptions (globals enabled, no imports)
- Use `customRender` from `tests/setup/test-utils.tsx` for component tests
- Use Testing Library queries (`getByRole`, `getByTestId`) for component tests
- Use MSW handlers in `tests/mocks/handlers/` for API mocking
- Use Testcontainers helpers (`getTestDb`, `resetTestDatabase`) for database tests
- Use factories from `tests/fixtures/` for test data creation

### Playwright (E2E)
- Use custom fixtures from `tests/e2e/fixtures/base.fixture.ts`
- Use `ComponentFinder` from helpers for `data-testid` lookups
- Use Page Object Model pattern (extend `BasePage`)
- Place tests in appropriate `tests/e2e/specs/{category}/` folder
- Use proper auth fixtures (`adminPage`, `userPage`, `newUserPage`)

## References

- `references/Testing-Patterns-Conventions.md` - Complete testing conventions
