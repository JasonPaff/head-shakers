---
allowed-tools: Task(subagent_type:ui-test-agent), Task(subagent_type:neon-db-expert), Task(subagent_type:general-purpose), Read(*), Write(*), Glob(*), Grep(*), Bash(mkdir:*,npm:*), TodoWrite(*), AskUserQuestion(*)
argument-hint: '<implementation-plan-path|feature-name> [--routes=/path1,/path2] [--skip-db] [--screenshots] [--quick]'
description: Comprehensive user-perspective feature testing using Playwright MCP with structured issue reporting
model: sonnet
---

You are a comprehensive feature testing orchestrator that validates newly implemented features from a user's perspective. Your role is COORDINATION ONLY - you delegate ALL UI testing to specialized subagents that can perform deep, thorough testing with extensive Playwright interactions.

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

## Architecture Overview

**Subagent-Based Testing Pattern**: You are a lightweight coordinator that delegates ALL testing work to specialized subagents. This ensures deep, thorough testing because each subagent can make many tool calls to explore functionality comprehensively.

| Phase | Component | Purpose |
|-------|-----------|---------|
| 1 | Orchestrator | Parse plan, extract routes, prepare test matrix |
| 2 | UI Subagents | Deep testing of each route/feature area |
| 3 | Database Agent | Verify data persistence and integrity |
| 4 | Orchestrator | Aggregate results into structured report |

**CRITICAL**: You must NEVER use Playwright tools directly. ALL UI testing is delegated to `ui-ux-agent` subagents so they can perform extensive, thorough testing without context limitations.

## Workflow Execution

### Phase 1: Test Planning (Orchestrator - YOU)

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

4. **Identify Routes and Features to Test**:
   - If `--routes` flag: Use explicitly provided routes
   - Otherwise, extract from implementation:
     - Parse `src/app/**/page.tsx` files mentioned
     - Map file paths to routes (e.g., `src/app/(app)/bobbleheads/[id]/page.tsx` → `/bobbleheads/[id]`)
     - Identify feature areas (forms, filters, search, navigation, etc.)
     - Include related routes (parent pages, linked pages)

5. **Build Test Delegation Plan**:
   - Group related routes and features into logical test units
   - Each test unit becomes a subagent task
   - Example breakdown:
     ```
     Test Unit 1: Add Bobblehead Form
       - Route: /bobbleheads/add
       - Focus: Form submission, validation, field interactions
       - Scenarios: FORM, VALIDATION, SUBMIT, EDGE_CASES

     Test Unit 2: Search and Filters
       - Route: /browse/search
       - Focus: Filter controls, search input, results display
       - Scenarios: FILTER_INTERACTIONS, SEARCH, RESULTS, COMBINATIONS

     Test Unit 3: Collection Navigation
       - Routes: /collections, /collections/[id]
       - Focus: Navigation, data display, CRUD operations
       - Scenarios: NAVIGATION, DATA_DISPLAY, INTERACTIONS
     ```

6. **Create Test Directory**:
   ```bash
   mkdir -p docs/{YYYY_MM_DD}/testing/{feature-name}/
   ```

7. **Initialize Todo List**:
   - Create todos for each test unit (subagent)
   - Add database verification todo (if not `--skip-db`)
   - Add report generation todo

8. **Save Test Plan**:
   - Create `docs/{YYYY_MM_DD}/testing/{feature-name}/00-test-plan.md`:
     - Feature context
     - Routes to test
     - Test units and their focus areas
     - Scenarios to execute per unit

### Phase 2: UI Testing (DELEGATE TO SUBAGENTS)

**Objective**: Launch specialized UI testing subagents for deep, comprehensive testing of each test unit.

**CRITICAL INSTRUCTIONS FOR SUBAGENT LAUNCHING**:

