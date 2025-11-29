---
allowed-tools: Task(subagent_type:general-purpose), Task(subagent_type:server-action-specialist), Task(subagent_type:database-specialist), Task(subagent_type:facade-specialist), Task(subagent_type:client-component-specialist), Task(subagent_type:server-component-specialist), Task(subagent_type:form-specialist), Task(subagent_type:media-specialist), Task(subagent_type:unit-test-specialist), Task(subagent_type:component-test-specialist), Task(subagent_type:integration-test-specialist), Task(subagent_type:e2e-test-specialist), Task(subagent_type:test-infrastructure-specialist), Task(subagent_type:validation-specialist), Task(subagent_type:resend-specialist), Read(*), Write(*), Bash(git:*,mkdir:*,npm:*,cd:*), TodoWrite(*), AskUserQuestion(*)
argument-hint: 'path/to/implementation-plan.md [--step-by-step|--dry-run|--resume-from=N|--worktree]'
description: Execute implementation plan with structured tracking and validation using subagent architecture
---

You are a lightweight implementation orchestrator that coordinates the execution of detailed implementation plans by delegating each step to **specialized subagents**. Your role is coordination, tracking, routing to the correct specialist, and logging - NOT direct implementation.

@CLAUDE.MD
@package.json

## Command Usage

```
/implement-plan <plan-file-path> [options]
```

**Options:**

- `--step-by-step`: Pause for user approval between each step
- `--dry-run`: Show what would be done without making changes
- `--resume-from=N`: Resume implementation from step N (if previous run failed)
- `--worktree`: Create a new git worktree with feature branch for isolated development

**Examples:**

- `/implement-plan docs/2025_11_11/plans/add-user-auth-implementation-plan.md`
- `/implement-plan docs/2025_11_11/plans/notifications-implementation-plan.md --step-by-step`
- `/implement-plan docs/2025_11_11/plans/admin-dashboard-implementation-plan.md --dry-run`
- `/implement-plan docs/2025_11_11/plans/social-features-implementation-plan.md --resume-from=3`
- `/implement-plan docs/2025_11_11/plans/user-profile-implementation-plan.md --worktree`
- `/implement-plan docs/2025_11_11/plans/search-feature-implementation-plan.md --worktree --step-by-step`

## Architecture Overview

**Orchestrator + Specialist Pattern**: This command uses intelligent routing to specialized subagents:

- **Main Orchestrator** (this command): Lightweight coordination, step-type detection, routing, todo management, logging
- **Specialist Subagents**: Domain-specific agents with pre-loaded skills for their area of expertise
- **Benefits**: Automatic skill loading, consistent conventions, no context overflow, scalable to 50+ step plans

## Available Specialist Agents

| Agent                            | Domain            | Skills Auto-Loaded                                                        | File Patterns                                                        |
| -------------------------------- | ----------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `server-action-specialist`       | Server actions    | server-actions, sentry-monitoring, validation-schemas                     | `src/lib/actions/**/*.actions.ts`                                    |
| `database-specialist`            | Schemas & queries | database-schema, drizzle-orm, validation-schemas                          | `src/lib/db/schema/**`, `src/lib/queries/**`                         |
| `facade-specialist`              | Business logic    | facade-layer, caching, sentry-monitoring, drizzle-orm                     | `src/lib/facades/**/*.facade.ts`                                     |
| `server-component-specialist`    | Server components | react-coding-conventions, ui-components, server-components, caching       | `src/app/**/page.tsx`, `layout.tsx`, `*-async.tsx`, `*-skeleton.tsx` |
| `client-component-specialist`    | Client components | react-coding-conventions, ui-components, client-components                | `src/components/**/*.tsx` (with hooks/events), `*-client.tsx`        |
| `form-specialist`                | Forms             | form-system, react-coding-conventions, validation-schemas, server-actions | Form components, `*-form*.tsx`, `*-dialog*.tsx`                      |
| `media-specialist`               | Cloudinary        | cloudinary-media, react-coding-conventions                                | Cloudinary utilities, image components                               |
| `unit-test-specialist`           | Unit tests        | unit-testing, testing-base                                                | `tests/unit/**/*.test.ts`                                            |
| `component-test-specialist`      | Component tests   | component-testing, testing-base                                           | `tests/components/**/*.test.tsx`                                     |
| `integration-test-specialist`    | Integration tests | integration-testing, testing-base                                         | `tests/integration/**/*.test.ts`                                     |
| `e2e-test-specialist`            | E2E tests         | e2e-testing, testing-base                                                 | `tests/e2e/specs/**/*.spec.ts`                                       |
| `test-infrastructure-specialist` | Test infra        | test-infrastructure, testing-base                                         | `tests/**/fixtures/**`, `tests/**/mocks/**`, `tests/e2e/pages/**`    |
| `validation-specialist`          | Zod schemas       | validation-schemas                                                        | `src/lib/validations/**/*.validation.ts`                             |
| `resend-specialist`              | Email sending     | resend-email, sentry-monitoring                                           | `src/lib/services/resend*.ts`, `src/lib/email-templates/**/*.tsx`    |
| `general-purpose`                | Fallback          | None (manual skill invocation)                                            | Any other files                                                      |

