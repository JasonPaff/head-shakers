Migration Plan: Store Refinement Agents in Database
Overview: Migrate refinement agents from hardcoded configuration (src/lib/config/refinement-agents.ts) to database storage,
enabling UI-based customization of agent prompts and settings. 

Complete replacement - no backward compatibility or fallback mechanisms (important).

Current State Analysis
- 6 hardcoded agents: Technical Architect, Product Manager, UX Designer, Security Engineer, Test Engineer, User Advocate
- Agent properties: agentId, name, role, systemPrompt, temperature, focus, tools
- Current flow: Config file → Facade (getRefinementAgents) → Service → API → UI
- Database: Already stores per-refinement metadata (agentId, agentName, agentRole) but not agent definitions
- Architecture: Server components + server actions (Next-Safe-Action)
  Implementation Steps

1. Database Schema (15-20 min)
- Create refinement_agents table in feature_planner schema with columns:
    - id (uuid, primary key)
    - agentId (varchar, unique) - stable identifier
    - name, role, focus (text fields)
    - systemPrompt (text)
    - temperature (decimal)
    - tools (jsonb array)
    - isActive, isDefault (boolean flags)
    - userId (uuid, nullable) - for custom user agents
    - createdAt, updatedAt (timestamps)
- Add table definition to src/lib/db/schema/feature-planner.schema.ts
- Add type exports for new table
- Generate migration with npm run db:generate
- Validation: npm run typecheck

2. Seed Default Agents (10-15 min)
- Create migration seed to populate table with 6 existing agents from config
- Preserve original agentIds for data continuity
- Mark all as isDefault: true, isActive: true
- Run migration with npm run db:migrate
- Validation: Query database to verify 6 seeded agents exist

3. Query Layer (20-25 min)
- Add queries to src/lib/queries/feature-planner/feature-planner.query.ts:
    - findAllActiveAgentsAsync(context) - get all active agents
    - findAgentByIdAsync(agentId, context) - get single agent by agentId
    - findAgentsByIdsAsync(agentIds, context) - get multiple agents
    - createAgentAsync(data, context) - create new agent
    - updateAgentAsync(agentId, updates, context) - update agent
    - deleteAgentAsync(agentId, userId, context) - soft delete (set isActive=false)
- Follow existing query patterns with QueryContext and error handling
- Validation: npm run typecheck

4. Facade Layer (25-30 min)
- Add methods to src/lib/facades/feature-planner/feature-planner.facade.ts:
    - getAvailableAgentsAsync(userId, dbInstance?) - returns database agents
    - getAgentByIdAsync(agentId, userId, dbInstance?)
    - getAgentsByIdsAsync(agentIds, userId, dbInstance?)
    - createRefinementAgentAsync(agentData, userId, dbInstance?)
    - updateRefinementAgentAsync(agentId, updates, userId, dbInstance?)
    - deleteRefinementAgentAsync(agentId, userId, dbInstance?)
- Update runParallelRefinementAsync() and runParallelRefinementWithStreamingAsync():
    - Replace getRefinementAgents() and getRefinementAgentsByIds() with database calls
    - Load agents via getAvailableAgentsAsync() or getAgentsByIdsAsync()
    - Convert database records to RefinementAgent interface format
- Follow established facade patterns with comprehensive error handling
- Validation: npm run typecheck and npm run lint:fix

5. Server Actions (30-35 min)
- Create src/lib/actions/feature-planner/manage-refinement-agents.action.ts:
    - createRefinementAgentAction - uses Next-Safe-Action
    - updateRefinementAgentAction - uses Next-Safe-Action
    - deleteRefinementAgentAction - uses Next-Safe-Action
- Follow existing action patterns:
    - Use createProtectedAction wrapper
    - Include proper validation schemas
    - Call facade methods for business logic
    - Return typed results with error handling
- Validation: npm run typecheck and npm run lint:fix

