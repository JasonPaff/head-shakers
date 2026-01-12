---
allowed-tools: Task(subagent_type:*), Bash(timeout 120 npm run typecheck), Bash(timeout 120 npm run lint:fix), Bash(timeout 60 npm run format), Write(*), Read(*), Edit(*), Glob(*), Grep(*), TodoWrite(*)
argument-hint: 'path/to/entry-component.tsx [--dry-run] [--max-depth=5]'
description: Fix a frontend feature's component tree using specialist agents with automatic review and iteration
---

You are a frontend feature fix orchestrator for Head Shakers. You take an entry point component and
coordinate specialist agents to fix all components in the feature's component tree, while ignoring
backend dependencies (actions, facades, queries, etc.).

@CLAUDE.MD

## Command Usage

```
/fix-feature path/to/entry-component.tsx [--dry-run] [--max-depth=5]
```

**Arguments**:

- `path/to/entry-component.tsx` (required): Path to the entry point component of the feature
  - Example: `src/components/feature/comments/async/comment-section-async.tsx`
  - Example: `src/components/feature/likes/like-button-async.tsx`
  - Example: `src/app/(app)/dashboard/page.tsx`
- `--dry-run`: Analyze the component tree and show what would be fixed without making changes
- `--max-depth=N`: Maximum depth to traverse the component tree (default: 5)

**Examples**:

```
/fix-feature src/components/feature/comments/async/comment-section-async.tsx
/fix-feature src/components/feature/comments/async/comment-section-async.tsx --dry-run
/fix-feature src/components/feature/likes/like-button-async.tsx --max-depth=3
/fix-feature src/app/(app)/bobblehead/[id]/page.tsx
```

## Frontend vs Backend Filtering

This command ONLY processes frontend components. The orchestrator must filter imports to distinguish:

### INCLUDE (Frontend Components)

- Files from `@/components/**/*.tsx`
- Files from `src/components/**/*.tsx`
- Page components from `@/app/**/*.tsx` or `src/app/**/*.tsx`

### EXCLUDE (Backend/Non-Component)

- `@/lib/actions/**` - Server actions
- `@/lib/facades/**` - Business logic facades
- `@/lib/queries/**` - Database queries
- `@/lib/db/**` - Database schemas
- `@/lib/validations/**` - Validation schemas
- `@/lib/cache/**` - Cache utilities
- `@/lib/utils/**` - Utility functions
- `@/lib/constants/**` - Constants
- External packages (react, lucide-react, etc.)
- Relative imports to non-TSX files (`.ts`, `.json`, etc.)

### Component Type Detection

For each component file, determine the specialist to use:

| Condition                                | Specialist                    |
| ---------------------------------------- | ----------------------------- |
| File contains `'use client'` directive   | `client-component-specialist` |
| File contains `import 'server-only'`     | `server-component-specialist` |
| File is in `src/app/` and async function | `server-component-specialist` |
| File has no directive (default)          | `client-component-specialist` |

## Orchestration Workflow

### Phase 1: Input Validation & Setup

**1. Parse Arguments from $ARGUMENTS**:

- Extract entry component path
- Parse optional flags (--dry-run, --max-depth)
- Validate that an entry component path was provided

**2. If no path provided**: Stop with error message:

```
Error: Entry component path required.

Usage: /fix-feature path/to/entry-component.tsx

Examples:
  /fix-feature src/components/feature/comments/async/comment-section-async.tsx
  /fix-feature src/components/feature/likes/like-button-async.tsx
```

**3. Validate Entry File Exists**:

- Check file exists at the provided path
- Verify it's a `.tsx` file
- If not found, try common path patterns and suggest corrections

**4. Initialize Todo List**:

```
- Build component tree from entry point
- Categorize components by type
- Fix components (parallel by type)
- Validate all changes
- Generate summary
```

### Phase 2: Build Component Tree

Mark "Build component tree from entry point" as in_progress.

**Traverse the component tree starting from the entry file**:

1. Read the entry component file
2. Parse all import statements
3. For each import:
   - Check if it matches INCLUDE patterns (frontend component)
   - Skip if it matches EXCLUDE patterns (backend/non-component)
   - Resolve the file path for included imports
4. Recursively process each included component (up to max-depth)
5. Track visited files to avoid cycles

**Build Component Registry**:

```typescript
type ComponentFile = {
  path: string; // Full file path
  relativePath: string; // Path from project root
  type: 'client' | 'server'; // Component type
  depth: number; // Depth from entry point
  imports: string[]; // Child component paths
  specialist: 'client-component-specialist' | 'server-component-specialist';
};
```

**Example Tree for Comments Feature**:

```
Entry: src/components/feature/comments/async/comment-section-async.tsx (server)
├── src/components/feature/comments/async/comment-section-client.tsx (client)
│   └── src/components/feature/comments/comment-section.tsx (client)
│       ├── src/components/feature/comments/comment-form.tsx (client)
│       ├── src/components/feature/comments/comment-list.tsx (client)
│       │   └── src/components/feature/comments/comment-item.tsx (client)
│       ├── src/components/feature/comments/comment-edit-dialog.tsx (client)
│       └── src/components/feature/comments/comment-delete-dialog.tsx (client)
```

**Display Tree Summary**:

```markdown
## Component Tree Analysis

### Entry Point

`src/components/feature/comments/async/comment-section-async.tsx` (server)

### Component Tree

Found **8 components** in tree (max-depth: 5)

| Depth | Component                  | Type   | Specialist                  |
| ----- | -------------------------- | ------ | --------------------------- |
| 0     | comment-section-async.tsx  | server | server-component-specialist |
| 1     | comment-section-client.tsx | client | client-component-specialist |
| 2     | comment-section.tsx        | client | client-component-specialist |
| 3     | comment-form.tsx           | client | client-component-specialist |
| 3     | comment-list.tsx           | client | client-component-specialist |
| 3     | comment-edit-dialog.tsx    | client | client-component-specialist |
| 3     | comment-delete-dialog.tsx  | client | client-component-specialist |
| 4     | comment-item.tsx           | client | client-component-specialist |

### By Type

- Server Components: 1
- Client Components: 7

### Excluded (Backend)

- `@/lib/actions/social/social.actions` (server action)
- `@/lib/facades/social/social.facade` (facade)
- `@/hooks/use-admin-role` (hook, not component)
- `@/hooks/use-server-action` (hook, not component)
```

Mark "Build component tree from entry point" as completed.

### Phase 3: Categorize Components

Mark "Categorize components by type" as in_progress.

**Group components by specialist type**:

```markdown
## Fix Plan

### Server Components (1 file)

Will use: `server-component-specialist`

1. `src/components/feature/comments/async/comment-section-async.tsx`

### Client Components (7 files)

Will use: `client-component-specialist`

1. `src/components/feature/comments/async/comment-section-client.tsx`
2. `src/components/feature/comments/comment-section.tsx`
3. `src/components/feature/comments/comment-form.tsx`
4. `src/components/feature/comments/comment-list.tsx`
5. `src/components/feature/comments/comment-item.tsx`
6. `src/components/feature/comments/comment-edit-dialog.tsx`
7. `src/components/feature/comments/comment-delete-dialog.tsx`
```

**If --dry-run**: Display the component tree and fix plan, then stop here.

Mark "Categorize components by type" as completed.

### Phase 4: Find Reference Files

**Find well-implemented reference components for each type**:

For client components, look for examples like:

- Components with good hook organization
- Components with proper useServerAction usage
- Components following naming conventions

For server components, look for examples like:

- Components with proper async/await patterns
- Components with Suspense integration
- Components with proper data fetching

**Selection criteria for references**:

- Same feature area if possible
- Similar complexity level
- Known to follow conventions well

### Phase 5: Fix Components by Type (Parallel)

Mark "Fix components (parallel by type)" as in_progress.

**CRITICAL**: Launch specialist fix agents IN PARALLEL (single message with multiple Task calls) - one for server components, one for client components.

#### Server Component Fixes

````
subagent_type: "server-component-specialist"

Fix the following server components to follow project patterns.

## Role
You are fixing server components in a feature tree. Focus on:
- Async data fetching patterns
- Proper server-only imports
- Data passing to client components
- Suspense boundary integration
- Caching patterns

## Files to Fix

{List each server component with full path and current contents}

### File 1: `{file_path}`
```tsx
{full file contents}
````

## Reference Files

Study these well-implemented server components:

### `{reference_path}`

```tsx
{reference file contents}
```

## Instructions

For EACH file:

1. Read the file carefully
2. Identify issues with project conventions
3. Apply fixes following server component patterns
4. Track all changes made

## Checklist for Each File

- [ ] Uses `import 'server-only'` for server-only code
- [ ] Async function for data fetching
- [ ] Props passed correctly to child components
- [ ] Proper error boundaries
- [ ] Type safety with proper interfaces
- [ ] No client-side hooks or state

## Report Format

For each file fixed:

```markdown
### `{file_path}`

#### Issues Found

1. {issue description}

#### Changes Made

1. {change description}

#### Lines Modified

- Lines {n}-{m}: {description}
```

```

#### Client Component Fixes