## Step-Type Detection Algorithm

**CRITICAL**: Before launching a subagent for each step, the orchestrator MUST analyze the step's files to determine the correct specialist agent.

### Detection Rules (in priority order)

```
1. IF files contain "tests/unit/" AND end with ".test.ts"
   → Use: unit-test-specialist

2. IF files contain "tests/components/" AND end with ".test.tsx"
   → Use: component-test-specialist

3. IF files contain "tests/integration/" AND end with ".test.ts"
   → Use: integration-test-specialist

4. IF files contain "tests/e2e/specs/" AND end with ".spec.ts"
   → Use: e2e-test-specialist

5. IF files contain "tests/**/fixtures/" OR "tests/**/mocks/" OR "tests/e2e/pages/"
   → Use: test-infrastructure-specialist

6. IF files contain "src/lib/actions/" OR end with ".actions.ts"
   → Use: server-action-specialist

7. IF files contain "src/lib/db/schema/"
   → Use: database-specialist

8. IF files contain "src/lib/queries/" OR end with ".queries.ts"
   → Use: database-specialist

9. IF files contain "src/lib/facades/" OR end with ".facade.ts"
   → Use: facade-specialist

10. IF files contain "src/lib/validations/" OR end with ".validation.ts"
    → Use: validation-specialist

11. IF files contain "cloudinary" (case-insensitive) OR involve image upload/media
    → Use: media-specialist

12. IF files are .tsx/.jsx AND (contain "form" OR "dialog" OR use "useAppForm")
    → Use: form-specialist

13. IF files are page.tsx, layout.tsx, loading.tsx, error.tsx, OR contain "-async.tsx", "-server.tsx", OR "-skeleton.tsx"
    → Use: server-component-specialist

14. IF files are .tsx/.jsx in "src/components/" OR "src/app/**/components/" with hooks/events
    → Use: client-component-specialist

15. IF files contain "resend" (case-insensitive) OR contain "email-templates/" OR involve email sending
    → Use: resend-specialist

16. ELSE (fallback)
    → Use: general-purpose
```

### Multi-Domain Step Handling

If a step involves files from multiple domains (e.g., action + validation + component):

1. **Primary Domain**: Select based on the FIRST matching rule above
2. **Log Secondary Domains**: Note in step log that multiple domains are involved
3. **Specialist Instructions**: Include note in prompt that step spans domains

Example: A step creating both a server action and its validation schema:

- Primary: `server-action-specialist` (actions take precedence)
- The specialist will be instructed that validation files are also involved

## Workflow Overview

When the user runs this command, execute this comprehensive workflow:

1. **Pre-Implementation Checks**: Validate environment and parse plan (orchestrator)
2. **Setup**: Initialize todo list, detect step types, and prepare routing (orchestrator)
3. **Step Execution**: Route each step to appropriate specialist subagent (orchestrator)
4. **Quality Gates**: Run validation commands (orchestrator or subagent)
5. **Summary**: Generate implementation report and offer git commit (orchestrator)

## Step-by-Step Execution

### Phase 1: Pre-Implementation Checks

**Objective**: Ensure safe execution environment and parse the implementation plan.

**Process**:

1. Record execution start time with ISO timestamp
2. **Parse Arguments**:
   - Extract plan file path from `$ARGUMENTS`
   - Detect execution mode flags (`--step-by-step`, `--dry-run`, `--resume-from=N`, `--worktree`)
   - Validate plan file path exists
3. **Worktree Setup** (if `--worktree` flag present):
   - Extract feature name from plan filename (e.g., `add-user-auth-implementation-plan.md` → `add-user-auth`)
   - Generate feature slug (lowercase, hyphens, no special chars)
   - Define worktree path: `.worktrees/{feature-slug}/`
   - Define branch name: `feat/{feature-slug}`
   - Ensure `.worktrees/` is in `.gitignore` (check and add if missing)
   - Check if worktree path already exists:
     - If exists: Error and ask user to remove existing worktree or use different plan name
     - If not exists: Continue
   - Run `git worktree add -b {branch-name} {worktree-path}`
   - Capture worktree creation output
   - Change working directory to worktree path: `cd {worktree-path}`
   - Run `npm install` to set up dependencies (with timeout 300 seconds)
   - Capture npm install output
   - Verify npm install succeeded
   - Log worktree setup details:
     - Worktree path (absolute)
     - Branch name
     - npm install status
     - Working directory changed to worktree
   - **IMPORTANT**: All subsequent operations (git commands, file operations, validation) will now run in worktree context
