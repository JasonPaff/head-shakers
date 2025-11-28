# Facade Error Handling Boilerplate Reduction Strategies

**Date:** 2025-11-28
**Status:** Proposal / Research
**Author:** Claude Code (Facade Layer Specialist)

## Executive Summary

This document proposes strategies to reduce the repetitive try-catch-rethrow boilerplate in facade methods while maintaining type safety, Sentry integration, and comprehensive error context. After analyzing the existing codebase (14 facade files, error utilities, Sentry breadcrumb helpers), we present 6 distinct strategies with implementation examples, pros/cons, and compatibility assessments.

## Current State Analysis

### Existing Error Handling Utilities

The codebase already has robust error handling infrastructure:

1. **Error Builders** (`src/lib/utils/error-builders.ts`)
   - `createFacadeError()` - Converts any error to ActionError with facade context
   - Layer-specific builders (query, service, middleware)
   - Type-safe error contexts

2. **Sentry Breadcrumb Utilities** (`src/lib/utils/sentry-server/breadcrumbs.server.ts`)
   - `withFacadeBreadcrumbs()` - Wraps operations with entry/success/error breadcrumbs
   - `facadeBreadcrumb()` - Manual breadcrumb creation
   - `trackFacadeWarning()` - Non-critical error tracking

3. **Error Types** (`src/lib/utils/error-types.ts`)
   - `FacadeErrorContext` - Structured context interface
   - Error severity levels and categories

### Boilerplate Pattern Analysis

Examining `BobbleheadsFacade` (945 lines), we observe:

**Pattern 1: Simple read methods (no breadcrumbs)**
```typescript
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}
```

**Pattern 2: Operations with breadcrumbs (newer pattern)**
```typescript
static async getPlatformStatsAsync(dbInstance: DatabaseExecutor = db): Promise<PlatformStats> {
  const methodName = 'getPlatformStatsAsync';

  return withFacadeBreadcrumbs(
    { facade: facadeName, method: methodName },
    async () => {
      try {
        return await CacheService.platform.stats(/* ... */);
      } catch (error) {
        throw createFacadeError(
          {
            data: {},
            facade: facadeName,
            method: methodName,
            operation: OPERATIONS.PLATFORM.GET_STATS,
          },
          error,
        );
      }
    },
    { includeResultSummary: (stats) => ({ /* ... */ }) },
  );
}
```

**Pattern 3: Cached read methods**
```typescript
static async getBobbleheadById(
  id: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return CacheService.bobbleheads.byId(
    () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findByIdAsync(id, context);
    },
    id,
    {
      context: {
        entityId: id,
        entityType: 'bobblehead',
        facade: 'BobbleheadsFacade',
        operation: 'getById',
        userId: viewerUserId,
      },
    },
  );
}
```

### Key Observations

1. **Three distinct patterns** with different verbosity levels
2. **Pattern 3 (cached)** has NO explicit error handling but should have
3. **Pattern 2 (breadcrumbs)** has nested try-catch (one in wrapper, one inside)
4. **`facadeName` constant** is defined at file top in all facades
5. **Context creation** is repetitive across all methods
6. **Method name** is often duplicated as string literal

---

## Strategy 1: Higher-Order Function with Context Inference

### Concept

Create a wrapper function that infers context from the facade class and method, eliminating manual context creation.

### Implementation

```typescript
// src/lib/utils/facade-helpers.ts

import type { FacadeErrorContext } from './error-types';
import type { DatabaseExecutor } from './next-safe-action';
import { createFacadeError } from './error-builders';

interface FacadeMethodContext {
  facadeName: string;
  operation?: string;
  userId?: string;
  data?: Record<string, unknown>;
}

/**
 * Wraps a facade method with automatic error handling
 * Infers method name from Error.stack and creates FacadeErrorContext
 */
export async function withFacadeErrorHandling<T>(
  context: FacadeMethodContext,
  operation: () => Promise<T>,
): Promise<T> {
  const methodName = getCallingMethodName(); // Extract from stack trace

  try {
    return await operation();
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      facade: context.facadeName,
      method: methodName,
      operation: context.operation || methodName,
      userId: context.userId,
      data: context.data,
    };
    throw createFacadeError(errorContext, error);
  }
}

/**
 * Extract calling method name from stack trace
 * Fallback to 'unknown' if extraction fails
 */
function getCallingMethodName(): string {
  const stack = new Error().stack;
  const stackLines = stack?.split('\n') || [];
  // Stack: [0] Error, [1] getCallingMethodName, [2] withFacadeErrorHandling, [3] actual method
  const methodLine = stackLines[3];
  const match = methodLine?.match(/at\s+(?:.*\.)?(\w+)\s+\(/);
  return match?.[1] || 'unknown';
}
```