6. Validation Schemas (10-15
- Add to src/lib/validations/feature-planner.validation.ts:
    - refinementAgentInputSchema (for create)
    - updateRefinementAgentSchema (for updates)
    - agentToolsSchema (for tools array validation)
    - agentIdSchema (for ID validation)
- Follow Zod schema patterns from existing validations
- Include proper constraints (string lengths, temperature range, etc.)
- Validation: npm run typecheck

7. Agent Management Page (Server Component) (35-40 min)
- Create src/app/(app)/feature-planner/agents/page.tsx:
    - Server Component that fetches agents via facade
    - Displays agent list with create button
    - No client-side data fetching
- Create src/app/(app)/feature-planner/agents/[agentId]/page.tsx:
    - Server Component for agent details/edit
    - Fetches single agent via facade
- Create components in src/app/(app)/feature-planner/components/agents/:
    - agent-list.tsx - server component displaying agent cards
    - agent-form-client.tsx - client component for form interactivity
    - agent-card.tsx - server component for individual agent display
    - delete-agent-dialog.tsx - client component for dialog
- Use server actions for form submissions
- Validation: npm run typecheck and npm run lint:fix

8. Update Refinement Settings (30-35 min)
- Update src/app/(app)/feature-planner/components/refinement-settings.tsx:
    - Receive agents via props from parent server component
    - Replace hardcoded agent count dropdown with agent multi-select
    - Show agent cards with checkbox selection
    - Display agent focus/role/temperature in UI
    - Update selectedAgentIds in settings state
- Settings remains client component for interactivity, receives server data via props
- Validation: npm run typecheck and npm run lint:fix

9. Update Main Page (20-25 min)
- Update src/app/(app)/feature-planner/page.tsx:
    - Server Component fetches available agents via facade
    - Pass agents to <RefinementSettings> and other components via props
    - Maintain existing step workflow
- Update refinement results display to show agent metadata
- Validation: npm run typecheck and npm run lint:fix

10. Update Type Definitions (10-15 min)
- Add type exports from schema for new refinement_agents table
- Ensure database types are compatible with existing RefinementAgent interface
- Update or create converter function: dbAgentToRefinementAgent()
- Update imports across codebase
- Validation: npm run typecheck

11. Update Constants (5-10 min)
- Add to src/lib/constants/index.ts:
    - Agent validation limits (prompt length, name length, temperature range)
    - Default temperature value
    - Available tool options
    - Schema limits for agent fields
- Validation: npm run typecheck

12. Remove Legacy Code (15-20 min)
- DELETE src/lib/config/refinement-agents.ts entirely
- Remove all imports of:
    - getRefinementAgent
    - getRefinementAgents
    - getRefinementAgentsByIds
    - getAllRefinementAgents
    - REFINEMENT_AGENTS
- Update all import statements to use database-backed facade methods
- Remove RefinementAgent interface from config (keep in types if needed)
- Search codebase for any remaining references
- Validation: npm run typecheck and npm run lint:fix

13. Testing & Quality Gates (25-30 min)
- Test agent CRUD operations via server actions
- Test refinement flow with database agents
- Verify agent selection UI works correctly
- Test form submissions and validations
- Verify server component data flow
- Test with different user scenarios
- Final validation: npm run lint:fix && npm run typecheck

  Total Estimated Time
  4 - 5 hours

  Architecture Patterns Used

  ✅ Server Components for data fetching (agent lists, details)✅ Server Actions for mutations (create/update/delete
  agents)✅ Facades for business logic (agent
  management)✅ Queries for database operations with QueryContext✅ Next-Safe-Action for type-safe server actions✅ Zod
  Schemas for validation✅ Client Components
  only where needed (forms, dialogs, interactive UI)

  Key Benefits
1. ✅ UI-based agent customization without code changes
2. ✅ Per-user custom agents (future enhancement)
3. ✅ Agent versioning and history tracking
4. ✅ Clean architecture - single source of truth (database)
5. ✅ No configuration file maintenance
6. ✅ Follows established server-first patterns

Migration Safety

- Seed migration preserves original agentIds for data continuity
- Existing feature_refinements table references remain valid
- No code fallbacks - cleaner, more maintainable
- Database is single source of truth    