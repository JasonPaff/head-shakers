---
allowed-tools: Task(subagent_type:ui-audit-specialist), Task(subagent_type:file-discovery-agent), Task(subagent_type:static-analysis-validator), Task(subagent_type:conventions-validator), Task(subagent_type:react-component-specialist), Task(subagent_type:server-action-specialist), Task(subagent_type:facade-specialist), Task(subagent_type:validation-specialist), Task(subagent_type:database-specialist), Task(subagent_type:form-specialist), Task(subagent_type:general-purpose), Read(*), Write(*), Bash(npm:*,mkdir:*,curl:*,netstat:*,tasklist:*), TodoWrite(*), Glob(*), Grep(*), AskUserQuestion(*)
argument-hint: 'page-path [feature-scope] [--skip-ui|--skip-code|--verbose]'
description: Comprehensive page audit combining interactive UI testing with code standards review
---

You are a page audit orchestrator for the Head Shakers bobblehead collection platform. You coordinate comprehensive audits of pages by running UI testing and code review in parallel, then aggregating results into a hierarchical report.

@CLAUDE.MD

## Command Usage

```
/audit-page <page-path> [feature-scope] [options]
```

**Arguments**:
- `page-path` (required): The page route to audit (e.g., `/bobbleheads`, `/collections/[slug]`)
- `feature-scope` (optional): Specific feature to focus on (e.g., `add-form`, `filters`)

**Options**:
- `--skip-ui`: Skip UI testing (code audit only)
- `--skip-code`: Skip code audit (UI testing only)
- `--verbose`: Include INFO-level findings (TODOs, deprecated markers)

**Examples**:
```
/audit-page /bobbleheads
/audit-page /bobbleheads add-form
/audit-page /collections --skip-ui
/audit-page /admin/users --verbose
```

## Architecture Overview

**5-Phase Parallel Audit**:

```
Phase 1: Pre-Audit Setup (Sequential)
    │
    ▼
Phase 2: File Discovery (Sequential)
    │
    ▼
Phase 3: Parallel Audits ──────────────────────────────┐
    │                                                   │
    ├── TRACK A: UI Audit          TRACK B: Code Audit │
    │   (ui-audit-specialist)      │                   │
    │                              ├── Static Analysis │
    │                              ├── Conventions     │
    │                              ├── Layer Specialists
    │                              └── Code Debt       │
    │                                                   │
    ▼
Phase 4: Report Aggregation (Sequential)
    │
    ▼
Phase 5: Summary & Recommendations
```

## Workflow Execution

### Phase 1: Pre-Audit Setup

**Objective**: Validate environment and prepare audit session.

**Process**:

1. **Parse Arguments**:
   - Extract page path from `$ARGUMENTS`
   - Extract optional feature scope
   - Detect flags: `--skip-ui`, `--skip-code`, `--verbose`
   - Validate page path format (must start with `/`)

2. **Validate Page Path**:
   - Map route to filesystem: `src/app/(app)/{page-path}/**/page.tsx`
   - Use Glob to verify page exists
   - If not found, check `src/app/(public)/` as fallback
   - If still not found, error with helpful message

3. **Check Dev Server**:
   - Use Bash to check if port 3000 is in use:
     ```bash
     netstat -ano | findstr :3000
     ```
   - **If not running**:
     - Start dev server in background:
       ```bash
       npm run dev
       ```
     - Wait up to 60 seconds for server to start
     - Health check with curl or retry logic
   - **If running**: Proceed

4. **Create Audit Directory**:
   - Generate date: `{YYYY_MM_DD}` format
   - Generate page slug from path (e.g., `/bobbleheads/add` → `bobbleheads-add`)
   - Create: `docs/{YYYY_MM_DD}/audits/{page-slug}/`
   - Create `screenshots/` subdirectory

5. **Initialize Todo List**:
   - Create todos for each phase:
     - "Pre-audit setup"
     - "File discovery"
     - "UI audit" (if not --skip-ui)
     - "Code audit" (if not --skip-code)
     - "Report generation"

6. **Save Pre-Audit Log**:
   - Create `docs/{date}/audits/{page-slug}/01-pre-audit-setup.md`:
     - Timestamp, page path, feature scope
     - Dev server status
     - Flags detected
     - Directory created

7. **CHECKPOINT**: Mark "Pre-audit setup" as completed

### Phase 2: File Discovery

**Objective**: Discover all files related to the page.

**Process**:

1. Mark "File discovery" as in_progress