### Usage Example

```typescript
// Before
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}

// After
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return withFacadeErrorHandling(
    {
      facadeName,
      operation: 'getBySlug',
      userId: viewerUserId,
      data: { slug },
    },
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
  );
}
```

### Pros

- Reduces 9 lines to 5 lines (44% reduction)
- Automatic method name inference (no string duplication)
- Type-safe context building
- Compatible with existing error infrastructure
- Easy migration path (one method at a time)

### Cons

- Stack trace parsing is fragile (may break with minification/transpilation)
- Method name inference adds runtime overhead
- Less explicit than manual context creation
- Doesn't handle Sentry breadcrumbs
- Nesting looks awkward for simple operations

### Compatibility with Existing Patterns

- **Pattern 1 (simple):** Perfect fit - reduces boilerplate
- **Pattern 2 (breadcrumbs):** Would need to combine with `withFacadeBreadcrumbs`
- **Pattern 3 (cached):** Doesn't apply (no error handling currently)

### Recommendation

**Not recommended** due to stack trace fragility. However, could be viable if method name is passed explicitly instead of inferred.

---

## Strategy 2: Decorator-Style Pattern (TypeScript Experimental Decorators)

### Concept

Use TypeScript decorators to wrap methods with error handling logic. Requires enabling experimental decorators.

### Implementation

```typescript
// src/lib/utils/facade-decorators.ts

import type { FacadeErrorContext } from './error-types';
import { createFacadeError } from './error-builders';

interface FacadeDecoratorOptions {
  operation?: string;
  getUserId?: (args: unknown[]) => string | undefined;
  getData?: (args: unknown[]) => Record<string, unknown> | undefined;
}

/**
 * Method decorator for automatic facade error handling
 * Usage: @FacadeMethod({ operation: 'getBySlug', getUserId: (args) => args[1] })
 */
export function FacadeMethod(options: FacadeDecoratorOptions = {}) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    const facadeName = target.constructor.name;

    descriptor.value = async function (...args: unknown[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        const errorContext: FacadeErrorContext = {
          facade: facadeName,
          method: propertyKey,
          operation: options.operation || propertyKey,
          userId: options.getUserId?.(args),
          data: options.getData?.(args),
        };
        throw createFacadeError(errorContext, error);
      }
    };

    return descriptor;
  };
}
```

### Usage Example

```typescript
// tsconfig.json (required)
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}

// Before
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}

// After
@FacadeMethod({
  operation: 'getBySlug',
  getUserId: (args) => args[1] as string | undefined,
  getData: (args) => ({ slug: args[0] }),
})
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  const context = viewerUserId
    ? createUserQueryContext(viewerUserId, { dbInstance })
    : createPublicQueryContext({ dbInstance });
  return BobbleheadsQuery.findBySlugAsync(slug, context);
}
```

### Pros

- Clean syntax (no nesting)
- Automatic method name capture
- Reusable decorator configuration
- Metadata-driven approach
- Reduces lines of code significantly (12 to 8 lines, 33%)

### Cons

- **Requires experimental decorators** (not TC39 Stage 3 yet)
- TypeScript's decorator spec is in flux (legacy vs new decorators)
- Next.js/React may have issues with experimental features
- Extracting context from args is awkward (positional access)
- Doesn't work with static methods in all decorator implementations
- Team may not want experimental features

### Compatibility with Existing Patterns

- **Pattern 1:** Works well
- **Pattern 2:** Can combine with `withFacadeBreadcrumbs`
- **Pattern 3:** Not applicable

### Recommendation

**Not recommended** for this project. Experimental decorators are not stable, and the codebase doesn't currently use them. Would introduce new complexity and potential build issues.

---

## Strategy 3: Result Type Pattern (Success/Failure Monads)

### Concept

Return `Result<T, Error>` types instead of throwing exceptions. Errors become values that callers must handle explicitly.

### Implementation

