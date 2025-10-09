# Feature Planner Web Implementation - Architecture Documentation

**Date:** 2025-10-08
**Project:** Head Shakers
**Feature:** Web-based Feature Planner UI

## Overview

This directory contains comprehensive architecture documentation for migrating the `/plan-feature` CLI command to a web-based UI. The documentation covers analysis, design, and implementation planning for building a feature planner that provides enhanced control, parallel execution, database persistence, and real-time feedback.

## Documentation Index

### [01. Current CLI Workflow Analysis](./01-current-cli-workflow-analysis.md)
**Purpose:** Understand the existing `/plan-feature` CLI implementation

**Contents:**
- Detailed analysis of the 3-step workflow (Refinement → Discovery → Planning)
- Agent architecture and configuration
- Data flow and logging mechanisms
- CLI limitations that motivate the web implementation
- Technical considerations for migration
- Recommendations for web improvements

**Key Insights:**
- The CLI uses filesystem-based agents (`.claude/agents/*.md`)
- Each step has comprehensive logging and validation
- Quality gates ensure output meets requirements
- Limited user control between steps is main limitation

### [02. Claude Agent SDK Capabilities](./02-claude-agent-sdk-capabilities.md)
**Purpose:** Document SDK capabilities and integration patterns

**Contents:**
- SDK overview and core capabilities
- Input modes (Single Message vs Streaming)
- Agent definition strategies (Programmatic vs Filesystem)
- Session management and resumption
- Tool permissions and control
- Error handling patterns
- Message types and event handling

**Key Capabilities:**
- `@anthropic-ai/claude-agent-sdk` v0.1.11 already installed
- Supports both programmatic and filesystem-based agent definitions
- Can reuse existing `.claude/agents/*.md` files
- Multiple input modes for different use cases
- Built-in session management and context persistence

**Recommended Approach:**
- **Hybrid agent definition:** Load from filesystem + programmatic overrides
- **Start with single message input** for MVP, add streaming later
- **Step-by-step API routes** for granular control

### [03. Database Schema Design](./03-database-schema-design.md)
**Purpose:** Complete database schema for persisting workflows

**Contents:**
- Core tables design (6 main tables)
- Relationships and foreign keys
- Indexes and performance optimization
- JSONB types for flexible data storage
- Query patterns and examples
- Migration strategy

**Core Tables:**
1. **`feature_plans`** - Main workflow orchestration
2. **`feature_refinements`** - Individual refinement attempts (parallel support)
3. **`file_discovery_sessions`** - File discovery executions
4. **`discovered_files`** - Individual discovered files with priority
5. **`implementation_plan_generations`** - Plan generation attempts
6. **`plan_execution_logs`** - Complete audit trail

**Key Features:**
- Parallel refinement support (multiple agents per plan)
- Complete execution audit trail
- Versioning and iteration support
- Performance metrics and token tracking
- File selection tracking

### [04. Comprehensive Architecture Plan](./04-comprehensive-architecture-plan.md)
**Purpose:** Complete architectural blueprint for implementation

**Contents:**
- System architecture overview
- Component architecture (Frontend, API, Service layers)
- Implementation phases (4 phases over 8 weeks)
- Technical decisions and rationale
- Security considerations
- Performance optimization strategies
- Testing strategy
- Deployment considerations
- Success metrics
- Future enhancements

**Architecture Highlights:**
```
Browser (React UI)
    ↓
Next.js App Router (Pages + API Routes)
    ↓
Service Layer (FeaturePlannerService)
    ↓
Claude Agent SDK
    ↓
Filesystem Agents + Claude API + PostgreSQL
```

**Implementation Phases:**
- **Phase 1 (Weeks 1-2):** MVP - Basic 3-step flow with DB persistence
- **Phase 2 (Weeks 3-4):** Parallel execution and comparison
- **Phase 3 (Weeks 5-6):** Real-time streaming and progress
- **Phase 4 (Weeks 7-8):** Versioning, iteration, and polish

## Quick Reference