2. **Launch File Discovery Agent**:
   - Use Task with `subagent_type: "file-discovery-agent"`
   - Description: "Discover files for page {page-path}"
   - Prompt:
     ```
     Discover all files related to this page for a comprehensive audit.

     Page Path: {page-path}
     Feature Scope: {feature-scope or "Full page"}

     Find and categorize files by layer:
     1. PAGE LAYER: src/app/(app)/{path}/**/page.tsx, layout.tsx, loading.tsx, components/*.tsx
     2. FEATURE COMPONENTS: src/components/feature/{domain}/**/*.tsx
     3. UI COMPONENTS: Any src/components/ui/** referenced by page
     4. SERVER ACTIONS: src/lib/actions/{domain}/*.actions.ts
     5. FACADES: src/lib/facades/{domain}/*.facade.ts
     6. QUERIES: src/lib/queries/{domain}/*.ts
     7. VALIDATIONS: src/lib/validations/{domain}.validation.ts
     8. SCHEMAS: src/lib/db/schema/{domain}.schema.ts

     Trace imports from page files to discover related code.

     Return a categorized list of all discovered files with their layer classification.
     ```

3. **Parse Discovery Results**:
   - Extract file lists by category
   - Count files per layer
   - Note any discovery issues

4. **Save Discovery Log**:
   - Create `docs/{date}/audits/{page-slug}/02-file-discovery.md`:
     - Files discovered by layer
     - Import trace summary
     - Total file count

5. **CHECKPOINT**: Mark "File discovery" as completed

### Phase 3: Parallel Audits

**Objective**: Run UI and code audits simultaneously.

**Process**:

Launch BOTH audit tracks in PARALLEL using multiple Task tool calls in a single message:

#### Track A: UI Audit (if not --skip-ui)

1. **Launch UI Audit Specialist**:
   - Use Task with `subagent_type: "ui-audit-specialist"`
   - Description: "UI audit for {page-path}"
   - Prompt:
     ```
     Perform interactive UI testing on this page.

     URL: http://localhost:3000{page-path}
     Feature Scope: {feature-scope or "Full page"}

     Test the page like a real user would:
     1. Navigate to the page
     2. Check authentication (if login page, STOP and ask user to log in)
     3. Detect page type (list, form, detail, dashboard)
     4. Interact with elements based on page type
     5. For forms: Fill and SUBMIT with test data
     6. Check console for errors
     7. Check network for failed requests
     8. Capture screenshots

     Return structured UI audit results.
     ```

2. **Process UI Results**:
   - Parse structured output from ui-audit-specialist
   - Handle AUTH REQUIRED status (stop and inform user)
   - Extract issues, screenshots, recommendations

3. **Save UI Audit Log**:
   - Create `docs/{date}/audits/{page-slug}/03-ui-audit.md`
   - Copy screenshots to `screenshots/` directory

#### Track B: Code Audit (if not --skip-code)

Run these in sequence within Track B:

**B1. Static Analysis**:
- Use Task with `subagent_type: "static-analysis-validator"`
- Prompt: Run ESLint, TypeScript, and Prettier checks on discovered files
- Capture all validation output

**B2. Conventions Validation**:
- Use Task with `subagent_type: "conventions-validator"`
- Prompt: Check React conventions on all .tsx/.jsx files from discovery

**B3. Layer-Specific Validation** (route based on file type):
- For action files → `server-action-specialist`
- For facade files → `facade-specialist`
- For validation files → `validation-specialist`
- For query/schema files → `database-specialist`
- For form components → `form-specialist`
- For other components → `react-component-specialist`

**B4. Code Debt Analysis** (orchestrator runs directly):
- Use Grep to find:
  ```
  eslint-disable   → CRITICAL (blocked by project rules)
  ts-ignore        → CRITICAL (blocked by project rules)
  ts-nocheck       → CRITICAL (blocked by project rules)
  TODO             → INFO
  FIXME            → INFO
  HACK             → INFO
  @deprecated      → INFO
  ```

4. **Save Code Audit Log**:
   - Create `docs/{date}/audits/{page-slug}/04-code-audit.md`:
     - Static analysis results
     - Convention violations
     - Layer-specific findings

5. **Save Code Debt Log**:
   - Create `docs/{date}/audits/{page-slug}/05-code-debt.md`:
     - Critical issues (eslint-disable, ts-ignore)
     - Technical debt markers (TODO, FIXME)

6. **CHECKPOINT**: Mark "UI audit" and/or "Code audit" as completed

### Phase 4: Report Aggregation

**Objective**: Aggregate findings into hierarchical report.

**Process**:

1. Mark "Report generation" as in_progress

2. **Collect All Findings**:
   - UI issues from Track A
   - Code issues from Track B
   - Code debt from B4

3. **Categorize by Priority**:

   | Priority | Criteria |
   |----------|----------|
   | **CRITICAL** | ESLint errors, TS errors, eslint-disable, ts-ignore, auth failures, page crashes |
   | **HIGH** | Convention violations, console errors, failed network requests, default exports |
   | **MEDIUM** | Naming conventions, missing comments, slow requests, warnings |
   | **LOW** | Best practices, minor style issues, suggestions |
   | **INFO** | TODOs, FIXMEs, deprecated markers |

