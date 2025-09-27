import { query } from '@anthropic-ai/claude-code';
import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

import { isClaudeSuccessResult, validateClaudeResult } from './validation-utils';

interface AIFileDiscoveryResult {
  aiAnalysis: string;
  discoveredFiles: string[];
  executionMetrics: {
    apiCalls: number;
    apiDuration: number;
    totalCost: number;
    totalDuration: number;
  };
  summary: string;
}

interface DiscoveredFile {
  category: 'actions' | 'components' | 'pages' | 'queries' | 'schema' | 'types' | 'utils' | 'validation';
  path: string;
  priority: 'critical' | 'high' | 'low' | 'medium';
  reason: string;
}

interface FileDiscoveryResult {
  categorizedFiles: Record<string, DiscoveredFile[]>;
  summary: string;
  totalFiles: number;
}

export class FileDiscoveryService {
  async discoverFiles(refinedRequest: string, orchestrationDir: string): Promise<StepResult> {
    const stepStart = Date.now();
    const stepLog = {
      errors: [] as Array<{ error: string; timestamp: string }>,
      metrics: {
        apiCalls: 0,
        apiDuration: 0,
        totalCost: 0,
        totalDuration: 0,
      },
      status: 'in_progress' as 'completed' | 'failed' | 'in_progress',
      timestamps: {
        aiQueryEnd: '',
        aiQueryStart: '',
        start: new Date(stepStart).toISOString(),
      },
    };

    try {
      // use AI-powered file discovery instead of keyword-based approach
      const aiResult = await this.aiFileDiscovery(refinedRequest, stepLog);

      if (!aiResult) {
        throw new Error('AI file discovery failed to return results');
      }

      // parse the AI results and convert to our expected format
      const result = await this.parseAndValidateAIResults(aiResult, stepLog);

      // save the enhanced step log with AI analysis
      const logPath = path.join(orchestrationDir, '02-file-discovery.md');
      const logContent = this.generateAIDiscoveryLog(refinedRequest, result, aiResult, stepLog, stepStart);

      await fs.mkdir(path.dirname(logPath), { recursive: true });
      await fs.writeFile(logPath, logContent);

      // update final metrics
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.status = 'completed';

      // return the flat list of files for backward compatibility
      const allFiles = Object.values(result.categorizedFiles)
        .flat()
        .map((f) => f.path);

      return {
        data: allFiles,
        isSuccessful: true,
      };
    } catch (error) {
      stepLog.status = 'failed';
      stepLog.metrics.totalDuration = Date.now() - stepStart;
      stepLog.errors.push({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });

      // save error log
      await this.saveErrorLog(refinedRequest, error, orchestrationDir, stepLog, stepStart);

      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private async aiFileDiscovery(
    refinedRequest: string,
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: {
        apiCalls: number;
        apiDuration: number;
        totalCost: number;
        totalDuration: number;
      };
      timestamps: Record<string, string>;
    },
  ): Promise<AIFileDiscoveryResult | null> {
    stepLog.timestamps.aiQueryStart = new Date().toISOString();
    stepLog.metrics.apiCalls++;

    try {
      const messages = [];

      // use Claude with file-discovery capabilities
      for await (const message of query({
        options: {
          allowedTools: ['*'],
          maxTurns: 5,
        },
        prompt: `I need you to identify all files relevant to implementing this feature request in the Head Shakers bobblehead collection platform:

"${refinedRequest}"

You are an expert codebase analysis agent. Analyze the project structure, search for relevant files using multiple discovery strategies, and provide a prioritized list of files essential for implementing this feature.

Please:
1. **Analyze Project Structure**: Examine the Head Shakers codebase architecture to understand how features are organized
2. **Conduct Systematic File Discovery**: Use pattern-based searches, directory traversal, and content analysis
3. **Validate File Relevance**: Read file contents to understand current functionality and integration points
4. **Prioritize Files**: Categorize by implementation priority and determine modification needs

Return your findings in this exact format:

# File Discovery Results

## Analysis Summary

- Explored X directories
- Examined Y candidate files
- Found Z highly relevant files
- Identified N supporting files

## Discovered Files

### High Priority (Core Implementation)

- \`file/path.ts\` - Brief description of relevance and role
- \`file/path2.tsx\` - Brief description of relevance and role

### Medium Priority (Supporting/Integration)

- \`file/path3.ts\` - Brief description of relevance and role
- \`file/path4.tsx\` - Brief description of relevance and role

### Low Priority (May Need Updates)

- \`file/path5.ts\` - Brief description of relevance and role

## Architecture Insights

- Key patterns discovered in the codebase
- Existing similar functionality found
- Integration points identified

**Focus on these areas**: database schemas (src/lib/db/schema), server actions (src/lib/actions), queries (src/lib/queries), validations (src/lib/validations), UI components (src/components), pages (src/app), types, and utilities.`,
      })) {
        messages.push(message);
      }

      stepLog.timestamps.aiQueryEnd = new Date().toISOString();

      // find the result message
      const resultMessage = messages.find((m) => m.type === 'result');
      if (!resultMessage) {
        stepLog.errors.push({
          error: `No result message found. Message count: ${messages.length}`,
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // validate the Claude result structure
      const validatedResult = validateClaudeResult(resultMessage);

      if (!isClaudeSuccessResult(validatedResult)) {
        stepLog.errors.push({
          error: `Claude execution failed with subtype: ${validatedResult.subtype}`,
          timestamp: new Date().toISOString(),
        });
        stepLog.metrics.apiDuration = validatedResult.duration_api_ms;
        stepLog.metrics.totalCost = validatedResult.total_cost_usd;
        return null;
      }

      const successResult = validatedResult;
      stepLog.metrics.apiDuration = successResult.duration_api_ms;
      stepLog.metrics.totalCost = successResult.total_cost_usd;

      if (typeof successResult.result !== 'string') {
        stepLog.errors.push({
          error: `Invalid result type: ${typeof successResult.result}`,
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      const aiAnalysis = successResult.result.trim();

      if (!aiAnalysis) {
        stepLog.errors.push({
          error: 'Empty AI analysis after trimming',
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // extract discovered files from the AI analysis
      const discoveredFiles = this.extractFilesFromAIAnalysis(aiAnalysis);

      return {
        aiAnalysis,
        discoveredFiles,
        executionMetrics: {
          apiCalls: stepLog.metrics.apiCalls,
          apiDuration: stepLog.metrics.apiDuration,
          totalCost: stepLog.metrics.totalCost,
          totalDuration: 0, // will be set later
        },
        summary: `AI discovered ${discoveredFiles.length} relevant files for feature implementation`,
      };
    } catch (error) {
      stepLog.errors.push({
        error: error instanceof Error ? error.message : 'Unknown error in AI discovery',
        timestamp: new Date().toISOString(),
      });
      return null;
    }
  }

  private categorizeFileByPath(filePath: string): DiscoveredFile['category'] {
    if (filePath.includes('/schema/')) return 'schema';
    if (filePath.includes('/actions/')) return 'actions';
    if (filePath.includes('/queries/')) return 'queries';
    if (filePath.includes('/validations/')) return 'validation';
    if (filePath.includes('/components/')) return 'components';
    if (filePath.includes('/app/') && filePath.includes('page.tsx')) return 'pages';
    if (filePath.includes('/types/')) return 'types';
    if (filePath.includes('/utils/')) return 'utils';

    // default categorization based on file extension
    if (filePath.endsWith('.tsx') && filePath.includes('page')) return 'pages';
    if (filePath.endsWith('.tsx')) return 'components';
    if (filePath.includes('action')) return 'actions';
    if (filePath.includes('query')) return 'queries';
    if (filePath.includes('schema')) return 'schema';
    if (filePath.includes('validation')) return 'validation';
    if (filePath.includes('type')) return 'types';

    return 'utils'; // default fallback
  }

  private categorizeFiles(files: DiscoveredFile[]): Record<string, DiscoveredFile[]> {
    const categorized: Record<string, DiscoveredFile[]> = {
      critical: [],
      high: [],
      low: [],
      medium: [],
    };

    files.forEach((file) => {
      const category = categorized[file.priority];
      if (category) {
        category.push(file);
      }
    });

    return categorized;
  }

  private extractFilesFromAIAnalysis(aiAnalysis: string): string[] {
    const files: string[] = [];

    // extract file paths from markdown format using regex
    // look for patterns like: - `file/path.ts` - description
    const filePathPattern = /- `([^`]+\.[a-zA-Z]+)` - /g;
    let match;

    while ((match = filePathPattern.exec(aiAnalysis)) !== null) {
      const filePath = match[1];
      if (filePath && !files.includes(filePath)) {
        files.push(filePath);
      }
    }

    // also look for other common patterns
    const alternatePattern = /`([^`]+\.(ts|tsx|js|jsx|md|json))`/g;
    while ((match = alternatePattern.exec(aiAnalysis)) !== null) {
      const filePath = match[1];
      if (filePath && !files.includes(filePath) && !filePath.includes('example') && !filePath.includes('placeholder')) {
        files.push(filePath);
      }
    }

    return files;
  }

  private generateAIDiscoveryLog(
    refinedRequest: string,
    result: FileDiscoveryResult,
    aiResult: AIFileDiscoveryResult,
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: {
        apiCalls: number;
        apiDuration: number;
        totalCost: number;
        totalDuration: number;
      };
      status: string;
      timestamps: Record<string, string>;
    },
    stepStart: number,
  ): string {
    const duration = ((Date.now() - stepStart) / 1000).toFixed(2);

    return `# Step 2: AI-Powered File Discovery

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${duration}s
**Status:** ✅ ${stepLog.status}

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ✅ ${stepLog.status} |
| **Total Duration** | ${duration}s |
| **AI API Duration** | ${stepLog.metrics.apiDuration}ms |
| **AI API Cost** | $${stepLog.metrics.totalCost.toFixed(4)} |
| **AI API Calls** | ${stepLog.metrics.apiCalls} |
| **Files Discovered** | ${result.totalFiles} |

## Refined Request Analysis

${refinedRequest}

## AI File Discovery Analysis

${aiResult.aiAnalysis}

## Discovery Summary

${result.summary}

## Discovered Files by Priority

### Critical Priority Files (${result.categorizedFiles.critical?.length || 0})

${result.categorizedFiles.critical?.map((f) => `- \`${f.path}\` - ${f.reason}`).join('\n') || 'None found'}

### High Priority Files (${result.categorizedFiles.high?.length || 0})

${result.categorizedFiles.high?.map((f) => `- \`${f.path}\` - ${f.reason}`).join('\n') || 'None found'}

### Medium Priority Files (${result.categorizedFiles.medium?.length || 0})

${result.categorizedFiles.medium?.map((f) => `- \`${f.path}\` - ${f.reason}`).join('\n') || 'None found'}

### Low Priority Files (${result.categorizedFiles.low?.length || 0})

${result.categorizedFiles.low?.map((f) => `- \`${f.path}\` - ${f.reason}`).join('\n') || 'None found'}

## File Categories

### Database Schema
${
  result.categorizedFiles.critical
    ?.filter((f) => f.category === 'schema')
    .map((f) => `- ${f.path}`)
    .join('\n') || 'None found'
}

### Server Actions
${
  result.categorizedFiles.high
    ?.filter((f) => f.category === 'actions')
    .map((f) => `- ${f.path}`)
    .join('\n') || 'None found'
}

### Query Layer
${
  result.categorizedFiles.high
    ?.filter((f) => f.category === 'queries')
    .map((f) => `- ${f.path}`)
    .join('\n') || 'None found'
}

### UI Components
${
  result.categorizedFiles.medium
    ?.filter((f) => f.category === 'components')
    .map((f) => `- ${f.path}`)
    .join('\n') || 'None found'
}

### Application Pages
${
  result.categorizedFiles.medium
    ?.filter((f) => f.category === 'pages')
    .map((f) => `- ${f.path}`)
    .join('\n') || 'None found'
}

## AI Processing Timeline

${Object.entries(stepLog.timestamps)
  .filter(([, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Processing Errors

${
  stepLog.errors.length > 0
    ? stepLog.errors.map((e) => `- **${e.timestamp}**: ${e.error}`).join('\n')
    : '✅ No errors encountered during AI file discovery'
}

## AI Discovery Advantages

- **Context-Aware**: AI understands feature requirements beyond simple keywords
- **Content Analysis**: AI examines actual file contents for relevance
- **Smart Prioritization**: AI considers implementation dependencies and relationships
- **Comprehensive Coverage**: AI discovers files across all architectural layers
- **Pattern Recognition**: AI identifies similar existing functionality for reference
`;
  }

  private async parseAndValidateAIResults(
    aiResult: AIFileDiscoveryResult,
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
    },
  ): Promise<FileDiscoveryResult> {
    const discoveredFiles: DiscoveredFile[] = [];

    // validate and categorize each discovered file
    for (const filePath of aiResult.discoveredFiles) {
      try {
        // attempt to read the file to validate it exists
        await fs.access(path.join(process.cwd(), filePath));

        // categorize based on file path and extension
        const category = this.categorizeFileByPath(filePath);
        const priority = this.prioritizeFileByPath(filePath);

        discoveredFiles.push({
          category,
          path: filePath,
          priority,
          reason: `AI-discovered file relevant to feature implementation`,
        });
      } catch {
        // file doesn't exist, log but continue
        stepLog.errors.push({
          error: `AI discovered non-existent file: ${filePath}`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // categorize files by priority
    const categorizedFiles = this.categorizeFiles(discoveredFiles);

    return {
      categorizedFiles,
      summary: `AI analysis discovered ${discoveredFiles.length} relevant files across ${Object.keys(categorizedFiles).length} priority levels`,
      totalFiles: discoveredFiles.length,
    };
  }

  private prioritizeFileByPath(filePath: string): DiscoveredFile['priority'] {
    // critical: database schemas and core actions
    if (filePath.includes('/schema/') || (filePath.includes('/actions/') && !filePath.includes('test'))) {
      return 'critical';
    }

    // high: queries, validations, and core components
    if (filePath.includes('/queries/') || filePath.includes('/validations/') || filePath.includes('/lib/')) {
      return 'high';
    }

    // medium: UI components and pages
    if (filePath.includes('/components/') || filePath.includes('page.tsx')) {
      return 'medium';
    }

    // low: utilities and type definitions
    return 'low';
  }

  private async saveErrorLog(
    refinedRequest: string,
    error: unknown,
    orchestrationDir: string,
    stepLog: {
      errors: Array<{ error: string; timestamp: string }>;
      metrics: {
        apiCalls: number;
        apiDuration: number;
        totalCost: number;
        totalDuration: number;
      };
      timestamps: Record<string, string>;
    },
    stepStart: number,
  ): Promise<void> {
    const logPath = path.join(orchestrationDir, '02-file-discovery.md');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorLog = `# Step 2: AI-Powered File Discovery

## Execution Summary

| Metric | Value |
|--------|-------|
| **Status** | ❌ Failed |
| **Duration** | ${((Date.now() - stepStart) / 1000).toFixed(2)}s |
| **Error Type** | ${error instanceof Error ? error.constructor.name : 'Unknown'} |
| **Timestamp** | ${new Date().toISOString()} |

## Input Context

### Refined Request
${refinedRequest}

## Error Details

\`\`\`
${errorMessage}
\`\`\`

${error instanceof Error && error.stack ? `### Stack Trace\n\n\`\`\`\n${error.stack}\n\`\`\`` : ''}

## Processing Timeline

${Object.entries(stepLog.timestamps)
  .filter(([, value]) => value)
  .map(([key, value]) => `- **${key}**: ${value}`)
  .join('\n')}

## Error Log

${stepLog.errors.map((e) => `- **${e.timestamp}**: ${e.error}`).join('\n')}

## Troubleshooting Information

- Ensure file-discovery-agent is properly configured
- Verify Claude API access and sufficient credits
- Check that the refined request is properly formatted
- Confirm project structure is accessible for file discovery
- Ensure all required tools are available to the AI agent

## Fallback Recommendation

Consider using basic file discovery patterns as a fallback:
- Database schemas: \`src/lib/db/schema/*.ts\`
- Server actions: \`src/lib/actions/*.ts\`
- Queries: \`src/lib/queries/*.ts\`
- Components: \`src/components/**/*.tsx\`
- Pages: \`src/app/**/*page.tsx\`
`;

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, errorLog).catch(() => {});
  }

}
