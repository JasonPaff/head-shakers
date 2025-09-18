# Orchestration Standards for Head Shakers

## Implementation Plan Format Requirements

### MANDATORY Format Rules

**✅ REQUIRED: Markdown Template Format**
- MUST use `# Implementation Plan: [Feature Name]` header
- MUST include sections: Overview, Prerequisites, Implementation Steps, Quality Gates
- MUST use `### Step N:` format for each step
- Each step MUST have: What, Why, Confidence, Files to Create/Modify, Changes, Validation Commands, Success Criteria

**❌ FORBIDDEN: XML Format**
- NEVER use `<?xml version="1.0"?>` or XML tags
- NEVER use `<implementation-plan>`, `<step>`, or similar XML elements

**❌ FORBIDDEN: Code Examples**
- NEVER include TypeScript/JavaScript/React code snippets in plans
- NEVER show `import`, `export`, `interface`, `function` declarations
- Focus on WHAT to implement, not HOW to code it

### MANDATORY Validation Commands

**Every step touching .js/.jsx/.ts/.tsx files MUST include:**
```bash
npm run lint:fix && npm run typecheck
```

**Quality Gates section MUST include:**
- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`

### Agent-Specific Standards

#### implementation-planner Agent
- **OUTPUT**: Pure markdown template format only
- **CONTENT**: High-level actionable steps without code
- **VALIDATION**: Every code step includes lint/typecheck commands
- **FOCUS**: Architecture and file organization, not implementation details

#### file-discovery-agent Agent
- **MINIMUM**: Must discover at least 5 relevant files
- **CATEGORIZATION**: Must prioritize files (HIGH/MEDIUM/LOW priority)
- **VALIDATION**: Must verify all discovered file paths exist

#### general-purpose Agent (refinement)
- **LENGTH**: Refined request should be 2-4x original (150-300 words max)
- **SCOPE**: Preserve original intent, no feature creep
- **CONTEXT**: Add only essential technical details

## Orchestration Workflow Standards

### Step 1: Feature Request Refinement
- **Duration**: 30-60 seconds
- **Output**: Enhanced request with project context
- **Quality Gate**: Length analysis (2-4x expansion check)
- **Quality Gate**: Scope preservation verification

### Step 2: File Discovery
- **Duration**: 60-90 seconds
- **Output**: Categorized file list with priorities
- **Quality Gate**: Minimum 5 files discovered
- **Quality Gate**: File path validation

### Step 3: Implementation Planning
- **Duration**: 120-180 seconds
- **Output**: Structured XML plan (legacy compatibility)
- **Quality Gate**: All required XML sections present
- **Quality Gate**: Minimum 3 implementation steps

### Final Deliverable
- **Location**: `docs/{YYYY_MM_DD}/plans/{feature-name}-implementation-plan.md`
- **Format**: Markdown with analysis summary and XML plan
- **Sections**: Analysis Summary, File Discovery Results, Implementation Plan

## Error Recovery Procedures

### Agent Non-Compliance
1. **Detection**: Validation hooks identify violations
2. **Logging**: Record specific violations in `.claude/logs/`
3. **Action**: Prompt for agent re-execution with corrected constraints
4. **Escalation**: Manual intervention if repeated failures

### Quality Gate Failures
1. **Step-Level**: Re-run individual step with enhanced prompts
2. **Workflow-Level**: Restart orchestration with corrected parameters
3. **Agent-Level**: Review and update agent prompt constraints

## Success Metrics

### Compliance Rates
- **Agent Format Compliance**: >95% markdown template usage
- **Code Example Violations**: <5% plans with forbidden code
- **Validation Commands**: 100% inclusion in code-touching steps

### Quality Metrics
- **File Discovery**: Average >8 files discovered per feature
- **Length Constraint**: 90% refined requests within 150-300 words
- **Timeline Accuracy**: Orchestration completes within 5 minutes

### Output Quality
- **Actionability**: Plans executable by developers without clarification
- **Completeness**: All user requirements addressed in final plan
- **Consistency**: Standard format maintained across all features