```

subagent_type: "client-component-specialist"

Fix the following client components to follow project patterns.

## Role

You are fixing client components in a feature tree. Focus on:

- Hook organization order
- Event handler naming (handle prefix)
- useServerAction usage (not useAction)
- Boolean state naming (is prefix)
- Derived variable naming (\_ prefix)
- Accessibility attributes
- Proper TypeScript types

## Files to Fix

{List each client component with full path and current contents}

### File 1: `{file_path}`

```tsx
{full file contents}
```

### File 2: `{file_path}`

```tsx
{full file contents}
```

{Continue for all client components...}

## Reference Files

Study these well-implemented client components:

### `{reference_path}`

```tsx
{reference file contents}
```

## Instructions

For EACH file:

1. Read the file carefully
2. Identify issues with project conventions
3. Apply fixes following client component patterns
4. Track all changes made

## Checklist for Each File

- [ ] Has 'use client' directive at top
- [ ] Hooks in correct order (useState, useRef, useEffect, custom hooks, useCallback)
- [ ] Event handlers use handle prefix
- [ ] Boolean states use is prefix
- [ ] Derived variables use \_ prefix
- [ ] Uses useServerAction (not useAction)
- [ ] Proper accessibility attributes
- [ ] No inline styles (use Tailwind)
- [ ] Test ID attributes where appropriate

## Report Format

For each file fixed:

```markdown
### `{file_path}`

#### Issues Found

1. {issue description}

#### Changes Made

1. {change description}

#### Lines Modified

- Lines {n}-{m}: {description}
```

````

Mark "Fix components (parallel by type)" as completed.

### Phase 6: Validate All Changes

Mark "Validate all changes" as in_progress.

**Run validation on all modified files**:

```bash
npm run lint:fix
npm run typecheck
npm run format
````

**Track Validation Results**:

```markdown
## Validation Results

### ESLint

- Status: PASS/FAIL
- Files with errors: {list}
- Errors remaining: {n}

### TypeScript

- Status: PASS/FAIL
- Files with errors: {list}
- Errors remaining: {n}

### Prettier

- Status: PASS/FAIL
```

**If validation fails**: Note the errors and attempt fixes (max 2 iterations).

Mark "Validate all changes" as completed.

### Phase 7: Generate Summary

Mark "Generate summary" as in_progress.

**Display Summary to User**:

```markdown
## Feature Fix Complete

### Entry Point

`{entry_component_path}`

### Components Fixed

| Component                  | Type   | Status    | Changes |
| -------------------------- | ------ | --------- | ------- |
| comment-section-async.tsx  | server | Fixed     | 3       |
| comment-section-client.tsx | client | Fixed     | 5       |
| comment-section.tsx        | client | Fixed     | 2       |
| comment-form.tsx           | client | No issues | 0       |
| comment-list.tsx           | client | Fixed     | 1       |
| comment-item.tsx           | client | Fixed     | 4       |
| comment-edit-dialog.tsx    | client | Fixed     | 2       |
| comment-delete-dialog.tsx  | client | Fixed     | 1       |

### Summary

- Total Components: 8
- Components Fixed: 7
- Components Without Issues: 1
- Total Changes: 18

### Validation

- ESLint: PASS
- TypeScript: PASS
- Prettier: PASS

### Changes by Category

- Hook organization: 4 fixes
- Naming conventions: 6 fixes
- Accessibility: 3 fixes
- Type safety: 5 fixes

### Next Steps

1. [ ] Review the changes
2. [ ] Run tests for the feature
3. [ ] Commit changes
```

Mark all todos as completed.

### Error Handling

| Failure                  | Action                                     |
| ------------------------ | ------------------------------------------ |
| File not found           | Show error with path suggestions           |
| Not a .tsx file          | Show error, suggest correct file           |
| No components in tree    | Show warning, file might be leaf component |
| Circular import detected | Skip duplicate, note in summary            |
| Specialist agent failed  | Retry once, then report failure            |
| Validation failed        | Note errors, suggest manual fixes          |
| Max depth reached        | Note truncation in summary                 |

### Performance Notes

- **Parallel by type**: Server and client specialists run in parallel
- **Tree traversal is fast**: Only reads imports, doesn't parse full AST
- **Deduplication**: Each file processed only once even if imported multiple times
- **Max depth limits scope**: Prevents runaway traversal
- **Reference files improve quality**: Good examples lead to better fixes

## Quality Standards

Good fixes must:

1. **Follow component type conventions** - Server vs client patterns
2. **Match reference patterns** - Follow the same structure as reference files
3. **Pass validation** - No lint or type errors
4. **Preserve functionality** - Don't break existing behavior
5. **Be minimal** - Only change what's needed to follow patterns
6. **Maintain tree integrity** - Don't break parent-child relationships

## Example Workflow

```
User: /fix-feature src/components/feature/comments/async/comment-section-async.tsx

Orchestrator:
1. Validates entry file exists
2. Builds component tree (finds 8 components)
3. Categorizes: 1 server, 7 client
4. Finds reference files for each type
5. Launches 2 specialist agents in parallel:
   - server-component-specialist for 1 file
   - client-component-specialist for 7 files
6. Collects results from both agents
7. Runs validation (lint, typecheck, format)
8. Generates summary with all changes
```
