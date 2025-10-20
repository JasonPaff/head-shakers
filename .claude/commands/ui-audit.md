---
description: Launch UI/UX audit agent to test all user interactions on a specific page
argument-hint: [page-route]
---

# UI Audit Command (/ui-audit)

Launches the specialized UI/UX audit agent to comprehensively test all user interactions on a specific page, identify bugs, and document user flows.

## Usage

```
/ui-audit [page-route]
```

## Examples

```
/ui-audit /feature-planner/agents
/ui-audit /dashboard
/ui-audit /bobbleheads/add
/ui-audit /collections
```

## What the Agent Does

The `ui-ux-agent` will:

1. **Navigate to the page** using Playwright MCP tools
2. **Test all user interactions** including:
    - Forms and input fields
    - Buttons and clickable elements
    - Navigation and routing
    - Modals and dialogs
    - Data tables and lists
    - Search and filtering
    - CRUD operations
3. **Use `/db` command** to:
    - Query database state before/after operations
    - Verify data persistence
    - Check data integrity
    - Test with different user scenarios
4. **Document findings** in a structured audit report including:
    - Complete user flow diagrams
    - Identified bugs and issues
    - UX/UI improvement recommendations
    - Accessibility concerns
    - Performance observations

## Audit Report Location

The agent will create a detailed audit report in:

```
docs/{YYYY_MM_DD}/audits/ui-audit-{page-name}.md
```

## Features

- **Comprehensive Testing**: Tests all interactive elements on the page
- **Database Integration**: Uses `/db` to verify data operations
- **Bug Detection**: Identifies broken functionality, console errors, and UX issues
- **User Flow Documentation**: Maps out all possible user interactions
- **Accessibility Review**: Checks for basic accessibility compliance
- **Performance Insights**: Notes any performance concerns

## Prerequisites

Before running the audit:

- Ensure the development server is running (`npm run dev`)
- Database should be seeded with test data
- Clerk authentication should be configured

## Agent Details

- **Agent Name**: `ui-ux-agent`
- **Model**: Sonnet (optimal for comprehensive testing)
- **Tools**: Playwright MCP, SlashCommand (/db), Read, Write, Bash
- **Scope**: Single page comprehensive audit

Launch the UI/UX audit agent for comprehensive page testing.

**Page Route**: {{$1}}

You must invoke the `ui-ux-agent` subagent using the Task tool to perform a comprehensive UI/UX audit of the page: {{$1}}

Provide the following context to the agent:

## Page Information

- **Route**: {{$1}}
- **Project**: Head Shakers - Bobblehead Collection Platform
- **Base URL**: http://localhost:3000 (development server)
- **Authentication**: Uses Clerk (agent may need to handle auth flow)

## Testing Scope

The agent should test ALL user interactions including:

- All forms and input validation
- All buttons and their actions
- Navigation elements and routing
- Modals, dialogs, and overlays
- Data display and formatting
- Search, filter, and sort functionality
- CRUD operations (Create, Read, Update, Delete)
- Error states and edge cases
- Loading states and async operations
- Responsive behavior (if applicable)

## Database Integration

The agent MUST use the `/db` slash command to:

- Query current database state before operations
- Verify data persistence after operations
- Test with different data scenarios
- Check data integrity and relationships
- Validate authorization rules

## Output Requirements

The agent must create a comprehensive audit report saved to:
`docs/{YYYY_MM_DD}/audits/ui-audit-{sanitized-route-name}.md`

The report should include:

1. **Executive Summary** - Overview of page functionality and audit scope
2. **User Flow Documentation** - Complete diagrams/descriptions of all user paths
3. **Bugs & Issues** - Categorized by severity (Critical, High, Medium, Low)
4. **UX/UI Recommendations** - Suggested improvements for user experience
5. **Accessibility Concerns** - WCAG compliance issues
6. **Performance Observations** - Loading times, responsiveness issues
7. **Database Verification** - Results of data integrity checks
8. **Test Coverage Summary** - What was tested and what couldn't be tested

## Important Notes

- The agent should start the browser using Playwright MCP tools
- Use `browser_snapshot` to understand page structure before interacting
- Take screenshots of any bugs or issues found
- Use the `/db` command liberally to verify data operations
- Document ALL findings, even minor ones
- Focus on user perspective - what would a real user experience?

Invoke the ui-ux-agent now with this context and page route.