### Key Decisions Summary

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Agent Invocation** | Hybrid (Filesystem + Programmatic) | Reuses `.claude/agents/*.md`, allows customization |
| **Input Mode** | Single Message → Streaming | Simple MVP, add complexity later |
| **State Management** | URL State + TanStack Query | Deep linking + server state caching |
| **Database** | PostgreSQL + Drizzle ORM | Already in use, type-safe, powerful |
| **Error Handling** | Multi-layer Strategy | Clear boundaries, proper logging |

### Key File Locations

**Frontend:**
```
/app/(app)/feature-planner/
├── page.tsx
└── components/
    ├── request-input.tsx
    ├── refinement-settings.tsx
    └── steps/
```

**API Routes:**
```
/app/api/feature-planner/
├── create/route.ts
├── refine/route.ts
├── discover/route.ts
└── plan/route.ts
```

**Service Layer:**
```
/src/lib/services/
└── feature-planner.service.ts
```

**Database Schema:**
```
/src/lib/db/schema/
└── feature-planner.schema.ts
```

### Critical Implementation Notes

1. **Reuse Existing Agents**: Load from `.claude/agents/` using `settingSources: ['project']`
2. **Session Continuity**: Use `continue: true` for multi-step workflows
3. **Parallel Refinement**: Run multiple agents with `Promise.all()`
4. **Complete Logging**: Store all prompts, responses, and metadata
5. **Validation at Every Step**: Check format, length, quality gates
6. **User Control**: Allow editing/selection between steps

### Technology Stack

- **Frontend:** React 19, Next.js 15.5, TailwindCSS 4, Radix UI
- **State:** nuqs (URL state), TanStack Query (server state)
- **Backend:** Next.js API Routes, Server Actions
- **Database:** PostgreSQL (Neon), Drizzle ORM
- **AI/Agents:** Claude Agent SDK v0.1.11, Claude Sonnet 4.5
- **Validation:** Zod schemas
- **Testing:** Vitest, Playwright

## Getting Started with Implementation

### Step 1: Review Documentation
Read all 4 documents in order to understand:
1. What the CLI does (Document 01)
2. How the SDK works (Document 02)
3. How to store data (Document 03)
4. How to build it (Document 04)

### Step 2: Create Database Schema
```bash
# Create schema file
touch src/lib/db/schema/feature-planner.schema.ts

# Implement schema from Document 03
# Then generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

### Step 3: Build Service Layer
```bash
# Create service file
touch src/lib/services/feature-planner.service.ts

# Implement FeaturePlannerService from Document 04
```

### Step 4: Create API Routes
```bash
# Create API route structure
mkdir -p app/api/feature-planner/{create,refine,discover,plan}

# Implement routes from Document 04
```

### Step 5: Build UI Components
```bash
# Create component structure
mkdir -p app/(app)/feature-planner/components/steps

# Implement components from Document 04
```

## Success Criteria

**Functional Requirements:**
- ✅ 3-step workflow operational
- ✅ Database persistence working
- ✅ Parallel refinement executing
- ✅ Real-time progress updates
- ✅ User control between steps

**Performance Targets:**
- Step 1 (Refinement): < 5 seconds
- Step 2 (Discovery): < 10 seconds
- Step 3 (Planning): < 15 seconds
- Total workflow: < 30 seconds

**Quality Metrics:**
- 95%+ success rate for refinements
- 90%+ valid implementation plans
- < 1% error rate

## Questions & Next Steps

### Immediate Questions
1. Should we start with Phase 1 MVP or full implementation?
2. Any specific UI/UX requirements or preferences?
3. Performance budget and scaling considerations?
4. Target launch date?

### Recommended Next Steps
1. ✅ Review and approve architecture
2. Create GitHub issues for Phase 1 tasks
3. Set up project tracking (Linear/Jira/GitHub Projects)
4. Begin Phase 1 implementation
   - [ ] Create database schema
   - [ ] Build service layer
   - [ ] Create API routes
   - [ ] Build basic UI
   - [ ] Integration testing

## Contact & Support

For questions or clarifications about this architecture:
- Review individual documents for detailed information
- Refer to Claude Agent SDK docs: https://docs.claude.com/en/api/agent-sdk/overview
- Check existing CLI implementation: `.claude/commands/plan-feature.md`

---

**Status:** ✅ Documentation Complete
**Next Phase:** Implementation Ready
**Last Updated:** 2025-10-08
