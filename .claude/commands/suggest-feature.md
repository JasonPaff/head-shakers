---
argument-hint: [page/component] [feature-type] [priority-level]
description: Suggest a new feature for a specific part of the application
model: sonnet
---

# Task: Suggest New Features

You must invoke the **feature-suggester** agent to analyze the codebase and provide three distinct feature suggestions.

## Context

Project: Head Shakers - Bobblehead Collection Platform
Review project guidelines: @CLAUDE.md

## Parameters

- **Target area**: {{$1}} (e.g., "bobbleheads/add", "collections", "dashboard", "user-profile")
- **Feature type**: {{$2}} (e.g., "accessibility", "performance", "UX", "integration", "analytics")
- **Priority level**: {{$3}} (e.g., "quick-win", "strategic", "experimental")

## Priority Definitions

- **quick-win**: 1-2 weeks implementation, high impact, low complexity, uses existing infrastructure
- **strategic**: 1-2 months implementation, long-term value, medium complexity, aligns with product roadmap
- **experimental**: 2-4 months implementation, innovative approach, higher complexity, requires validation

## Your Task

Invoke the `feature-suggester` agent using the Task tool with the following prompt:

```
Analyze the Head Shakers codebase and provide three distinct feature suggestions for the following:

Target Area: {{$1}}
Feature Type: {{$2}}
Priority Level: {{$3}}

Please analyze all relevant files in the {{$1}} area, focusing specifically on {{$2}} improvements.

Provide three distinct suggestions:
- Option A: Quick Win (1-2 weeks)
- Option B: Strategic (1-2 months)
- Option C: Experimental (2-4 months)

For each option, include:
- Feature name and description
- Impact scores (User Value, Business Value, Technical Feasibility)
- Key benefits
- Implementation estimate

Save the suggestions to: docs/{YYYY_MM_DD}/suggestions/feature-suggestion-{{$1-sanitized}}-{timestamp}.md

After analysis, provide your recommendation for which option best fits the {{$3}} priority level.
```

## Expected Output

The agent will:
1. Analyze the target area of the codebase
2. Generate three distinct feature suggestions with impact analysis
3. Save structured documentation to `docs/{YYYY_MM_DD}/suggestions/`
4. Provide a recommendation

After the agent completes, summarize the suggestions and provide the path to the saved documentation file.
