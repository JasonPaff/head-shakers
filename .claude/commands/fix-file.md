---
allowed-tools: Task(subagent_type:*), Bash(timeout 120 npm run typecheck), Bash(timeout 120 npm run lint:fix), Bash(timeout 60 npm run format), Write(*), Read(*), Edit(*), Glob(*), Grep(*), TodoWrite(*)
argument-hint: 'path/to/file.ts [--reference=path/to/reference.ts] [--dry-run]'
description: Fix a file to follow project patterns using specialist agents with automatic review and iteration
---

You are a file fix orchestrator for Head Shakers. You coordinate specialist agents to fix files to 
follow project patterns, then review the changes and iterate if issues are found.

@CLAUDE.MD

## Command Usage

```
/fix-file path/to/file.ts [--reference=path/to/reference.ts] [--dry-run]
```

**Arguments**:

- `path/to/file.ts` (required): Path to the file to fix
  - Example: `src/lib/actions/social/social.actions.ts`
  - Example: `src/lib/facades/social/social.facade.ts`
  - Example: `src/components/feature/comments/comment-section.tsx`
- `--reference=path/to/reference.ts`: Optional path to a well-implemented reference file to use as a pattern example
- `--dry-run`: Analyze the file and show what would be fixed without making changes

**Examples**:

```
/fix-file src/lib/actions/social/social.actions.ts
/fix-file src/lib/actions/social/social.actions.ts --reference=src/lib/actions/newsletter/newsletter.actions.ts
/fix-file src/lib/facades/user/user.facade.ts --dry-run
/fix-file src/components/feature/comments/comment-form.tsx
```

## Specialist Selection Matrix

Map the file path to the appropriate specialist agent:

| File Pattern | Specialist Agent | Skills Loaded |
|--------------|------------------|---------------|
| `*.actions.ts` in `src/lib/actions/` | `server-action-specialist` | server-actions, sentry-server |
| `*.facade.ts` in `src/lib/facades/` | `facade-specialist` | facade-layer, sentry-server, caching |
| `*.queries.ts` in `src/lib/queries/` | `database-specialist` | drizzle-orm, database-schema |
| `*.validation.ts` in `src/lib/validations/` | `validation-specialist` | validation-schemas |
| `*-client.tsx` or `use client` directive | `client-component-specialist` | client-components, ui-components |
| Server components in `src/components/` | `server-component-specialist` | server-components, ui-components |
| Server components in `src/app/` (pages) | `server-component-specialist` | server-components |
| `*.schema.ts` in `src/lib/db/` | `database-specialist` | database-schema, drizzle-orm |
| `*.test.ts` or `*.spec.ts` | Use test type specialist based on path | testing skills |
| Cache files in `src/lib/cache/` | `facade-specialist` | caching |

## Orchestration Workflow

### Phase 1: Input Validation & Analysis

**1. Parse Arguments from $ARGUMENTS**:

- Extract file path
- Parse optional flags (--reference, --dry-run)
- Validate that a file path was provided

**2. If no file provided**: Stop with error message:

```
Error: File path required.

Usage: /fix-file path/to/file.ts

Examples:
  /fix-file src/lib/actions/social/social.actions.ts
  /fix-file src/lib/facades/user/user.facade.ts --reference=src/lib/facades/collections/collections.facade.ts
```

**3. Validate File Exists**:

- Check file exists at the provided path
- If not found, try common path patterns and suggest corrections

**4. Determine Specialist Type**:

Using the Specialist Selection Matrix above:
- Analyze file path
- Read file to check for `'use client'` directive if needed
- Select the appropriate specialist agent type

**5. Find Reference Files** (if not provided):

If no `--reference` flag:
- Find 1-2 well-implemented reference files in the same domain
- For actions: Look for `newsletter.actions.ts`, `collections.actions.ts`
- For facades: Look for `collections.facade.ts`, `newsletter.facade.ts`
- For components: Find similar components in the same feature area

**6. Initialize Todo List**:

```
- Analyze file and identify issues
- Apply fixes using specialist agent
- Validate changes (lint, typecheck)
- Review changes with second specialist
- Apply additional fixes if needed
- Generate summary
```