```typescript
// src/lib/utils/result.ts

export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly success = true;
  constructor(readonly value: T) {}

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Success(fn(this.value));
  }

  flatMap<U, E>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }
}

export class Failure<E> {
  readonly success = false;
  constructor(readonly error: E) {}

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this as unknown as Failure<E>;
  }

  flatMap<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this as unknown as Failure<E>;
  }
}

export function Ok<T>(value: T): Success<T> {
  return new Success(value);
}

export function Err<E>(error: E): Failure<E> {
  return new Failure(error);
}

// Helper to wrap facade operations
export async function tryFacade<T>(
  context: FacadeErrorContext,
  operation: () => Promise<T>,
): Promise<Result<T, ActionError>> {
  try {
    const value = await operation();
    return Ok(value);
  } catch (error) {
    return Err(createFacadeError(context, error));
  }
}
```

### Usage Example

```typescript
// Before
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}

// After
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<Result<BobbleheadRecord | null, ActionError>> {
  return tryFacade(
    {
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
      data: { slug },
    },
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
  );
}

// Calling code changes
const result = await BobbleheadsFacade.getBobbleheadBySlug(slug, userId);
if (result.success) {
  const bobblehead = result.value;
  // use bobblehead
} else {
  const error = result.error;
  // handle error
}
```

### Pros

- Makes error handling explicit in type system
- No hidden exceptions (all errors are values)
- Composable with `map` and `flatMap`
- Popular in functional programming (Rust, Haskell)
- Forces callers to handle errors

### Cons

- **BREAKING CHANGE:** All callers must be updated
- Changes return types across entire facade layer
- Requires mental shift from exception-based to Result-based
- Nesting for operation body still required
- Verbose at call sites (must check `result.success`)
- Doesn't integrate with Sentry breadcrumbs
- Server actions expect exceptions, not Results

### Compatibility with Existing Patterns

- **Not compatible** - requires rewriting all facades and callers
- Would need adapter layer for server actions
- Major architectural change

### Recommendation

**Not recommended**. This is a massive breaking change that would require rewriting the entire error handling strategy. The codebase is exception-based, and changing to Results would be a multi-week migration effort with high risk.

---

## Strategy 4: Enhanced Facade Base Class with Template Methods

### Concept

Extend `BaseFacade` with error handling utilities that child facades can call. Provide template methods for common patterns.

### Implementation

```typescript
// src/lib/facades/base/base-facade.ts

import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { BaseContextHelpers } from '@/lib/queries/base/base-context-helpers';
import { createFacadeError } from '@/lib/utils/error-builders';

export abstract class BaseFacade extends BaseContextHelpers {
  /**
   * Get the facade name (should be defined as static in subclass)
   */
  protected static get facadeName(): string {
    return this.name;
  }

  /**
   * Execute a facade operation with automatic error handling
   * Captures method name from call stack
   *
   * @param operation - The operation string (e.g., 'getBySlug')
   * @param fn - The async function to execute
   * @param options - Additional context options
   */
  protected static async execute<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: {
      userId?: string;
      data?: Record<string, unknown>;
    },
  ): Promise<T> {
    const methodName = this.getCallingMethodName();

    try {
      return await fn();
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        facade: this.facadeName,
        method: methodName,
        operation,
        userId: options?.userId,
        data: options?.data,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * Extract the calling method name from stack trace
   * Looks for the method that called execute()
   */
  private static getCallingMethodName(): string {
    const stack = new Error().stack;
    const stackLines = stack?.split('\n') || [];
    // [0] Error, [1] getCallingMethodName, [2] execute, [3] actual method
    const methodLine = stackLines[3];
    const match = methodLine?.match(/at\s+(?:\w+\.)?(\w+)\s+\(/);
    return match?.[1] || 'unknown';
  }

  /**
   * Execute with breadcrumbs and error handling
   */
  protected static async executeWithBreadcrumbs<T>(
    operation: string,
    fn: () => Promise<T>,
    options?: {
      userId?: string;
      data?: Record<string, unknown>;
      includeResultSummary?: (result: T) => Record<string, unknown>;
    },
  ): Promise<T> {
    const methodName = this.getCallingMethodName();
    const { withFacadeBreadcrumbs } = await import('@/lib/utils/sentry-server/breadcrumbs.server');

    return withFacadeBreadcrumbs(
      { facade: this.facadeName, method: methodName, userId: options?.userId },
      async () => {
        try {
          return await fn();
        } catch (error) {
          const errorContext: FacadeErrorContext = {
            facade: this.facadeName,
            method: methodName,
            operation,
            userId: options?.userId,
            data: options?.data,
          };
          throw createFacadeError(errorContext, error);
        }
      },
      { includeResultSummary: options?.includeResultSummary },
    );
  }
}
```

### Usage Example