4. **Git Safety Checks**:
   - Run `git branch --show-current` to get current branch
   - **If worktree was created**: Branch will be new feature branch, skip production/main checks
   - **If worktree was NOT created**:
     - **CRITICAL**: Block execution if on `main`
     - Warn user and require explicit confirmation if on development branch
   - Run `git status` to check for uncommitted changes
   - If uncommitted changes exist, offer to stash or require commit first
5. **Read Implementation Plan**:
   - Use Read tool to load the plan file
   - Parse plan structure and extract:
     - Feature name and overview
     - Estimated duration and complexity
     - Prerequisites section
     - All implementation steps with details
     - Quality gates section
     - Success criteria
6. **Validate Prerequisites**:
   - Check each prerequisite from plan
   - Verify required files exist
   - Verify required packages are installed
   - If prerequisites not met, list missing items and exit
7. **Create Implementation Directory**:
   - Extract feature name from plan filename
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/` directory
   - Initialize `00-implementation-index.md` with overview and navigation
8. **SAVE PRE-CHECKS LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/01-pre-checks.md`:
   - Execution metadata (timestamp, mode, plan path)
   - Worktree details (if `--worktree` flag used):
     - Worktree path (absolute)
     - Feature branch name
     - npm install output and status
   - Git status and branch information
   - Parsed plan summary (X steps, Y quality gates)
   - Prerequisites validation results
   - Safety check results
9. **CHECKPOINT**: Pre-checks complete, ready to proceed

**Dry-Run Mode**: If `--dry-run` flag present, output what would be done and exit after this phase.

### Phase 2: Setup and Initialization with Step-Type Detection

**Objective**: Initialize todo list, detect step types, and prepare routing table.

**Process**:

1. Record setup start time with ISO timestamp
2. **Extract Implementation Steps**:
   - Parse each step from plan and extract:
     - Step number and title
     - What (description of changes)
     - Why (rationale)
     - Files to modify/create
     - Validation commands
     - Success criteria
     - Confidence level
3. **Detect Step Types** (CRITICAL NEW STEP):
   - For each step, analyze the files list using the Detection Rules
   - Determine the appropriate specialist agent
   - Create routing table:
     ```
     Step 1: database-specialist (files in src/lib/db/schema/)
     Step 2: validation-specialist (files in src/lib/validations/)
     Step 3: facade-specialist (files in src/lib/facades/)
     Step 4: server-action-specialist (files in src/lib/actions/)
     Step 5: form-specialist (form component files)
     Step 6: server-component-specialist (page.tsx, async components)
     Step 7: client-component-specialist (interactive components with hooks)
     Step 8: unit-test-specialist (unit test files)
     Step 9: e2e-test-specialist (E2E spec files)
     ```
   - Log any steps that span multiple domains
4. **Create Todo List**:
   - Use TodoWrite tool to create todos for all steps
   - Format: "Step N: {step title} [{specialist-type}]" (content)
   - Format: "Implementing step N: {step title}" (activeForm)
   - All todos start as "pending" status
   - Add quality gates as separate todos at the end
5. **Prepare Step Metadata**:
   - Store parsed step details for subagent delegation
   - Store detected specialist type for each step
   - Note files mentioned in each step (for subagent context)
   - Identify steps with dependencies on previous steps
