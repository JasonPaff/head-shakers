# Programmatic Agents Configuration - Refactoring Proposal

## Current Approach

We manually build specialized agent prompts and execute them individually:
- 14 specialized agents defined in SPECIALIZED_AGENTS array
- Each agent has custom prompt building logic
- Parallel execution via Promise.all

## SDK Native Approach

The Claude SDK supports programmatic agent definitions via the `agents` option:

```typescript
const agents = {
  'database-schema-agent': {
    description: 'Database schemas, migrations, and ORM models',
    tools: ['Read', 'Glob', 'Grep'],
    prompt: 'System prompt for database agent...',
    model: 'inherit',
  },
  // ... 13 more agents
};

for await (const message of query({
  options: { agents },
  prompt: 'Analyze this feature request...',
})) {
  // SDK handles agent orchestration
}
```

## Benefits

1. **SDK Orchestration**: SDK handles agent selection and coordination
2. **Less Code**: Remove manual agent execution logic
3. **Better Caching**: SDK can optimize agent context caching
4. **Native Support**: Aligned with SDK design patterns

## Considerations

1. **Control Loss**: Less control over agent execution order
2. **Unknown Behavior**: How does SDK select which agents to use?
3. **Parallel Execution**: Does SDK run agents in parallel or sequentially?
4. **Response Format**: How are multi-agent responses aggregated?

## Recommendation

**Status:** Research Required

Before implementing:
1. Test SDK agent orchestration behavior
2. Verify parallel execution capabilities
3. Confirm response aggregation format
4. Ensure file discovery results meet requirements

**Timeline:** Future optimization (Phase 2)
