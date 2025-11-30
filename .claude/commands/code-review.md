---
allowed-tools: Task(subagent_type:*), Bash(mkdir:*), Write(*), Read(*), Glob(*), Grep(*), TodoWrite(*)
argument-hint: '"target area description" [--skip-static|--verbose|--quick]'
description: Comprehensive code review orchestration with parallel specialist agents and consolidated reporting
---

You are a code review orchestrator for Head Shakers. You coordinate comprehensive code reviews by dispatching multiple specialist agents in parallel and compiling their findings into a unified report.

@CLAUDE.MD

## Command Usage

```
/code-review "target area description" [--skip-static] [--verbose] [--quick]
```

**Arguments**:

- `target area description` (required): Description of the code area to review
  - Page route: `"the home page at /app/(app)/(home)/page.tsx"`
  - Feature: `"the bobblehead detail page and all its components"`
  - Component: `"the FeaturedCollections section"`
  - Domain: `"all facade layer code for collections"`
- `--skip-static`: Skip static analysis (lint/typecheck/format)
- `--verbose`: Include INFO-level findings and detailed analysis
- `--quick`: Review only HIGH priority methods/components (faster but less comprehensive)

**Examples**:

```
/code-review "the home page route located at /app/(app)/(home)/page.tsx"
/code-review "bobblehead collection management feature"
/code-review "user profile and settings pages" --verbose
/code-review "server actions for authentication" --quick
```

## Orchestration Workflow

### Phase 1: Input Validation & Setup

**1. Parse Arguments from $ARGUMENTS**:

- Extract target description
- Parse optional flags (--skip-static, --verbose, --quick)
- Validate that a target description was provided

**2. If no target provided**: Stop with error message:

```
Error: Target area description required.

Usage: /code-review "description of code area to review"

Examples:
  /code-review "the home page at /app/(app)/(home)/page.tsx"
  /code-review "bobblehead detail feature"
  /code-review "collections domain facades and actions"
```

**3. Setup Environment**:

- Generate review ID: `review-{timestamp}`
- Create review directory: `docs/{YYYY_MM_DD}/code-reviews/{review-slug}/`
- Create subdirectories: `agent-reports/`, `screenshots/` (if UI components)

**4. Initialize Todo List**:

```
- Scope analysis for code review
- Dispatch specialist reviewers (in parallel)
- Wait for all reviews to complete
- Compile final report
- Save and display results
```

**5. Save Setup Log**: `00-review-setup.md` with:

- Review ID
- Target description
- Timestamp
- Flags parsed
- Directory structure created

### Phase 2: Scope Analysis (Surgical Precision)

Mark "Scope analysis" as in_progress.

**Call code-review-analyzer agent**:

Use Task tool with `subagent_type: "code-review-analyzer"`:

```
Analyze the following code area for a comprehensive code review with SURGICAL PRECISION:

Target: $ARGUMENTS

Your task:
1. Identify the entry point files and trace the EXACT methods/functions called
2. Build a complete call graph showing which methods call which other methods
3. For each file, identify ONLY the specific methods/functions relevant to this review
4. Files may have 30-50 methods - you must identify the 2-5 that are actually in the call path
5. Categorize by review domain with file + method pairs
6. Prioritize as HIGH, MEDIUM, or LOW based on complexity and position in call graph

CRITICAL REQUIREMENTS:
- DO NOT just list files - list file + specific methods/functions
- A facade with 40 methods might only have 2 relevant methods - identify those 2
- A cache service with 50 methods might only have 3 called - identify those 3
- Read file contents to trace actual call chains
- Note methods that exist but are NOT relevant (so reviewers can skip them)

Quick Mode: {true if --quick flag, else false}
- If quick mode, only include HIGH priority methods/components

Return the structured analysis following your output format specification with:
- Complete call graph visualization
- File + method pairs for each specialist domain
- Explicit notes on which methods to SKIP in large files
```