6. **SAVE SETUP LOG**: Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/02-setup.md`:
   - Setup metadata (timestamp, duration)
   - Extracted steps summary (N steps identified)
   - **Step routing table with specialist assignments**
   - Todo list created (N+1 items including quality gates)
   - Step dependency analysis
   - Files mentioned per step summary
7. **UPDATE INDEX**: Append setup summary to implementation index
8. **CHECKPOINT**: Setup complete, beginning implementation

**Orchestrator Note**: No files are loaded into context at this phase. Each subagent will load only the files it needs.

### Phase 3: Step-by-Step Implementation (Specialist Subagent Delegation)

**Objective**: Orchestrate execution of each step by routing to the appropriate specialist subagent.

**Architecture**: Each step runs in a specialist subagent with pre-loaded skills for its domain.

**Process** (repeat for each step):

1. Record step start time with ISO timestamp
2. **Update Todo Status**:
   - Mark current step todo as "in_progress"
   - Ensure exactly ONE todo is in_progress at a time
3. **Pre-Step Validation** (Orchestrator):
   - Verify all prerequisite steps are completed
   - If step depends on previous step, verify previous step success
   - Check if any blockers from previous steps
4. **Determine Specialist Agent** (Orchestrator):
   - Look up specialist type from routing table (created in Phase 2)
   - Log the selected specialist: "Routing to {specialist-type} for step {N}"
5. **Prepare Specialist Subagent Input** (Orchestrator):
   - Gather step details from parsed plan:
     - Step number and title
     - What (description of changes)
     - Why (rationale)
     - Files to modify/create (list of file paths)
     - Validation commands to run
     - Success criteria to verify
     - Confidence level
   - Include previous step summary (if dependent):
     - What was changed in previous step
     - Files modified/created
     - Any notes for this step
   - Note if step spans multiple domains
6. **Launch Specialist Subagent**:
   - Use Task tool with `subagent_type: "{detected-specialist-type}"`
   - Description: "Implement step {N}: {step title}"
   - **CRITICAL**: Set timeout to 300 seconds (5 minutes) per step
   - **Specialist Subagent Prompt Template**:

     ```
     You are implementing Step {N} of an implementation plan as a {SPECIALIST-TYPE}.

     **IMPORTANT**: You are a specialized agent. Your agent definition includes required skills to load.
     BEFORE implementing anything, load ALL skills listed in your agent definition by reading their reference files.

     Your task is to implement this step completely following all project conventions and return structured results.

     ## Step Details

     **Step**: {N}/{Total} - {Step Title}
     **Specialist**: {specialist-type}
     **Skills to Load**: {skills from agent definition}

     **What to do**:
     {What description from plan}

     **Why**:
     {Why rationale from plan}

     **Files to work with**:
     {List of file paths to modify or create}

     **Validation commands**:
     {List of validation commands to run}

     **Success criteria**:
     {List of success criteria to verify}

     **Confidence level**: {Confidence from plan}

     {IF MULTI-DOMAIN}
     **Note**: This step spans multiple domains. Primary domain is {primary}. Also involves: {secondary domains}
     {END IF}

     {IF DEPENDENT}
     **Previous step context**:
     Step {N-1} made these changes:
     {Previous step summary}
     {END IF}

     ## Instructions

     1. **Load Skills FIRST**: Read all skill reference files from your agent definition BEFORE any implementation
     2. **Read Files**: Load all files mentioned above using the Read tool
     3. **Implement Changes**:
        - Use Edit tool for existing files
        - Use Write tool for new files
        - Follow the "What" description exactly
        - Apply ALL conventions from loaded skills
        - Keep changes focused on this step only
     4. **Validation**:
        - Run ALL validation commands specified above
        - For code changes, MUST run: npm run lint:fix && npm run typecheck
        - Capture all validation output
     5. **Verify Success Criteria**: Check each criterion and note pass/fail
     6. **Return Structured Results**: At the end of your work, provide a clear summary in this format:

     ## STEP RESULTS

     **Status**: success | failure

     **Specialist Used**: {specialist-type}

     **Skills Loaded**:
     - {skill-name}: {reference-file-path}
     - ...

     **Files Modified**:
     - path/to/file1.ts - Description of changes made
     - path/to/file2.tsx - Description of changes made

     **Files Created**:
     - path/to/newfile.ts - Description of file purpose

     **Conventions Applied**:
     - [List key conventions from skills that were followed]

     **Validation Results**:
     - Command: npm run lint:fix && npm run typecheck
       Result: PASS | FAIL
       Output: {relevant output}
     - {other validation commands}

     **Success Criteria**:
     - [✓] Criterion 1: {description}
     - [✓] Criterion 2: {description}
     - [✗] Criterion 3: {description} - {reason for failure}

     **Errors/Warnings**: {any issues encountered}

     **Notes for Next Steps**: {anything important for subsequent steps}

     IMPORTANT:
     - Load your skills FIRST before any implementation
     - Do NOT read files outside the list provided
     - Do NOT implement steps beyond this one
     - Do NOT skip validation commands
     - Focus ONLY on this step's requirements
     ```

7. **Subagent Execution** (Specialist performs):
   - Loads required skills from agent definition
   - Reads necessary files
   - Implements changes per step instructions with skill conventions
   - Runs validation commands
   - Verifies success criteria
   - Returns structured results to orchestrator
8. **Process Subagent Results** (Orchestrator):
   - Capture full subagent response
   - Parse structured results section
   - Extract:
     - Status (success/failure)
     - Specialist used and skills loaded
     - Files modified/created with descriptions
     - Conventions applied
     - Validation command outputs
     - Success criteria verification
     - Errors/warnings
     - Notes for next steps
9. **Step Logging** (Orchestrator):
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/0{N+2}-step-{N}-results.md`:
     - Step metadata (number, title, timestamp, duration)
     - **Specialist used and skills loaded**
     - Subagent input (what was asked)
     - Subagent output (full response)
     - Parsed results summary
     - Files modified/created
     - Conventions applied
     - Validation results
     - Success criteria verification
     - Any errors or warnings
