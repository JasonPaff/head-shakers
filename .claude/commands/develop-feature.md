---
description: "Complete feature development workflow - refine idea then create plan"
argument-hint: "rough-feature-description"
---

# Feature Development Workflow: $ARGUMENTS

## Step 1: Feature Refinement

First, let me refine your rough idea into a clear feature description.

**Rough idea:** $ARGUMENTS

## Project Context for Refinement
@CLAUDE.MD
@package.json

**Refined Feature Description:**
[Refine the rough idea above into a clear, detailed feature description with What/Who/Why/Scope/Success Criteria]

---

## Step 2: Implementation Planning

Now I'll create a detailed implementation plan for the refined feature.

## Project Health Check
!`git status --porcelain`
!`npm run typecheck 2>&1 | head -20`
!`npm run lint:fix 2>&1 | head -20`

## Codebase Context for Planning
@CLAUDE.MD
@package.json

**Implementation Plan:**
[Create detailed implementation plan with Requirements/Files/Steps/Quality Checkpoints/Testing]

**Remember:** This is planning only - no code implementation yet.