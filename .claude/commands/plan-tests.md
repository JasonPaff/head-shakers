---
allowed-tools: Task(subagent_type:*), Bash(mkdir:*), Bash(echo:*), Write(*), Read(*), Glob(*), Grep(*)
argument-hint: 'feature-area [--scope=unit|component|integration|e2e|all]'
description: Generate comprehensive test implementation plans through automated 4-step orchestration
---

You are a test planning orchestrator that creates comprehensive test implementation plans through a structured 4-step process.

@CLAUDE.MD
@package.json

## Command Usage

```
/plan-tests "feature area description" [--scope=all]
```

**Examples:**

- `/plan-tests "bobblehead navigation"` - Plan all tests for navigation feature
- `/plan-tests "validation schemas" --scope=unit` - Plan only unit tests
- `/plan-tests "admin reports" --scope=e2e` - Plan only E2E tests
- `/plan-tests "user authentication" --scope=integration` - Plan integration tests

**Scope Options:**

| Scope           | Tests Planned                     |
| --------------- | --------------------------------- |
| `all` (default) | Unit, Component, Integration, E2E |
| `unit`          | Unit tests only                   |
| `component`     | Component tests only              |
| `integration`   | Integration tests only            |
| `e2e`           | E2E tests only                    |

## Workflow Overview

When the user runs this command, execute this 4-step workflow:

1. **Test Scope Refinement**: Understand and expand the feature area into testable requirements
2. **Source & Test Discovery**: Find all source files AND existing tests for the feature
3. **Coverage Gap Analysis**: Identify what tests are missing
4. **Test Plan Generation**: Create detailed test implementation plan

## Step-by-Step Execution

### Step 1: Test Scope Refinement

**Objective**: Transform the feature area description into specific testable requirements.

**Process**:

1. **Initialize Orchestration Directory**: Create `docs/{YYYY_MM_DD}/test-planning/{feature-name}/` directory structure
2. **Create Orchestration Index**: Save `docs/{YYYY_MM_DD}/test-planning/{feature-name}/00-test-planning-index.md` with workflow overview
3. Record step start time with ISO timestamp
4. Read CLAUDE.md and package.json for project context
5. Use Task tool with `subagent_type: "general-purpose"`:
   - Description: "Refine test scope with project context"
   - **IMPORTANT**: Request single paragraph output (200-400 words) without headers
   - **ERROR HANDLING**: If subagent fails, retry once with simplified prompt
   - **TIMEOUT**: Set 30-second timeout
   - Prompt template: "Analyze this feature area for testing: '$ARGUMENTS'. Using the project context from CLAUDE.md, identify what specific functionality needs to be tested. Consider: What source files are likely involved? What user interactions exist? What data operations occur? What error scenarios should be covered? Output a SINGLE PARAGRAPH (200-400 words) describing the testable scope."
   - **CONSTRAINT**: Output must be single paragraph format only
   - **CONSTRAINT**: Focus on WHAT needs testing, not HOW
   - Agent returns refined test scope as single paragraph
6. Record step end time and validate output
7. **SAVE STEP 1 LOG**: Create `docs/{YYYY_MM_DD}/test-planning/{feature-name}/01-test-scope-refinement.md` with:
   - Step metadata (timestamps, duration, status)
   - Original request and scope filter
   - Complete agent prompt sent
   - Full agent response received
   - Refined test scope extracted
   - Validation results

### Step 2: Source & Test Discovery

**Objective**: Find all source files related to the feature AND any existing tests that cover them.

**Process**:

1. Record step start time with ISO timestamp
2. Use Task tool with `subagent_type: "file-discovery-agent"`:
   - Description: "Discover source files and existing tests"
   - **CRITICAL**: Must discover BOTH source files AND existing test files
   - Prompt must include: "For the feature area: '[refined scope]', discover:
     1. **Source Files**: All source files in `src/` related to this feature (components, actions, queries, validations, etc.)
     2. **Existing Tests**: All test files in `tests/` that test this functionality (unit, component, integration, E2E)

     Search patterns to use:
     - Source: `src/**/*{feature-keywords}*`
     - Unit tests: `tests/unit/**/*.test.ts`
     - Component tests: `tests/components/**/*.test.tsx`
     - Integration tests: `tests/integration/**/*.test.ts`
     - E2E tests: `tests/e2e/specs/**/*.spec.ts`

     For each file, note whether it's a SOURCE file or TEST file.
     Categorize by priority: Critical (core logic), High (user-facing), Medium (supporting), Low (utilities)."

   - **MINIMUM REQUIREMENT**: Must discover at least 3 source files
   - **ERROR HANDLING**: Retry once if discovery fails
   - **TIMEOUT**: Set 60-second timeout

3. **Validate Discovery Results**:
   - Verify all discovered file paths exist
   - Categorize files as SOURCE or TEST
   - Map tests to their corresponding source files
4. Record step end time and validation results
5. **SAVE STEP 2 LOG**: Create `docs/{YYYY_MM_DD}/test-planning/{feature-name}/02-source-test-discovery.md` with:
   - Step metadata
   - Refined scope used as input
   - Complete agent prompt and response
   - Source files discovered (categorized)
   - Test files discovered (categorized)
   - File validation results
6. **UPDATE INDEX**: Append Step 2 summary to orchestration index

### Step 3: Coverage Gap Analysis

**Objective**: Analyze which source files lack adequate test coverage.

**Process**:

1. Record step start time with ISO timestamp
2. Use Task tool with `subagent_type: "test-gap-analyzer"`:
   - Description: "Analyze test coverage gaps"
   - Pass the discovered source files and test files from Step 2
   - **SCOPE FILTER**: If user specified `--scope`, filter analysis to that test type only
   - Prompt must include: "Analyze test coverage gaps for these files:

     **Source Files**:
     [List from Step 2]

     **Existing Tests**:
     [List from Step 2]

     **Scope Filter**: [all|unit|component|integration|e2e]

     For each source file:
     1. Identify which test types exist (unit, component, integration, E2E)
     2. Identify which test types are MISSING
     3. List specific exports/functionality that lack coverage
     4. Assign priority (Critical/High/Medium/Low)
     5. Estimate number of tests needed

     Return a structured coverage gap analysis."

   - **ERROR HANDLING**: Retry once if analysis fails
   - **TIMEOUT**: Set 45-second timeout

3. **Validate Gap Analysis**:
   - Ensure all source files have been analyzed
   - Verify gap priorities are assigned
   - Confirm test estimates are reasonable
4. Record step end time and validation results
5. **SAVE STEP 3 LOG**: Create `docs/{YYYY_MM_DD}/test-planning/{feature-name}/03-coverage-gap-analysis.md` with:
   - Step metadata
   - Input files analyzed
   - Complete agent prompt and response
   - Coverage matrix
   - Gaps by priority
   - Test count estimates
6. **UPDATE INDEX**: Append Step 3 summary to orchestration index

### Step 4: Test Plan Generation

**Objective**: Generate a detailed, actionable test implementation plan.

**Process**:

1. Record step start time with ISO timestamp
2. Use Task tool with `subagent_type: "general-purpose"`:
   - Description: "Generate test implementation plan"
   - **CRITICAL**: Request MARKDOWN format following the agent's template
   - Pass coverage gap analysis from Step 3
   - Prompt must include: "Create a test implementation plan for these coverage gaps:

     **Coverage Gaps**:
     [Analysis from Step 3]

     **Scope Filter**: [all|unit|component|integration|e2e]

     Generate a MARKDOWN implementation plan with:
     - Overview (total tests, complexity, risk level)
     - Prerequisites (fixtures, mocks, setup needed)
     - Implementation Steps (ordered by: infrastructure -> unit -> component -> integration -> e2e)
       - Each step: What, Why, Test Type, Files to Create, Test Cases, Patterns to Follow, Validation Commands, Success Criteria
     - Quality Gates
     - Test Infrastructure Notes

     IMPORTANT:
     - Load testing-patterns skill first for correct patterns
     - Include validation commands for every step
     - Order steps by logical dependencies
     - Be specific about file paths and test cases
     - Do NOT include actual test code implementations"

   - **ERROR HANDLING**: Retry once if format validation fails
   - **TIMEOUT**: Set 60-second timeout