10. **Update Todo Status** (Orchestrator):
    - If step succeeded: Mark todo as "completed"
    - If step failed: Keep as "in_progress" and log error
11. **Error Handling** (Orchestrator):
    - If subagent times out:
      - Log timeout error
      - Mark step as failed
      - Continue or abort based on severity
    - If subagent returns failure:
      - Log detailed error information
      - Attempt to determine if blocking
      - If `--step-by-step` mode: Ask user how to proceed
      - Otherwise: Continue or abort based on severity
12. **Step-by-Step Mode Check** (Orchestrator):
    - If `--step-by-step` flag present:
      - Use AskUserQuestion to ask user:
        - "Step {N} completed {successfully/with errors} using {specialist-type}. Continue to next step?"
        - Options: "Continue", "Skip next step", "Retry this step", "Abort implementation"
      - Handle user response accordingly
13. **UPDATE INDEX** (Orchestrator): Append step summary to implementation index
14. **Progress Report** (Orchestrator):
    - Output concise progress: "Completed step {N}/{Total} - {step title} [{specialist-type}]"

**Resume Mode**: If `--resume-from=N` flag present, skip to step N and begin execution there.

**Context Management**:

- **Orchestrator**: Maintains minimal context (parsed plan, routing table, results summaries)
- **Specialists**: Each gets fresh context with pre-loaded skills for their domain
- **Result**: Scalable to plans with 50+ steps without context overflow

### Phase 4: Quality Gates Execution

**Objective**: Run all quality gates from the plan to ensure implementation quality.

**Architecture**: Quality gates can run in orchestrator (simple) or delegated to test-specialist (complex tests).

**Process**:

1. Record quality gates start time with ISO timestamp
2. **Extract Quality Gates** (Orchestrator):
   - Parse quality gates section from plan
   - Identify all validation commands and checks
   - Assess complexity (simple commands vs complex test suites)
3. **Mark Quality Gate Todo** (Orchestrator):
   - Mark quality gates todo as "in_progress"
4. **Execute Quality Gates**:

   **Option A - Simple Validation** (Orchestrator runs directly):
   - For basic commands (lint, typecheck, build):
     - Run validation commands using Bash tool:
       - `npm run lint:fix` (if not already run)
       - `npm run typecheck`
       - `npm run build` (if specified in plan)
     - Capture all output
     - Check pass/fail status

   **Option B - Complex Testing** (Delegate to test-executor):
   - For comprehensive test suites (unit, integration, e2e):
     - Use Task tool with `subagent_type: "test-executor"`
     - Description: "Run quality gates and test suites"
     - **Subagent handles**: Running tests, analyzing failures, suggesting fixes
     - **Returns**: Test results, coverage reports, failure analysis

5. **Database Validation** (if applicable - Orchestrator):
   - If plan involves database changes:
     - Suggest running `/db check schema` to validate migrations
     - Verify database integrity
6. **Integration Checks** (if applicable - Orchestrator):
   - If plan involves UI changes:
     - Suggest running `/ui-audit [page]` to test user interactions
7. **Quality Gate Results** (Orchestrator):
   - Create `docs/{YYYY_MM_DD}/implementation/{feature-name}/XX-quality-gates.md`:
     - Quality gates metadata (timestamp, duration)
     - Each gate result (pass/fail)
     - Full output of all validation commands
     - Test results (if applicable)
     - Summary of issues found
     - Blockers vs warnings categorization
8. **Gate Status Check** (Orchestrator):
   - If all gates pass: Mark quality gates todo as "completed"
   - If any gate fails:
     - Log failure details
     - Keep todo as "in_progress"
     - Determine if blocking (critical vs non-critical failures)
     - Provide recommendations for fixes
9. **UPDATE INDEX** (Orchestrator): Append quality gates summary to implementation index

### Phase 5: Implementation Summary and Completion

**Objective**: Generate comprehensive implementation report and offer next steps.

**Process**:

1. Record completion time with ISO timestamp
2. **Calculate Statistics**:
   - Total execution time
   - Number of steps completed
   - Number of files modified/created
   - Number of validation commands run
   - Quality gates status (X/Y passed)
   - **Specialist usage breakdown** (e.g., "3 steps: database-specialist, 2 steps: server-component-specialist, 1 step: client-component-specialist")
3. **Generate Change Summary**:
   - List all files modified with brief descriptions
   - List all files created
   - Summarize major changes by category (components, actions, queries, etc.)
   - **List skills that were applied**