```typescript
// src/lib/facades/bobbleheads/bobbleheads.facade.ts

export class BobbleheadsFacade extends BaseFacade {
  // Before
  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadBySlug',
        operation: 'getBySlug',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  // After
  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return this.execute(
      'getBySlug',
      async () => {
        const context = viewerUserId
          ? createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return BobbleheadsQuery.findBySlugAsync(slug, context);
      },
      { userId: viewerUserId, data: { slug } },
    );
  }

  // With breadcrumbs
  static async getPlatformStatsAsync(dbInstance: DatabaseExecutor = db): Promise<PlatformStats> {
    return this.executeWithBreadcrumbs(
      OPERATIONS.PLATFORM.GET_STATS,
      async () => {
        return await CacheService.platform.stats(async () => {
          const context = this.publicContext(dbInstance);
          const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
            BobbleheadsQuery.getBobbleheadCountAsync(context),
            CollectionsQuery.getCollectionCountAsync(context),
            UsersQuery.getUserCountAsync(context),
          ]);
          return {
            totalBobbleheads: bobbleheadsCount,
            totalCollections: collectionsCount,
            totalCollectors: collectorsCount,
          };
        }, { /* cache options */ });
      },
      {
        includeResultSummary: (stats) => ({
          totalBobbleheads: stats.totalBobbleheads,
          totalCollections: stats.totalCollections,
          totalCollectors: stats.totalCollectors,
        }),
      },
    );
  }
}
```

### Pros

- Builds on existing `BaseFacade` class
- Automatic method name inference from stack
- Two methods for two patterns (`execute` and `executeWithBreadcrumbs`)
- Inheritance-based, fits OOP design
- Reduces boilerplate significantly (12 to 6 lines, 50%)
- Compatible with all existing facades
- No breaking changes

### Cons

- Stack trace parsing is still fragile
- Requires all facades to extend `BaseFacade` (some might not)
- Async import for breadcrumbs adds complexity
- Nesting operation body is still verbose
- `this.execute` may confuse developers (static method calling pattern)

### Compatibility with Existing Patterns

- **Pattern 1:** Perfect fit
- **Pattern 2:** `executeWithBreadcrumbs` covers this
- **Pattern 3:** Not applicable

### Recommendation

**Moderately recommended** if stack trace fragility can be addressed by making method name explicit instead of inferred. This would be the most compatible approach with existing patterns.

---

## Strategy 5: Explicit Wrapper Functions (No Stack Inference)

### Concept

Provide simple wrapper functions that require explicit method names. No magic, no stack parsing, just straightforward helpers.

### Implementation

```typescript
// src/lib/utils/facade-helpers.ts

import type { FacadeErrorContext } from './error-types';
import { createFacadeError } from './error-builders';

interface FacadeOperationConfig {
  facade: string;
  method: string;
  operation: string;
  userId?: string;
  data?: Record<string, unknown>;
}

/**
 * Wrap a facade operation with error handling
 * Explicitly provide all context - no inference
 */
export async function executeFacadeOperation<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      facade: config.facade,
      method: config.method,
      operation: config.operation,
      userId: config.userId,
      data: config.data,
    };
    throw createFacadeError(errorContext, error);
  }
}

/**
 * Simplified version for cases where operation === method name
 */
export async function executeFacadeMethod<T>(
  facade: string,
  method: string,
  operation: () => Promise<T>,
  options?: { userId?: string; data?: Record<string, unknown> },
): Promise<T> {
  return executeFacadeOperation(
    {
      facade,
      method,
      operation: method,
      userId: options?.userId,
      data: options?.data,
    },
    operation,
  );
}
```

### Usage Example

```typescript
// Before
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}

// After (full config)
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return executeFacadeOperation(
    {
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
      data: { slug },
    },
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
  );
}

// After (simplified - when method === operation)
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return executeFacadeMethod(
    facadeName,
    'getBobbleheadBySlug',
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
    { userId: viewerUserId, data: { slug } },
  );
}
```

### Pros

- **No magic** - explicit method names, no stack parsing
- Simple implementation (20 lines)
- Type-safe and predictable
- Easy to understand and debug
- Works with all facades immediately
- Can combine with `withFacadeBreadcrumbs`
- Reduces boilerplate (12 to 7 lines, 42%)

### Cons

- Still requires method name duplication as string
- Nesting for operation body
- Doesn't automatically add breadcrumbs (but can be combined)
- Config object can be verbose for simple cases

### Compatibility with Existing Patterns