3. **Validate Plan**:
   - **Format Check**: Verify markdown with required sections
   - **Template Compliance**: Check for Overview, Prerequisites, Steps, Quality Gates
   - **Validation Commands**: Ensure all steps include test/lint commands
   - **Completeness**: Confirm plan addresses all identified gaps
4. Record step end time and validation results
5. **SAVE STEP 4 LOG**: Create `docs/{YYYY_MM_DD}/test-planning/{feature-name}/04-test-plan.md` with:
   - Step metadata
   - Coverage gaps used as input
   - Complete agent prompt and response
   - Validation results
6. **UPDATE INDEX**: Append Step 4 summary and final status to orchestration index
7. **SAVE TEST PLAN**: Create `docs/{YYYY_MM_DD}/plans/{feature-name}-test-plan.md` with the final plan

## Logging and Output

**Initialize Test Planning Structure**: Create directory hierarchy:

```
docs/{YYYY_MM_DD}/test-planning/{feature-name}/
├── 00-test-planning-index.md
├── 01-test-scope-refinement.md
├── 02-source-test-discovery.md
├── 03-coverage-gap-analysis.md
└── 04-test-plan.md

docs/{YYYY_MM_DD}/plans/{feature-name}-test-plan.md (final plan)
```

**Critical Logging Requirements**:

- **Separate Step Files**: Each step saves its own markdown file with full details
- **Human Readable**: Use markdown formatting with headers, lists, and code blocks
- **Complete Data Capture**: Full input prompts and agent responses
- **Step Metadata**: Timestamps, duration, status at the top of each file

**Return Summary**:

```
## Test Plan Generated
Saved to: docs/{date}/plans/{feature-name}-test-plan.md

## Test Planning Logs
Directory: docs/{date}/test-planning/{feature-name}/
- 00-test-planning-index.md - Workflow overview
- 01-test-scope-refinement.md - Testable requirements
- 02-source-test-discovery.md - Found X source files, Y existing tests
- 03-coverage-gap-analysis.md - Identified Z coverage gaps
- 04-test-plan.md - Generated N-step test plan

## Summary
- Source Files: X
- Existing Tests: Y
- Coverage Gaps: Z
- New Tests Planned: N
- Scope: [all|unit|component|integration|e2e]

Execution time: X.X seconds
```

## Quality Gates

- **Step 1 Success**: Test scope refined into clear testable requirements
  - Single paragraph format
  - 200-400 words
  - Focuses on WHAT, not HOW
- **Step 2 Success**: File discovery completed with both source and test files
  - At least 3 source files discovered
  - All existing tests for the feature identified
  - Files validated to exist
- **Step 3 Success**: Coverage gap analysis completed with priorities
  - All source files analyzed
  - Gaps categorized by priority
  - Test estimates provided
- **Step 4 Success**: Test plan generated in correct format
  - Markdown format with all required sections
  - Steps ordered by dependencies
  - Validation commands for each step
  - Addresses all identified gaps

## Integration with /implement-plan

The generated test plan can be executed using:

```
/implement-plan docs/{date}/plans/{feature-name}-test-plan.md
```

This routes each step to the appropriate test specialist agent (unit-test-specialist, component-test-specialist, integration-test-specialist, or e2e-test-specialist) based on the test type.

## Example Output File Structure

**Test Plan**: `docs/{YYYY_MM_DD}/plans/{feature-name}-test-plan.md`

```markdown
# Test Implementation Plan: {Feature Name}

Generated: {timestamp}
Original Request: {original feature area}
Scope Filter: {all|unit|component|integration|e2e}

## Analysis Summary

- Feature area refined into testable requirements
- Discovered X source files, Y existing tests
- Identified Z coverage gaps
- Generated N-step test implementation plan

## Coverage Gap Summary

{Summary from gap analysis}

## Test Implementation Plan

{Detailed plan from test-planner agent}
```
