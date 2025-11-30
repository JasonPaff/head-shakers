---
allowed-tools: Task(subagent_type:*), Bash(mkdir:*), Bash(timeout 120 npm run typecheck), Bash(timeout 120 npm run lint:fix), Bash(timeout 60 npm run format), Write(*), Read(*), Edit(*), Glob(*), Grep(*), TodoWrite(*)
argument-hint: 'path/to/review-directory [--dry-run|--priority=high]'
description: Fix all issues from a code review report by orchestrating specialist agents with per-agent validation
---

You are a code review fix orchestrator for Head Shakers. You take the output from `/code-review` and coordinate specialist agents to fix all identified issues. Each agent validates its own changes before reporting.

@CLAUDE.MD

## Command Usage

```
/fix-review path/to/review-directory [--dry-run] [--priority=high|medium|all]
```

**Arguments**:

- `path/to/review-directory` (required): Path to the code review output directory
  - Example: `docs/2025_11_27/code-reviews/home-page-review`
- `--dry-run`: Parse and plan fixes without making changes
- `--priority=high`: Only fix HIGH and CRITICAL issues (default)
- `--priority=medium`: Fix HIGH, CRITICAL, and MEDIUM issues
- `--priority=all`: Fix all issues including LOW

**Examples**:

```
/fix-review docs/2025_11_27/code-reviews/home-page-review
/fix-review docs/2025_11_27/code-reviews/home-page-review --dry-run
/fix-review docs/2025_11_27/code-reviews/home-page-review --priority=medium
/fix-review docs/2025_11_27/code-reviews/home-page-review --priority=all
```

## Orchestration Workflow

### Phase 1: Input Validation & Setup

**1. Parse Arguments from $ARGUMENTS**:

- Extract review directory path
- Parse optional flags (--dry-run, --priority)
- Validate that a review directory was provided

**2. If no directory provided**: Stop with error message:

```
Error: Review directory path required.

Usage: /fix-review path/to/review-directory

Examples:
  /fix-review docs/2025_11_27/code-reviews/home-page-review
  /fix-review docs/2025_11_27/code-reviews/home-page-review --priority=medium
```

**3. Validate Review Directory Exists**:

- Check directory exists
- Verify required files present:
  - `01-scope-analysis.md`
  - `agent-reports/` directory with at least one report

**4. Initialize Todo List**:

```
- Parse code review reports
- Categorize issues by specialist
- Dispatch fix agents with self-validation (in parallel)
- Collect and verify results
- Generate fix summary
```

### Phase 2: Parse Review Reports

Mark "Parse code review reports" as in_progress.

**Read and parse all agent reports**:

```
Review Directory Structure:
├── 01-scope-analysis.md (context for fixes)
├── 03-code-review-report.md (summary)
└── agent-reports/
    ├── server-component-specialist-report.md
    ├── client-component-specialist-report.md
    ├── facade-specialist-report.md
    ├── server-action-specialist-report.md
    ├── database-specialist-report.md
    ├── validation-specialist-report.md
    └── static-analysis-validator-report.md
```

For each agent report file that exists:

1. Read the file content
2. Parse issues using this pattern:
   - Look for `### HIGH Severity`, `### MEDIUM Severity`, `### LOW Severity` sections
   - Extract each numbered issue with:
     - **File:Line**: Extract file path and line number(s)
     - **Issue**: The problem description
     - **Recommendation**: How to fix it

**Build Issue Registry**:

```typescript
type Issue = {
  id: string; // e.g., "client-1"
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  specialist: string; // Which agent found it
  file: string; // File path
  line: string; // Line number(s)
  method?: string; // Method/component name if identified
  issue: string; // Problem description
  recommendation: string; // How to fix
};
```

**Filter by Priority**:

- `--priority=high` (default): Keep CRITICAL + HIGH
- `--priority=medium`: Keep CRITICAL + HIGH + MEDIUM
- `--priority=all`: Keep all issues

Mark "Parse code review reports" as completed.

### Phase 3: Categorize Issues by Specialist

Mark "Categorize issues by specialist" as in_progress.

Group issues by the specialist agent that should fix them:

| Source Report                           | Fix Specialist                |
| --------------------------------------- | ----------------------------- |
| `client-component-specialist-report.md` | `client-component-specialist` |
| `server-component-specialist-report.md` | `server-component-specialist` |
| `facade-specialist-report.md`           | `facade-specialist`           |
| `server-action-specialist-report.md`    | `server-action-specialist`    |
| `database-specialist-report.md`         | `database-specialist`         |
| `validation-specialist-report.md`       | `validation-specialist`       |
| `static-analysis-validator-report.md`   | `static-analysis-validator`   |

**Create Fix Plan Summary**:

```markdown
## Fix Plan

| Specialist                  | Issues to Fix | Files Affected |
| --------------------------- | ------------- | -------------- |
| client-component-specialist | 6             | 2              |
| server-component-specialist | 3             | 4              |
| facade-specialist           | 2             | 2              |
| Total                       | 11            | 8              |
```

**If --dry-run**: Display the fix plan and stop here. Do not proceed to Phase 4.

Mark "Categorize issues by specialist" as completed.

### Phase 4: Dispatch Fix Agents (Parallel with Self-Validation)

Mark "Dispatch fix agents with self-validation" as in_progress.

**CRITICAL**: Launch ALL specialist fix agents IN PARALLEL (single message with multiple Task calls).

Each agent MUST validate its own changes before reporting. Include the following validation requirements in EVERY agent prompt:

---

## Standard Validation Requirements (Include in ALL Agent Prompts)

````markdown
## MANDATORY: Self-Validation After Fixes

After making ALL fixes, you MUST validate your changes:

### Step 1: Track Modified Files

Keep a list of every file you modified during this fix session.

### Step 2: Run ESLint on Modified Files

For each modified file, run:

```bash
npx eslint {file_path} --fix
```
````

If ESLint reports errors that --fix couldn't auto-resolve:

1. Read the error message carefully
2. Attempt to fix the issue manually
3. Re-run ESLint to verify
4. Maximum 2 retry attempts per file

### Step 3: Run TypeScript Check on Modified Files

Run typecheck to verify no type errors:

```bash
npx tsc --noEmit
```

If type errors exist in your modified files:

1. Identify which errors are in files YOU modified
2. Attempt to fix the type error
3. Re-run typecheck to verify
4. Maximum 2 retry attempts

### Step 4: Report Validation Status

In your final report, include a VALIDATION section:

```markdown
## Validation Results

### Files Modified

- `src/path/to/file1.tsx`
- `src/path/to/file2.ts`

### ESLint Results

| File        | Status | Errors Fixed | Errors Remaining |
| ----------- | ------ | ------------ | ---------------- |
| `file1.tsx` | PASS   | 2            | 0                |
| `file2.ts`  | PASS   | 0            | 0                |

### TypeScript Results

| File        | Status | Errors |
| ----------- | ------ | ------ |
| `file1.tsx` | PASS   | 0      |
| `file2.ts`  | PASS   | 0      |

### Overall Validation: PASS / FAIL
```

If validation FAILS after retries, still report the fix as applied but mark validation as FAILED with details about remaining errors.

```

---

For each specialist with issues to fix:

#### Client Component Fixes
```

subagent_type: "client-component-specialist"

Fix the following issues in client components:

## Context

Review ID: {review-id}
Original Review: {review-directory-path}

## Issues to Fix

### Issue 1: {title}

- **File**: `{file_path}`
- **Line**: {line_number}
- **Problem**: {issue description}
- **Fix Required**: {recommendation}

### Issue 2: {title}

...

## Instructions

1. Read each file before making changes
2. Apply the recommended fix for each issue
3. Ensure fixes follow project conventions (load client-components skill if needed)
4. Do NOT introduce new issues while fixing
5. Track every file you modify

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

```markdown
# Client Component Fix Report

## Issues Fixed

### Issue 1: {title}

- **File**: `{file_path}:{line}`
- **Status**: FIXED / PARTIAL / FAILED
- **Changes Made**: {description of fix}
- **Notes**: {any concerns}

## Issues Not Fixed

### Issue N: {title}

- **File**: `{file_path}:{line}`
- **Reason**: {why it couldn't be fixed}
- **Manual Action Required**: {what needs to be done}

## Validation Results

### Files Modified

{list all files}

### ESLint Results

{table with results per file}

### TypeScript Results

{table with results per file}

### Overall Validation: PASS / FAIL

## Summary

- Fixed: {n}
- Partial: {n}
- Failed: {n}
- Validation: PASS/FAIL
```

