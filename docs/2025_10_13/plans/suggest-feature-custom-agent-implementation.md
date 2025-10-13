# Suggest Feature Custom Agent - Implementation Plan

**Date**: October 13, 2025
**Feature**: Enable custom agent configuration for Suggest Feature functionality
**Status**: Planning

## Overview

This document outlines the implementation plan for updating the "Suggest Feature" component in the feature planner to use a customizable agent with editable prompts and settings that persist to the database, similar to how the feature request refinement uses custom agents.

### Key Decision: Table Rename

As part of this implementation, we're renaming the `refinement_agents` table to `custom_agents` to better reflect its purpose:
- **Rationale**: The table now stores user-configured agents for multiple purposes (refinement, feature-suggestion, and potentially more in the future)
- **Benefits**:
  - More semantically accurate naming
  - Future-proof for additional agent types
  - Clearer code semantics around customization
- **Impact**: Requires migration of database table and updates to all code references

## Current State Analysis

### Existing Implementation

**Suggest Feature Dialog** (`src/app/(app)/feature-planner/components/feature-suggestion-dialog.tsx`):
- Modal dialog with form for inputting feature suggestion parameters
- Displays AI-generated suggestions with title, rationale, description, and implementation considerations
- Currently calls `suggestFeatureAction` server action

**Suggest Feature Hook** (`src/app/(app)/feature-planner/hooks/use-suggest-feature.ts`):
- Manages dialog state and suggestion results
- Calls `suggestFeatureAction` with parameters: `pageOrComponent`, `featureType`, `priorityLevel`, `additionalContext`

**Backend Service** (`src/lib/services/feature-planner.service.ts:281-391`):
- `executeFeatureSuggestionAgent` method
- **Current approach**: Builds a simple prompt invoking `/suggest-feature` slash command
- Hardcoded to use Claude SDK's `query()` function with fixed settings
- Does NOT support custom agent configuration

**Custom Agents** (Comparison):
- Database table: `feature_planner.custom_agents` (stores all agent types: refinement, feature-suggestion)
- Fields: `agentId`, `agentType`, `name`, `role`, `focus`, `systemPrompt`, `temperature`, `tools`, `userId`, `isActive`, `isDefault`
- Service method: `executeRefinementAgent` accepts optional `agent` parameter
- Uses `buildRoleBasedRefinementPrompt` when agent is provided
- CRUD operations: `manage-refinement-agents.action.ts`
- UI: `/feature-planner/agents` page for management

### Key Differences to Address

1. **Agent Storage**: Suggest feature currently has NO agent configuration in database
2. **Service Method**: No support for custom agent parameter
3. **Prompt Building**: Uses slash command instead of custom system prompt
4. **UI Management**: No UI for managing suggest feature agent settings

## Requirements

### Functional Requirements

1. **Single Custom Agent**: Users can configure ONE custom agent for feature suggestions
2. **Editable Properties**:
   - Name (display name)
   - System Prompt (instructions for AI)
   - Temperature (0.0 - 2.0)
   - Tools (Read, Grep, Glob)
3. **Persistence**: Agent configuration persists to database per user
4. **UI Access**: Agent settings accessible from feature planner page

### Technical Requirements

1. **Database Schema**: Store suggest feature agent configurations
2. **Service Layer**: Update `executeFeatureSuggestionAgent` to support custom agents
3. **Actions Layer**: CRUD operations for suggest feature agents
4. **UI Layer**: Management interface for agent configuration
5. **Validation**: Zod schemas for type safety

## Implementation Plan

### Phase 1: Database Schema

**File**: `src/lib/db/schema/feature-planner.schema.ts`

**Decision**: Rename existing `refinement_agents` table to `custom_agents`
- Rationale: The table stores user-configured agents for multiple purposes (refinement, feature-suggestion, future types)
- `custom_agents` is more semantically accurate and future-proof
- Add `agentType` field to distinguish agent purposes
- Values: `'refinement' | 'feature-suggestion'`
- Constraint: Only ONE active agent per user per type

