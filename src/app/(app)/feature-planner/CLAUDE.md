Feature Planner Context Summary

Purpose & Overview
The Feature Planner (/feature-planner) is an AI-powered development workflow orchestration tool that guides users through a 3-step
process to plan software features. It uses Claude Agent SDK to execute specialized AI agents that refine requirements, discover
relevant files, and generate implementation plans.

Three-Step Workflow

Step 1: Feature Request Refinement
- User inputs a feature request (50-500 characters recommended)
- Supports parallel refinement with 1-5 AI agents running simultaneously
- Settings: agent count, output length (100-250 words), project context inclusion, custom model
- Agents analyze CLAUDE.md and project structure to refine requests with technical specificity
- Results displayed in tabbed interface for comparison; user selects best refinement or uses original

Step 2: File Discovery
- Uses 14 specialized agents (database schemas, server actions, queries, facades, UI components, pages, API routes, hooks, types,
  validations, utils, config, tests, build tooling)
- Agents search assigned paths using Read/Grep/Glob tools to find relevant files
- Returns 20-100+ files categorized by priority (critical/high/medium/low) with relevance scores
- Supports manual file additions and bulk selection controls
- Architecture insights extracted from discovered patterns

Step 3: Implementation Planning
- Generates structured markdown implementation plan with 5-15 steps
- Includes estimated duration, complexity (low/medium/high), risk level, prerequisites, quality gates
- Each step contains title, description, commands, validation commands, confidence level
- Plan persisted with metadata for tracking

Technical Architecture

Database (Neon PostgreSQL): 9 tables track complete workflow state:
- feature_plans: Main plan records with status, settings, selections
- feature_refinements: Individual refinement attempts with token usage
- file_discovery_sessions: Discovery execution with file counts by priority
- discovered_files: Individual discovered files with metadata
- implementation_plan_generations: Plan generation attempts
- plan_steps: Structured plan steps with commands
- plan_execution_logs: Complete audit trail of all agent executions
- plan_step_templates: Reusable step templates

Service Layer: FeaturePlannerService handles all Claude SDK operations with circuit breakers, retry logic (2 attempts), and timeout
protection (12 minutes)

State Management: React hooks (useRefinementFlow, useFileDiscovery, useImplementationPlan) manage API calls, loading states, and step
data. URL state managed via Nuqs (step query param).

API Routes: REST endpoints for each operation (/api/feature-planner/refine, /discover, /plan, /[planId]/select-refinement, etc.)

Current Status & Known Issues

Working Well:
- Steps 1-2 execute flawlessly with excellent AI quality
- Database persistence with 100% data integrity
- Parallel agent execution with consistent performance
- Comprehensive file discovery (80+ files typical)

Critical Issues:
1. State Management Bug: Step 3 cannot be accessed via direct URL navigation; requires sequential workflow completion. Root cause:
   planId URL param not properly hydrated into React state on mount.
2. High Token Consumption: Step 2 uses 10K+ tokens (99.5% completion tokens), raising cost concerns
3. UI Scalability: 80+ discovered files cause browser tool pagination issues; lacks search/filter functionality

Key Files:
- Page: src/app/(app)/feature-planner/page.tsx
- Service: src/lib/services/feature-planner.service.ts
- Schema: src/lib/db/schema/feature-planner.schema.ts
- Hooks: src/app/(app)/feature-planner/hooks/
- Components: src/app/(app)/feature-planner/components/