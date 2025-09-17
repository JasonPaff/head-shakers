# Simplified Feature Planning Command

When the user runs `/plan-feature "task description"`, execute this workflow:

## Quick Execution Steps

1. **Get Directory Structure**
   ```bash
   find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -maxdepth 4
   ```

2. **Find Relevant Files**
   - Search for files related to the task using Grep tool
   - Look for components, APIs, utilities, and config files
   - Limit to 20 most relevant files

3. **Read Key Files**
   - Use Read tool on the most relevant files
   - Focus on understanding the architecture

4. **Generate Implementation Plan**
   - Use Task tool with subagent_type: "general-purpose"
   - Include all the context gathered
   - Request an XML-formatted implementation plan

5. **Save and Return**
   - Save plan to `docs/YYYY_MM_DD/plans/feature-name-plan.md`
   - Return summary to user

## Example Task Tool Usage

```
Task(
    subagent_type="general-purpose",
    description="Generate implementation plan",
    prompt="""
    Generate a detailed implementation plan for: [TASK]

    Project: Head Shakers (Next.js 15, React 19, PostgreSQL, Drizzle ORM)

    Relevant files found:
    [LIST OF FILES]

    File contents:
    [KEY FILE CONTENTS]

    Create an XML implementation plan following this format:
    <implementation_plan>
      <steps>
        <step number="1">
          <title>Step title</title>
          <description>What to do</description>
          <file_operations>
            <operation type="create|modify">
              <path>file/path</path>
              <changes>Specific changes</changes>
            </operation>
          </file_operations>
        </step>
      </steps>
    </implementation_plan>
    """
)
```

## Success Criteria
- Plan includes specific file operations
- All file paths are validated
- Plan addresses the original request
- Documentation is saved properly