- **Pattern 1:** Direct replacement
- **Pattern 2:** Can nest inside `withFacadeBreadcrumbs`
- **Pattern 3:** Not applicable

### Recommendation

**Highly recommended**. This is the safest, most explicit approach. No fragile inference, no experimental features, just straightforward wrappers.

---

## Strategy 6: Macro-Style Code Generation (Build-time)

### Concept

Use TypeScript Compiler API or a custom transformer to generate error handling code at build time. Methods are decorated with special comments that trigger code generation.

### Implementation

```typescript
// Custom TypeScript transformer (pseudo-code)
// Would run during build process

/**
 * Detects methods with @FacadeMethod JSDoc tag
 * Wraps method body with try-catch during compilation
 */
function transformFacadeMethods(sourceFile: SourceFile): SourceFile {
  function visitor(node: Node): Node {
    if (ts.isMethodDeclaration(node)) {
      const jsdoc = getJSDocTags(node);
      const facadeMethodTag = jsdoc.find(tag => tag.tagName.text === 'FacadeMethod');

      if (facadeMethodTag) {
        // Extract metadata from tag
        const { operation, userId, data } = parseTag(facadeMethodTag);

        // Wrap method body with try-catch
        return wrapWithErrorHandling(node, operation, userId, data);
      }
    }
    return ts.visitEachChild(node, visitor, context);
  }

  return ts.visitNode(sourceFile, visitor);
}
```

### Usage Example

```typescript
// Source code (before compilation)
export class BobbleheadsFacade {
  /**
   * Get bobblehead by slug
   * @FacadeMethod operation=getBySlug data=slug userId=viewerUserId
   */
  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  }
}

// Generated code (after compilation)
export class BobbleheadsFacade {
  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    } catch (error) {
      const errorContext = {
        facade: 'BobbleheadsFacade',
        method: 'getBobbleheadBySlug',
        operation: 'getBySlug',
        userId: viewerUserId,
        data: { slug },
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
```

### Pros

- Zero runtime overhead (code generated at build time)
- Clean source code (no nesting)
- Automatic method name capture
- Type-safe (TypeScript compiler validates)
- Most DRY solution

### Cons

- **High complexity** - requires custom TypeScript transformer
- Build toolchain integration (Next.js, Turbopack)
- Debugging harder (source maps required)
- Team needs to understand build process
- JSDoc tag parsing is brittle
- May break with Next.js/Turbopack updates
- Overkill for this use case

### Compatibility with Existing Patterns

- Can work with all patterns
- Requires build process changes

### Recommendation

**Not recommended**. This is engineering over-optimization. The complexity and maintenance burden far outweigh the benefits. Custom transformers are hard to debug and can break with toolchain updates.

---

## Comparison Matrix

| Strategy | LOC Reduction | Complexity | Breaking Changes | Stack Inference | Experimental | Recommended |
|----------|---------------|------------|------------------|-----------------|--------------|-------------|
| 1. HOF with Inference | 44% | Medium | No | Yes (fragile) | No | No |
| 2. Decorators | 33% | High | No | Yes | Yes | No |
| 3. Result Types | N/A | Very High | Yes | No | No | No |
| 4. Base Class | 50% | Medium | No | Yes (fragile) | No | Maybe |
| 5. Explicit Wrappers | 42% | Low | No | No | No | **Yes** |
| 6. Build-time Generation | 100% | Very High | No | No | Yes | No |

---

## Recommended Approach: Strategy 5 with Enhancements

After analyzing all strategies, **Strategy 5 (Explicit Wrapper Functions)** is the best fit for this codebase because:

1. **No magic** - explicit, predictable, debuggable
2. **Compatible** with all existing patterns
3. **Low complexity** - 20-line implementation
4. **Type-safe** - TypeScript validates everything
5. **Composable** with `withFacadeBreadcrumbs`

### Enhanced Implementation