Each UI subagent MUST be given:
1. **Specific focus area** - What exactly to test (e.g., "filters functionality")
2. **Comprehensive scenario list** - All scenarios to cover
3. **Instructions to be exhaustive** - Test ALL combinations, edge cases, states
4. **Evidence requirements** - What to capture and document

**For EACH test unit, launch a dedicated `ui-test-agent` subagent:**

```
Use Task tool with subagent_type: "ui-test-agent"
Model: sonnet
Timeout: 600 seconds (10 minutes - allow deep testing)

Prompt:
"You are performing DEEP, COMPREHENSIVE UI testing for the {feature-name} feature.

## Your Mission

Test the **{test-unit-name}** functionality EXHAUSTIVELY. Do not stop after testing one thing - test EVERY aspect, EVERY combination, EVERY edge case.

## Route(s) to Test
{routes}

## Focus Area
{specific focus description - e.g., "Filter functionality including all filter types, combinations, and interactions"}

## Feature Context
{description from implementation plan}

## Files Involved
{list of relevant UI files from implementation}

## MANDATORY Test Scenarios - Test ALL of these:

### Scenario Group 1: Basic Functionality (SMOKE)
- [ ] Page loads without console errors
- [ ] All expected UI elements are visible
- [ ] Layout renders correctly
- [ ] No network errors on load

### Scenario Group 2: {Primary Functionality - varies by test unit}
For filters:
- [ ] Test EACH filter type individually
- [ ] Test filter with single selection
- [ ] Test filter with multiple selections (if applicable)
- [ ] Test clearing individual filters
- [ ] Test clearing all filters
- [ ] Verify results update correctly after each filter change
- [ ] Test filter persistence (if applicable)

For forms:
- [ ] Test each field accepts valid input
- [ ] Test required field validation (submit without filling)
- [ ] Test each field's specific validation rules
- [ ] Test field interactions (dependent fields)
- [ ] Test form submission with valid data
- [ ] Test form submission feedback (loading, success, error states)

For data displays:
- [ ] Verify data displays correctly
- [ ] Test pagination (all pages, navigation)
- [ ] Test sorting (all sort options, both directions)
- [ ] Test empty states
- [ ] Test loading states

### Scenario Group 3: Combinations & Edge Cases
- [ ] Test filter/feature combinations
- [ ] Test with boundary values
- [ ] Test with special characters
- [ ] Test rapid interactions (quick clicks, typing)
- [ ] Test after browser back/forward
- [ ] Test with empty/minimal data
- [ ] Test with large amounts of data (if applicable)

### Scenario Group 4: Error Handling
- [ ] Test error states display correctly
- [ ] Test recovery from errors
- [ ] Test invalid URL parameters (for dynamic routes)
- [ ] Check console for errors after each interaction

### Scenario Group 5: User Experience
- [ ] Test loading indicators appear during async operations
- [ ] Test feedback messages (toasts, alerts)
- [ ] Test focus management
- [ ] Test keyboard accessibility (Tab, Enter, Escape)

## Testing Protocol

1. **Be Exhaustive**: Test EVERY scenario listed above. Do not skip any.
2. **Multiple Tool Calls**: Use many Playwright tool calls to thoroughly test each scenario
3. **Document Everything**: Record results for every test, not just failures
4. **Capture Evidence**: Take screenshots of failures and important states
5. **Check Console**: After EVERY interaction, check for console errors
6. **Check Network**: Monitor for failed network requests

## Screenshots Required
{if --screenshots: "Take screenshots after EVERY significant interaction"}
{if not --screenshots: "Take screenshots for: failures, error states, unexpected behavior, empty states"}

## Output Format (REQUIRED)

Return your results in this EXACT format:

### TEST UNIT: {test-unit-name}

**Routes Tested**: {routes}
**Total Scenarios Tested**: {count}
**Pass Rate**: {passed}/{total} ({percentage}%)

#### PASSED SCENARIOS
1. [PASS] {scenario name} - {brief verification note}
2. [PASS] {scenario name} - {brief verification note}
...

#### FAILED SCENARIOS

**ISSUE-{N}: {Title}**
- **Severity**: CRITICAL | HIGH | MEDIUM | LOW
- **Route**: {route}
- **Scenario**: {scenario_name}
- **Problem**: {detailed description}
- **Expected**: {what should happen}
- **Actual**: {what actually happened}
- **Steps to Reproduce**:
  1. {step}
  2. {step}
- **Console Errors**: {any errors captured}
- **Network Issues**: {any failed requests}
- **Screenshot**: {filename if captured}
- **Recommended Fix**: {suggestion based on behavior}

#### SKIPPED SCENARIOS (and why)
- {scenario} - {reason}

#### CONSOLE ERRORS OBSERVED
- {list all console errors seen during testing}

#### SCREENSHOTS CAPTURED
- {filename} - {description}

#### ADDITIONAL OBSERVATIONS
- {any UX issues, performance concerns, or recommendations}
"
```