**Response Handling**:

- If empty/failed: Log failure, attempt fallback using Glob patterns to discover files
- Extract file + method assignments by specialist domain
- **CRITICAL**: Parse the specific methods for each file, not just file lists
- Save to `01-scope-analysis.md`
- Mark "Scope analysis" as completed

### Phase 3: Parallel Specialist Reviews (Method-Focused)

Mark "Dispatch specialist reviewers" as in_progress.

Based on the scope analysis, launch ALL relevant specialist agents IN PARALLEL (single message with multiple Task calls).

**CRITICAL**: Pass the specific methods/functions to each specialist, not just files. Each specialist should know exactly which methods to focus on and which to skip.

For each specialist domain with methods to review:

#### Server Component Review (if server component methods found)

```
subagent_type: "server-component-specialist"

Review these specific server components and methods for code quality, conventions, and best practices:

## Files and Methods to Review

{From scope analysis - include the exact table with file + method pairs}

Example format:
### `src/app/(app)/(home)/page.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `HomePage` | Page Component | Entry point | HIGH |

Focus on: `HomePage` function, data fetching calls

### `src/components/feature/collections/featured-collections-section.tsx`
| Export | Type | Purpose | Priority |
|--------|------|---------|----------|
| `FeaturedCollectionsSection` | Server Component | Displays featured | HIGH |

**Note**: This file may have other exports - only review the ones listed above.

## Call Graph Context
{Include relevant portion of call graph showing data flow}

## Review Checklist
- [ ] Async component patterns correct
- [ ] Data fetching through facades (not direct queries)
- [ ] Caching integration present
- [ ] Suspense boundaries for async children
- [ ] SEO metadata generation (for pages)
- [ ] Proper authentication handling
- [ ] Error boundaries/handling

DO NOT IMPLEMENT CHANGES. Only identify issues.
The methods NOT listed are out of scope - do not review them.

Return findings with:
- File:line for each issue
- Severity (CRITICAL/HIGH/MEDIUM/LOW)
- Description of the problem
- Recommendation to fix
```

#### Client Component Review (if client component methods found)

```
subagent_type: "client-component-specialist"

Review these specific client components for code quality, conventions, and best practices:

## Files and Methods to Review

{From scope analysis - include exact table with components, hooks, handlers}

Example format:
### `src/components/feature/newsletter/newsletter-form.tsx`
| Export | Type | Purpose | Priority | Hooks/Handlers |
|--------|------|---------|----------|----------------|
| `NewsletterForm` | Form Component | Email subscription | HIGH | `useServerAction`, `handleSubmit` |

**Note**: Only review `NewsletterForm` - other exports in this file are out of scope.

## Call Graph Context
{Show how this component fits in the page and what actions it calls}

## Review Checklist
- [ ] 'use client' directive present and necessary
- [ ] Hook organization follows project order (useState → other hooks → useMemo → useEffect → handlers)
- [ ] Event handlers use `handle` prefix
- [ ] Server action consumption via `useServerAction` (not `useAction`)
- [ ] Accessibility (ARIA attributes, keyboard navigation)
- [ ] Boolean state uses `is` prefix
- [ ] Derived variables use `_` prefix

DO NOT IMPLEMENT CHANGES. Only identify issues.
Focus ONLY on the listed components/hooks/handlers.

Return findings with file:line, severity, description, and recommendation.
```

#### Facade Review (if facade methods found)

```
subagent_type: "facade-specialist"

Review these specific facade methods for code quality, conventions, and best practices:

## Files and Methods to Review

{From scope analysis - include exact table with methods}

Example format:
### `src/lib/facades/collections.facade.ts`
| Method | Purpose | Calls | Cache | Priority |
|--------|---------|-------|-------|----------|
| `getFeaturedAsync(limit)` | Get featured collections | `CacheService.collections.featured()` | TTL: 5min | HIGH |

