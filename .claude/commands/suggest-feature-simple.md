---
argument-hint: [page/component] [feature-type] [priority-level]
description: Suggest a new feature for a specific part of the application
tools: Read, Grep, Glob, Bash(git log:*), Bash(git diff:*)
---

# Task: Suggest a New Feature

## Context

First, review the project guidelines:
@CLAUDE.md

## Parameters
- **Target area**: $1
- **Feature type**: $2 (e.g., "accessibility", "performance", "UX", "integration", "analytics")
- **Priority**: $3 (e.g., "quick-win", "strategic", "experimental")

## Instructions

1. Analyze all files related to "$1"
2. Focus specifically on **$2** improvements
3. Suggest ONE feature aligned with **$3** priority level:
    - **quick-win**: Can be built in 1-2 weeks, high impact
    - **strategic**: Long-term value, aligns with product roadmap
    - **experimental**: Innovative, may require validation

## Output Format

**Feature**: [Name]
**Why**: [User value and business impact]
**Type**: [Matches requested $2]
**Priority Fit**: [How it aligns with $3]

NO implementation details.