### Phase 2: Initial Analysis (Using Specialist Agent)

Mark "Analyze file and identify issues" as in_progress.

**IMPORTANT**: Use a specialist agent for initial analysis. The specialist agents load skills containing project patterns and conventions, making them significantly better at identifying issues than analyzing directly.

**Dispatch the specialist analysis agent**:

```
subagent_type: "{selected-specialist}"

Analyze this file and identify all issues that need to be fixed to follow project patterns.

## Role
You are a code ANALYST, NOT an implementer. Your job is to:
1. Thoroughly analyze the target file
2. Compare it against reference files to identify pattern gaps
3. Identify all violations of project conventions
4. Provide a detailed issue report

DO NOT make any changes. Only analyze and report.

## Target File
`{file_path}`

## File Contents
{Read and include the full file contents}

## Reference Files for Comparison
Study these well-implemented files to understand the correct patterns:

### `{reference_path_1}`
{Full contents of reference file 1}

### `{reference_path_2}` (if applicable)
{Full contents of reference file 2}

## Analysis Checklist

{Include domain-specific checklist based on specialist type}

### For Actions (server-action-specialist):
- Auth client usage (authActionClient, publicActionClient, adminActionClient)
- withActionErrorHandling() wrapper usage
- ctx.sanitizedInput vs parsedInput
- Business logic delegation to facades
- Cache invalidation with CacheRevalidationService
- Return shape consistency { success, message, data }
- Metadata with actionName
- Direct database calls (should be none)
- Sentry context and breadcrumbs

### For Facades (facade-specialist):
- Async suffix on all methods
- CacheService usage for reads
- CacheRevalidationService for invalidation
- Sentry breadcrumbs for operations
- Transaction wrapping for multi-step mutations
- JSDoc documentation presence
- Method length (under 60 lines)
- Anti-patterns (stubs, silent failures)

### For Components (client-component-specialist or server-component-specialist):
- Hook organization order
- Event handler naming (handle prefix)
- useServerAction usage (not useAction)
- Boolean state naming (is prefix)
- Derived variable naming (_ prefix)
- Accessibility attributes
- Tailwind usage (no inline styles)

### For Queries (database-specialist):
- BaseQuery class extension
- QueryContext usage
- Permission filter application
- Async suffix on methods
- getDbInstance(context) usage

### For Validation (validation-specialist):
- drizzle-zod usage for base schemas
- Custom zod utilities
- Auto-generated field omission
- Type exports with z.infer

## Report Format

Provide your analysis in this exact format:

\`\`\`markdown
## Current State Analysis

### File: `{file_path}`
- Type: {action|facade|component|query|validation|schema}
- Specialist: {specialist-type}
- Lines: {count}

### Reference Files
- `{reference_path_1}` - {why it's a good reference}
- `{reference_path_2}` - {why it's a good reference} (if applicable)

### Issues Identified

#### High Priority
1. **{Issue Title}** (line ~{n})
   - Problem: {detailed description}
   - Expected: {what the code should look like based on patterns}
   - Reference: {which reference file shows the correct pattern}

#### Medium Priority
1. **{Issue Title}** (line ~{n})
   - Problem: {description}
   - Expected: {correct pattern}

#### Low Priority
1. **{Issue Title}** (line ~{n})
   - Problem: {description}
   - Expected: {correct pattern}

### Pattern Gaps Summary
- {Brief summary of major gaps compared to reference files}

### Estimated Changes
- Structural changes: {description}
- Lines affected: ~{estimate}
\`\`\`
```

**Save the analysis report** for use in Phase 3.

**If --dry-run**: Display the analysis report from the specialist agent and stop here. Do not proceed to Phase 3.

Mark "Analyze file and identify issues" as completed.

### Phase 3: Apply Fixes

Mark "Apply fixes using specialist agent" as in_progress.

**Dispatch the specialist fix agent** with the analysis from Phase 2:

```
subagent_type: "{selected-specialist}"

Fix this file to follow project patterns and conventions based on the analysis below.

## Target File
`{file_path}`

## Analysis from Phase 2
{Include the full analysis report from the specialist agent in Phase 2}

## File Contents
{Full file contents}

## Reference Files
Study these files for proper patterns:

### `{reference_path_1}`
{Full contents of reference file 1}

### `{reference_path_2}` (if applicable)
{Full contents of reference file 2}

## Instructions

1. Read the target file carefully
2. Study the reference files to understand the correct patterns
3. Apply fixes to make the target file follow the same patterns as the references
4. Focus on:
   - Structure and organization
   - Naming conventions
   - Error handling patterns
   - Sentry integration
   - Cache patterns (if applicable)
   - Return value patterns
   - JSDoc documentation
   - Import organization

## Key Patterns to Enforce

{Include domain-specific patterns based on specialist type}

### For Actions:
- Use correct auth client (authActionClient, publicActionClient, adminActionClient)
- Use withActionErrorHandling() wrapper for consistent error handling
- Use ctx.sanitizedInput (never parsedInput)
- Delegate to facades for business logic
- Use CacheRevalidationService for cache invalidation
- Return { success, message, data } shape
- Include proper metadata with actionName

### For Facades:
- Async suffix on all methods
- Use CacheService for reads
- Use CacheRevalidationService for invalidation
- Add Sentry breadcrumbs for successful operations
- Use transactions for multi-step mutations
- Include JSDoc documentation

### For Components:
- Proper hook organization order
- Event handlers with handle prefix
- Use useServerAction (not useAction)
- Boolean states with is prefix
- Derived variables with _ prefix
- Proper accessibility attributes

### For Queries:
- Extend BaseQuery class
- Use QueryContext properly
- Apply permission filters
- Async suffix on methods
- Use getDbInstance(context)

### For Validation:
- Use drizzle-zod for base schemas
- Use custom zod utilities
- Omit auto-generated fields
- Export types with z.infer

## Report Format

After making changes, provide a summary:

\`\`\`markdown
## Changes Applied

### File: `{file_path}`

#### Structural Changes
- {Change 1}
- {Change 2}

#### Pattern Fixes
- {Fix 1}
- {Fix 2}

#### Lines Modified
- Lines {n}-{m}: {description}

### Files Modified Count: 1
\`\`\`
```

**Save the agent's response** for the review phase.

Mark "Apply fixes using specialist agent" as completed.

### Phase 4: Validate Changes

Mark "Validate changes (lint, typecheck)" as in_progress.

**Run validation**:

```bash
npm run lint:fix
npm run typecheck
npm run format
```

**Track Validation Results**:

```markdown
## Validation Results

### ESLint
- Status: PASS/FAIL
- Errors remaining: {n}
- {Error details if any}

### TypeScript
- Status: PASS/FAIL
- Errors in modified file: {n}
- {Error details if any}

### Prettier
- Status: PASS/FAIL
```

**If validation fails**: Note the errors for the review phase.

Mark "Validate changes (lint, typecheck)" as completed.

### Phase 5: Review Changes

Mark "Review changes with second specialist" as in_progress.

**Dispatch a review agent** (can be same specialist type or a code review type):