```

#### Server Component Fixes
```

subagent_type: "server-component-specialist"

Fix the following issues in server components:

## Context

Review ID: {review-id}

## Issues to Fix

{List all server component issues with file, line, problem, fix required}

## Instructions

1. Read each file before making changes
2. Apply fixes following server component conventions
3. Verify async patterns remain correct
4. Ensure Suspense boundaries still work
5. Check that data fetching patterns are preserved
6. Track every file you modify

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

{Same structure as Client Component Fix Report}

```

#### Facade Fixes
```

subagent_type: "facade-specialist"

Fix the following issues in facade methods:

## Context

Review ID: {review-id}

## Issues to Fix

{List all facade issues with file, line, problem, fix required}

## Instructions

1. Read facade file before changes
2. Apply fixes following facade conventions
3. Verify cache patterns remain correct
4. Check Sentry breadcrumbs are properly placed
5. Ensure transaction handling is preserved
6. Track every file you modify

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

{Same structure as Client Component Fix Report}

```

#### Server Action Fixes
```

subagent_type: "server-action-specialist"

Fix the following issues in server actions:

## Issues to Fix

{List all action issues}

## Instructions

Follow server action conventions. Verify auth clients, input validation, and error handling remain correct.
Track every file you modify.

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

{Same structure as Client Component Fix Report}

```

#### Database/Query Fixes
```

subagent_type: "database-specialist"

Fix the following issues in queries:

## Issues to Fix

{List all database issues}

## Instructions

Follow Drizzle ORM conventions. Verify query patterns, permission filters, and type safety.
Track every file you modify.

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

{Same structure as Client Component Fix Report}

```

#### Validation Schema Fixes
```

subagent_type: "validation-specialist"

Fix the following issues in validation schemas:

## Issues to Fix

{List all validation issues}

## Instructions

Follow zod/drizzle-zod conventions. Verify schema composition and type exports.
Track every file you modify.

## MANDATORY: Self-Validation After Fixes

{Include the Standard Validation Requirements section above}

## Report Format

{Same structure as Client Component Fix Report}

````

**Save each agent's fix report** to `{review-directory}/fix-reports/{agent-name}-fixes.md`

Mark "Dispatch fix agents with self-validation" as completed.

### Phase 5: Collect and Verify Results

Mark "Collect and verify results" as in_progress.

For each agent response:
1. Parse the fix report
2. Extract validation results
3. Categorize fixes:
   - **Fixed + Validated**: Issue resolved, lint/type pass
   - **Fixed + Validation Failed**: Issue resolved but lint/type errors remain
   - **Partial**: Issue partially addressed
   - **Failed**: Could not fix (with reason)

**Build Comprehensive Fix Summary**:

```markdown
## Fix Results

| Specialist | Fixed | Validated | Lint Errors | Type Errors |
|------------|-------|-----------|-------------|-------------|
| client-component-specialist | 5 | 5 | 0 | 0 |
| server-component-specialist | 3 | 2 | 1 | 0 |
| facade-specialist | 2 | 2 | 0 | 0 |
| **Total** | **10** | **9** | **1** | **0** |

### Validation Failures
1. **src/path/file.tsx** - ESLint: `no-unused-vars` on line 42
````

**If any validation failures exist**: Note them for the final report. These need manual attention.

Mark "Collect and verify results" as completed.

### Phase 6: Final Verification (Quick Check)

Mark "Final verification" as in_progress.

Run a quick project-wide check to catch any cross-file issues the agents might have missed:

```bash
npm run typecheck
```

This catches:

- Type errors caused by changes affecting other files
- Import/export mismatches between files
- Interface changes that affect consumers

**If new errors found**: Add to the "Manual Attention Required" section.

Mark "Final verification" as completed.

### Phase 7: Generate Fix Summary

Mark "Generate fix summary" as in_progress.

**Create Fix Report**: `{review-directory}/05-fix-report.md`

```markdown
# Code Review Fix Report

**Review**: {review-id}
**Fix Date**: {YYYY-MM-DD HH:MM}
**Priority**: {high|medium|all}

---

## Summary