**Schema Changes**:
```typescript
export const customAgents = featurePlannerSchema.table(
  'custom_agents',
  {
    agentId: varchar('agent_id', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).primaryKey(),
    agentType: varchar('agent_type', { length: 50 }).default('refinement').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    focus: text('focus').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    name: varchar('name', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    role: varchar('role', { length: SCHEMA_LIMITS.REFINEMENT.AGENT_ID.MAX }).notNull(),
    systemPrompt: text('system_prompt').notNull(),
    temperature: numeric('temperature', { precision: 3, scale: 2 }).notNull(),
    tools: jsonb('tools').$type<Array<string>>().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    // ... existing checks ...
    check('custom_agents_agent_type_valid', sql`${table.agentType} IN ('refinement', 'feature-suggestion')`),

    // ... existing indexes ...
    index('custom_agents_agent_type_idx').on(table.agentType),
    index('custom_agents_user_type_idx').on(table.userId, table.agentType),
  ],
);
```

**Migration Script**: `src/lib/db/migrations/0XXX_rename_refinement_agents_to_custom_agents.sql`

### Phase 2: Type Definitions

**File**: `src/lib/types/feature-suggestion-agent.ts` (new)

```typescript
import { z } from 'zod';

export const featureSuggestionAgentSchema = z.object({
  agentId: z.string(),
  agentType: z.literal('feature-suggestion'),
  createdAt: z.date(),
  focus: z.string(),
  isActive: z.boolean(),
  name: z.string(),
  role: z.string(),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  tools: z.array(z.enum(['Read', 'Grep', 'Glob'])),
  updatedAt: z.date(),
  userId: z.string(),
});

export type FeatureSuggestionAgent = z.infer<typeof featureSuggestionAgentSchema>;
```

### Phase 3: Database Queries

**File**: `src/lib/queries/feature-planner/feature-planner.query.ts`

Add methods:
- `getFeatureSuggestionAgentByUserId(userId: string)` - Queries `custom_agents` with `agent_type = 'feature-suggestion'`
- `createFeatureSuggestionAgent(agent: NewCustomAgent)` - Inserts into `custom_agents` with type
- `updateFeatureSuggestionAgent(agentId: string, updates: Partial<NewCustomAgent>)` - Updates existing agent

Note: Type `NewCustomAgent` is the insert type from Drizzle schema for `custom_agents` table

### Phase 4: Service Layer Updates

**File**: `src/lib/services/feature-planner.service.ts`

**Update Method**: `executeFeatureSuggestionAgent`

**Current Signature**:
```typescript
static async executeFeatureSuggestionAgent(
  pageOrComponent: string,
  featureType: string,
  priorityLevel: string,
  additionalContext: string | undefined,
  settings: { customModel?: string },
)
```

**New Signature**:
```typescript
static async executeFeatureSuggestionAgent(
  pageOrComponent: string,
  featureType: string,
  priorityLevel: string,
  additionalContext: string | undefined,
  settings: { customModel?: string },
  agent?: FeatureSuggestionAgent, // NEW PARAMETER
)
```

**Implementation Changes**:

1. **Prompt Building**:
```typescript
// use custom prompt
const prompt = this.buildCustomFeatureSuggestionPrompt(
      pageOrComponent,
      featureType,
      priorityLevel,
      additionalContext,
      agent
    )
```

2. **Agent-Specific Tools**:
```typescript
const allowedTools = agent ? agent.tools : ['Read', 'Grep', 'Glob'];
```

3. **Agent-Specific Temperature** 
```typescript
// Note: Temperature support may need to be added to SDK
const options = {
  allowedTools,
  maxTurns: 10,
  model: settings.customModel || 'claude-sonnet-4-5-20250929',
  settingSources: ['project'],
  temperature: agent?.temperature,
};
```

**New Method**: `buildCustomFeatureSuggestionPrompt`

```typescript
private static buildCustomFeatureSuggestionPrompt(
  pageOrComponent: string,
  featureType: string,
  priorityLevel: string,
  additionalContext: string | undefined,
  agent: FeatureSuggestionAgent,
): string {
  const contextStr = additionalContext ? `\n\nAdditional Context: ${additionalContext}` : '';

  return `${agent.systemPrompt}

FEATURE SUGGESTION CONTEXT:
- Target Area: ${pageOrComponent}
- Feature Type: ${featureType} (e.g., enhancement, new-capability, optimization, ui-improvement, integration)
- Priority Level: ${priorityLevel} (low, medium, high, critical)${contextStr}

YOUR TASK:
As a ${agent.role} with focus on ${agent.focus}, analyze the target area and generate 3-5 strategic feature suggestions.

REQUIREMENTS:
- Each suggestion must include: title, rationale, description, implementationConsiderations
- Consider the specified feature type and priority level
- Use Read/Grep/Glob tools to analyze relevant project files
- Base suggestions on actual codebase patterns and conventions