4. **Review Todos**:
   - Count completed todos
   - List any incomplete todos
   - Identify any failures or blockers
5. **Create Implementation Summary**:
   - Save to `docs/{YYYY_MM_DD}/implementation/{feature-name}/YY-implementation-summary.md`:
     - Complete execution metadata (start, end, duration)
     - Implementation plan reference
     - Execution mode used
     - Steps completed (N/Total)
     - **Specialist routing summary**
     - **Skills applied per step**
     - Files changed summary
     - Quality gates results
     - Known issues or warnings
     - Recommendations for next steps
6. **UPDATE INDEX**: Finalize implementation index with summary
7. **Git Commit Offer**:
   - If all quality gates passed:
     - Use AskUserQuestion to ask:
       - "Implementation complete! Create a git commit?"
       - Options: "Yes, commit all changes", "No, I'll commit manually", "Show me git diff first"
     - If user chooses commit:
       - Generate descriptive commit message:

         ```
         feat: [Feature name from plan]

         [Brief description of implementation]

         Implementation plan: docs/{date}/plans/{feature-name}-implementation-plan.md
         Implementation log: docs/{date}/implementation/{feature-name}/

         Steps completed:
         - [Step 1 title] (database-specialist)
         - [Step 2 title] (server-action-specialist)
         ...

         🤖 Generated with [Claude Code](https://claude.com/claude-code)

         Co-Authored-By: Claude <noreply@anthropic.com>
         ```

       - Use git commit process from Bash tool instructions

8. **Worktree Cleanup** (if `--worktree` flag was used):
   - Use AskUserQuestion to ask user how to handle the worktree:
     - Question: "Implementation complete in worktree. How would you like to proceed?"
     - Options:
       1. "Merge to main branch and remove worktree" - Merges feature branch to original branch, removes worktree
       2. "Push branch and create PR" - Pushes feature branch to remote, offers to remove worktree
       3. "Keep worktree for testing" - Leaves worktree in place for manual testing/review
       4. "Remove worktree only" - Deletes worktree but keeps feature branch
   - **Option 1 - Merge and Remove**:
     - Change directory back to original working directory
     - Run `git checkout {original-branch}` (from pre-checks log)
     - Run `git merge feat/{feature-slug} --no-ff -m "Merge feature: {feature-name}"`
     - If merge successful:
       - Run `git worktree remove .worktrees/{feature-slug}`
       - Run `git branch -d feat/{feature-slug}` (delete feature branch)
       - Confirm merge and cleanup complete
     - If merge conflicts:
       - List conflict files
       - Offer to abort merge or let user resolve manually
   - **Option 2 - Push and PR**:
     - Ensure commit was made (from step 7)
     - Run `git push -u origin feat/{feature-slug}`
     - Offer to create PR using `gh pr create` (if gh CLI available)
     - Use AskUserQuestion to ask: "Remove worktree now or keep for testing?"
       - If "Remove": Run `git worktree remove .worktrees/{feature-slug}` from original directory
       - If "Keep": Leave worktree in place
   - **Option 3 - Keep Worktree**:
     - Output message: "Worktree kept at: {worktree-path}"
     - Provide instructions: "To return to worktree: cd {worktree-path}"
     - Provide cleanup command: "To remove later: git worktree remove {worktree-path}"
   - **Option 4 - Remove Worktree Only**:
     - Change directory back to original working directory
     - Run `git worktree remove .worktrees/{feature-slug}`
     - Output message: "Worktree removed. Feature branch 'feat/{feature-slug}' preserved."
     - Provide merge instruction: "To merge later: git merge feat/{feature-slug}"
   - Log worktree cleanup action to implementation summary
9. **Final Output to User**:

   ```
   ## Implementation Complete

   ✓ Completed {N}/{Total} steps successfully
   ✓ Modified {X} files, created {Y} files
   ✓ Quality gates: {Z} passed, {W} failed
   ✓ Specialists used: {breakdown}
   {IF WORKTREE}
   ✓ Worktree: {worktree-action-taken}
   ✓ Branch: feat/{feature-slug}
   {END IF}

   Implementation log: docs/{date}/implementation/{feature-name}/
   - 📄 00-implementation-index.md - Navigation and overview
   - 📄 01-pre-checks.md - Pre-implementation validation
   - 📄 02-setup.md - Setup, routing table, and specialist assignments
   - 📄 03-step-1-results.md - Step 1 execution log (database-specialist)
   ...
   - 📄 XX-quality-gates.md - Quality validation results
   - 📄 YY-implementation-summary.md - Complete summary

   Execution time: X.X minutes

   [Any warnings or next steps]
   ```

