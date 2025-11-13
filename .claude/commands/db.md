---
argument-hint: 'operation description'
description: Quick access to the Neon Database Expert subagent for Head Shakers project database operations
model: haiku
---

You must invoke the **neon-db-expert** subagent using the Task tool to handle this database operation.

**User's Request:** {{$ARGUMENTS}}

**Instructions:**

1. Use the Task tool with `subagent_type: "neon-db-expert"`
2. Pass the user's complete request to the agent
3. The agent will automatically:
   - Validate project ID (`misty-boat-49919732`)
   - Apply database name (`head-shakers`)
   - Use development branch by default (`br-dark-forest-adf48tll`)
   - Protect production branch from unsafe operations
   - Log all operations to `docs/{YYYY_MM_DD}/database/validation-log.md`

**Important:** Do not attempt to handle database operations directly. Always delegate to the neon-db-expert subagent.