OUTPUT FORMAT:
Return ONLY a JSON object (no markdown code blocks) with this structure:

{
  "context": "Brief analysis of the target area (optional)",
  "suggestions": [
    {
      "title": "Feature name",
      "rationale": "Why this feature is valuable",
      "description": "What the feature does",
      "implementationConsiderations": ["consideration 1", "consideration 2"]
    }
  ]
}

IMPORTANT:
- Return ONLY the JSON object
- Start with { and end with }
- No markdown code blocks
- No explanatory text
- Ensure all strings are properly escaped`;
}
```

### Phase 5: Facade Layer

**File**: `src/lib/facades/feature-planner/feature-planner.facade.ts`

Add methods:
- `getFeatureSuggestionAgentAsync(userId: string, db: Database)` - Fetches from `custom_agents` table
- `createFeatureSuggestionAgentAsync(agent: NewCustomAgent, userId: string, db: Database)` - Creates in `custom_agents`
- `updateFeatureSuggestionAgentAsync(agentId: string, updates: Partial<NewCustomAgent>, userId: string, db: Database)` - Updates in `custom_agents`

### Phase 6: Server Actions

**File**: `src/lib/actions/feature-planner/manage-suggestion-agents.action.ts` (new)

Create actions:
```typescript
export const getFeatureSuggestionAgentAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.GET_SUGGESTION_AGENT })
  .inputSchema(z.object({}))
  .action(async ({ ctx }) => {
    const agent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(ctx.userId, ctx.db);
    return { data: agent, success: true };
  });

export const createFeatureSuggestionAgentAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.CREATE_SUGGESTION_AGENT })
  .inputSchema(featureSuggestionAgentInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const agent = await FeaturePlannerFacade.createFeatureSuggestionAgentAsync(parsedInput, ctx.userId, ctx.db);
    return { data: agent, success: true };
  });

export const updateFeatureSuggestionAgentAction = authActionClient
  .metadata({ actionName: ACTION_NAMES.FEATURE_PLANNER.UPDATE_SUGGESTION_AGENT })
  .inputSchema(updateFeatureSuggestionAgentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { agentId, updates } = parsedInput;
    const agent = await FeaturePlannerFacade.updateFeatureSuggestionAgentAsync(agentId, updates, ctx.userId, ctx.db);
    return { data: agent, success: true };
  });
```

**Update**: `src/lib/actions/feature-planner/feature-planner.actions.ts`

Modify `suggestFeatureAction` to:
1. Fetch user's custom agent (if exists)
2. Pass agent to `executeFeatureSuggestionAgent`

```typescript
export const suggestFeatureAction = authActionClient
  .metadata({ /* ... */ })
  .inputSchema(/* ... */)
  .action(async ({ ctx }) => {
    const input = ctx.sanitizedInput;
    const userId = ctx.userId;

    try {
      // Fetch user's custom agent (if exists)
      const customAgent = await FeaturePlannerFacade.getFeatureSuggestionAgentAsync(userId, ctx.db);

      const result = await FeaturePlannerService.executeFeatureSuggestionAgent(
        input.pageOrComponent,
        input.featureType,
        input.priorityLevel,
        input.additionalContext,
        { customModel: input.customModel },
        customAgent || undefined, // Pass agent if exists
      );

      return {
        data: {
          executionTimeMs: result.executionTimeMs,
          retryCount: result.retryCount,
          suggestions: result.result,
          tokenUsage: result.tokenUsage,
        },
        success: true,
      };
    } catch (error) {
      return handleActionError(error, { /* ... */ });
    }
  });
```

### Phase 7: Validation Schemas

**File**: `src/lib/validations/feature-planner.validation.ts`

Add schemas:
```typescript
export const featureSuggestionAgentInputSchema = z.object({
  focus: z.string().min(10).max(500),
  name: z.string().min(3).max(100),
  role: z.string().min(5).max(100),
  systemPrompt: z.string().min(50).max(5000),
  temperature: z.number().min(0).max(2),
  tools: z.array(z.enum(['Read', 'Grep', 'Glob'])).min(1),
});

export const updateFeatureSuggestionAgentSchema = z.object({
  agentId: z.string().uuid(),
  updates: z.object({
    focus: z.string().min(10).max(500).optional(),
    name: z.string().min(3).max(100).optional(),
    role: z.string().min(5).max(100).optional(),
    systemPrompt: z.string().min(50).max(5000).optional(),
    temperature: z.number().min(0).max(2).optional(),
    tools: z.array(z.enum(['Read', 'Grep', 'Glob'])).min(1).optional(),
  }),
});

export type FeatureSuggestionAgentInput = z.infer<typeof featureSuggestionAgentInputSchema>;
export type UpdateFeatureSuggestionAgent = z.infer<typeof updateFeatureSuggestionAgentSchema>;
```

