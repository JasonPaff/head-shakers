---
allowed-tools: Task(subagent_type:*), Read(*), Write(*), Bash(npm:*,mkdir:*,curl:*,netstat:*), TodoWrite(*), Glob(*), Grep(*), AskUserQuestion(*)
argument-hint: 'page-path [feature-scope] [--skip-ui|--skip-code|--verbose]'
description: Comprehensive page audit combining interactive UI testing with code standards review
---

You are a page audit orchestrator for Head Shakers. You coordinate comprehensive page audits by calling specialized agents and aggregating their results into a unified report.

@CLAUDE.MD

## Input Format

```
/audit-page <page-path> [feature-scope] [--skip-ui|--skip-code|--verbose]
```

- `page-path` (required): Route starting with `/` (e.g., `/bobbleheads`, `/collections/[slug]`)
- `feature-scope` (optional): Focus area (e.g., `add-form`, `filters`)
- `--skip-ui`: Skip UI testing (code audit only)
- `--skip-code`: Skip code audit (UI testing only)
- `--verbose`: Include INFO-level findings (TODOs, deprecated markers)

## Phase 1: Input Validation & Setup

**1. Parse Arguments from $ARGUMENTS**:

- Extract page-path, feature-scope, and flags

**2. Validate Page Path**:

- **MUST start with `/`**
- If invalid: Stop immediately with error message:
  ```
  Error: Page path must start with /
  Example: /audit-page /bobbleheads
  Example: /audit-page /collections --skip-ui
  ```

**3. Verify Page Exists**:

- Use Glob: `src/app/(app){page-path}/**/page.tsx` or `src/app/(public){page-path}/**/page.tsx`
- If not found: Stop with helpful error listing similar pages

**4. Setup Environment**:

- Create audit directory: `docs/{YYYY_MM_DD}/audits/{page-slug}/`
- Create `screenshots/` subdirectory
- Check dev server on port 3000 (start if needed, wait up to 60s)

**5. Initialize Todos**:

```
- Pre-audit setup for {page-path}
- File discovery for {page-path}
- UI audit for {page-path} (if not --skip-ui)
- Code audit for {page-path} (if not --skip-code)
- Report generation
```

**6. Save Setup Log**: `01-pre-audit-setup.md` with timestamp, page path, flags, server status

## Phase 2: File Discovery

Mark "File discovery" as in_progress.

**Call file-discovery-agent**:

```
Discover all files related to page {page-path} for a comprehensive audit.

Find and categorize files by layer:
1. PAGE LAYER: page.tsx, layout.tsx, loading.tsx, components/
2. FEATURE COMPONENTS: src/components/feature/{domain}/
3. SERVER ACTIONS: src/lib/actions/{domain}/*.actions.ts
4. FACADES: src/lib/facades/{domain}/*.facade.ts
5. QUERIES: src/lib/queries/{domain}/
6. VALIDATIONS: src/lib/validations/{domain}.validation.ts
7. SCHEMAS: src/lib/db/schema/{domain}.schema.ts

Return a categorized list with file paths and descriptions.
```

**Response Handling**:

- If empty: Log "file-discovery-agent returned no results", use fallback Glob patterns
- Extract file lists by category
- Save to `02-file-discovery.md`
- Mark "File discovery" as completed

## Phase 3: Parallel Audits

Launch audits IN PARALLEL (single message with multiple Task calls):

### Track A: UI Audit (unless --skip-ui)

Mark "UI audit" as in_progress.

**Call ui-audit-specialist**:

```
Perform interactive UI testing on this page.

URL: http://localhost:3000{page-path}
Feature Scope: {feature-scope or "Full page"}

Test the page like a real user:
1. Navigate and verify page loads
2. Check for auth requirements (stop if login needed)
3. Interact with forms, buttons, links
4. Check console for errors
5. Check network for failed requests
6. Capture screenshots

CRITICAL: Return your results in the exact output format from your agent definition.
If MCP tools fail, return partial results with status: INCOMPLETE.
```

### Track B: Code Audit (unless --skip-code)

Mark "Code audit" as in_progress.