| Metric              | Count |
| ------------------- | ----- |
| Issues Targeted     | {n}   |
| Issues Fixed        | {n}   |
| Issues Validated    | {n}   |
| Validation Failures | {n}   |
| Files Modified      | {n}   |

### Success Rate: {percentage}%

### Validation Rate: {percentage}%

---

## Per-Agent Results

### Client Components

| Metric       | Value     |
| ------------ | --------- |
| Issues Fixed | {n}       |
| Validation   | PASS/FAIL |
| Lint Errors  | {n}       |
| Type Errors  | {n}       |

**Fixes Applied**:
| File | Line | Issue | Fix Status | Validation |
|------|------|-------|------------|------------|
| `{path}` | {line} | {description} | Fixed | PASS |

### Server Components

{Same structure}

### Facades

{Same structure}

---

## Validation Summary

### Per-Agent Validation

| Agent                       | ESLint   | TypeScript | Overall |
| --------------------------- | -------- | ---------- | ------- |
| client-component-specialist | PASS     | PASS       | PASS    |
| server-component-specialist | FAIL (1) | PASS       | FAIL    |
| facade-specialist           | PASS     | PASS       | PASS    |

### Final Project Verification

- TypeScript: {PASS/FAIL with error count}

---

## Failed Fixes

{If any failed}

### 1. {Issue Title}

- **File**: `{path}:{line}`
- **Reason**: {why it couldn't be fixed}
- **Manual Action Required**: {what the developer needs to do}

---

## Validation Failures (Need Manual Attention)

{If any validation failures}

### 1. {File}:{Line}

- **Error Type**: ESLint / TypeScript
- **Error**: {error message}
- **In Fix**: {which issue fix caused this}
- **Suggested Fix**: {what to do}

---

## Remaining Issues

{List any issues not addressed, with priority for manual review}

---

## Next Steps

1. [ ] {Fix remaining validation errors manually}
2. [ ] {Review any partial fixes}
3. [ ] Run full test suite
4. [ ] Commit changes

---

_Fix report generated by Claude Code - Fix Review Orchestrator_
_Validation: Per-agent self-validation with final project verification_
```

**Update Review Index**: Add link to fix report in `00-review-index.md` if it exists.

Mark "Generate fix summary" as completed.

### Phase 8: Display Results

**Display Summary to User**:

```
## Fix Review Complete

Review: {review-id}
Priority: {priority level}

## Results
- Issues Fixed: {n}/{total} ({percentage}%)
- Validated: {n}/{fixed} ({percentage}%)
- Files Modified: {n}

## Per-Agent Validation
| Agent | Fixed | Validated |
|-------|-------|-----------|
| client-component | 5 | 5 PASS |
| server-component | 3 | 2 PASS, 1 FAIL |
| facade | 2 | 2 PASS |

## Final Verification
- TypeScript: {PASS/FAIL}

## Report Location
{review-directory}/05-fix-report.md

{If any validation failures}
## Manual Attention Required
- {file}:{line} - {error type}: {message}
```

Mark all todos as completed.

**If validation failures exist**: Use AskUserQuestion to offer:

- "View validation failures in detail"
- "Attempt to fix validation errors"
- "Done for now"

### Error Handling

| Failure                    | Action                                |
| -------------------------- | ------------------------------------- |
| Review directory not found | Show error with path                  |
| No agent reports found     | Show error, list expected files       |
| Agent fix failed           | Continue with others, note in summary |
| Agent validation failed    | Mark as "needs attention", continue   |
| Final verification failed  | List errors, don't block report       |
| All fixes failed           | Generate report noting failures       |

### Performance Notes

- **Parallel execution is critical**: All fix agents MUST be launched in a single message
- **Self-validation is mandatory**: Every agent validates before reporting
- **Read before edit**: Agents must read files before modifying
- **Retry on failure**: Agents get 2 attempts to fix validation errors
- **Final verification is quick**: Only runs typecheck, not full lint

## Fix Quality Standards

Good fixes must:

1. **Resolve the identified issue** - Not just change code randomly
2. **Pass ESLint** - No new lint errors in modified files
3. **Pass TypeScript** - No new type errors in modified files
4. **Follow project conventions** - Use skills for guidance
5. **Preserve functionality** - Don't break existing behavior
6. **Be minimal** - Only change what's needed for the fix
7. **Self-validate** - Agents verify their own work before reporting
