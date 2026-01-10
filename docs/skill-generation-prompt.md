# Claude Code Skills Generation Prompt

Use this prompt with an agentic AI to generate a comprehensive skills system for any project.

---

## The Prompt

```
You are a Claude Code skills architect. Your task is to analyze this codebase and create a comprehensive skills system that will guide AI assistants to follow the project's conventions, patterns, and best practices consistently.

## What Are Skills?

Skills are specialized knowledge modules stored in `.claude/skills/` that teach AI assistants the project-specific conventions for different domains (components, database, validation, testing, etc.). When an AI loads a skill, it learns exactly how to write code that matches the project's patterns.

## Skills Architecture

Each skill consists of two files:

### 1. SKILL.md (Entry Point)
Located at: `.claude/skills/{skill-name}/SKILL.md`

Structure:
```yaml
---
name: {skill-name}  # kebab-case identifier
description: {One sentence describing what conventions this skill enforces and when to use it}
---
```

Followed by markdown with:
- **Purpose**: What this skill enforces
- **Activation**: When to use this skill (file patterns, import patterns, task types)
- **Workflow**: Steps to follow when the skill activates
- **Key Patterns**: Quick reference of the most important conventions
- **Anti-Patterns**: Common mistakes to avoid
- **References**: Link to the detailed conventions file

### 2. References File (Complete Conventions)
Located at: `.claude/skills/{skill-name}/references/{Skill-Name}-Conventions.md`

This is the comprehensive conventions document containing:
- File structure and organization
- Naming conventions with examples
- Code patterns with complete code samples
- Integration patterns with other parts of the system
- Error handling approaches
- Anti-patterns with bad/good comparisons
- Constants and configuration references

## Your Analysis Tasks

### Phase 1: Technology Discovery

Analyze the codebase to identify:

1. **Core Framework**: What framework powers the app? (Next.js, Remix, Express, etc.)
2. **Language & Types**: TypeScript? What typing patterns are used?
3. **Database**: ORM used? (Drizzle, Prisma, TypeORM, raw SQL)
4. **Validation**: Schema library? (Zod, Yup, Joi)
5. **State Management**: Client state approach? (Redux, Zustand, Context, etc.)
6. **Forms**: Form library? (React Hook Form, TanStack Form, Formik)
7. **API Layer**: How are APIs structured? (Server actions, tRPC, REST, GraphQL)
8. **Authentication**: Auth approach? (Clerk, NextAuth, Auth0, custom)
9. **Styling**: CSS approach? (Tailwind, CSS Modules, styled-components)
10. **Testing**: Test frameworks? (Vitest, Jest, Playwright, Testing Library)
11. **Monitoring**: Error tracking? (Sentry, LogRocket, custom)
12. **Media/Files**: File storage? (Cloudinary, S3, local)
13. **Caching**: Caching strategy? (Redis, in-memory, CDN)
14. **Real-time**: WebSocket/real-time needs? (Ably, Pusher, Socket.io)

### Phase 2: Architecture Pattern Discovery

Examine the codebase structure to identify:

1. **Folder Organization**: How is code organized? What are the key directories?
2. **Component Patterns**: Server vs client components? Component composition patterns?
3. **Data Flow**: How does data flow from DB to UI and back?
4. **Business Logic Layer**: Is there a facade/service layer? How is business logic separated?
5. **Code Style**: Naming conventions, file naming, export patterns
6. **Error Handling**: Consistent error handling patterns?
7. **Testing Strategy**: Unit, integration, E2E patterns?

### Phase 3: Convention Extraction

For each identified domain, extract:

1. **File naming patterns** (kebab-case, PascalCase, suffixes like `.actions.ts`)
2. **Code organization** (import order, hook order, section comments)
3. **Naming conventions** (prefixes like `is` for booleans, `handle` for handlers)
4. **Type patterns** (interfaces vs types, naming patterns)
5. **Return value patterns** (null vs undefined, response shapes)
6. **Documentation patterns** (JSDoc, inline comments)

### Phase 4: Skill Categories to Create

Based on analysis, create skills for these categories (where applicable):

#### Frontend Skills
- `react-coding-conventions` - Base React/TypeScript conventions
- `client-components` - Interactive components with hooks and handlers
- `server-components` - Async data fetching components
- `ui-components` - Component library patterns (Radix, Shadcn, etc.)
- `form-system` - Form handling patterns

#### Backend Skills
- `server-actions` - Server action patterns (if using)
- `api-routes` - API route patterns (if using)
- `facade-layer` or `service-layer` - Business logic layer
- `database-schema` - Schema definition conventions
- `{orm-name}` - ORM-specific query patterns (drizzle-orm, prisma-orm, etc.)
- `validation-schemas` - Validation schema patterns

#### Infrastructure Skills
- `caching` - Caching strategy and patterns
- `{auth-provider}` - Authentication patterns
- `{error-tracking}` - Error tracking integration (sentry-client, sentry-server)
- `{media-provider}` - Media handling (cloudinary-media, s3-media, etc.)
- `{email-provider}` - Email patterns (resend-email, sendgrid-email, etc.)

#### Testing Skills
- `testing-base` - Shared testing conventions
- `unit-testing` - Unit test patterns
- `component-testing` - Component test patterns
- `integration-testing` - Integration test patterns
- `e2e-testing` - End-to-end test patterns
- `test-infrastructure` - Test utilities, factories, mocks

## Output Format

For each skill, generate:

### 1. SKILL.md Template

```markdown
---
name: {skill-name}
description: {Enforces project {domain} coding conventions when {trigger condition}. This skill ensures consistent patterns for {key things it covers}.}
---

