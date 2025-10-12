Critical Issues 🔴

1. Architecture Insights Never Populated

Location: feature-planner.facade.ts:261-278

// ❌ The architectureInsights field exists in the schema but is never set
const updatedSession = await FeaturePlannerQuery.updateFileDiscoverySessionAsync(
session.id,
{
// ... other fields
// architectureInsights: <-- MISSING
},
context,
);

Fix: Update the parallel agent coordinator to extract and synthesize architecture insights:
- Add a post-processing step that analyzes all discovered files
- Identify patterns (e.g., "All actions use Drizzle transactions", "Forms use TanStack React Form")
- Surface reusable components and utilities
- Note architectural conventions (folder structure, naming patterns)

2. Agent Output Format Compliance Issues

Location: feature-planner.service.ts:927-999

The complex parsing logic with multiple fallbacks indicates agents aren't reliably returning the expected JSON format:

// The fact we need all these fallbacks means the prompt isn't working:
- JSON format parsing
- Markdown format parsing
- Regex pattern matching fallback

Root Cause: The prompt at buildSpecializedAgentPrompt tries to enforce format with "START YOUR RESPONSE WITH: ```json" but this is too rigid.

Fix:
- Add few-shot examples in the prompt showing exact expected output
- Use structured output mode if available in Claude SDK
- Add validation step that requests reformatting if output is invalid
- Consider using Claude's tool calling feature with defined schemas

3. File Existence Verification is Incorrect

Location: feature-planner.facade.ts:286

fileExists: file.fileExists ?? true,  // ❌ Assumes files exist

Agents are supposed to verify with Read tool, but:
- Default of true masks when agents fail to verify
- No server-side verification before storing

Fix:
import { existsSync } from 'fs';
import { join } from 'path';

fileExists: file.fileExists ?? existsSync(join(process.cwd(), file.filePath)),

High Priority Improvements 🟡

4. Weak Deduplication Logic

Location: feature-planner.service.ts:585-616

Current logic only keeps highest relevance score:
if (!existing || file.relevanceScore > existing.relevanceScore) {
fileMap.set(normalizedPath, file);
}

Problem: Loses valuable information from other agents' perspectives.

Fix: Implement consensus-based aggregation:
if (existing) {
// Merge descriptions from multiple agents
// Average or max relevance scores
// Combine reasoning from different perspectives
// Use highest priority assigned by any agent
fileMap.set(normalizedPath, {
...existing,
relevanceScore: Math.max(existing.relevanceScore, file.relevanceScore),
description: `${existing.description} | ${file.description}`,
reasoning: existing.reasoning ?
`${existing.reasoning}; ${file.reasoning}` :
file.reasoning,
});
}

5. Agent Coverage Gaps

Missing Specialized Agents:
- Configuration Files Agent: tsconfig.json, next.config.ts, tailwind.config.ts, .env.example
- Test Files Agent: tests/**/*, *.test.ts, *.spec.ts
- Documentation Agent: docs/**/*, README.md, code comments
- Build/Tooling Agent: package.json, drizzle.config.ts, ESLint configs

Impact: Important files for implementation (configs, tests) are missed.

Fix: Add 4 new specialized agents to SPECIALIZED_AGENTS array.

6. Priority Assignment Inconsistency

No clear guidance on priority criteria leads to inconsistent classifications:

// Agent might say "high" when it should be "critical"
// No calibration across agents

Fix: Add explicit priority rubric to prompt:

PRIORITY CRITERIA:
- **critical**: MUST modify for feature to work (core logic, schema changes)
- **high**: LIKELY modify for integration (API routes, UI components directly used)
- **medium**: MAY modify for polish (styling, related features, type definitions)
- **low**: Reference only (similar patterns, utility functions, examples)

RELEVANCE SCORE CALIBRATION:
- 90-100: Core implementation file, will definitely modify
- 70-89: Direct integration point, likely to modify
- 50-69: Supporting file that may need updates
- 30-49: Reference/context file, probably won't modify

7. No Progressive/Streaming Discovery

Current implementation is all-or-nothing:
- All 11 agents run in parallel
- User waits 30-60 seconds with no feedback
- No ability to cancel or adjust mid-flight

Fix: Implement phased discovery:

Phase 1 (fast, 10s): Run highest-priority agents first
- Database Schema Agent
- Server Actions Agent
- UI Components Agent

Phase 2 (medium, 20s): Run integration agents
- API Routes Agent
- Hooks Agent
- Facades & Services Agent

Phase 3 (thorough, 30s): Run supporting agents
- Types, Validations, Utils agents

Show results incrementally as each phase completes.

8. Inefficient File Verification

Agents are told to Read every file, which is wasteful:

// YOUR TASK:
// 3. Use Read to VERIFY each file exists before adding it to your results

Problem:
- Reading large files just for existence check
- Wasted tokens on file contents
- Slower execution

Fix: Use a more efficient verification strategy:
// In prompt: "Use Glob to verify file exists, only Read files you need to understand content"
// Or server-side: Verify existence after agent returns results

9. Missing Integration Point Structure

The integrationPoint field is often vague or missing:

integrationPoint: "May need updates"  // ❌ Not actionable

Fix: Require structured integration analysis:
{
integrationPoint: {
importedBy: ["src/app/page.tsx", "src/components/layout.tsx"],
exports: ["MyComponent", "useMyHook"],
modificationNeeded: "Add new prop `onFavorite` to component interface",
impact: "Will affect 3 files that import this component"
}
}

Medium Priority Enhancements 🟢

10. Smart Agent Selection

Don't always run all 11 agents. Use feature classification:

// Analyze refined request to determine feature type
const featureType = classifyFeature(refinedRequest);

// Select relevant agents based on type
const relevantAgents = {
'ui-component': ['ui-components-agent', 'hooks-agent', 'types-agent'],
'api-endpoint': ['api-routes-agent', 'validations-agent', 'facades-services-agent'],
'database-change': ['database-schema-agent', 'queries-agent', 'facades-services-agent'],
'full-feature': SPECIALIZED_AGENTS // All agents
}[featureType];

Benefit: Faster discovery for simple features, lower token costs.

11. Caching & Memoization

Cache agent results for similar queries:

// Key: hash(refinedRequest + agentId + searchPaths)
// Value: discovered files
// TTL: 1 hour (codebase doesn't change that fast)

Benefit: Instant results for repeated/similar queries.

12. Cross-Agent Context Sharing

Currently agents work in isolation. Enable knowledge sharing:

// After Phase 1 completes, pass results to Phase 2 agents:
"The database-schema-agent found these tables: [users, posts, comments]
Your task is to find the queries that interact with these tables."

13. Relevance Score Calibration

Implement post-processing to normalize scores across agents:

// Some agents might score generously (avg 80)
// Others might score conservatively (avg 50)
// Normalize to standard distribution
function calibrateScores(files: FileDiscoveryResult[]): FileDiscoveryResult[] {
const mean = files.reduce((sum, f) => sum + f.relevanceScore, 0) / files.length;
const target = 65; // Target mean
const adjustment = target - mean;

    return files.map(f => ({
      ...f,
      relevanceScore: clamp(f.relevanceScore + adjustment, 0, 100)
    }));
}

14. Add File Type Detection

Currently fileType field exists but is never populated:

// schema.ts:292
fileType: varchar('file_type', { length: SCHEMA_LIMITS.FILE_DISCOVERY.FILE_TYPE.MAX }),

Fix: Detect and store file type:
const getFileType = (filePath: string): string => {
if (filePath.includes('schema')) return 'schema';
if (filePath.endsWith('.tsx')) return 'component';
if (filePath.includes('actions')) return 'server-action';
if (filePath.includes('api')) return 'api-route';
// ... etc
};

15. Lines of Code Tracking

The linesOfCode field exists but isn't populated:

// schema.ts:301
linesOfCode: integer('lines_of_code'),

Use cases:
- Estimate modification effort
- Flag overly complex files
- Prioritize smaller files for easier changes

Fix: Count lines when reading files or use stats from filesystem.

Low Priority / Nice to Have 🔵

16. Agent Performance Metrics

Track which agents perform best:
- Average relevance score by agent
- File acceptance rate (how many files users select per agent)
- Execution time per agent
- Token efficiency (files found per 1000 tokens)

Use metrics to improve prompts and adjust agent mix.

17. User Feedback Loop

Allow users to mark files as "Not Relevant" and feed that back:

// When user deselects a file with low relevance, record it
// Use to train/adjust agent scoring algorithms

18. Semantic Search Integration

Instead of just Grep, use semantic similarity:
- Embed feature request
- Embed file contents
- Use cosine similarity for relevance

Benefit: Finds conceptually related files even if keywords don't match.

19. Historical Learning

Track which files are commonly modified together:

// If users always select [schema.ts, actions.ts, route.ts] together
// Boost relevance scores for these files as a group

20. Test File Generation Hints

Add a field suggesting test files that should be created/updated:

{
filePath: "src/lib/actions/favorites.actions.ts",
suggestedTests: [
"tests/lib/actions/favorites.actions.test.ts",
"tests/integration/favorites-flow.test.ts"
]
}

Recommended Implementation Order

Sprint 1 (Critical Fixes - 2-3 days)

1. Fix file existence verification (existsSync)
2. Populate architecture insights field
3. Improve agent output format compliance
4. Add missing specialized agents (config, tests, docs)

Sprint 2 (Quality Improvements - 3-4 days)

5. Implement better deduplication with consensus
6. Add priority rubric to prompts
7. Implement progressive/streaming discovery
8. Add file type detection and LOC tracking

Sprint 3 (Performance & UX - 2-3 days)

9. Smart agent selection based on feature type
10. Add caching layer for repeated queries
11. Calibrate relevance scores across agents
12. Add structured integration point analysis

Sprint 4 (Advanced Features - 4-5 days)

13. Cross-agent context sharing
14. Agent performance metrics dashboard
15. User feedback loop
16. Historical learning system

Would you like me to create detailed implementation plans for any of these improvements? I can also help implement specific fixes right now if you'd like to start with
the critical issues.