```typescript
// src/lib/utils/facade-helpers.ts

import type { FacadeErrorContext } from './error-types';
import type { DatabaseExecutor } from './next-safe-action';
import { createFacadeError } from './error-builders';
import type { WithFacadeBreadcrumbsOptions } from './sentry-server/types';

export interface FacadeOperationConfig {
  facade: string;
  method: string;
  operation: string;
  userId?: string;
  data?: Record<string, unknown>;
}

/**
 * Execute a facade operation with error handling
 *
 * @example
 * return executeFacadeOperation(
 *   {
 *     facade: facadeName,
 *     method: 'getBobbleheadBySlug',
 *     operation: 'getBySlug',
 *     userId: viewerUserId,
 *     data: { slug },
 *   },
 *   async () => {
 *     const context = viewerUserId
 *       ? createUserQueryContext(viewerUserId, { dbInstance })
 *       : createPublicQueryContext({ dbInstance });
 *     return BobbleheadsQuery.findBySlugAsync(slug, context);
 *   },
 * );
 */
export async function executeFacadeOperation<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      facade: config.facade,
      method: config.method,
      operation: config.operation,
      userId: config.userId,
      data: config.data,
    };
    throw createFacadeError(errorContext, error);
  }
}

/**
 * Execute a facade operation with breadcrumbs AND error handling
 * Combines executeFacadeOperation with withFacadeBreadcrumbs
 *
 * @example
 * return executeFacadeOperationWithBreadcrumbs(
 *   {
 *     facade: facadeName,
 *     method: 'getPlatformStatsAsync',
 *     operation: OPERATIONS.PLATFORM.GET_STATS,
 *   },
 *   async () => {
 *     return await CacheService.platform.stats(/* ... */);
 *   },
 *   {
 *     includeResultSummary: (stats) => ({
 *       totalBobbleheads: stats.totalBobbleheads,
 *       totalCollections: stats.totalCollections,
 *     }),
 *   },
 * );
 */
export async function executeFacadeOperationWithBreadcrumbs<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
  breadcrumbOptions?: WithFacadeBreadcrumbsOptions<T>,
): Promise<T> {
  const { withFacadeBreadcrumbs } = await import('./sentry-server/breadcrumbs.server');

  return withFacadeBreadcrumbs(
    { facade: config.facade, method: config.method, userId: config.userId },
    async () => {
      try {
        return await operation();
      } catch (error) {
        const errorContext: FacadeErrorContext = {
          facade: config.facade,
          method: config.method,
          operation: config.operation,
          userId: config.userId,
          data: config.data,
        };
        throw createFacadeError(errorContext, error);
      }
    },
    breadcrumbOptions,
  );
}

/**
 * Simplified version when operation name matches method name
 * Common case that reduces config verbosity
 *
 * @example
 * return executeFacadeMethod(
 *   facadeName,
 *   'getBobbleheadBySlug',
 *   async () => { /* ... */ },
 *   { userId: viewerUserId, data: { slug } },
 * );
 */
export async function executeFacadeMethod<T>(
  facade: string,
  method: string,
  operation: () => Promise<T>,
  options?: { userId?: string; data?: Record<string, unknown> },
): Promise<T> {
  return executeFacadeOperation(
    {
      facade,
      method,
      operation: method,
      userId: options?.userId,
      data: options?.data,
    },
    operation,
  );
}
```

### Migration Path

1. **Phase 1:** Implement helpers in `src/lib/utils/facade-helpers.ts`
2. **Phase 2:** Update one facade as proof-of-concept (e.g., `PlatformStatsFacade`)
3. **Phase 3:** Gradually migrate other facades (optional, not required)
4. **Phase 4:** Update facade conventions document to recommend new pattern

### Before/After Examples

**Simple read method:**
```typescript
// Before (12 lines)
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  try {
    const context = viewerUserId
      ? createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return BobbleheadsQuery.findBySlugAsync(slug, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { slug },
      facade: facadeName,
      method: 'getBobbleheadBySlug',
      operation: 'getBySlug',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}

// After (9 lines) - 25% reduction
static async getBobbleheadBySlug(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return executeFacadeOperation(
    { facade: facadeName, method: 'getBobbleheadBySlug', operation: 'getBySlug', userId: viewerUserId, data: { slug } },
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
  );
}
```

