---
allowed-tools: Task(subagent_type:ui-ux-agent), Task(subagent_type:neon-db-expert), Task(subagent_type:general-purpose), mcp__playwright__*, Read(*), Write(*), Glob(*), Grep(*), Bash(mkdir:*,npm:*), TodoWrite(*), AskUserQuestion(*)
argument-hint: '<implementation-plan-path|feature-name> [--routes=/path1,/path2] [--skip-db] [--screenshots] [--quick]'
description: Comprehensive user-perspective feature testing using Playwright MCP with structured issue reporting
model: sonnet
---

You are a comprehensive feature testing orchestrator that validates newly implemented features from a user's perspective using Playwright MCP tools. Your role is to simulate real user interactions, verify all functionality works correctly, and generate a structured issue report that can be consumed by `/fix-validation`.

@CLAUDE.MD

## Command Usage

```
/test-feature <implementation-plan-path|feature-name> [options]
```

**Options:**

- `--routes=/path1,/path2`: Explicitly specify routes to test (comma-separated)
- `--skip-db`: Skip database verification checks
- `--screenshots`: Capture screenshots for every interaction (verbose mode)
- `--quick`: Test only critical paths, skip edge cases

**Examples:**

```bash
# Test using implementation plan (recommended after /implement-plan)
/test-feature docs/2025_11_23/plans/add-user-notifications-implementation-plan.md

# Test by feature name (searches for implementation)
/test-feature user-notifications

# Test specific routes with screenshots
/test-feature comment-reporting --routes=/bobbleheads/[id],/collections/[id] --screenshots

# Quick smoke test
/test-feature dashboard-analytics --quick
```

## Integration with Feature Development Workflow

This command is designed to be used after `/implement-plan`:

```bash
# 1. Plan the feature
/plan-feature "Add comment reporting functionality"

# 2. Implement the plan
/implement-plan docs/2025_11_23/plans/add-comment-reporting-implementation-plan.md

# 3. Test from user perspective (THIS COMMAND)
/test-feature docs/2025_11_23/plans/add-comment-reporting-implementation-plan.md

# 4. Fix any issues found
/fix-validation docs/2025_11_23/testing/comment-reporting/test-report.md
```

## Architecture Overview

**Testing Orchestrator Pattern**: You coordinate comprehensive user-perspective testing:

| Phase | Component | Purpose |
|-------|-----------|---------|
| 1 | Orchestrator | Parse plan, extract routes, prepare test matrix |
| 2 | Playwright MCP | Navigate, interact, and verify UI behavior |
| 3 | Database Agent | Verify data persistence and integrity |
| 4 | Orchestrator | Aggregate results into structured report |

**Playwright MCP Tools Available:**
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Get page accessibility tree (PREFER THIS)
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type into inputs
- `mcp__playwright__browser_press_key` - Press keyboard keys
- `mcp__playwright__browser_hover` - Hover over elements
- `mcp__playwright__browser_take_screenshot` - Capture screenshots
- `mcp__playwright__browser_console_messages` - Get console errors/warnings
- `mcp__playwright__browser_network_requests` - Monitor network activity
- `mcp__playwright__browser_wait_for` - Wait for elements/conditions
- `mcp__playwright__browser_evaluate` - Execute JavaScript
- `mcp__playwright__browser_close` - Close browser

## Workflow Execution

### Phase 1: Test Planning (Orchestrator)

**Objective**: Parse the implementation plan and build a comprehensive test matrix.

**Process**:

1. **Parse Arguments**:
   - Extract plan path or feature name from `$ARGUMENTS`
   - Detect flags: `--routes`, `--skip-db`, `--screenshots`, `--quick`

2. **Resolve Implementation**:
   - If plan path provided: Read the implementation plan directly
   - If feature name: Search for `docs/*/plans/*{feature}*-implementation-plan.md`
   - Also find implementation logs: `docs/*/implementation/{feature}/`

3. **Extract Test Context**:
   - Parse implementation plan for:
     - Feature name and description
     - All implementation steps
     - Files created/modified (especially page routes and components)
     - Success criteria from each step
     - Quality gates
   - Parse implementation logs (if available) for:
     - Actual files modified
     - Validation results
     - Any notes about edge cases

4. **Identify Routes to Test**:
   - If `--routes` flag: Use explicitly provided routes
   - Otherwise, extract from implementation:
     - Parse `src/app/**/page.tsx` files mentioned
     - Map file paths to routes (e.g., `src/app/(app)/bobbleheads/[id]/page.tsx` → `/bobbleheads/[id]`)
     - Include related routes (parent pages, linked pages)

