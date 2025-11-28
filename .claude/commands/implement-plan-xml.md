---
allowed-tools: Task(subagent_type:general-purpose), Task(subagent_type:server-action-specialist-xml), Task(subagent_type:database-specialist-xml), Task(subagent_type:facade-specialist-xml), Task(subagent_type:client-component-specialist-xml), Task(subagent_type:server-component-specialist-xml), Task(subagent_type:form-specialist-xml), Task(subagent_type:media-specialist-xml), Task(subagent_type:test-specialist), Task(subagent_type:validation-specialist-xml), Task(subagent_type:resend-specialist-xml), Read(*), Write(*), Bash(git:*,mkdir:*,npm:*,cd:*), TodoWrite(*), AskUserQuestion(*)
argument-hint: 'path/to/implementation-plan.md [--step-by-step|--dry-run|--resume-from=N|--worktree]'
description: Execute implementation plan with structured tracking and validation using subagent architecture (XML-structured version)
---

<command-definition>
  <role>
    <description>You are a lightweight implementation orchestrator that coordinates the execution of detailed implementation plans by delegating each step to specialized subagents.</description>
    <responsibility>Coordination, tracking, routing to the correct specialist, and logging</responsibility>
    <constraint>NOT direct implementation</constraint>
  </role>

  <context-files>
    <file>@CLAUDE.MD</file>
    <file>@package.json</file>
  </context-files>

  <command-usage>
    <syntax>/implement-plan &lt;plan-file-path&gt; [options]</syntax>

    <options>
      <option name="--step-by-step" type="flag">
        <description>Pause for user approval between each step</description>
      </option>
      <option name="--dry-run" type="flag">
        <description>Show what would be done without making changes</description>
      </option>
      <option name="--resume-from" type="parameter">
        <description>Resume implementation from step N (if previous run failed)</description>
        <syntax>--resume-from=N</syntax>
      </option>
      <option name="--worktree" type="flag">
        <description>Create a new git worktree with feature branch for isolated development</description>
      </option>
    </options>

    <examples>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/add-user-auth-implementation-plan.md</command>
      </example>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/notifications-implementation-plan.md --step-by-step</command>
      </example>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/admin-dashboard-implementation-plan.md --dry-run</command>
      </example>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/social-features-implementation-plan.md --resume-from=3</command>
      </example>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/user-profile-implementation-plan.md --worktree</command>
      </example>
      <example>
        <command>/implement-plan docs/2025_11_11/plans/search-feature-implementation-plan.md --worktree --step-by-step</command>
      </example>
    </examples>
  </command-usage>

  <architecture-overview>
    <pattern name="Orchestrator + Specialist Pattern">
      <description>This command uses intelligent routing to specialized subagents</description>

      <component name="Main Orchestrator" role="this command">
        <responsibility>Lightweight coordination</responsibility>
        <responsibility>Step-type detection</responsibility>
        <responsibility>Routing</responsibility>
        <responsibility>Todo management</responsibility>
        <responsibility>Logging</responsibility>
      </component>

      <component name="Specialist Subagents">
        <description>Domain-specific agents with pre-loaded skills for their area of expertise</description>
      </component>

      <benefits>
        <benefit>Automatic skill loading</benefit>
        <benefit>Consistent conventions</benefit>
        <benefit>No context overflow</benefit>
        <benefit>Scalable to 50+ step plans</benefit>
      </benefits>
    </pattern>
  </architecture-overview>

  <available-specialists>
    <table>
      <header>
        <cell>Agent</cell>
        <cell>Domain</cell>
        <cell>Skills Auto-Loaded</cell>
        <cell>File Patterns</cell>
      </header>
      <row>
        <cell>server-action-specialist-xml</cell>
        <cell>Server actions</cell>
        <cell>server-actions, sentry-monitoring, validation-schemas</cell>
        <cell>src/lib/actions/**/*.actions.ts</cell>
      </row>
      <row>
        <cell>database-specialist-xml</cell>
        <cell>Schemas &amp; queries</cell>
        <cell>database-schema, drizzle-orm, validation-schemas</cell>
        <cell>src/lib/db/schema/**, src/lib/queries/**</cell>
      </row>
      <row>
        <cell>facade-specialist-xml</cell>
        <cell>Business logic</cell>
        <cell>facade-layer, caching, sentry-monitoring, drizzle-orm</cell>
        <cell>src/lib/facades/**/*.facade.ts</cell>
      </row>
      <row>
        <cell>server-component-specialist-xml</cell>
        <cell>Server components</cell>
        <cell>react-coding-conventions, ui-components, server-components, caching</cell>
        <cell>src/app/**/page.tsx, layout.tsx, *-async.tsx, *-skeleton.tsx</cell>
      </row>
      <row>
        <cell>client-component-specialist-xml</cell>
        <cell>Client components</cell>
        <cell>react-coding-conventions, ui-components, client-components</cell>
        <cell>src/components/**/*.tsx (with hooks/events), *-client.tsx</cell>
      </row>
      <row>
        <cell>form-specialist-xml</cell>
        <cell>Forms</cell>
        <cell>form-system, react-coding-conventions, validation-schemas, server-actions</cell>
        <cell>Form components, *-form*.tsx, *-dialog*.tsx</cell>
      </row>
      <row>
        <cell>media-specialist-xml</cell>
        <cell>Cloudinary</cell>
        <cell>cloudinary-media, react-coding-conventions</cell>
        <cell>Cloudinary utilities, image components</cell>
      </row>
      <row>
        <cell>test-specialist</cell>
        <cell>Testing</cell>
        <cell>testing-patterns</cell>
        <cell>tests/**/*.test.ts, e2e/**/*.spec.ts</cell>
      </row>
      <row>
        <cell>validation-specialist-xml</cell>
        <cell>Zod schemas</cell>
        <cell>validation-schemas</cell>
        <cell>src/lib/validations/**/*.validation.ts</cell>
      </row>
      <row>
        <cell>resend-specialist-xml</cell>
        <cell>Email sending</cell>
        <cell>resend-email, sentry-monitoring</cell>
        <cell>src/lib/services/resend*.ts, src/lib/email-templates/**/*.tsx</cell>
      </row>
      <row>
        <cell>general-purpose</cell>
        <cell>Fallback</cell>
        <cell>None (manual skill invocation)</cell>
        <cell>Any other files</cell>
      </row>
    </table>
  </available-specialists>

  <step-type-detection-algorithm>
    <note type="critical">Before launching a subagent for each step, the orchestrator MUST analyze the step's files to determine the correct specialist agent.</note>

    <detection-rules priority-order="true">
      <rule priority="1">
        <condition>files contain "tests/" OR end with ".test.ts" OR ".spec.ts"</condition>
        <result>test-specialist</result>
      </rule>
      <rule priority="2">
        <condition>files contain "src/lib/actions/" OR end with ".actions.ts"</condition>
        <result>server-action-specialist-xml</result>
      </rule>
      <rule priority="3">
        <condition>files contain "src/lib/db/schema/"</condition>
        <result>database-specialist-xml</result>
      </rule>
      <rule priority="4">
        <condition>files contain "src/lib/queries/" OR end with ".queries.ts"</condition>
        <result>database-specialist-xml</result>
      </rule>
      <rule priority="5">
        <condition>files contain "src/lib/facades/" OR end with ".facade.ts"</condition>
        <result>facade-specialist-xml</result>
      </rule>
      <rule priority="6">
        <condition>files contain "src/lib/validations/" OR end with ".validation.ts"</condition>
        <result>validation-specialist-xml</result>
      </rule>
      <rule priority="7">
        <condition>files contain "cloudinary" (case-insensitive) OR involve image upload/media</condition>
        <result>media-specialist-xml</result>
      </rule>
      <rule priority="8">
        <condition>files are .tsx/.jsx AND (contain "form" OR "dialog" OR use "useAppForm")</condition>
        <result>form-specialist-xml</result>
      </rule>
      <rule priority="9">
        <condition>files are page.tsx, layout.tsx, loading.tsx, error.tsx, OR contain "-async.tsx", "-server.tsx", OR "-skeleton.tsx"</condition>
        <result>server-component-specialist-xml</result>
      </rule>
      <rule priority="10">
        <condition>files are .tsx/.jsx in "src/components/" OR "src/app/**/components/" with hooks/events</condition>
        <result>client-component-specialist-xml</result>
      </rule>
      <rule priority="11">
        <condition>files contain "resend" (case-insensitive) OR contain "email-templates/" OR involve email sending</condition>
        <result>resend-specialist-xml</result>
      </rule>
      <rule priority="12">
        <condition>ELSE (fallback)</condition>
        <result>general-purpose</result>
      </rule>
    </detection-rules>

    <multi-domain-step-handling>
      <description>If a step involves files from multiple domains (e.g., action + validation + component)</description>
      <step order="1">
        <action>Primary Domain</action>
        <details>Select based on the FIRST matching rule above</details>
      </step>
      <step order="2">
        <action>Log Secondary Domains</action>
        <details>Note in step log that multiple domains are involved</details>
      </step>
      <step order="3">
        <action>Specialist Instructions</action>
        <details>Include note in prompt that step spans domains</details>
      </step>
      <example>
        <scenario>A step creating both a server action and its validation schema</scenario>
        <primary>server-action-specialist-xml (actions take precedence)</primary>
        <note>The specialist will be instructed that validation files are also involved</note>
      </example>
    </multi-domain-step-handling>
  </step-type-detection-algorithm>

  <workflow-overview>
    <description>When the user runs this command, execute this comprehensive workflow:</description>
    <phase order="1" name="Pre-Implementation Checks">
      <description>Validate environment and parse plan (orchestrator)</description>
    </phase>
    <phase order="2" name="Setup">
      <description>Initialize todo list, detect step types, and prepare routing (orchestrator)</description>
    </phase>
    <phase order="3" name="Step Execution">
      <description>Route each step to appropriate specialist subagent (orchestrator)</description>
    </phase>
    <phase order="4" name="Quality Gates">
      <description>Run validation commands (orchestrator or subagent)</description>
    </phase>
    <phase order="5" name="Summary">
      <description>Generate implementation report and offer git commit (orchestrator)</description>
    </phase>
  </workflow-overview>

  <phase-details>
    <phase number="1" name="Pre-Implementation Checks">
      <objective>Ensure safe execution environment and parse the implementation plan.</objective>

      <process>
        <step order="1">
          <action>Record execution start time with ISO timestamp</action>
        </step>
        <step order="2" name="Parse Arguments">
          <action>Extract plan file path from $ARGUMENTS</action>
          <action>Detect execution mode flags (--step-by-step, --dry-run, --resume-from=N, --worktree)</action>
          <action>Validate plan file path exists</action>
        </step>
        <step order="3" name="Worktree Setup">
          <condition>if --worktree flag present</condition>
          <actions>
            <action>Extract feature name from plan filename (e.g., add-user-auth-implementation-plan.md to add-user-auth)</action>
            <action>Generate feature slug (lowercase, hyphens, no special chars)</action>
            <action>Define worktree path: .worktrees/{feature-slug}/</action>
            <action>Define branch name: feat/{feature-slug}</action>
            <action>Ensure .worktrees/ is in .gitignore (check and add if missing)</action>
            <action>Check if worktree path already exists</action>
            <conditional trigger="worktree exists">
              <then>Error and ask user to remove existing worktree or use different plan name</then>
              <else>Continue</else>
            </conditional>
            <action>Run git worktree add -b {branch-name} {worktree-path}</action>
            <action>Capture worktree creation output</action>
            <action>Change working directory to worktree path: cd {worktree-path}</action>
            <action>Run npm install to set up dependencies (with timeout 300 seconds)</action>
            <action>Capture npm install output</action>
            <action>Verify npm install succeeded</action>
            <action>Log worktree setup details: worktree path (absolute), branch name, npm install status, working directory changed to worktree</action>
            <note type="important">All subsequent operations (git commands, file operations, validation) will now run in worktree context</note>
          </actions>
        </step>
        <step order="4" name="Git Safety Checks">
          <action>Run git branch --show-current to get current branch</action>
          <conditional trigger="worktree was created">
            <then>Branch will be new feature branch, skip production/main checks</then>
            <else>
              <action type="critical">Block execution if on main</action>
              <action>Warn user and require explicit confirmation if on development branch</action>
            </else>
          </conditional>
          <action>Run git status to check for uncommitted changes</action>
          <action>If uncommitted changes exist, offer to stash or require commit first</action>
        </step>
        <step order="5" name="Read Implementation Plan">
          <action>Use Read tool to load the plan file</action>
          <action>Parse plan structure and extract:</action>
          <extraction-items>
            <item>Feature name and overview</item>
            <item>Estimated duration and complexity</item>
            <item>Prerequisites section</item>
            <item>All implementation steps with details</item>
            <item>Quality gates section</item>
            <item>Success criteria</item>
          </extraction-items>
        </step>
        <step order="6" name="Validate Prerequisites">
          <action>Check each prerequisite from plan</action>
          <action>Verify required files exist</action>
          <action>Verify required packages are installed</action>
          <action>If prerequisites not met, list missing items and exit</action>
        </step>
        <step order="7" name="Create Implementation Directory">
          <action>Extract feature name from plan filename</action>
          <action>Create docs/{YYYY_MM_DD}/implementation/{feature-name}/ directory</action>
          <action>Initialize 00-implementation-index.md with overview and navigation</action>
        </step>
        <step order="8" name="Save Pre-Checks Log">
          <output-file>docs/{YYYY_MM_DD}/implementation/{feature-name}/01-pre-checks.md</output-file>
          <contents>
            <item>Execution metadata (timestamp, mode, plan path)</item>
            <item>Worktree details (if --worktree flag used): worktree path (absolute), feature branch name, npm install output and status</item>
            <item>Git status and branch information</item>
            <item>Parsed plan summary (X steps, Y quality gates)</item>
            <item>Prerequisites validation results</item>
            <item>Safety check results</item>
          </contents>
        </step>
        <step order="9" name="Checkpoint">
          <status>Pre-checks complete, ready to proceed</status>
        </step>
      </process>

      <dry-run-mode>
        <description>If --dry-run flag present, output what would be done and exit after this phase</description>
      </dry-run-mode>
    </phase>

    <phase number="2" name="Setup and Initialization with Step-Type Detection">
      <objective>Initialize todo list, detect step types, and prepare routing table.</objective>

      <process>
        <step order="1">
          <action>Record setup start time with ISO timestamp</action>
        </step>
        <step order="2" name="Extract Implementation Steps">
          <action>Parse each step from plan and extract:</action>
          <extraction-items>
            <item>Step number and title</item>
            <item>What (description of changes)</item>
            <item>Why (rationale)</item>
            <item>Files to modify/create</item>
            <item>Validation commands</item>
            <item>Success criteria</item>
            <item>Confidence level</item>
          </extraction-items>
        </step>
        <step order="3" name="Detect Step Types">
          <note type="critical">NEW STEP</note>
          <action>For each step, analyze the files list using the Detection Rules</action>
          <action>Determine the appropriate specialist agent</action>
          <action>Create routing table</action>
          <routing-table-example>
            <route step="1" specialist="database-specialist-xml" reason="files in src/lib/db/schema/" />
            <route step="2" specialist="validation-specialist-xml" reason="files in src/lib/validations/" />
            <route step="3" specialist="facade-specialist-xml" reason="files in src/lib/facades/" />
            <route step="4" specialist="server-action-specialist-xml" reason="files in src/lib/actions/" />
            <route step="5" specialist="form-specialist-xml" reason="form component files" />
            <route step="6" specialist="server-component-specialist-xml" reason="page.tsx, async components" />
            <route step="7" specialist="client-component-specialist-xml" reason="interactive components with hooks" />
            <route step="8" specialist="test-specialist" reason="test files" />
          </routing-table-example>
          <action>Log any steps that span multiple domains</action>
        </step>
        <step order="4" name="Create Todo List">
          <action>Use TodoWrite tool to create todos for all steps</action>
          <format name="content">Step N: {step title} [{specialist-type}]</format>
          <format name="activeForm">Implementing step N: {step title}</format>
          <initial-status>All todos start as "pending" status</initial-status>
          <action>Add quality gates as separate todos at the end</action>
        </step>
        <step order="5" name="Prepare Step Metadata">
          <action>Store parsed step details for subagent delegation</action>
          <action>Store detected specialist type for each step</action>
          <action>Note files mentioned in each step (for subagent context)</action>
          <action>Identify steps with dependencies on previous steps</action>
        </step>
        <step order="6" name="Save Setup Log">
          <output-file>docs/{YYYY_MM_DD}/implementation/{feature-name}/02-setup.md</output-file>
          <contents>
            <item>Setup metadata (timestamp, duration)</item>
            <item>Extracted steps summary (N steps identified)</item>
            <item>Step routing table with specialist assignments</item>
            <item>Todo list created (N+1 items including quality gates)</item>
            <item>Step dependency analysis</item>
            <item>Files mentioned per step summary</item>
          </contents>
        </step>
        <step order="7" name="Update Index">
          <action>Append setup summary to implementation index</action>
        </step>
        <step order="8" name="Checkpoint">
          <status>Setup complete, beginning implementation</status>
        </step>
      </process>

      <orchestrator-note>No files are loaded into context at this phase. Each subagent will load only the files it needs.</orchestrator-note>
    </phase>

    <phase number="3" name="Step-by-Step Implementation (Specialist Subagent Delegation)">
      <objective>Orchestrate execution of each step by routing to the appropriate specialist subagent.</objective>
      <architecture>Each step runs in a specialist subagent with pre-loaded skills for its domain.</architecture>

      <process repeat="for each step">
        <step order="1">
          <action>Record step start time with ISO timestamp</action>
        </step>
        <step order="2" name="Update Todo Status">
          <action>Mark current step todo as "in_progress"</action>
          <constraint>Ensure exactly ONE todo is in_progress at a time</constraint>
        </step>
        <step order="3" name="Pre-Step Validation" executor="Orchestrator">
          <action>Verify all prerequisite steps are completed</action>
          <action>If step depends on previous step, verify previous step success</action>
          <action>Check if any blockers from previous steps</action>
        </step>
        <step order="4" name="Determine Specialist Agent" executor="Orchestrator">
          <action>Look up specialist type from routing table (created in Phase 2)</action>
          <action>Log the selected specialist: "Routing to {specialist-type} for step {N}"</action>
        </step>
        <step order="5" name="Prepare Specialist Subagent Input" executor="Orchestrator">
          <action>Gather step details from parsed plan</action>
          <step-details>
            <item>Step number and title</item>
            <item>What (description of changes)</item>
            <item>Why (rationale)</item>
            <item>Files to modify/create (list of file paths)</item>
            <item>Validation commands to run</item>
            <item>Success criteria to verify</item>
            <item>Confidence level</item>
          </step-details>
          <conditional trigger="dependent on previous step">
            <include>
              <item>What was changed in previous step</item>
              <item>Files modified/created</item>
              <item>Any notes for this step</item>
            </include>
          </conditional>
          <action>Note if step spans multiple domains</action>
        </step>
        <step order="6" name="Launch Specialist Subagent">
          <action>Use Task tool with subagent_type: "{detected-specialist-type}"</action>
          <description>Implement step {N}: {step title}</description>
          <timeout type="critical">300 seconds (5 minutes) per step</timeout>

          <specialist-prompt-template>
            <![CDATA[
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
- [x] Criterion 1: {description}
- [x] Criterion 2: {description}
- [ ] Criterion 3: {description} - {reason for failure}

**Errors/Warnings**: {any issues encountered}

**Notes for Next Steps**: {anything important for subsequent steps}

IMPORTANT:
- Load your skills FIRST before any implementation
- Do NOT read files outside the list provided
- Do NOT implement steps beyond this one
- Do NOT skip validation commands
- Focus ONLY on this step's requirements
            ]]>
          </specialist-prompt-template>
        </step>
        <step order="7" name="Subagent Execution" executor="Specialist">
          <action>Loads required skills from agent definition</action>
          <action>Reads necessary files</action>
          <action>Implements changes per step instructions with skill conventions</action>
          <action>Runs validation commands</action>
          <action>Verifies success criteria</action>
          <action>Returns structured results to orchestrator</action>
        </step>
        <step order="8" name="Process Subagent Results" executor="Orchestrator">
          <action>Capture full subagent response</action>
          <action>Parse structured results section</action>
          <extraction-items>
            <item>Status (success/failure)</item>
            <item>Specialist used and skills loaded</item>
            <item>Files modified/created with descriptions</item>
            <item>Conventions applied</item>
            <item>Validation command outputs</item>
            <item>Success criteria verification</item>
            <item>Errors/warnings</item>
            <item>Notes for next steps</item>
          </extraction-items>
        </step>
        <step order="9" name="Step Logging" executor="Orchestrator">
          <output-file>docs/{YYYY_MM_DD}/implementation/{feature-name}/0{N+2}-step-{N}-results.md</output-file>
          <contents>
            <item>Step metadata (number, title, timestamp, duration)</item>
            <item>Specialist used and skills loaded</item>
            <item>Subagent input (what was asked)</item>
            <item>Subagent output (full response)</item>
            <item>Parsed results summary</item>
            <item>Files modified/created</item>
            <item>Conventions applied</item>
            <item>Validation results</item>
            <item>Success criteria verification</item>
            <item>Any errors or warnings</item>
          </contents>
        </step>
        <step order="10" name="Update Todo Status" executor="Orchestrator">
          <conditional trigger="step succeeded">
            <then>Mark todo as "completed"</then>
            <else>Keep as "in_progress" and log error</else>
          </conditional>
        </step>
        <step order="11" name="Error Handling" executor="Orchestrator">
          <conditional trigger="subagent times out">
            <actions>
              <action>Log timeout error</action>
              <action>Mark step as failed</action>
              <action>Continue or abort based on severity</action>
            </actions>
          </conditional>
          <conditional trigger="subagent returns failure">
            <actions>
              <action>Log detailed error information</action>
              <action>Attempt to determine if blocking</action>
              <conditional trigger="--step-by-step mode">
                <then>Ask user how to proceed</then>
                <else>Continue or abort based on severity</else>
              </conditional>
            </actions>
          </conditional>
        </step>
        <step order="12" name="Step-by-Step Mode Check" executor="Orchestrator">
          <condition>if --step-by-step flag present</condition>
          <action>Use AskUserQuestion to ask user</action>
          <question>Step {N} completed {successfully/with errors} using {specialist-type}. Continue to next step?</question>
          <options>
            <option>Continue</option>
            <option>Skip next step</option>
            <option>Retry this step</option>
            <option>Abort implementation</option>
          </options>
          <action>Handle user response accordingly</action>
        </step>
        <step order="13" name="Update Index" executor="Orchestrator">
          <action>Append step summary to implementation index</action>
        </step>
        <step order="14" name="Progress Report" executor="Orchestrator">
          <output>Completed step {N}/{Total} - {step title} [{specialist-type}]</output>
        </step>
      </process>

      <resume-mode>
        <description>If --resume-from=N flag present, skip to step N and begin execution there.</description>
      </resume-mode>

      <context-management>
        <component name="Orchestrator">
          <description>Maintains minimal context (parsed plan, routing table, results summaries)</description>
        </component>
        <component name="Specialists">
          <description>Each gets fresh context with pre-loaded skills for their domain</description>
        </component>
        <result>Scalable to plans with 50+ steps without context overflow</result>
      </context-management>
    </phase>

    <phase number="4" name="Quality Gates Execution">
      <objective>Run all quality gates from the plan to ensure implementation quality.</objective>
      <architecture>Quality gates can run in orchestrator (simple) or delegated to test-specialist (complex tests).</architecture>

      <process>
        <step order="1">
          <action>Record quality gates start time with ISO timestamp</action>
        </step>
        <step order="2" name="Extract Quality Gates" executor="Orchestrator">
          <action>Parse quality gates section from plan</action>
          <action>Identify all validation commands and checks</action>
          <action>Assess complexity (simple commands vs complex test suites)</action>
        </step>
        <step order="3" name="Mark Quality Gate Todo" executor="Orchestrator">
          <action>Mark quality gates todo as "in_progress"</action>
        </step>
        <step order="4" name="Execute Quality Gates">
          <option name="A" label="Simple Validation" executor="Orchestrator runs directly">
            <condition>For basic commands (lint, typecheck, build)</condition>
            <actions>
              <action>Run validation commands using Bash tool</action>
              <command>npm run lint:fix</command>
              <command>npm run typecheck</command>
              <command>npm run build (if specified in plan)</command>
              <action>Capture all output</action>
              <action>Check pass/fail status</action>
            </actions>
          </option>
          <option name="B" label="Complex Testing" executor="Delegate to test-specialist">
            <condition>For comprehensive test suites (unit, integration, e2e)</condition>
            <actions>
              <action>Use Task tool with subagent_type: "test-specialist"</action>
              <description>Run quality gates and test suites</description>
              <subagent-handles>
                <item>Running tests</item>
                <item>Analyzing failures</item>
                <item>Suggesting fixes</item>
              </subagent-handles>
              <returns>
                <item>Test results</item>
                <item>Coverage reports</item>
                <item>Failure analysis</item>
              </returns>
            </actions>
          </option>
        </step>
        <step order="5" name="Database Validation" executor="Orchestrator">
          <condition>if plan involves database changes</condition>
          <action>Suggest running /db check schema to validate migrations</action>
          <action>Verify database integrity</action>
        </step>
        <step order="6" name="Integration Checks" executor="Orchestrator">
          <condition>if plan involves UI changes</condition>
          <action>Suggest running /ui-audit [page] to test user interactions</action>
        </step>
        <step order="7" name="Quality Gate Results" executor="Orchestrator">
          <output-file>docs/{YYYY_MM_DD}/implementation/{feature-name}/XX-quality-gates.md</output-file>
          <contents>
            <item>Quality gates metadata (timestamp, duration)</item>
            <item>Each gate result (pass/fail)</item>
            <item>Full output of all validation commands</item>
            <item>Test results (if applicable)</item>
            <item>Summary of issues found</item>
            <item>Blockers vs warnings categorization</item>
          </contents>
        </step>
        <step order="8" name="Gate Status Check" executor="Orchestrator">
          <conditional trigger="all gates pass">
            <then>Mark quality gates todo as "completed"</then>
            <else>
              <action>Log failure details</action>
              <action>Keep todo as "in_progress"</action>
              <action>Determine if blocking (critical vs non-critical failures)</action>
              <action>Provide recommendations for fixes</action>
            </else>
          </conditional>
        </step>
        <step order="9" name="Update Index" executor="Orchestrator">
          <action>Append quality gates summary to implementation index</action>
        </step>
      </process>
    </phase>

    <phase number="5" name="Implementation Summary and Completion">
      <objective>Generate comprehensive implementation report and offer next steps.</objective>

      <process>
        <step order="1">
          <action>Record completion time with ISO timestamp</action>
        </step>
        <step order="2" name="Calculate Statistics">
          <statistics>
            <stat>Total execution time</stat>
            <stat>Number of steps completed</stat>
            <stat>Number of files modified/created</stat>
            <stat>Number of validation commands run</stat>
            <stat>Quality gates status (X/Y passed)</stat>
            <stat>Specialist usage breakdown (e.g., "3 steps: database-specialist-xml, 2 steps: server-component-specialist-xml, 1 step: client-component-specialist-xml")</stat>
          </statistics>
        </step>
        <step order="3" name="Generate Change Summary">
          <action>List all files modified with brief descriptions</action>
          <action>List all files created</action>
          <action>Summarize major changes by category (components, actions, queries, etc.)</action>
          <action>List skills that were applied</action>
        </step>
        <step order="4" name="Review Todos">
          <action>Count completed todos</action>
          <action>List any incomplete todos</action>
          <action>Identify any failures or blockers</action>
        </step>
        <step order="5" name="Create Implementation Summary">
          <output-file>docs/{YYYY_MM_DD}/implementation/{feature-name}/YY-implementation-summary.md</output-file>
          <contents>
            <item>Complete execution metadata (start, end, duration)</item>
            <item>Implementation plan reference</item>
            <item>Execution mode used</item>
            <item>Steps completed (N/Total)</item>
            <item>Specialist routing summary</item>
            <item>Skills applied per step</item>
            <item>Files changed summary</item>
            <item>Quality gates results</item>
            <item>Known issues or warnings</item>
            <item>Recommendations for next steps</item>
          </contents>
        </step>
        <step order="6" name="Update Index">
          <action>Finalize implementation index with summary</action>
        </step>
        <step order="7" name="Git Commit Offer">
          <condition>if all quality gates passed</condition>
          <action>Use AskUserQuestion to ask</action>
          <question>Implementation complete! Create a git commit?</question>
          <options>
            <option>Yes, commit all changes</option>
            <option>No, I'll commit manually</option>
            <option>Show me git diff first</option>
          </options>
          <conditional trigger="user chooses commit">
            <commit-message-template>
              <![CDATA[
feat: [Feature name from plan]

[Brief description of implementation]

Implementation plan: docs/{date}/plans/{feature-name}-implementation-plan.md
Implementation log: docs/{date}/implementation/{feature-name}/

Steps completed:
- [Step 1 title] (database-specialist-xml)
- [Step 2 title] (server-action-specialist-xml)
...

Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
              ]]>
            </commit-message-template>
            <action>Use git commit process from Bash tool instructions</action>
          </conditional>
        </step>
        <step order="8" name="Worktree Cleanup">
          <condition>if --worktree flag was used</condition>
          <action>Use AskUserQuestion to ask user how to handle the worktree</action>
          <question>Implementation complete in worktree. How would you like to proceed?</question>
          <options>
            <option name="1" label="Merge to main branch and remove worktree">
              <description>Merges feature branch to original branch, removes worktree</description>
              <actions>
                <action>Change directory back to original working directory</action>
                <action>Run git checkout {original-branch} (from pre-checks log)</action>
                <action>Run git merge feat/{feature-slug} --no-ff -m "Merge feature: {feature-name}"</action>
                <conditional trigger="merge successful">
                  <then>
                    <action>Run git worktree remove .worktrees/{feature-slug}</action>
                    <action>Run git branch -d feat/{feature-slug} (delete feature branch)</action>
                    <action>Confirm merge and cleanup complete</action>
                  </then>
                  <else>
                    <action>List conflict files</action>
                    <action>Offer to abort merge or let user resolve manually</action>
                  </else>
                </conditional>
              </actions>
            </option>
            <option name="2" label="Push branch and create PR">
              <description>Pushes feature branch to remote, offers to remove worktree</description>
              <actions>
                <action>Ensure commit was made (from step 7)</action>
                <action>Run git push -u origin feat/{feature-slug}</action>
                <action>Offer to create PR using gh pr create (if gh CLI available)</action>
                <action>Use AskUserQuestion to ask: "Remove worktree now or keep for testing?"</action>
                <conditional trigger="Remove">
                  <then>Run git worktree remove .worktrees/{feature-slug} from original directory</then>
                  <else>Leave worktree in place</else>
                </conditional>
              </actions>
            </option>
            <option name="3" label="Keep worktree for testing">
              <description>Leaves worktree in place for manual testing/review</description>
              <actions>
                <action>Output message: "Worktree kept at: {worktree-path}"</action>
                <action>Provide instructions: "To return to worktree: cd {worktree-path}"</action>
                <action>Provide cleanup command: "To remove later: git worktree remove {worktree-path}"</action>
              </actions>
            </option>
            <option name="4" label="Remove worktree only">
              <description>Deletes worktree but keeps feature branch</description>
              <actions>
                <action>Change directory back to original working directory</action>
                <action>Run git worktree remove .worktrees/{feature-slug}</action>
                <action>Output message: "Worktree removed. Feature branch 'feat/{feature-slug}' preserved."</action>
                <action>Provide merge instruction: "To merge later: git merge feat/{feature-slug}"</action>
              </actions>
            </option>
          </options>
          <action>Log worktree cleanup action to implementation summary</action>
        </step>
        <step order="9" name="Final Output to User">
          <output-template>
            <![CDATA[
## Implementation Complete

Completed {N}/{Total} steps successfully
Modified {X} files, created {Y} files
Quality gates: {Z} passed, {W} failed
Specialists used: {breakdown}
{IF WORKTREE}
Worktree: {worktree-action-taken}
Branch: feat/{feature-slug}
{END IF}

Implementation log: docs/{date}/implementation/{feature-name}/
- 00-implementation-index.md - Navigation and overview
- 01-pre-checks.md - Pre-implementation validation
- 02-setup.md - Setup, routing table, and specialist assignments
- 03-step-1-results.md - Step 1 execution log (database-specialist-xml)
...
- XX-quality-gates.md - Quality validation results
- YY-implementation-summary.md - Complete summary

Execution time: X.X minutes

[Any warnings or next steps]
            ]]>
          </output-template>
        </step>
      </process>
    </phase>
  </phase-details>

  <error-recovery-and-resilience>
    <section name="Step Failure Handling">
      <step order="1">
        <action>Capture full error details (message, stack trace, context)</action>
      </step>
      <step order="2">
        <action>Log error to step results file including which specialist was used</action>
      </step>
      <step order="3" name="Attempt automatic recovery">
        <recovery-action trigger="validation failure">
          <action>Show validation output and suggest fixes</action>
        </recovery-action>
        <recovery-action trigger="file not found">
          <action>Suggest creating file or checking plan</action>
        </recovery-action>
        <recovery-action trigger="dependency missing">
          <action>Suggest installation command</action>
        </recovery-action>
        <recovery-action trigger="skill loading failed">
          <action>Retry with explicit skill paths</action>
        </recovery-action>
      </step>
      <step order="4" name="If recovery not possible">
        <action>Mark step as failed in todo</action>
        <action>Continue to next step OR abort based on severity</action>
        <action>Log failure reason clearly</action>
      </step>
    </section>

    <section name="Quality Gate Failure Handling">
      <step order="1">
        <action>Identify which gate failed (lint, typecheck, test, build)</action>
      </step>
      <step order="2">
        <action>Show relevant error output</action>
      </step>
      <step order="3">
        <action>Categorize as blocker vs warning</action>
      </step>
      <step order="4" name="Provide specific recommendations">
        <recommendation trigger="lint failures">Run npm run lint:fix to see issues</recommendation>
        <recommendation trigger="type errors">Check files with type issues: [list]</recommendation>
        <recommendation trigger="test failures">Review failed test output above</recommendation>
        <recommendation trigger="build failures">Build errors must be fixed before deployment</recommendation>
      </step>
      <step order="5" name="Ask user">
        <options>
          <option>Attempt automatic fixes</option>
          <option>Abort and fix manually</option>
          <option>Continue anyway (if non-blocking)</option>
        </options>
      </step>
    </section>

    <section name="Rollback Capability">
      <condition>If major failure occurs</condition>
      <conditional trigger="in worktree">
        <then>Offer to remove entire worktree (clean rollback)</then>
        <else>
          <action>Suggest using git diff to review changes</action>
          <action>Offer to git restore specific files</action>
          <action>Recommend git stash to save partial work</action>
        </else>
      </conditional>
      <constraint>Never automatically discard work without user confirmation</constraint>
    </section>
  </error-recovery-and-resilience>

  <implementation-details>
    <section name="Critical Requirements">
      <requirement type="architecture">ORCHESTRATOR PATTERN: This command is a lightweight coordinator, NOT a direct implementer</requirement>
      <requirement type="routing">SPECIALIST ROUTING: Each step routed to domain-specific specialist with pre-loaded skills</requirement>
      <requirement type="skills">SKILL AUTO-LOADING: Specialists automatically load relevant skills from their agent definitions</requirement>
      <requirement type="isolation">WORKTREE ISOLATION: Optional git worktree creation for isolated feature development with automated cleanup</requirement>
      <requirement type="safety">SAFETY FIRST: Never execute on main or production branches without explicit confirmation (worktrees bypass this with new branches)</requirement>
      <requirement type="execution">SYSTEMATIC EXECUTION: Execute steps in order, one at a time, via specialist delegation</requirement>
      <requirement type="validation">VALIDATION ENFORCEMENT: Specialists always run lint:fix and typecheck for code changes</requirement>
      <requirement type="todo">TODO MANAGEMENT: Orchestrator keeps todo list updated in real-time (ONE in_progress at a time)</requirement>
      <requirement type="logging">COMPREHENSIVE LOGGING: Orchestrator saves detailed logs including specialist and skills used</requirement>
      <requirement type="error">ERROR RECOVERY: Handle subagent errors gracefully with clear user guidance</requirement>
      <requirement type="quality">QUALITY ASSURANCE: Enforce quality gates before completion</requirement>
      <requirement type="context">CONTEXT EFFICIENCY: Orchestrator maintains minimal context, specialists use fresh context per step</requirement>
      <requirement type="scalability">SCALABILITY: Can handle plans with 50+ steps without context overflow</requirement>
    </section>

    <section name="Quality Standards">
      <standard>All code must pass lint and typecheck</standard>
      <standard>All modified files must follow project conventions (enforced by specialist skills)</standard>
      <standard>All success criteria must be verified</standard>
      <standard>All validation commands must be executed</standard>
      <standard>All changes must be logged with rationale and skills applied</standard>
    </section>

    <section name="Logging Requirements">
      <requirement name="Human-Readable Format">Use markdown with clear headers and sections</requirement>
      <requirement name="Complete Data Capture">Full validation output, error messages, changes made</requirement>
      <requirement name="Specialist Tracking">Log which specialist and skills were used for each step</requirement>
      <requirement name="Incremental Saves">Save logs after each step completes</requirement>
      <requirement name="Navigation Structure">Index file with links to all logs</requirement>
      <requirement name="Timestamp Precision">ISO format timestamps for all events</requirement>
      <requirement name="Change Tracking">Document what changed, why, and verification results</requirement>
    </section>

    <section name="Performance Optimization">
      <optimization target="Orchestrator">Minimal context usage, fast coordination</optimization>
      <optimization target="Specialists">Fresh context per step with pre-loaded domain skills</optimization>
      <optimization target="Parallel Potential">Independent steps could run in parallel (future enhancement)</optimization>
      <optimization target="Batch Operations">Orchestrator batches pre-checks and setup operations</optimization>
      <optimization target="Context Isolation">Each specialist only loads files needed for its step</optimization>
      <optimization target="Scalable Architecture">Linear context growth instead of exponential</optimization>
    </section>

    <section name="User Experience">
      <feature>Clear progress indicators ("Step N/Total [{specialist}]")</feature>
      <feature>Concise status updates after each step with specialist used</feature>
      <feature>Detailed logs available for review</feature>
      <feature>Helpful error messages with actionable guidance</feature>
      <feature>Offer next steps upon completion</feature>
    </section>
  </implementation-details>

  <file-output-structure>
    <directory path="docs/{YYYY_MM_DD}/implementation/{feature-name}/">
      <file name="00-implementation-index.md" description="Navigation, routing table, and workflow overview" />
      <file name="01-pre-checks.md" description="Pre-implementation validation results" />
      <file name="02-setup.md" description="Setup, step-type detection, and specialist routing" />
      <file name="03-step-1-results.md" description="Step 1 execution log (includes specialist + skills)" />
      <file name="04-step-2-results.md" description="Step 2 execution log (includes specialist + skills)" />
      <file name="..." description="..." />
      <file name="XX-quality-gates.md" description="Quality gate validation results" />
      <file name="YY-implementation-summary.md" description="Final summary with specialist breakdown" />
    </directory>

    <index-file-template name="00-implementation-index.md">
      <![CDATA[
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

| Step | Specialist | Skills Loaded |
|------|------------|---------------|
| 1. {title} | database-specialist-xml | database-schema, drizzle-orm, validation-schemas |
| 2. {title} | server-action-specialist-xml | server-actions, sentry-monitoring, validation-schemas |
| ... | ... | ... |

## Navigation

- [Pre-Implementation Checks](./01-pre-checks.md)
- [Setup and Routing](./02-setup.md)
- [Step 1: {title}](./03-step-1-results.md) [database-specialist-xml]
- [Step 2: {title}](./04-step-2-results.md) [server-action-specialist-xml]
  ...
- [Quality Gates](./XX-quality-gates.md)
- [Implementation Summary](./YY-implementation-summary.md)

## Quick Status

| Step | Specialist | Status | Duration | Issues |
|------|------------|--------|----------|--------|
| 1. {title} | database-specialist-xml | done | 2.3s | None |
| 2. {title} | server-action-specialist-xml | done | 5.1s | None |

...

## Summary

{Brief summary of implementation results}
      ]]>
    </index-file-template>
  </file-output-structure>

  <integration-with-other-commands>
    <section name="Automatic Integration">
      <integration trigger="plan involves database changes">Automatically offer to run /db operations</integration>
      <integration trigger="plan involves UI changes">Suggest running /ui-audit after implementation</integration>
      <integration trigger="plan involves new features">Reference /plan-feature for future enhancements</integration>
    </section>

    <section name="Command Chaining Example">
      <example>
        <comment>Complete feature workflow</comment>
        <command>/plan-feature "Add real-time notifications"</command>
        <comment>Review generated plan</comment>
        <command>/implement-plan docs/2025_11_11/plans/add-real-time-notifications-implementation-plan.md</command>
        <comment>After implementation</comment>
        <command>/ui-audit /notifications</command>
      </example>
    </section>
  </integration-with-other-commands>

  <specialist-communication-protocol>
    <section name="Input to Specialist Subagent">
      <source>from orchestrator</source>
      <fields>
        <field>Step number and title</field>
        <field>Specialist type and skills to load</field>
        <field>What: Description of changes needed</field>
        <field>Why: Rationale for the changes</field>
        <field>Files: List of file paths to modify/create</field>
        <field>Validation commands: Commands to run for verification</field>
        <field>Success criteria: Criteria to check</field>
        <field>Previous step context: Summary of what previous step did (if dependent)</field>
        <field>Multi-domain note: If step spans multiple domains</field>
      </fields>
    </section>

    <section name="Output from Specialist Subagent">
      <destination>to orchestrator</destination>
      <fields>
        <field>Status: success | failure</field>
        <field>Specialist used and skills loaded</field>
        <field>Files modified: List with descriptions of changes</field>
        <field>Files created: List with descriptions</field>
        <field>Conventions applied: Key patterns from skills</field>
        <field>Validation results: Command outputs with pass/fail status</field>
        <field>Success criteria: Verification of each criterion</field>
        <field>Errors/warnings: Any issues encountered</field>
        <field>Notes: Information for subsequent steps</field>
      </fields>
    </section>

    <section name="Architecture Benefits">
      <benefit order="1">Automatic Skill Loading: Specialists know which skills to load for their domain</benefit>
      <benefit order="2">Convention Enforcement: Skills ensure consistent code patterns</benefit>
      <benefit order="3">Context Isolation: Each step has clean, isolated context</benefit>
      <benefit order="4">Scalability: Can handle 50+ step plans without context overflow</benefit>
      <benefit order="5">Error Containment: Failures isolated to individual steps</benefit>
      <benefit order="6">Parallel Potential: Future enhancement could run independent steps concurrently</benefit>
      <benefit order="7">Debugging: Clear logs show which specialist and skills were used</benefit>
      <benefit order="8">Resource Efficiency: Only load files and skills needed per step</benefit>
    </section>
  </specialist-communication-protocol>

  <notes>
    <note>This command is designed to work seamlessly with plans generated by /plan-feature</note>
    <note type="architecture">Uses orchestrator + specialist subagent pattern with automatic skill loading</note>
    <note type="specialists">9 domain-specific agents with pre-configured skills for their area (XML versions)</note>
    <note>Always review the implementation plan before executing to ensure it's current</note>
    <note>Use --step-by-step mode for complex or risky implementations</note>
    <note>Use --dry-run mode to preview changes and specialist routing before applying them</note>
    <note>Use --worktree mode for isolated feature development with these benefits:</note>
    <worktree-benefits>
      <benefit>Complete isolation from main codebase</benefit>
      <benefit>Safe experimentation without affecting working directory</benefit>
      <benefit>Easy rollback by removing entire worktree</benefit>
      <benefit>Automatic dependency installation (npm install)</benefit>
      <benefit>Flexible cleanup options (merge, PR, keep, or remove)</benefit>
    </worktree-benefits>
    <note type="worktree-location">Created at .worktrees/{feature-slug}/ (gitignored by default)</note>
    <note type="worktree-branch">Uses feat/{feature-slug} naming convention</note>
    <note>Implementation logs provide complete audit trail including specialists and skills used</note>
    <note>Quality gates are enforced but non-blocking warnings won't stop execution</note>
    <note>Git commit is offered but optional - you can commit manually if preferred</note>
    <note type="scalability">Tested architecture can handle plans with 50+ steps efficiently</note>
  </notes>
</command-definition>