**Method with breadcrumbs:**
```typescript
// Before (25 lines with nested try-catch)
static async getPlatformStatsAsync(dbInstance: DatabaseExecutor = db): Promise<PlatformStats> {
  const methodName = 'getPlatformStatsAsync';

  return withFacadeBreadcrumbs(
    { facade: facadeName, method: methodName },
    async () => {
      try {
        return await CacheService.platform.stats(
          async () => {
            const context = this.publicContext(dbInstance);
            const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
              BobbleheadsQuery.getBobbleheadCountAsync(context),
              CollectionsQuery.getCollectionCountAsync(context),
              UsersQuery.getUserCountAsync(context),
            ]);
            return {
              totalBobbleheads: bobbleheadsCount,
              totalCollections: collectionsCount,
              totalCollectors: collectorsCount,
            };
          },
          { context: { /* ... */ }, ttl: CACHE_CONFIG.TTL.EXTENDED },
        );
      } catch (error) {
        throw createFacadeError(
          { data: {}, facade: facadeName, method: methodName, operation: OPERATIONS.PLATFORM.GET_STATS },
          error,
        );
      }
    },
    { includeResultSummary: (stats) => ({ /* ... */ }) },
  );
}

// After (18 lines) - 28% reduction
static async getPlatformStatsAsync(dbInstance: DatabaseExecutor = db): Promise<PlatformStats> {
  return executeFacadeOperationWithBreadcrumbs(
    { facade: facadeName, method: 'getPlatformStatsAsync', operation: OPERATIONS.PLATFORM.GET_STATS },
    async () => {
      return await CacheService.platform.stats(
        async () => {
          const context = this.publicContext(dbInstance);
          const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
            BobbleheadsQuery.getBobbleheadCountAsync(context),
            CollectionsQuery.getCollectionCountAsync(context),
            UsersQuery.getUserCountAsync(context),
          ]);
          return {
            totalBobbleheads: bobbleheadsCount,
            totalCollections: collectionsCount,
            totalCollectors: collectorsCount,
          };
        },
        { context: { /* ... */ }, ttl: CACHE_CONFIG.TTL.EXTENDED },
      );
    },
    { includeResultSummary: (stats) => ({ totalBobbleheads: stats.totalBobbleheads, totalCollections: stats.totalCollections, totalCollectors: stats.totalCollectors }) },
  );
}
```

---

## Alternative Consideration: Hybrid Approach

For maximum flexibility, implement **both Strategy 4 and Strategy 5**:

1. **BaseFacade helpers** (Strategy 4) - for facades that extend BaseFacade
2. **Standalone helpers** (Strategy 5) - for facades that don't extend BaseFacade

```typescript
// BaseFacade gets convenience methods
export abstract class BaseFacade extends BaseContextHelpers {
  protected static async execute<T>(
    method: string,
    operation: string,
    fn: () => Promise<T>,
    options?: { userId?: string; data?: Record<string, unknown> },
  ): Promise<T> {
    return executeFacadeOperation(
      { facade: this.name, method, operation, userId: options?.userId, data: options?.data },
      fn,
    );
  }

  protected static async executeWithBreadcrumbs<T>(
    method: string,
    operation: string,
    fn: () => Promise<T>,
    options?: {
      userId?: string;
      data?: Record<string, unknown>;
      includeResultSummary?: (result: T) => Record<string, unknown>;
    },
  ): Promise<T> {
    return executeFacadeOperationWithBreadcrumbs(
      { facade: this.name, method, operation, userId: options?.userId, data: options?.data },
      fn,
      { includeResultSummary: options?.includeResultSummary },
    );
  }
}

// Usage in child facades
export class BobbleheadsFacade extends BaseFacade {
  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return this.execute('getBobbleheadBySlug', 'getBySlug', async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    }, { userId: viewerUserId, data: { slug } });
  }
}
```

This gives the best of both worlds: convenience for BaseFacade children, standalone helpers for others.

---

## Impact Analysis

### Metrics

Based on `BobbleheadsFacade.ts` (945 lines, 30 methods with try-catch):

- **Current:** 30 methods × 12 lines avg = 360 lines of boilerplate
- **With Strategy 5:** 30 methods × 7 lines avg = 210 lines
- **Savings:** 150 lines (42% reduction in error handling code)

### Codebase-Wide Impact

14 facades × 150 lines avg = **2,100 lines saved** across the facade layer.

### Developer Experience

- **Reduced cognitive load:** Less nesting, clearer intent
- **Consistency:** Standardized error handling pattern
- **Type safety:** Compiler enforces correct context structure
- **Debugging:** Error context is always complete

---

## Recommendations Summary

### Primary Recommendation: Strategy 5 (Explicit Wrapper Functions)

**Implement immediately:**
- `executeFacadeOperation` - for simple operations
- `executeFacadeOperationWithBreadcrumbs` - for operations needing breadcrumbs
- `executeFacadeMethod` - shorthand for when operation === method

**Why:**
- Lowest risk
- No experimental features
- Compatible with existing code
- Easy to understand and maintain
- Significant boilerplate reduction (42%)

### Secondary Recommendation: Enhance BaseFacade (Strategy 4 + 5 Hybrid)

