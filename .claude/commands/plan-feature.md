---
allowed-tools: Bash(git status, npm run)
description: "Create detailed implementation plan for a feature"
argument-hint: "feature-description"
---

# Feature Planning: $ARGUMENTS

## Project Health Check
!`git status --porcelain`
!`npm run typecheck 2>&1 | head -5`
!`npm run lint 2>&1 | head -5`

## Current Codebase Context
@CLAUDE.MD
@package.json

## Planning Task

Create a detailed implementation plan for: **$ARGUMENTS**

Your plan should include:

1. **Requirements Analysis** - What exactly needs to be built
2. **File Changes** - Which specific files need to be created/modified
3. **Implementation Steps** - Numbered steps in logical order
4. **Quality Checkpoints** - Where to run lint/typecheck during development
5. **Testing Strategy** - What needs to be tested

Make this plan detailed enough that another developer (or AI) could follow it step-by-step.

**Important:** This is PLANNING only - do not write any code yet.