# {Skill Title}

## Purpose

This skill enforces the project {domain} coding conventions automatically during {activity type}. It ensures consistent {what it ensures}.

## Activation

This skill activates when:

- {Trigger 1 - file path patterns}
- {Trigger 2 - import patterns}
- {Trigger 3 - task types}

## Workflow

1. Detect {domain} work ({detection criteria})
2. Load `references/{Skill-Name}-Conventions.md`
3. Generate/modify code following all conventions
4. Scan for violations
5. Auto-fix all violations (no permission needed)
6. Report fixes applied

## Key Patterns

### {Pattern Category 1}

- {Key convention 1}
- {Key convention 2}
- {Key convention 3}

### {Pattern Category 2}

- {Key convention 1}
- {Key convention 2}

## Anti-Patterns to Avoid

1. **Never {anti-pattern 1}** - {why it's bad}
2. **Never {anti-pattern 2}** - {why it's bad}
3. **Never {anti-pattern 3}** - {why it's bad}

## References

- `references/{Skill-Name}-Conventions.md` - Complete {domain} conventions
```

### 2. References File Template

```markdown
# {Domain} Conventions

## Overview

{Brief description of this domain and its role in the project}

**Key Integration Points:**

- **{Integration 1}**: {How this integrates}
- **{Integration 2}**: {How this integrates}

## File Structure

```
{directory structure showing where files go}
```

## File Naming

- **Files**: `{pattern}` (e.g., `{example}`)
- **{Other naming}**: `{pattern}`

## Required Imports

```typescript
{Standard imports for this domain}
```

---

## {Major Section 1}

### {Subsection}

{Explanation with code example}

```typescript
// Good example
{code}

// Bad example (what to avoid)
{code}
```

---

## {Major Section 2}

{Continue pattern...}

---

## Anti-Patterns to Avoid

### 1. {Anti-pattern title}

```typescript
// Wrong
{bad code}

// Correct
{good code}
```

### 2. {Anti-pattern title}

{Continue...}
```

## Execution Instructions

1. **Start with the base skill**: Create `react-coding-conventions` (or equivalent base frontend skill) first
2. **Layer specialized skills**: Build domain-specific skills that reference the base
3. **Extract real examples**: Use actual code from the project as examples
4. **Identify constants**: Reference project constants (never hardcode values)
5. **Map integrations**: Show how each domain integrates with others
6. **Document anti-patterns**: Include common mistakes you've seen in the codebase

## Quality Checklist for Each Skill

- [ ] SKILL.md has proper YAML frontmatter
- [ ] Description is one clear sentence
- [ ] Activation triggers are specific and detectable
- [ ] Key patterns cover the most important conventions
- [ ] Anti-patterns include the most common mistakes
- [ ] References file has complete code examples
- [ ] Examples use project-specific imports and constants
- [ ] Integration points are documented
- [ ] File naming patterns are explicit

## Begin Analysis

Now analyze this codebase and create the skills. Start by:

1. Reading the project's main configuration files (package.json, tsconfig.json, etc.)
2. Exploring the folder structure to understand organization
3. Reading key files in each domain to extract patterns
4. Identifying constants, utilities, and shared patterns
5. Creating skills one domain at a time, starting with the most foundational

Output each skill's SKILL.md and references file as you complete analysis of each domain.
```

---

## Usage Notes

1. **Project Context**: Before running this prompt, ensure the AI has access to read the full codebase
2. **Iterative Refinement**: After initial generation, refine skills based on actual codebase patterns
3. **Constants Integration**: Make sure skills reference actual project constants
4. **Testing**: Test each skill by having the AI write code in that domain

## Skill Categories Quick Reference

| Category | Skills to Consider |
|----------|-------------------|
| **Frontend** | react-coding-conventions, client-components, server-components, ui-components, form-system |
| **Data** | database-schema, {orm}-orm, validation-schemas |
| **Business Logic** | facade-layer/service-layer, server-actions/api-routes |
| **Infrastructure** | caching, authentication, error-tracking, media-handling |
| **Testing** | testing-base, unit-testing, component-testing, integration-testing, e2e-testing |
| **Monitoring** | sentry-client, sentry-server (or equivalent) |

## Extending with Agents and Commands

After creating skills, you can create specialized agents that load multiple skills:

### Agent Template (`.claude/agents/{agent-name}.md`)

```markdown
---
name: {agent-name}
description: {Specialized agent for X. Automatically loads {skill1}, {skill2}, and {skill3} skills.}
color: {orange|yellow|green|blue|purple}
---

You are a {domain} specialist for this project.

## Your Role

When implementing {domain} work, you:

1. **Load required skills FIRST** before any implementation
2. **Follow all project conventions** from the loaded skills
3. {Additional responsibilities}

## Required Skills - MUST LOAD BEFORE IMPLEMENTATION

Before writing ANY code, you MUST read these skill reference files:

1. **{skill1}** - Load `references/{Skill1}-Conventions.md`
2. **{skill2}** - Load `references/{Skill2}-Conventions.md`
3. **{skill3}** - Load `references/{Skill3}-Conventions.md`

## Implementation Checklist

{Domain-specific checklist items}

## File Patterns

This agent handles files matching:

- `{pattern1}`
- `{pattern2}`

## Output Format

When completing work, provide:

```
## RESULTS

**Status**: success | failure

**Skills Loaded**:
- {skill1}: references/{Skill1}-Conventions.md
- {skill2}: references/{Skill2}-Conventions.md

**Files Modified**:
- path/to/file.ts - Description

**Conventions Applied**:
- [List key conventions followed]

**Validation Results**:
- Command: {validation command}
  Result: PASS | FAIL
```
```

### Command Template (`.claude/commands/{command-name}.md`)

```markdown
---
allowed-tools: {tool permissions}
argument-hint: {usage hint}
description: {What this command does}
---

You are a {purpose} orchestrator.

@CLAUDE.MD

## Command Usage

```
/{command-name} {arguments}
```

## Workflow

{Step-by-step workflow}

## Output

{Expected output format}
```