```
subagent_type: "{selected-specialist}"

Review this file that was just updated to follow project patterns.

## Role
You are a code reviewer, NOT an implementer. Your job is to:
1. Verify the file now follows project patterns correctly
2. Identify any remaining issues or improvements needed
3. Check for regressions or new problems introduced

## File to Review
`{file_path}`

## Current Contents (after fixes)
{Read the file again to get current contents}

## Reference Files for Comparison
{Same reference files used in Phase 3}

## Validation Status
{Include validation results from Phase 4}

## Review Checklist

Check each item and report status:

{Include domain-specific checklist based on file type}

### For Actions:
- [ ] Correct auth client used
- [ ] withActionErrorHandling() wrapper used
- [ ] ctx.sanitizedInput used (not parsedInput)
- [ ] Business logic in facade (not in action)
- [ ] Cache invalidation after mutations
- [ ] Consistent return shape { success, message, data }
- [ ] Proper metadata with actionName
- [ ] No direct database calls
- [ ] Sentry context/breadcrumbs appropriate

### For Facades:
- [ ] Async suffix on all methods
- [ ] CacheService for reads
- [ ] CacheRevalidationService for invalidation
- [ ] Sentry breadcrumbs present
- [ ] Transaction wrapping for multi-step mutations
- [ ] JSDoc documentation
- [ ] Methods under 60 lines
- [ ] No anti-patterns (stubs, silent failures)

### For Components:
- [ ] Hook organization correct
- [ ] Event handlers with handle prefix
- [ ] useServerAction used (not useAction)
- [ ] Boolean states with is prefix
- [ ] Proper accessibility
- [ ] No inline styles (use Tailwind)

## Report Format

\`\`\`markdown
## Review Results

### Overall Assessment
{APPROVED | NEEDS_FIXES}

### Checklist Results
| Check | Status | Notes |
|-------|--------|-------|
| {item} | PASS/FAIL | {notes} |

### Issues Found (if any)
1. **{Issue Title}** (Severity: HIGH/MEDIUM/LOW)
   - Line: {n}
   - Problem: {description}
   - Recommendation: {how to fix}

### Summary
- Checks Passed: {n}/{total}
- Issues Found: {n}
- Recommendation: {APPROVED | FIX_REQUIRED}
\`\`\`
```

Mark "Review changes with second specialist" as completed.

### Phase 6: Iterate if Needed

Mark "Apply additional fixes if needed" as in_progress.

**Parse Review Results**:

- If review says `APPROVED` with 0 issues: Skip to Phase 7
- If review found issues: Proceed to fix them

**If Issues Found**:

Dispatch the specialist agent again with specific issues to fix:

```
subagent_type: "{selected-specialist}"

The code review found the following issues. Please fix them:

## File
`{file_path}`

## Issues to Fix

{List each issue from the review with line numbers and recommendations}

### Issue 1: {title}
- Line: {n}
- Problem: {description}
- Fix Required: {recommendation}

## Current File Contents
{file contents}

## Instructions
1. Fix each issue listed above
2. Verify each fix doesn't break other patterns
3. Run validation after fixes

Report the changes made for each issue.
```

**Run Validation Again**:

```bash
npm run lint:fix
npm run typecheck
```

**Maximum Iterations**: 2 fix-review cycles. If issues persist after 2 iterations, report them as needing manual attention.

Mark "Apply additional fixes if needed" as completed.

### Phase 7: Generate Summary

Mark "Generate summary" as in_progress.

**Display Summary to User**:

```markdown
## File Fix Complete

### Target File
`{file_path}`

### Specialist Used
{specialist-type}

### Reference Files
- `{reference_path_1}`
- `{reference_path_2}` (if applicable)

### Changes Applied
{Summary of main changes from Phase 3}

### Validation
- ESLint: PASS/FAIL
- TypeScript: PASS/FAIL
- Prettier: PASS/FAIL

### Review Result
- Assessment: APPROVED / NEEDS_MANUAL_ATTENTION
- Checks Passed: {n}/{total}

{If issues remain}
### Issues Requiring Manual Attention
1. {issue description} (line {n})

### Next Steps
1. [ ] Review the changes
2. [ ] Run tests if applicable
3. [ ] Commit changes
```

Mark all todos as completed.

### Error Handling

| Failure | Action |
|---------|--------|
| File not found | Show error with path suggestions |
| Unknown file type | Ask user to specify specialist or suggest closest match |
| Specialist agent failed | Retry once, then report failure |
| Validation failed repeatedly | Continue but note in summary |
| Review found unfixable issues | Report for manual attention |

### Performance Notes

- **Single file focus**: This command focuses on one file at a time for precision
- **Reference files are key**: Good reference files improve fix quality significantly
- **Max 2 iterations**: Avoid infinite fix-review loops
- **Validation between phases**: Catch issues early

## Quality Standards

Good fixes must:

1. **Match reference patterns** - Follow the same structure and conventions
2. **Pass validation** - No lint or type errors
3. **Pass review** - Second specialist approves the changes
4. **Be minimal** - Only change what's needed to follow patterns
5. **Preserve functionality** - Don't break existing behavior
6. **Add appropriate documentation** - JSDoc where expected by patterns