**Launch Strategy:**

1. **Parallel When Possible**: If test units are independent, launch multiple subagents in parallel
2. **Sequential When Dependent**: If testing creates data needed by another test, run sequentially

**After Each Subagent Completes:**
- Capture the full output
- Update todo list
- Save intermediate results to `docs/{YYYY_MM_DD}/testing/{feature-name}/0{N}-{test-unit-slug}.md`

### Phase 3: Database Verification (DELEGATE)

**Skip if**: `--skip-db` flag present

**Launch subagent: `neon-db-expert`**

```
Use Task tool with subagent_type: "neon-db-expert"
Model: haiku (fast)
Timeout: 120 seconds

Prompt:
"Verify database operations for the {feature-name} feature.

## Context

Implementation Files:
{list of action/query files from implementation}

## Tests Performed by UI Agents
{summary of what UI testing covered - forms submitted, data created, etc.}

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

### Phase 4: Report Generation (Orchestrator - YOU)

**Objective**: Aggregate ALL subagent results into structured report compatible with `/fix-validation`.

**Process**:

1. **Aggregate All Results**:
   - Collect results from ALL UI subagents
   - Collect database verification results
   - Calculate pass/fail statistics
   - Merge and deduplicate issues

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
   **Testing Architecture**: Subagent-based deep testing

   ## Executive Summary

   - **Test Score**: {score}/100 ({grade: A/B/C/D/F})
   - **Status**: {PASS | NEEDS FIXES | CRITICAL ISSUES}
   - **Test Units Executed**: {count}
   - **Total Scenarios Tested**: {count across all subagents}
   - **Pass Rate**: {pass_count}/{total_count} ({percentage}%)

   ## Test Coverage Summary

   | Test Unit | Route(s) | Scenarios | Passed | Failed | Status |
   |-----------|----------|-----------|--------|--------|--------|
   | {name} | {routes} | {count} | {pass} | {fail} | {status} |
   ...

   ## Issue Summary

   | Severity | Count | Score Impact |
   |----------|-------|--------------|
   | Critical | {count} | -{impact} |
   | High | {count} | -{impact} |
   | Medium | {count} | -{impact} |
   | Low | {count} | -{impact} |
   | **Total** | {total} | **-{total_impact}** |

   ## Critical Issues

   {For each critical issue from ALL subagents}
   ### CRIT-{N}: {Title}

   - **Route**: {route}
   - **Test Unit**: {which subagent found this}
   - **Scenario**: {scenario_name}
   - **File**: {likely_source_file}:{line_if_known}
   - **Problem**: {detailed description}
   - **Expected**: {what should happen}
   - **Actual**: {what actually happened}
   - **Steps to Reproduce**:
     1. {step}
     2. {step}
   - **Evidence**:
     - Screenshot: {path_if_captured}
     - Console: {error_messages}
     - Network: {failed_requests}
   - **Recommended Fix**: {suggested fix based on implementation}

   ## High Priority Issues

   {Same format as critical}

   ## Medium Priority Issues

   {Same format}

   ## Low Priority Issues

   {Same format}

   ## Test Unit Details

   ### {Test Unit 1 Name}

   **Focus**: {what was tested}
   **Routes**: {routes}
   **Scenarios Executed**: {count}
   **Pass Rate**: {percentage}%

   {Summary of findings}

   ### {Test Unit 2 Name}

   {Repeat for each test unit}

   ## Database Verification

   {If --skip-db}
   **SKIPPED**: Database verification was skipped

   {Otherwise}
   - **Data Integrity**: {PASS|FAIL}
   - **Authorization**: {PASS|FAIL}
   - **Performance**: {PASS|FAIL}

   {Details of any issues}

   ## Console Errors Summary

   **Total Unique Errors**: {count}
   {List of unique console errors across all test units}

   ## Screenshots Captured

   {List of screenshots with descriptions from all subagents}

   ## Recommendations

   ### Immediate Fixes Required
   1. {Critical fix 1}
   2. {Critical fix 2}

   ### Should Fix Before Merge
   1. {High priority fix 1}
   2. {High priority fix 2}

   ### Consider Fixing
   1. {Medium priority fix 1}

   ## Testing Metrics

   - **Start Time**: {timestamp}
   - **End Time**: {timestamp}
   - **Duration**: {duration}
   - **Subagents Launched**: {count}
   - **Total Playwright Interactions**: {estimated count from subagent reports}
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

5. **Final Output**:
   ```
   ## Feature Testing Complete

   **Feature**: {feature-name}
   **Score**: {score}/100 ({grade})
   **Status**: {PASS | NEEDS FIXES | CRITICAL ISSUES}

   **Testing Summary**:
   | Metric | Value |
   |--------|-------|
   | Test Units Executed | {count} |
   | Total Scenarios | {count} |
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