### Phase 8: UI Components

#### 8.1 Agent Management Page

**File**: `src/app/(app)/feature-planner/suggestion-agent/page.tsx` (new)

```typescript
export default async function SuggestionAgentPage() {
  const agent = await getFeatureSuggestionAgentAction();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Feature Suggestion Agent Configuration</h1>
      <SuggestionAgentForm initialAgent={agent.data} />
    </div>
  );
}
```

#### 8.2 Agent Form Component

**File**: `src/app/(app)/feature-planner/suggestion-agent/components/suggestion-agent-form.tsx` (new)

Form fields:
- Name (text input)
- Role (text input)
- Focus (textarea)
- System Prompt (textarea with markdown preview)
- Temperature (slider: 0.0 - 2.0)
- Tools (multi-select checkboxes: Read, Grep, Glob)

#### 8.3 Link from Feature Planner

**File**: `src/app/(app)/feature-planner/components/request-input.tsx` (or relevant component)

Add link/button to manage suggestion agent:
```tsx
<Button variant="ghost" size="sm" asChild>
  <Link href="/feature-planner/suggestion-agent">
    <Settings className="mr-2 h-4 w-4" />
    Configure Suggestion Agent
  </Link>
</Button>
```

### Phase 9: Constants & Error Messages

**File**: `src/lib/constants/index.ts`

Add action names:
```typescript
export const ACTION_NAMES = {
  FEATURE_PLANNER: {
    // ... existing ...
    GET_SUGGESTION_AGENT: 'feature-planner.get-suggestion-agent',
    CREATE_SUGGESTION_AGENT: 'feature-planner.create-suggestion-agent',
    UPDATE_SUGGESTION_AGENT: 'feature-planner.update-suggestion-agent',
  },
};
```

Add error codes and messages:
```typescript
export const ERROR_CODES = {
  FEATURE_PLANNER: {
    // ... existing ...
    SUGGESTION_AGENT_NOT_FOUND: 'SUGGESTION_AGENT_NOT_FOUND',
    SUGGESTION_AGENT_CREATE_FAILED: 'SUGGESTION_AGENT_CREATE_FAILED',
  },
};

export const ERROR_MESSAGES = {
  FEATURE_PLAN: {
    // ... existing ...
    SUGGESTION_AGENT_NOT_FOUND: 'Feature suggestion agent not found',
    SUGGESTION_AGENT_CREATE_FAILED: 'Failed to create feature suggestion agent',
  },
};
```

## Testing Strategy

### Unit Tests

1. **Service Layer** (`feature-planner.service.test.ts`):
   - Test `executeFeatureSuggestionAgent` with custom agent
   - Test `executeFeatureSuggestionAgent` without custom agent (fallback)
   - Test `buildCustomFeatureSuggestionPrompt` prompt building

2. **Actions Layer** (`manage-suggestion-agents.action.test.ts`):
   - Test create agent action
   - Test update agent action
   - Test get agent action

3. **Validation** (`feature-planner.validation.test.ts`):
   - Test agent input schema validation
   - Test update agent schema validation

### Integration Tests

1. **Database Operations**:
   - Create agent and verify storage
   - Update agent and verify changes
   - Query agent by user

2. **End-to-End Flow**:
   - Configure agent via UI
   - Trigger feature suggestion
   - Verify custom prompt is used

## Migration Path

### Step 1: Database Migration
```sql
-- Rename table from refinement_agents to custom_agents
ALTER TABLE feature_planner.refinement_agents
RENAME TO custom_agents;

-- Rename indexes
ALTER INDEX IF EXISTS refinement_agents_pkey
RENAME TO custom_agents_pkey;

-- Add agent_type column with default
ALTER TABLE feature_planner.custom_agents
ADD COLUMN agent_type VARCHAR(50) DEFAULT 'refinement' NOT NULL;

-- Add check constraint
ALTER TABLE feature_planner.custom_agents
ADD CONSTRAINT custom_agents_agent_type_valid
CHECK (agent_type IN ('refinement', 'feature-suggestion'));

-- Add indexes
CREATE INDEX custom_agents_agent_type_idx
ON feature_planner.custom_agents(agent_type);

CREATE INDEX custom_agents_user_type_idx
ON feature_planner.custom_agents(user_id, agent_type);
```

