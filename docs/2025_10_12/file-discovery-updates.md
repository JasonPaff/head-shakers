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

fileExists: file.fileExists ?? true, // ❌ Assumes files exist

Agents are supposed to verify with Read tool, but:

- Default of true masks when agents fail to verify
- No server-side verification before storing

Fix:
import { existsSync } from 'fs';
import { join } from 'path';

fileExists: file.fileExists ?? existsSync(join(process.cwd(), file.filePath)),

High Priority Improvements 🟡

5. Agent Coverage Gaps

Missing Specialized Agents:

- Configuration Files Agent: tsconfig.json, next.config.ts, tailwind.config.ts, .env.example
- Test Files Agent: tests/\*_/_, _.test.ts, _.spec.ts
- Documentation Agent: docs/\*_/_, README.md, code comments
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

integrationPoint: "May need updates" // ❌ Not actionable

Fix: Require structured integration analysis:
{
integrationPoint: {
importedBy: ["src/app/page.tsx", "src/components/layout.tsx"],
exports: ["MyComponent", "useMyHook"],
modificationNeeded: "Add new prop `onFavorite` to component interface",
impact: "Will affect 3 files that import this component"
}
}