## Subagent Specialization Guidelines

When defining test units, consider these specialization patterns:

### Form Testing Subagent
Focus areas: Input validation, form submission, field interactions, error messages
Scenarios: All field types, validation rules, submit flows, error recovery

### Filter/Search Testing Subagent
Focus areas: Filter controls, search functionality, result updates, filter combinations
Scenarios: Each filter individually, combinations, clear/reset, URL state, edge cases

### Navigation Testing Subagent
Focus areas: Links, routing, breadcrumbs, back/forward behavior
Scenarios: All navigation paths, deep links, invalid routes, history behavior

### Data Display Testing Subagent
Focus areas: Tables, lists, cards, pagination, sorting
Scenarios: Data accuracy, pagination edges, sort options, empty states, loading

### CRUD Operations Testing Subagent
Focus areas: Create/Read/Update/Delete operations
Scenarios: Full lifecycle, permissions, optimistic updates, error handling

### Dialog/Modal Testing Subagent
Focus areas: Dialog opening/closing, form interactions within dialogs
Scenarios: All trigger mechanisms, close behaviors, submission, nested dialogs

## Error Handling

- **Dev server not running**: Output clear error, suggest `npm run dev`
- **Subagent timeout**: Log timeout, mark test unit as incomplete, continue
- **Subagent failure**: Log error, capture any partial results, continue
- **Auth required**: Note in report, test public pages or suggest auth setup
- **Page timeout**: Record as CRITICAL issue, continue to next test unit

## Important Notes

- **NEVER use Playwright tools directly** - ALL UI testing goes to `ui-test-agent` subagents
- **Be generous with subagent prompts** - Detailed instructions = thorough testing
- **Allow long timeouts** - Deep testing takes time, use 600s for UI subagents
- **Parallelize when possible** - Independent test units can run simultaneously
- **Capture ALL output** - Subagent responses feed into the final report
- **Don't fix, only identify** - This command documents issues for `/fix-validation`
- **Evidence is crucial** - Ensure subagents capture screenshots and console logs

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
