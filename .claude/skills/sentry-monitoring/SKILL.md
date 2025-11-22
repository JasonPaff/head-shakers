---
name: sentry-monitoring
description: Enforces Head Shakers Sentry monitoring conventions when implementing error tracking, performance monitoring, and breadcrumb logging. This skill ensures consistent patterns for context setting, breadcrumb categories, error capture, and performance spans.
---

# Sentry Monitoring Skill

## Purpose

This skill enforces the Head Shakers Sentry monitoring conventions automatically during error tracking implementation. It ensures consistent patterns for context setting, breadcrumb categories, error capture, performance spans, and error boundaries.

## Activation

This skill activates when:

- Creating or modifying server actions in `src/lib/actions/`
- Implementing error handling in facades
- Setting up performance monitoring spans
- Adding breadcrumbs for debugging
- Creating error boundary components
- Working with utility functions that need error tracking
- Any code that imports from `@sentry/nextjs`

## Workflow

1. Detect Sentry work (imports from `@sentry/nextjs` or uses Sentry patterns)
2. Load `references/Sentry-Monitoring-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of Sentry patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

### Server Actions

- Set context at the start with `Sentry.setContext(SENTRY_CONTEXTS.*, {...})`
- Add breadcrumbs for successful operations
- Log non-critical failures (e.g., cache invalidation) with `level: 'warning'`

### Facades

- Add breadcrumbs for non-blocking operations (Cloudinary cleanup)
- Capture non-critical exceptions without failing the operation

### Error Boundaries

- Use `Sentry.captureException` with `contexts`, `extra`, `tags`, and `level`
- Use `Sentry.captureMessage` for user action logging (retry, continue without)

### Utilities

- Capture exceptions with `extra` context for operations
- Use appropriate levels: `'warning'` for recoverable, `'error'` for critical

### Middleware

- Use `Sentry.withScope` and `Sentry.startSpan` for performance tracking
- Set tags and context within the scope

## Constants (Always Use)

| Constant                       | Import Path       | Purpose                        |
| ------------------------------ | ----------------- | ------------------------------ |
| `SENTRY_CONTEXTS`              | `@/lib/constants` | Context names for `setContext` |
| `SENTRY_BREADCRUMB_CATEGORIES` | `@/lib/constants` | Breadcrumb category values     |
| `SENTRY_LEVELS`                | `@/lib/constants` | Breadcrumb level values        |
| `SENTRY_TAGS`                  | `@/lib/constants` | Tag names for `setTag`         |
| `SENTRY_OPERATIONS`            | `@/lib/constants` | Operation names for spans      |

## Usage Pattern Reference

| Use Case             | Primary Method            | Level     |
| -------------------- | ------------------------- | --------- |
| Action start         | `Sentry.setContext`       | N/A       |
| Successful operation | `Sentry.addBreadcrumb`    | `INFO`    |
| Non-critical failure | `Sentry.captureException` | `warning` |
| Critical failure     | Let error propagate       | `error`   |
| User action logging  | `Sentry.captureMessage`   | `info`    |
| Performance tracking | `Sentry.startSpan`        | N/A       |

## References

- `references/Sentry-Monitoring-Conventions.md` - Complete Sentry monitoring conventions
