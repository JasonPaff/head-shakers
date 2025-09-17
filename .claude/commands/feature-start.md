---
allowed-tools: Bash(git status, git branch, npm run)
---

# Start Feature Development: $ARGUMENTS

## Current Git Status
!`git status --porcelain`

## Current Branch
!`git branch --show-current`

## Quick Health Check
!`npm run lint:fix 2>&1 | head -10`

## Project Context
@CLAUDE.MD
@package.json

Now help me start development on: $ARGUMENTS

Please:
1. Tell me if my project is in a good state to start (based on git status and lint results)
2. Analyze what needs to be built for this feature
3. Suggest which files might need changes
4. Create a simple 3-4 step plan
5. Recommend if I should create a new branch

Keep it focused and actionable.