4. **Calculate Audit Scores**:
   - UI Score: 100 - (critical * 20) - (high * 10) - (medium * 3)
   - Code Score: 100 - (critical * 20) - (high * 10) - (medium * 3)
   - Overall: (UI Score + Code Score) / 2

5. **Generate Index File**:
   - Create `docs/{date}/audits/{page-slug}/00-audit-index.md`:
     ```markdown
     # Page Audit: {page-path}

     **Date**: {timestamp}
     **Feature Scope**: {scope or "Full Page"}
     **Status**: {PASS|ISSUES|CRITICAL}

     ## Audit Scores

     | Category | Score | Status |
     |----------|-------|--------|
     | UI | {score}/100 | {emoji} |
     | Code | {score}/100 | {emoji} |
     | **Overall** | **{score}/100** | **{emoji}** |

     ## Issues Summary

     | Priority | Count |
     |----------|-------|
     | Critical | {n} |
     | High | {n} |
     | Medium | {n} |
     | Low | {n} |
     | Info | {n} |

     ## Navigation

     - [Pre-Audit Setup](./01-pre-audit-setup.md)
     - [File Discovery](./02-file-discovery.md)
     - [UI Audit](./03-ui-audit.md)
     - [Code Audit](./04-code-audit.md)
     - [Code Debt](./05-code-debt.md)
     - [Audit Summary](./06-audit-summary.md)
     - [Screenshots](./screenshots/)

     ## Quick Actions

     Based on findings:
     - {recommendation 1}
     - {recommendation 2}
     ```

6. **Generate Summary File**:
   - Create `docs/{date}/audits/{page-slug}/06-audit-summary.md`:
     - Executive summary
     - All issues by priority
     - Detailed recommendations
     - Next steps (plan mode or /plan-feature suggestions)

7. **CHECKPOINT**: Mark "Report generation" as completed

### Phase 5: Summary & Recommendations

**Objective**: Present final results to user.

**Process**:

1. **Display Summary**:
   ```
   ## Page Audit Complete

   Page: {page-path}
   Feature Scope: {scope or "Full Page"}

   ## Audit Scores
   - UI Score: {score}/100 {emoji}
   - Code Score: {score}/100 {emoji}
   - Overall: {score}/100 {emoji}

   ## Issues Found
   - Critical: {n}
   - High: {n}
   - Medium: {n}
   - Low: {n}
   - Info: {n}

   ## Audit Report
   Directory: docs/{date}/audits/{page-slug}/

   Files:
   - 00-audit-index.md (start here)
   - 01-pre-audit-setup.md
   - 02-file-discovery.md
   - 03-ui-audit.md
   - 04-code-audit.md
   - 05-code-debt.md
   - 06-audit-summary.md
   - screenshots/

   Execution time: {duration}
   ```

2. **Provide Next Steps**:
   - If critical issues: Recommend immediate fixes
   - If high issues: Recommend using plan mode to address
   - If many issues: Recommend `/plan-feature` for comprehensive fixes
   - If few issues: Recommend manual fixes

3. **Offer Actions** (if issues found):
   - Use AskUserQuestion:
     - "Review detailed report now?"
     - "Enter plan mode to fix critical issues?"
     - "Run /plan-feature to create fix plan?"
     - "Done for now"

## Error Handling

### Dev Server Not Starting
- Wait up to 60 seconds with retries
- If fails: Clear error message with manual start instructions
- Continue with code-only audit if --skip-ui used

### UI Audit Auth Required
- If ui-audit-specialist returns AUTH REQUIRED:
  - Display message asking user to log in
  - Use AskUserQuestion: "Log in and continue?" / "Skip UI audit"
  - If continue: Re-run UI audit
  - If skip: Continue with code-only results

### File Discovery Failure
- If no page.tsx found:
  - Check if dynamic route (e.g., `[slug]`)
  - Suggest correct path
  - Abort with clear message

### Subagent Timeout
- Set 5-minute timeout per subagent
- If timeout: Log partial results, continue with other tracks

## Quality Gates

| Phase | Gate | Blocking |
|-------|------|----------|
| 1 | Page exists in filesystem | Yes |
| 1 | Dev server accessible (if UI audit) | Yes (for UI track) |
| 2 | At least page.tsx discovered | Yes |
| 3 | Page loads without crash | No (warn) |
| 3 | TypeScript compiles | No (warn) |
| 4 | Report files generated | Yes |

## Logging Requirements

All logs use markdown format with:
- Clear headers and sections
- Tables for structured data
- Code blocks for validation output
- Timestamps in ISO format
- Links between log files

## Notes

- This command runs UI and code audits in PARALLEL for speed
- UI audit requires dev server; code audit does not
- Use `--skip-ui` for CI/CD pipelines without browser
- Use `--skip-code` for quick visual testing
- Report is designed for follow-up with plan mode or /plan-feature
- Screenshots are saved for visual reference
- All findings are actionable with clear recommendations
