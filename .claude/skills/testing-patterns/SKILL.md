---
name: testing-patterns
description: Enforces Head Shakers testing conventions when creating or modifying tests using Vitest, Testing Library, and Playwright. This skill ensures consistent patterns for unit tests, integration tests, E2E tests, mocking, and test organization.
---

# Testing Patterns Skill

## Purpose

This skill enforces the Head Shakers testing conventions automatically during test development. It ensures consistent patterns for unit tests, integration tests, E2E tests, mocking, and test organization.

## Activation

This skill activates when:

- Creating new test files in `tests/`
- Modifying existing test files (`.test.ts`, `.spec.ts`)
- Setting up test mocks or fixtures
- Working with Testing Library or Playwright
- Implementing database tests with Testcontainers

## Workflow

1. Detect testing work (file path contains `tests/` or ends with `.test.ts`/`.spec.ts`)
2. Load `references/Testing-Patterns-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of testing patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

- Use `describe`/`it` blocks with clear descriptions
- Use Testing Library queries for component tests
- Use MSW for API mocking
- Use Testcontainers for database tests
- Use Playwright for E2E tests

## References

- `references/Testing-Patterns-Conventions.md` - Complete testing conventions