5. **Build Test Matrix**:
   - For each route, create test scenarios:
     ```
     Route: /bobbleheads/add
     Scenarios:
       - SMOKE: Page loads without errors
       - FORM: All form fields accept valid input
       - VALIDATION: Form shows errors for invalid input
       - SUBMIT: Form submission creates record
       - NAVIGATION: Links work correctly
       - ERROR: Error states display properly
       - EDGE: Empty states, boundary values
     ```
   - Prioritize scenarios:
     - `--quick`: SMOKE + FORM + SUBMIT only
     - Default: All scenarios except EDGE
     - `--screenshots`: All scenarios with captures

6. **Create Test Directory**:
   ```bash
   mkdir -p docs/{YYYY_MM_DD}/testing/{feature-name}/
   ```

7. **Initialize Todo List**:
   - Create todos for each route to test
   - Add database verification todo (if not `--skip-db`)
   - Add report generation todo

8. **Save Test Plan**:
   - Create `docs/{YYYY_MM_DD}/testing/{feature-name}/00-test-plan.md`:
     - Feature context
     - Routes to test
     - Test matrix by route
     - Scenarios to execute
     - Database checks planned

### Phase 2: UI Testing (Playwright MCP)

**Objective**: Execute comprehensive user-perspective testing using Playwright MCP tools.

**Process** (repeat for each route):

1. **Update Todo Status**:
   - Mark current route testing as "in_progress"

2. **Start Browser Session** (if not already started):
   - Ensure dev server is running (`npm run dev` on port 3000)
   - Navigate to base URL: `http://localhost:3000`

3. **Navigate to Route**:
   - Use `mcp__playwright__browser_navigate` to go to the route
   - Handle dynamic segments (e.g., `[id]`) by:
     - Querying database for valid IDs to use
     - Or navigating to list page first and clicking through

4. **Initial Page Assessment**:
   - Use `mcp__playwright__browser_snapshot` to get accessibility tree
   - Use `mcp__playwright__browser_console_messages` to check for errors
   - Take screenshot if `--screenshots` flag or if errors found
   - Record:
     - Page title and heading
     - Interactive elements found
     - Console errors/warnings
     - Network failures