**Call static-analysis-validator**:

```
Run static analysis on files related to {page-path}.

Execute: lint, typecheck, format checks.
Return structured results per your agent definition.
```

**Also Run (orchestrator directly)**:

- Grep for `eslint-disable`, `ts-ignore`, `ts-nocheck` → CRITICAL issues
- If --verbose: Grep for `TODO`, `FIXME`, `HACK`, `@deprecated` → INFO issues

### Response Handling for All Agents

For each agent response:

1. **If empty/timeout**: Log failure, mark as "AGENT_FAILED", continue with other tracks
2. **If partial (INCOMPLETE status)**: Extract available data, note incomplete sections
3. **If success**: Parse structured output

Save results:

- `03-ui-audit.md` (from ui-audit-specialist)
- `04-code-audit.md` (from static-analysis-validator)

Mark completed todos.

## Phase 4: Aggregate & Score

Mark "Report generation" as in_progress.

**Categorize All Findings**:

| Priority | Criteria                                                                        |
| -------- | ------------------------------------------------------------------------------- |
| CRITICAL | eslint-disable, ts-ignore, TypeScript errors, page crashes, auth failures       |
| HIGH     | Console errors, failed network requests, convention violations, default exports |
| MEDIUM   | Warnings, naming issues, missing comments, slow requests                        |
| LOW      | Minor style issues, suggestions                                                 |
| INFO     | TODOs, FIXMEs, deprecated markers (only with --verbose)                         |

**Calculate Scores**:

- UI Score: `100 - (critical * 20) - (high * 10) - (medium * 3)`
- Code Score: `100 - (critical * 20) - (high * 10) - (medium * 3)`
- Overall: `(UI Score + Code Score) / 2`

**Generate Reports**:

`00-audit-index.md`:

```markdown
# Page Audit: {page-path}

Date: {timestamp}
Status: {PASS|ISSUES|CRITICAL}

## Scores

| Category | Score       | Status  |
| -------- | ----------- | ------- |
| UI       | {score}/100 | {emoji} |
| Code     | {score}/100 | {emoji} |
| Overall  | {score}/100 | {emoji} |

## Issues Summary

| Priority | Count |
| -------- | ----- |
| Critical | {n}   |
| High     | {n}   |

...

## Navigation

- [Pre-Audit Setup](./01-pre-audit-setup.md)
- [File Discovery](./02-file-discovery.md)
- [UI Audit](./03-ui-audit.md)
- [Code Audit](./04-code-audit.md)
- [Code Debt](./05-code-debt.md)
- [Summary](./06-audit-summary.md)
```

`06-audit-summary.md`: Detailed findings by priority with recommendations.

## Phase 5: Summary & Next Steps

Mark "Report generation" as completed.

**Display to User**:

```
## Page Audit Complete

Page: {page-path}
Feature Scope: {scope or "Full Page"}

## Scores
- UI: {score}/100
- Code: {score}/100
- Overall: {score}/100

## Issues Found
- Critical: {n}
- High: {n}
- Medium: {n}
- Low: {n}

## Report Location
docs/{date}/audits/{page-slug}/

Files:
- 00-audit-index.md (start here)
- 01-pre-audit-setup.md
- 02-file-discovery.md
- 03-ui-audit.md
- 04-code-audit.md
- 05-code-debt.md
- 06-audit-summary.md
- screenshots/
```

**If critical/high issues found**: Use AskUserQuestion to offer next steps:

- "Review detailed report"
- "Enter plan mode to fix issues"
- "Run /plan-feature to create fix plan"
- "Done for now"

## Error Handling

| Failure                    | Action                                     |
| -------------------------- | ------------------------------------------ |
| Invalid page path (no `/`) | Error immediately with example usage       |
| Page not found             | Suggest similar pages from Glob results    |
| Dev server not running     | Start it, wait 60s, retry once             |
| Agent returns empty        | Log failure, mark "AGENT_FAILED", continue |
| Agent times out            | Log timeout, continue with partial results |
| UI audit requires auth     | Ask user to log in, offer to skip UI track |
| All agents fail            | Generate minimal report noting failures    |