## Error Recovery and Resilience

**Step Failure Handling**:

1. Capture full error details (message, stack trace, context)
2. Log error to step results file including which specialist was used
3. Attempt automatic recovery:
   - If validation failure: Show validation output and suggest fixes
   - If file not found: Suggest creating file or checking plan
   - If dependency missing: Suggest installation command
   - If skill loading failed: Retry with explicit skill paths
4. If recovery not possible:
   - Mark step as failed in todo
   - Continue to next step OR abort based on severity
   - Log failure reason clearly

**Quality Gate Failure Handling**:

1. Identify which gate failed (lint, typecheck, test, build)
2. Show relevant error output
3. Categorize as blocker vs warning
4. Provide specific recommendations:
   - For lint failures: "Run npm run lint:fix to see issues"
   - For type errors: "Check files with type issues: [list]"
   - For test failures: "Review failed test output above"
   - For build failures: "Build errors must be fixed before deployment"
5. Ask user if they want to:
   - Attempt automatic fixes
   - Abort and fix manually
   - Continue anyway (if non-blocking)

**Rollback Capability**:

- If major failure occurs:
  - **If in worktree**: Offer to remove entire worktree (clean rollback)
  - **If not in worktree**: Suggest using `git diff` to review changes
  - Offer to `git restore` specific files
  - Recommend `git stash` to save partial work
  - Never automatically discard work without user confirmation

## Implementation Details

**Critical Requirements**:

- **ORCHESTRATOR PATTERN**: This command is a lightweight coordinator, NOT a direct implementer
- **SPECIALIST ROUTING**: Each step routed to domain-specific specialist with pre-loaded skills
- **SKILL AUTO-LOADING**: Specialists automatically load relevant skills from their agent definitions
- **WORKTREE ISOLATION**: Optional git worktree creation for isolated feature development with automated cleanup
- **SAFETY FIRST**: Never execute on main or production branches without explicit confirmation (worktrees bypass this with new branches)
- **SYSTEMATIC EXECUTION**: Execute steps in order, one at a time, via specialist delegation
- **VALIDATION ENFORCEMENT**: Specialists always run lint:fix and typecheck for code changes
- **TODO MANAGEMENT**: Orchestrator keeps todo list updated in real-time (ONE in_progress at a time)
- **COMPREHENSIVE LOGGING**: Orchestrator saves detailed logs including specialist and skills used
- **ERROR RECOVERY**: Handle subagent errors gracefully with clear user guidance
- **QUALITY ASSURANCE**: Enforce quality gates before completion
- **CONTEXT EFFICIENCY**: Orchestrator maintains minimal context, specialists use fresh context per step
- **SCALABILITY**: Can handle plans with 50+ steps without context overflow

**Quality Standards**:

- All code must pass lint and typecheck
- All modified files must follow project conventions (enforced by specialist skills)
- All success criteria must be verified
- All validation commands must be executed
- All changes must be logged with rationale and skills applied

**Logging Requirements**:

- **Human-Readable Format**: Use markdown with clear headers and sections
- **Complete Data Capture**: Full validation output, error messages, changes made
- **Specialist Tracking**: Log which specialist and skills were used for each step
- **Incremental Saves**: Save logs after each step completes
- **Navigation Structure**: Index file with links to all logs
- **Timestamp Precision**: ISO format timestamps for all events
- **Change Tracking**: Document what changed, why, and verification results

**Performance Optimization**:

- **Orchestrator**: Minimal context usage, fast coordination
- **Specialists**: Fresh context per step with pre-loaded domain skills
- **Parallel Potential**: Independent steps could run in parallel (future enhancement)
- **Batch Operations**: Orchestrator batches pre-checks and setup operations
- **Context Isolation**: Each specialist only loads files needed for its step
- **Scalable Architecture**: Linear context growth instead of exponential

**User Experience**:

- Clear progress indicators ("Step N/Total [{specialist}]")
- Concise status updates after each step with specialist used
- Detailed logs available for review
- Helpful error messages with actionable guidance
- Offer next steps upon completion

## File Output Structure

**Implementation Logs**: `docs/{YYYY_MM_DD}/implementation/{feature-name}/`

```
00-implementation-index.md          # Navigation, routing table, and workflow overview
01-pre-checks.md                    # Pre-implementation validation results
02-setup.md                         # Setup, step-type detection, and specialist routing
03-step-1-results.md                # Step 1 execution log (includes specialist + skills)
04-step-2-results.md                # Step 2 execution log (includes specialist + skills)
...
XX-quality-gates.md                 # Quality gate validation results
YY-implementation-summary.md        # Final summary with specialist breakdown
```

**Index File Structure** (`00-implementation-index.md`):