**Implement later** (optional enhancement):
- Add `execute` and `executeWithBreadcrumbs` to `BaseFacade`
- Delegates to standalone helpers internally
- Provides convenience for facades extending BaseFacade

**Why:**
- Even less boilerplate for child facades
- Builds on existing infrastructure
- Backward compatible

### Not Recommended

- **Strategy 1:** Stack inference is fragile
- **Strategy 2:** Experimental decorators are unstable
- **Strategy 3:** Breaking change, massive migration effort
- **Strategy 6:** Over-engineered, build complexity

---

## Next Steps

1. **Review** this document with the team
2. **Decide** on Strategy 5 vs Strategy 4+5 hybrid
3. **Implement** helpers in `src/lib/utils/facade-helpers.ts`
4. **Test** with one facade as proof-of-concept
5. **Document** in facade conventions
6. **Migrate** other facades gradually (optional)

---

## Appendix: Full Strategy 5 Implementation

```typescript
// src/lib/utils/facade-helpers.ts

import type { FacadeErrorContext } from './error-types';
import { createFacadeError } from './error-builders';
import type { WithFacadeBreadcrumbsOptions } from './sentry-server/types';

export interface FacadeOperationConfig {
  facade: string;
  method: string;
  operation: string;
  userId?: string;
  data?: Record<string, unknown>;
}

/**
 * Execute a facade operation with error handling
 */
export async function executeFacadeOperation<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      facade: config.facade,
      method: config.method,
      operation: config.operation,
      userId: config.userId,
      data: config.data,
    };
    throw createFacadeError(errorContext, error);
  }
}

/**
 * Execute a facade operation with breadcrumbs AND error handling
 */
export async function executeFacadeOperationWithBreadcrumbs<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
  breadcrumbOptions?: WithFacadeBreadcrumbsOptions<T>,
): Promise<T> {
  const { withFacadeBreadcrumbs } = await import('./sentry-server/breadcrumbs.server');

  return withFacadeBreadcrumbs(
    { facade: config.facade, method: config.method, userId: config.userId },
    async () => {
      try {
        return await operation();
      } catch (error) {
        const errorContext: FacadeErrorContext = {
          facade: config.facade,
          method: config.method,
          operation: config.operation,
          userId: config.userId,
          data: config.data,
        };
        throw createFacadeError(errorContext, error);
      }
    },
    breadcrumbOptions,
  );
}

/**
 * Simplified version when operation name matches method name
 */
export async function executeFacadeMethod<T>(
  facade: string,
  method: string,
  operation: () => Promise<T>,
  options?: { userId?: string; data?: Record<string, unknown> },
): Promise<T> {
  return executeFacadeOperation(
    {
      facade,
      method,
      operation: method,
      userId: options?.userId,
      data: options?.data,
    },
    operation,
  );
}
```

**Tests:**

```typescript
// tests/lib/utils/facade-helpers.test.ts

import { describe, it, expect } from 'vitest';
import { executeFacadeOperation, executeFacadeMethod } from '@/lib/utils/facade-helpers';
import { ActionError } from '@/lib/utils/errors';

describe('facade-helpers', () => {
  describe('executeFacadeOperation', () => {
    it('should return result on success', async () => {
      const result = await executeFacadeOperation(
        { facade: 'TestFacade', method: 'testMethod', operation: 'test' },
        async () => ({ success: true }),
      );
      expect(result).toEqual({ success: true });
    });

    it('should wrap errors in FacadeError', async () => {
      await expect(
        executeFacadeOperation(
          { facade: 'TestFacade', method: 'testMethod', operation: 'test', userId: 'user123', data: { key: 'value' } },
          async () => {
            throw new Error('Test error');
          },
        ),
      ).rejects.toThrow(ActionError);
    });

    it('should preserve ActionError if already thrown', async () => {
      const originalError = new ActionError('VALIDATION', 'TEST_ERROR', 'Test message');

      try {
        await executeFacadeOperation(
          { facade: 'TestFacade', method: 'testMethod', operation: 'test' },
          async () => {
            throw originalError;
          },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ActionError);
        expect((error as ActionError).code).toBe('TEST_ERROR');
      }
    });
  });

  describe('executeFacadeMethod', () => {
    it('should use method name as operation', async () => {
      const result = await executeFacadeMethod(
        'TestFacade',
        'getBySl',
        async () => ({ id: '123' }),
        { userId: 'user1', data: { slug: 'test' } },
      );
      expect(result).toEqual({ id: '123' });
    });
  });
});
```

---

**End of Document**
