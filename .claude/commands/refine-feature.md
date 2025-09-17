---
description: "Refine a rough feature idea into a clear detailed prompt"
argument-hint: "rough-feature-description"
---

# Feature Refinement: $ARGUMENTS

## Project Context
@CLAUDE.MD
@package.json

Take this rough feature idea: **$ARGUMENTS**

Refine it into a clear, detailed feature description that includes:

1. **What** - Exactly what functionality to build
2. **Who** - What type of user this is for
3. **Why** - What problem this solves
4. **Scope** - What's included and what's NOT included
5. **Success Criteria** - How we know it's working correctly

Make this description clear enough to hand off to a developer for planning.

**Output this as a clean, refined feature description that can be copy/pasted.**