### Step 2: Update Code References

After renaming the database table, update all code references:

**Schema Definition**:
- Rename `refinementAgents` export to `customAgents` in `src/lib/db/schema/feature-planner.schema.ts`
- Update Drizzle types: `RefinementAgent` → `CustomAgent`, `NewRefinementAgent` → `NewCustomAgent`

**Query Files**:
- Update all imports and references in `src/lib/queries/feature-planner/feature-planner.query.ts`
- Update query methods that reference the old table name

**Action Files**:
- Update `src/lib/actions/feature-planner/manage-refinement-agents.action.ts` to use new schema name
- Update type imports and references

**Facade Files**:
- Update `src/lib/facades/feature-planner/feature-planner.facade.ts` with new table references

**Service Files**:
- Update `src/lib/services/feature-planner.service.ts` type imports

### Step 3: Default Agent Seeding

Create default suggestion agent for existing users (optional):
```typescript
// Migration script to create default agents
const defaultAgent = {
  agentId: 'default-suggestion-agent',
  agentType: 'feature-suggestion',
  name: 'Default Feature Suggestion Agent',
  role: 'Product Strategist',
  focus: 'Strategic feature ideation based on user needs and technical feasibility',
  systemPrompt: `You are a product strategist analyzing a codebase for feature opportunities...`,
  temperature: '1.0',
  tools: ['Read', 'Grep', 'Glob'],
  isDefault: true,
  isActive: true,
};
```

## Risks & Mitigation

### Risk 1: Breaking Changes
**Mitigation**:
- Do not maintain any backwards compatible approach, all code should use the new approach

### Risk 2: Prompt Quality
**Mitigation**:
- Provide default agent with well-tested system prompt
- Add examples in UI for guidance
- Validate prompt length and structure

### Risk 3: Database Constraints
**Mitigation**:
- Add unique constraint on (user_id, agent_type, is_active) to prevent multiple active agents
- Handle edge cases in queries

## Timeline Estimate

- **Phase 1-2** (Database Schema Rename & Types): 3-4 hours (includes table rename)
- **Phase 3** (Queries): 1-2 hours
- **Phase 4** (Service): 3-4 hours
- **Phase 5** (Facade): 1-2 hours
- **Phase 6** (Actions): 2-3 hours
- **Phase 7** (Validation): 1 hour
- **Phase 8** (UI): 4-6 hours
- **Phase 9** (Constants): 30 minutes
- **Code Updates** (updating all references to renamed table): 2-3 hours
- **Testing**: 3-4 hours
- **Migration & Deployment**: 2-3 hours

**Total**: 22-32 hours (3-4 days)

## Success Criteria

1. ✅ Users can create/edit a custom suggestion agent via UI
2. ✅ Agent configuration persists to database
3. ✅ Feature suggestions use custom agent when configured
4. ✅ Feature suggestions fall back to default behavior when no agent configured
5. ✅ `npm run lint:fix` and `npm run typecheck` return no errors
6. ✅ No backwards compatible code, all code uses the new approach

## Next Steps

1. Review and approve implementation plan
2. **Execute table rename**: Rename `refinement_agents` to `custom_agents` and update all code references
3. Create database migration for `agent_type` column
4. Implement backend changes (service → facade → actions)
5. Implement UI components
6. Testing and validation
7. Deploy and verify

## References

- **Custom Agents Implementation**: `src/lib/actions/feature-planner/manage-refinement-agents.action.ts` (will be updated to use `custom_agents` table)
- **Feature Planner Service**: `src/lib/services/feature-planner.service.ts`
- **Database Schema**: `src/lib/db/schema/feature-planner.schema.ts` (table: `custom_agents`, formerly `refinement_agents`)
- **Feature Planner Agents UI**: `src/app/(app)/feature-planner/agents/`

## Notes on Implementation

### Table Rename Impact
The rename from `refinement_agents` to `custom_agents` affects:
1. **Schema definition**: Export name changes from `refinementAgents` to `customAgents`
2. **Types**: `RefinementAgent` → `CustomAgent`, `NewRefinementAgent` → `NewCustomAgent`
3. **All query functions**: Must use new table reference
4. **All action files**: Must import new types
5. **Database constraints and indexes**: Must be renamed in migration
6. **Documentation**: Update all references to reflect new naming

This rename is done **once** as part of this feature implementation, ensuring all future agent types use the correct, semantic table name.
