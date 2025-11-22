---
name: facade-layer
description: Enforces Head Shakers facade layer coding conventions when creating or modifying business logic facades. This skill ensures consistent patterns for transaction handling, error management, cache integration, query coordination, and cross-service orchestration.
---

# Facade Layer Skill

## Purpose

This skill enforces the Head Shakers facade layer coding conventions automatically during business logic development. It ensures consistent patterns for transaction handling, error management, cache integration, query coordination, and cross-service orchestration with Sentry monitoring.

## Activation

This skill activates when:

- Creating new facade files in `src/lib/facades/`
- Modifying existing facade files (`.facade.ts`)
- Implementing business logic that coordinates multiple queries
- Working with database transactions
- Coordinating between multiple services or facades

## Workflow

1. Detect facade work (file path contains `facades/` or class name ends with `Facade`)
2. Load `references/Facade-Layer-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations of facade patterns
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

- Use static class methods (no instantiation needed)
- Define `const facadeName = '{Domain}Facade'` for error context
- Accept optional `DatabaseExecutor` (`dbInstance?: DatabaseExecutor`)
- Create appropriate query context (`createProtectedQueryContext`, `createUserQueryContext`, `createPublicQueryContext`)
- Wrap write operations in transactions: `(dbInstance ?? db).transaction(async (tx) => { ... })`
- Use domain-specific CacheService helpers (`CacheService.bobbleheads.byId()`, etc.)
- Use CacheRevalidationService for invalidation (`CacheRevalidationService.bobbleheads.onPhotoChange()`)
- Handle errors with `createFacadeError(errorContext, error)`
- Use Sentry for breadcrumbs and non-blocking error capture
- Coordinate across facades when business logic spans domains
- Use `Promise.all` for parallel independent data fetching

## References

- `references/Facade-Layer-Conventions.md` - Complete facade layer conventions