**IMPORTANT**: This facade has ~25 methods. Only review `getFeaturedAsync`.
Skip: `createAsync`, `updateAsync`, `deleteAsync`, `getBySlugAsync`, etc.

### Cache Service Methods (secondary review)
| Method | Called By | Key Pattern | Priority |
|--------|-----------|-------------|----------|
| `collections.featured()` | `CollectionsFacade.getFeaturedAsync` | `collections:featured:{limit}` | MEDIUM |

## Call Graph Context
{Show the method's position: who calls it, what it calls}

## Review Checklist for Each Method
- [ ] Method has `Async` suffix
- [ ] Transaction wrapping for multi-step mutations (if applicable)
- [ ] Uses `CacheService.{domain}.{method}()` for reads
- [ ] Uses `CacheRevalidationService` for invalidation after writes
- [ ] Sentry breadcrumb added for successful operations
- [ ] JSDoc documentation present
- [ ] Method under 60 lines (extract helpers if needed)
- [ ] No anti-patterns: stubs, silent failures, hardcoded Sentry strings

DO NOT IMPLEMENT CHANGES. Only identify issues.
ONLY review the specific methods listed - others are out of scope.

Return findings with file:line, severity, description, and recommendation.
```

#### Server Action Review (if action methods found)

```
subagent_type: "server-action-specialist"

Review these specific server actions for code quality, conventions, and best practices:

## Actions to Review

{From scope analysis - include exact table with actions}

Example format:
### `src/lib/actions/newsletter.actions.ts`
| Action | Auth Level | Input Schema | Purpose | Priority |
|--------|-----------|--------------|---------|----------|
| `subscribeNewsletterAction` | public | `newsletterSubscribeSchema` | Newsletter signup | HIGH |

**IMPORTANT**: This file may have multiple actions. Only review `subscribeNewsletterAction`.

## Call Graph Context
{Show: which component calls this action, what facade it uses}

## Review Checklist
- [ ] Correct auth client (`authActionClient`, `adminActionClient`, `publicActionClient`)
- [ ] Input validation schema defined
- [ ] Uses `ctx.sanitizedInput` (never `parsedInput`)
- [ ] Metadata includes `actionName` and `isTransactionRequired`
- [ ] Sentry context set at action start
- [ ] Business logic delegated to facade
- [ ] Error handling via `handleActionError`
- [ ] Cache invalidation after successful mutations
- [ ] Consistent return shape: `{ success, message, data }`

DO NOT IMPLEMENT CHANGES. Only identify issues.

Return findings with file:line, severity, description, and recommendation.
```

#### Database/Query Review (if query methods found)

```
subagent_type: "database-specialist"

Review these specific query methods and schemas for code quality, conventions, and best practices:

## Query Methods to Review

{From scope analysis - include exact table}

Example format:
### `src/lib/queries/collections/collections.queries.ts`
| Method | Called By | Tables | Filters | Priority |
|--------|-----------|--------|---------|----------|
| `getFeaturedAsync(limit, context)` | `CacheService.collections.featured` | `collections`, `users` | `isFeatured = true` | MEDIUM |

**IMPORTANT**: This query class has ~15 methods. Only review `getFeaturedAsync`.

## Schema Tables Referenced
| Table | Relevant Columns | Priority |
|-------|------------------|----------|
| `collections` | `id`, `name`, `slug`, `isFeatured`, `userId` | LOW |

## Call Graph Context
{Show where in the stack this query is called from}

## Review Checklist
- [ ] Extends `BaseQuery` class
- [ ] Uses `QueryContext` for database instance
- [ ] Permission filters applied via `buildBaseFilters`
- [ ] Method has `Async` suffix
- [ ] Returns `null` for single items when not found
- [ ] Uses `getDbInstance(context)` for database access
- [ ] Pagination via `applyPagination(options)` when applicable
- [ ] Proper type inference from Drizzle schemas

DO NOT IMPLEMENT CHANGES. Only identify issues.

Return findings with file:line, severity, description, and recommendation.
```

#### Validation Review (if validation schemas found)

```
subagent_type: "validation-specialist"

Review these specific validation schemas for code quality, conventions, and best practices:

## Schemas to Review

{From scope analysis - include exact table}

Example format:
### `src/lib/validations/newsletter.validation.ts`
| Schema | Used By | Key Fields | Priority |
|--------|---------|------------|----------|
| `newsletterSubscribeSchema` | `subscribeNewsletterAction` | `email` | LOW |

## Review Checklist
- [ ] Uses drizzle-zod for base schema generation (when applicable)
- [ ] Custom zod utilities used (`zodMinMaxString`, `zodMaxString`, etc.)
- [ ] Auto-generated fields omitted (id, createdAt, updatedAt, userId)
- [ ] Type exports present (`z.infer` and `z.input`)
- [ ] Naming follows pattern: `{entity}{Action}Schema`

DO NOT IMPLEMENT CHANGES. Only identify issues.

Return findings with file:line, severity, description, and recommendation.
```

#### Static Analysis (unless --skip-static)

```
subagent_type: "static-analysis-validator"

Run static analysis focused on files from this code review:

## Files in Scope
{List all files from scope analysis}

Run:
- ESLint checks
- TypeScript type checking
- Prettier format checks

Return structured results per your output format.
```

**Save each agent's raw output** to `agent-reports/{agent-name}-report.md`

### Phase 4: Wait and Collect Results

Mark "Wait for all reviews" as in_progress.

All agents were launched in parallel. Collect their responses:

For each agent response:

1. **If success**: Parse the structured output, extract issues
2. **If incomplete**: Extract available data, note incomplete sections
3. **If failed/timeout**: Log failure, mark as "AGENT_FAILED"

Create summary tracking which agents completed:

```markdown
## Agent Completion Status

| Agent                       | Status     | Methods Reviewed | Issues Found |
| --------------------------- | ---------- | ---------------- | ------------ |
| server-component-specialist | SUCCESS    | 6 components     | 3            |
| client-component-specialist | SUCCESS    | 3 components     | 7            |
| facade-specialist           | SUCCESS    | 4 methods        | 2            |
| server-action-specialist    | SUCCESS    | 1 action         | 1            |
| database-specialist         | INCOMPLETE | 2 methods        | 1            |
| validation-specialist       | SUCCESS    | 1 schema         | 0            |
| static-analysis-validator   | SUCCESS    | 21 files         | 5            |
```

Save to `02-agent-status.md`

Mark "Wait for all reviews" as completed.

### Phase 5: Compile Report

Mark "Compile final report" as in_progress.

**Call code-review-reporter agent**:

Use Task tool with `subagent_type: "code-review-reporter"`:

```
Compile a comprehensive code review report from the following specialist agent findings:

Target Area: {target description}
Review ID: {review-id}
Review Date: {timestamp}
Flags: {--skip-static, --verbose, --quick as applicable}

## Scope Analysis Summary
{Include the call graph and method-level breakdown from Phase 2}

## Agent Findings

### Server Component Review
{Full output from server-component-specialist or "AGENT_FAILED: No results"}

### Client Component Review
{Full output from client-component-specialist or "AGENT_FAILED: No results"}

### Facade Review
{Full output from facade-specialist or "AGENT_FAILED: No results"}

### Server Action Review
{Full output from server-action-specialist or "AGENT_FAILED: No results"}

### Database Review
{Full output from database-specialist or "AGENT_FAILED: No results"}

### Validation Review
{Full output from validation-specialist or "AGENT_FAILED: No results"}

### Static Analysis
{Full output from static-analysis-validator or "SKIPPED" or "AGENT_FAILED"}

Verbose Mode: {true if --verbose flag, else false}
- If verbose, include INFO-level issues

Generate the comprehensive report following your output format specification.
Include the call graph in the report to show code relationships.
```

**Response Handling**:

- Parse the compiled report
- Validate all required sections present
- Save to `03-code-review-report.md`

Mark "Compile final report" as completed.

### Phase 6: Save and Display Results

Mark "Save and display results" as in_progress.

**Create Index File**: `00-review-index.md`:

```markdown
# Code Review: {target description}

**Review ID**: {review-id}
**Date**: {YYYY-MM-DD HH:MM}
**Status**: {COMPLETE|PARTIAL|FAILED}

## Quick Summary

- **Overall Health**: {Grade} ({Score}/100)
- **Critical Issues**: {count}
- **High Priority**: {count}
- **Total Issues**: {count}

## Review Scope

- **Files Analyzed**: {count}
- **Methods/Components Reviewed**: {count}
- **Methods Skipped (out of scope)**: {count}

## Navigation

- [Review Setup](./00-review-setup.md)
- [Scope Analysis](./01-scope-analysis.md) - Call graph and method mapping
- [Agent Status](./02-agent-status.md)
- [Full Report](./03-code-review-report.md)

## Agent Reports

- [Server Components](./agent-reports/server-component-specialist-report.md)
- [Client Components](./agent-reports/client-component-specialist-report.md)
- [Facades](./agent-reports/facade-specialist-report.md)
- [Server Actions](./agent-reports/server-action-specialist-report.md)
- [Database](./agent-reports/database-specialist-report.md)
- [Validation](./agent-reports/validation-specialist-report.md)
- [Static Analysis](./agent-reports/static-analysis-validator-report.md)
```

**Display Summary to User**:

```
## Code Review Complete

Target: {target description}
Review ID: {review-id}

## Health Score
Overall: {Grade} ({Score}/100)
- UI/Components: {score}/100
- Business Logic: {score}/100
- Data Layer: {score}/100

## Issues Found
- Critical: {n} {emoji if > 0}
- High: {n}
- Medium: {n}
- Low: {n}
- Total: {n}

## Review Coverage
- Agents Run: {n}/{total}
- Methods/Components Reviewed: {n}
- Files Touched: {n}

## Report Location
docs/{YYYY_MM_DD}/code-reviews/{review-slug}/

Files:
- 00-review-index.md (start here)
- 01-scope-analysis.md (call graph)
- 03-code-review-report.md (full report)
- agent-reports/ (raw agent outputs)
```

Mark all todos as completed.

**If critical/high issues found**: Use AskUserQuestion to offer:

- "View detailed report"
- "Create fix plan with /plan-feature"
- "Done for now"

### Error Handling

| Failure                   | Action                                             |
| ------------------------- | -------------------------------------------------- |
| No target provided        | Show usage and examples                            |
| Scope analysis failed     | Use fallback Glob patterns, note reduced precision |
| All agents failed         | Generate minimal report noting failures            |
| Some agents failed        | Continue with available results, note gaps         |
| Reporter failed           | Output raw agent results as fallback               |
| Directory creation failed | Use alternative path, warn user                    |

### Performance Notes

- **Parallel execution is critical**: All specialist agents MUST be launched in a single message with multiple Task calls
- **Timeout handling**: Allow up to 120 seconds per agent
- **Memory efficient**: Save results incrementally, don't hold all in memory
- **Quick mode**: Significantly faster by only reviewing HIGH priority methods/components
- **Method-focused**: Specialists review specific methods, not entire files

## Review Quality Standards

A good code review identifies:

1. **Security issues** - XSS, injection, auth problems
2. **Type safety issues** - TypeScript errors, any usage
3. **Convention violations** - Project-specific patterns
4. **Performance concerns** - Inefficient patterns
5. **Best practice deviations** - Code quality issues
6. **Documentation gaps** - Missing JSDoc, comments

The goal is actionable feedback that improves code quality, focused on the code paths that actually matter.