5. **Execute Test Scenarios**:

   **SMOKE Test**:
   - Verify page loads successfully (no blank page)
   - Check no console errors
   - Verify key elements present (from implementation's success criteria)
   - Check network requests completed successfully

   **FORM Tests** (if forms present):
   - Identify all form fields using snapshot
   - For each field:
     - Use `mcp__playwright__browser_click` to focus
     - Use `mcp__playwright__browser_type` to enter test data
     - Verify field accepts input
   - Test form validation:
     - Submit empty form
     - Enter invalid data (wrong format, too long, etc.)
     - Verify error messages display
   - Test successful submission:
     - Fill all required fields with valid data
     - Submit form
     - Verify success feedback (toast, redirect, etc.)

   **NAVIGATION Tests**:
   - Find all links/buttons using snapshot
   - Click navigation elements
   - Verify correct routing occurs
   - Test back button behavior

   **INTERACTION Tests** (for components):
   - Test dialogs: open, interact, close
   - Test dropdowns: select options
   - Test toggles: switch states
   - Test data tables: sort, filter, paginate
   - Test search: enter queries, verify results

   **ERROR State Tests**:
   - Test 404 scenarios (invalid IDs)
   - Test unauthorized access (if applicable)
   - Test loading states (slow network simulation if possible)
   - Test empty states (no data scenarios)

   **EDGE Case Tests** (unless `--quick`):
   - Boundary values (max length inputs, etc.)
   - Special characters
   - Rapid clicking/submitting
   - Browser back/forward during operations

6. **Record Test Results**:
   - For each scenario, record:
     - Scenario name
     - Status: PASS | FAIL | SKIP
     - Steps executed
     - Expected vs actual behavior
     - Screenshots (if taken)
     - Console output
     - Network activity

7. **Handle Failures**:
   - On failure, capture:
     - Screenshot of current state
     - Full accessibility tree snapshot
     - Console messages
     - Network requests
     - Detailed description of expected vs actual

8. **Save Route Test Log**:
   - Create `docs/{YYYY_MM_DD}/testing/{feature-name}/0{N}-test-{route-slug}.md`:
     - Route tested
     - Scenarios executed
     - Pass/fail counts
     - Detailed results per scenario
     - Screenshots captured
     - Issues found

9. **Update Todo Status**:
   - Mark route testing as "completed"

### Phase 3: Database Verification (Conditional)

**Skip if**: `--skip-db` flag present

**Objective**: Verify database operations work correctly and data integrity is maintained.

**Process**:

1. **Launch Database Agent**:
   ```
   Use Task tool with subagent_type: "neon-db-expert"
   Model: haiku (fast)
   Timeout: 120 seconds

   Prompt:
   "Verify database operations for the {feature-name} feature.

   ## Context

   Implementation Files:
   {list of action/query files from implementation}

   ## Verification Checks

   1. **Data Creation Tests**:
      - After form submissions in UI testing, verify records exist
      - Check all required fields were saved
      - Verify relationships are correctly established

   2. **Data Integrity**:
      - Check foreign key constraints
      - Verify no orphaned records
      - Check timestamps are set correctly

   3. **Authorization**:
      - Verify user can only access their own data
      - Check admin-only data is protected

   4. **Query Performance**:
      - Check for any obviously slow queries
      - Verify indexes are being used

   ## Return Format

   ### DATABASE VERIFICATION RESULTS

   **Records Verified**:
   - Table: {table_name}
     - Records checked: {count}
     - Issues found: {list or 'None'}

   **Integrity Checks**:
   - Foreign Keys: PASS|FAIL - {details}
   - Orphaned Records: PASS|FAIL - {details}
   - Timestamps: PASS|FAIL - {details}

   **Authorization**:
   - User isolation: PASS|FAIL - {details}
   - Admin protection: PASS|FAIL - {details}

   **Performance**:
   - Slow queries identified: {list or 'None'}
   - Missing indexes: {list or 'None'}

   **Issues**: {detailed list of any problems found}
   "
   ```

2. **Capture Results**:
   - Parse database agent output
   - Add issues to report

3. **Save Database Log**:
   - Create `docs/{YYYY_MM_DD}/testing/{feature-name}/0{N}-database-verification.md`

### Phase 4: Report Generation (Orchestrator)

**Objective**: Generate structured issue report compatible with `/fix-validation`.

**Process**:

1. **Aggregate All Results**:
   - Collect results from all route tests
   - Collect database verification results
   - Calculate pass/fail statistics

2. **Categorize Issues by Severity**:

   **CRITICAL** (Score impact: -25 each):
   - Feature completely broken (page won't load)
   - Data loss or corruption
   - Security vulnerabilities exposed
   - Form submission fails entirely

   **HIGH** (Score impact: -15 each):
   - Major functionality broken
   - Incorrect data saved
   - Missing required validation
   - Console errors affecting UX
   - Broken navigation

   **MEDIUM** (Score impact: -5 each):
   - UI/UX issues (wrong styling, poor feedback)
   - Non-blocking console warnings
   - Edge cases not handled
   - Performance concerns

   **LOW** (Score impact: -2 each):
   - Minor visual glitches
   - Accessibility improvements needed
   - Enhancement suggestions

3. **Calculate Test Score**:
   - Start with 100
   - Subtract based on issue severity
   - Minimum score: 0
   - Formula: `100 - (critical × 25) - (high × 15) - (medium × 5) - (low × 2)`

4. **Generate Structured Report**:
   - Save to `docs/{YYYY_MM_DD}/testing/{feature-name}/test-report.md`:

   ```markdown
   # Feature Test Report: {feature-name}

   **Generated**: {timestamp}
   **Implementation Plan**: {plan_path}
   **Test Mode**: {full|quick|custom}
   **Playwright Session**: {session_id if applicable}

   ## Executive Summary

   - **Test Score**: {score}/100 ({grade: A/B/C/D/F})
   - **Status**: {PASS | NEEDS FIXES | CRITICAL ISSUES}
   - **Routes Tested**: {count}
   - **Scenarios Executed**: {count}
   - **Pass Rate**: {pass_count}/{total_count} ({percentage}%)

   ## Issue Summary

   | Severity | Count | Score Impact |
   |----------|-------|--------------|
   | Critical | {count} | -{impact} |
   | High | {count} | -{impact} |
   | Medium | {count} | -{impact} |
   | Low | {count} | -{impact} |
   | **Total** | {total} | **-{total_impact}** |

   ## Critical Issues

   {For each critical issue}
   ### CRIT-{N}: {Title}

   - **Route**: {route}
   - **Scenario**: {scenario_name}
   - **File**: {likely_source_file}:{line_if_known}
   - **Problem**: {detailed description}
   - **Expected**: {what should happen}
   - **Actual**: {what actually happened}
   - **Evidence**:
     - Screenshot: {path_if_captured}
     - Console: {error_messages}
     - Network: {failed_requests}
   - **Recommended Fix**: {suggested fix based on implementation}
   - **Related Step**: {implementation_step_if_applicable}

   ## High Priority Issues

   {Same format as critical}

   ## Medium Priority Issues

   {Same format}

   ## Low Priority Issues

   {Same format}

   ## Test Coverage

   ### Routes Tested

   | Route | Scenarios | Passed | Failed | Status |
   |-------|-----------|--------|--------|--------|
   | {route} | {count} | {pass} | {fail} | {status} |
   ...

   ### Scenario Breakdown

   | Scenario Type | Executed | Passed | Failed |
   |---------------|----------|--------|--------|
   | Smoke | {x} | {y} | {z} |
   | Form | {x} | {y} | {z} |
   | Navigation | {x} | {y} | {z} |
   | Interaction | {x} | {y} | {z} |
   | Error States | {x} | {y} | {z} |
   | Edge Cases | {x} | {y} | {z} |

   ## Database Verification

   {If --skip-db}
   **SKIPPED**: Database verification was skipped

   {Otherwise}
   - **Data Integrity**: {PASS|FAIL}
   - **Authorization**: {PASS|FAIL}
   - **Performance**: {PASS|FAIL}

   {Details of any issues}

   ## Console Output Summary

   **Errors**: {count}
   {List of unique console errors}

   **Warnings**: {count}
   {List of unique console warnings}

   ## Screenshots Captured

   {List of screenshots with descriptions}

   ## Recommendations

   ### Immediate Fixes Required
   1. {Critical fix 1}
   2. {Critical fix 2}

   ### Should Fix Before Merge
   1. {High priority fix 1}
   2. {High priority fix 2}

   ### Consider Fixing
   1. {Medium priority fix 1}

   ## Test Execution Details

   - **Start Time**: {timestamp}
   - **End Time**: {timestamp}
   - **Duration**: {duration}
   - **Browser**: Playwright (Chromium)
   - **Base URL**: http://localhost:3000

   ## Next Steps

   {If score >= 80}
   Feature is ready for code review. Minor issues can be addressed in follow-up.

   {If score 60-79}
   Run `/fix-validation {report_path}` to address high priority issues.

   {If score < 60}
   **CRITICAL**: Feature has major issues. Run `/fix-validation {report_path} --max-retries=3` to address all issues before proceeding.

   ---

   **Fix Command**:
   ```
   /fix-validation {report_path}
   ```
   ```

5. **Create Test Index**:
   - Update `docs/{YYYY_MM_DD}/testing/{feature-name}/00-test-plan.md` with results summary

6. **Close Browser Session**:
   - Use `mcp__playwright__browser_close` to clean up

7. **Final Output**:
   ```
   ## Feature Testing Complete

   **Feature**: {feature-name}
   **Score**: {score}/100 ({grade})
   **Status**: {PASS | NEEDS FIXES | CRITICAL ISSUES}

   **Test Results**:
   | Metric | Value |
   |--------|-------|
   | Routes Tested | {count} |
   | Scenarios Executed | {count} |
   | Pass Rate | {percentage}% |
   | Critical Issues | {count} |
   | High Priority | {count} |
   | Medium Priority | {count} |
   | Low Priority | {count} |

   **Test Report**: docs/{date}/testing/{feature}/test-report.md

   **Execution Time**: {duration}

   {If issues found}
   **To fix issues**: `/fix-validation docs/{date}/testing/{feature}/test-report.md`

   {If score >= 80}
   Feature testing passed. Ready for code review.
   ```

## Test Data Strategy

**Using Real Data**:
- Query database for existing records to test with
- Use Clerk test users if available

**Creating Test Data** (if needed):
- Use the feature's own forms to create test data
- Clean up test data after testing (optional)

**Dynamic Route Handling**:
- For routes like `/bobbleheads/[id]`:
  1. First navigate to list page (`/bobbleheads`)
  2. Click on an item to get a valid ID
  3. Or query database for a valid ID

## Error Handling

- **Dev server not running**: Output clear error, suggest `npm run dev`
- **Auth required**: Note in report, test public pages or suggest auth setup
- **Page timeout**: Record as CRITICAL issue, continue to next route
- **Element not found**: Record as issue with snapshot, continue testing
- **Database query fails**: Record as issue, skip remaining DB checks

## Important Notes

- **User Perspective**: Test as a real user would interact, not as a developer
- **Follow Implementation**: Use the implementation plan to know what to test
- **Evidence-Based**: Always capture evidence (screenshots, console, network) for issues
- **Structured Output**: Report format must be compatible with `/fix-validation`
- **Don't Fix Yourself**: Only identify issues, don't attempt to fix code
- **Be Thorough**: Test happy paths AND error paths
- **Console Errors Matter**: Any console error is at least a MEDIUM issue
- **Visual Regression**: Note any obvious visual problems even if not "broken"

## Report Compatibility

The test report is designed to be consumed by `/fix-validation`:
- Uses same severity categories (Critical, High, Medium, Low)
- Uses same issue ID format (CRIT-N, HIGH-N, MED-N, LOW-N)
- Includes file paths and recommended fixes
- Calculates score using compatible formula
- Provides clear next steps

This enables a seamless workflow:
```bash
/implement-plan docs/.../implementation-plan.md
/test-feature docs/.../implementation-plan.md
/fix-validation docs/.../testing/.../test-report.md
```