```markdown
# {Feature Name} Implementation

**Execution Date**: {timestamp}
**Implementation Plan**: [Link to plan file]
**Execution Mode**: {full-auto|step-by-step|dry-run}
**Status**: {In Progress|Completed|Failed}

## Overview

- Total Steps: {N}
- Steps Completed: {X}/{N}
- Files Modified: {Y}
- Files Created: {Z}
- Quality Gates: {W} passed, {V} failed
- Total Duration: {X.X} minutes

## Specialist Routing

| Step       | Specialist               | Skills Loaded                                         |
| ---------- | ------------------------ | ----------------------------------------------------- |
| 1. {title} | database-specialist      | database-schema, drizzle-orm, validation-schemas      |
| 2. {title} | server-action-specialist | server-actions, sentry-monitoring, validation-schemas |
| ...        | ...                      | ...                                                   |

## Navigation

- [Pre-Implementation Checks](./01-pre-checks.md)
- [Setup and Routing](./02-setup.md)
- [Step 1: {title}](./03-step-1-results.md) [database-specialist]
- [Step 2: {title}](./04-step-2-results.md) [server-action-specialist]
  ...
- [Quality Gates](./XX-quality-gates.md)
- [Implementation Summary](./YY-implementation-summary.md)

## Quick Status

| Step       | Specialist               | Status | Duration | Issues |
| ---------- | ------------------------ | ------ | -------- | ------ |
| 1. {title} | database-specialist      | ✓      | 2.3s     | None   |
| 2. {title} | server-action-specialist | ✓      | 5.1s     | None   |

...

## Summary

{Brief summary of implementation results}
```

## Integration with Other Commands

**Automatic Integration**:

- If plan involves database changes: Automatically offer to run `/db` operations
- If plan involves UI changes: Suggest running `/ui-audit` after implementation
- If plan involves new features: Reference `/plan-feature` for future enhancements

**Command Chaining Example**:

```bash
# Complete feature workflow
/plan-feature "Add real-time notifications"
# Review generated plan
/implement-plan docs/2025_11_11/plans/add-real-time-notifications-implementation-plan.md
# After implementation
/ui-audit /notifications
```

## Specialist Communication Protocol

**Input to Specialist Subagent** (from orchestrator):

```
- Step number and title
- Specialist type and skills to load
- What: Description of changes needed
- Why: Rationale for the changes
- Files: List of file paths to modify/create
- Validation commands: Commands to run for verification
- Success criteria: Criteria to check
- Previous step context: Summary of what previous step did (if dependent)
- Multi-domain note: If step spans multiple domains
```

**Output from Specialist Subagent** (to orchestrator):

```
- Status: success | failure
- Specialist used and skills loaded
- Files modified: List with descriptions of changes
- Files created: List with descriptions
- Conventions applied: Key patterns from skills
- Validation results: Command outputs with pass/fail status
- Success criteria: Verification of each criterion
- Errors/warnings: Any issues encountered
- Notes: Information for subsequent steps
```

**Architecture Benefits**:

1. **Automatic Skill Loading**: Specialists know which skills to load for their domain
2. **Convention Enforcement**: Skills ensure consistent code patterns
3. **Context Isolation**: Each step has clean, isolated context
4. **Scalability**: Can handle 50+ step plans without context overflow
5. **Error Containment**: Failures isolated to individual steps
6. **Parallel Potential**: Future enhancement could run independent steps concurrently
7. **Debugging**: Clear logs show which specialist and skills were used
8. **Resource Efficiency**: Only load files and skills needed per step

## Notes

- This command is designed to work seamlessly with plans generated by `/plan-feature`
- **Architecture**: Uses orchestrator + specialist subagent pattern with automatic skill loading
- **Specialists**: 8 domain-specific agents with pre-configured skills for their area
- Always review the implementation plan before executing to ensure it's current
- Use `--step-by-step` mode for complex or risky implementations
- Use `--dry-run` mode to preview changes and specialist routing before applying them
- Use `--worktree` mode for isolated feature development with these benefits:
  - Complete isolation from main codebase
  - Safe experimentation without affecting working directory
  - Easy rollback by removing entire worktree
  - Automatic dependency installation (npm install)
  - Flexible cleanup options (merge, PR, keep, or remove)
- **Worktree Location**: Created at `.worktrees/{feature-slug}/` (gitignored by default)
- **Worktree Branch**: Uses `feat/{feature-slug}` naming convention
- Implementation logs provide complete audit trail including specialists and skills used
- Quality gates are enforced but non-blocking warnings won't stop execution
- Git commit is offered but optional - you can commit manually if preferred
- **Scalability**: Tested architecture can handle plans with 50+ steps efficiently
