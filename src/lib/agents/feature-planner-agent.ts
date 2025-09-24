import { promises as fs } from 'fs';
import path from 'path';

interface FeaturePlannerResult {
  discoveredFiles?: string[];
  error?: string;
  executionTime?: number;
  implementationPlan?: string;
  isSuccessful: boolean;
  orchestrationPath?: string;
  planPath?: string;
  refinedRequest?: string;
}

interface StepResult {
  data?: unknown;
  error?: string;
  isSuccessful: boolean;
}

export class FeaturePlannerAgent {
  private readonly date: string = '';
  private featureName: string = '';
  private orchestrationDir: string = '';
  private startTime: number = 0;

  constructor() {
    const now = new Date();
    this.date = now.toISOString().split('T')[0]?.replace(/-/g, '_') ?? 'unknown_date';
  }

  async plan(featureRequest: string): Promise<FeaturePlannerResult> {
    this.startTime = Date.now();
    this.featureName = this.generateFeatureName(featureRequest);
    this.orchestrationDir = path.join(process.cwd(), 'docs', this.date, 'orchestration', this.featureName);

    try {
      // create the orchestration directory structure
      await this.initializeOrchestrationDirectory();

      // step 1: refine feature request
      const refinedResult = await this.refineFeatureRequest(featureRequest);
      if (!refinedResult.isSuccessful) {
        throw new Error(`Feature refinement failed: ${refinedResult.error}`);
      }

      // step 2 & 3: run file discovery and context gathering in parallel
      const [filesResult, contextData] = await Promise.all([
        this.discoverFiles(refinedResult.data as string),
        this.gatherProjectContext(),
      ]);

      if (!filesResult.isSuccessful) {
        throw new Error(`File discovery failed: ${filesResult.error}`);
      }

      // step 4: generate the implementation plan
      const planResult = await this.generateImplementationPlan(
        refinedResult.data as string,
        filesResult.data as string[],
        contextData,
      );

      if (!planResult.isSuccessful) {
        throw new Error(`Implementation plan generation failed: ${planResult.error}`);
      }

      // save final implementation plan
      const planPath = await this.saveFinalPlan(
        planResult.data as string,
        featureRequest,
        refinedResult.data as string,
      );

      const executionTime = (Date.now() - this.startTime) / 1000;

      return {
        discoveredFiles: filesResult.data as string[],
        executionTime,
        implementationPlan: planResult.data as string,
        isSuccessful: true,
        orchestrationPath: this.orchestrationDir,
        planPath,
        refinedRequest: refinedResult.data as string,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: (Date.now() - this.startTime) / 1000,
        isSuccessful: false,
      };
    }
  }

  private async discoverFiles(refinedRequest: string): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // for MVP, we'll do simple file discovery based on keywords
      // in production, this would use the file-discovery-agent
      const discoveredFiles = this.simpleFileDiscovery(refinedRequest);

      // save step log
      const logPath = path.join(this.orchestrationDir, '02-file-discovery.md');
      const logContent = `# Step 2: File Discovery

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Success

## Refined Request Used

${refinedRequest}

## Discovered Files (${discoveredFiles.length})

${discoveredFiles.map((f) => `- ${f}`).join('\n')}

## File Categories

### Core Implementation
${discoveredFiles
  .filter((f) => f.includes('/lib/'))
  .map((f) => `- ${f}`)
  .join('\n')}

### UI Components
${discoveredFiles
  .filter((f) => f.includes('/components/'))
  .map((f) => `- ${f}`)
  .join('\n')}

### Pages/Routes
${discoveredFiles
  .filter((f) => f.includes('/app/'))
  .map((f) => `- ${f}`)
  .join('\n')}
`;

      await fs.writeFile(logPath, logContent);

      return {
        data: discoveredFiles,
        isSuccessful: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private async gatherProjectContext(): Promise<Record<string, unknown>> {
    // gather additional project context in parallel with file discovery
    try {
      const readmePath = path.join(process.cwd(), 'README.md');
      const readme = await fs.readFile(readmePath, 'utf-8').catch(() => '');

      return {
        hasReadme: readme.length > 0,
        readmeLength: readme.length,
      };
    } catch {
      return {};
    }
  }

  private generateFeatureName(request: string): string {
    // generate a clean feature name from the request
    const cleanName = request
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    return cleanName || 'feature';
  }

  private async generateImplementationPlan(
    refinedRequest: string,
    discoveredFiles: string[],
    contextData: Record<string, unknown>,
  ): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // for MVP, generate a simple implementation plan
      // in production; this would use the implementation-planner agent
      const plan = this.simpleImplementationPlan(refinedRequest, discoveredFiles);

      // save step log
      const logPath = path.join(this.orchestrationDir, '03-implementation-planning.md');
      const logContent = `# Step 3: Implementation Planning

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Success

## Input Summary

- Refined Request: ${refinedRequest.slice(0, 100)}...
- Discovered Files: ${discoveredFiles.length} files
- Context Data: ${JSON.stringify(contextData)}

## Generated Plan

${plan}
`;

      await fs.writeFile(logPath, logContent);

      return {
        data: plan,
        isSuccessful: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private async initializeOrchestrationDirectory(): Promise<void> {
    await fs.mkdir(this.orchestrationDir, { recursive: true });

    const indexPath = path.join(this.orchestrationDir, '00-orchestration-index.md');
    const indexContent = `# Feature Planning Orchestration

**Feature:** ${this.featureName}
**Started:** ${new Date().toISOString()}

## Workflow Overview

This orchestration runs a 3-step planning process:

1. **Feature Refinement** - Enhance request with project context
2. **File Discovery** - Find relevant files for implementation
3. **Implementation Planning** - Generate detailed implementation plan

## Steps

- [Step 1: Feature Refinement](./01-feature-refinement.md)
- [Step 2: File Discovery](./02-file-discovery.md)
- [Step 3: Implementation Planning](./03-implementation-planning.md)
`;

    await fs.writeFile(indexPath, indexContent);
  }

  private async refineFeatureRequest(request: string): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // read project context
      const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
      const packageJsonPath = path.join(process.cwd(), 'package.json');

      const [claudeMd, packageJson] = await Promise.all([
        fs.readFile(claudeMdPath, 'utf-8').catch(() => ''),
        fs.readFile(packageJsonPath, 'utf-8').catch(() => '{}'),
      ]);

      // for MVP, we'll do a simple refinement without calling external subagents
      // in production, this would call the Claude Code SDK
      const refinedRequest = this.simpleRefineRequest(request, claudeMd, packageJson);

      // save step log
      const logPath = path.join(this.orchestrationDir, '01-feature-refinement.md');
      const logContent = `# Step 1: Feature Refinement

**Started:** ${new Date(stepStart).toISOString()}
**Duration:** ${((Date.now() - stepStart) / 1000).toFixed(2)}s
**Status:** Success

## Original Request

${request}

## Refined Request

${refinedRequest}

## Context Used

- CLAUDE.md: ${claudeMd.length} characters
- package.json: ${packageJson.length} characters
`;

      await fs.writeFile(logPath, logContent);

      return {
        data: refinedRequest,
        isSuccessful: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        isSuccessful: false,
      };
    }
  }

  private async saveFinalPlan(
    plan: string,
    originalRequest: string,
    refinedRequest: string,
  ): Promise<string> {
    const planDir = path.join(process.cwd(), 'docs', this.date, 'plans');
    await fs.mkdir(planDir, { recursive: true });

    const planPath = path.join(planDir, `${this.featureName}-implementation-plan.md`);

    const fullPlan = `# ${this.featureName} Implementation Plan

**Generated:** ${new Date().toISOString()}
**Original Request:** ${originalRequest}
**Refined Request:** ${refinedRequest}

${plan}
`;

    await fs.writeFile(planPath, fullPlan);

    return planPath;
  }

  private simpleFileDiscovery(refinedRequest: string): string[] {
    // simple keyword-based file discovery for MVP
    const files = [
      'src/app/(app)/layout.tsx',
      'src/components/ui/form/index.tsx',
      'src/lib/actions/index.ts',
      'src/lib/validations/index.ts',
      'src/lib/db/schema.ts',
    ];

    // add files based on keywords in the request
    if (refinedRequest.toLowerCase().includes('auth')) {
      files.push('src/lib/auth/index.ts');
    }
    if (refinedRequest.toLowerCase().includes('ui') || refinedRequest.toLowerCase().includes('component')) {
      files.push('src/components/ui/button.tsx');
      files.push('src/components/ui/dialog.tsx');
    }
    if (
      refinedRequest.toLowerCase().includes('database') ||
      refinedRequest.toLowerCase().includes('schema')
    ) {
      files.push('src/lib/db/migrations/index.ts');
    }

    return files;
  }

  private simpleImplementationPlan(_refinedRequest: string, files: string[]): string {
    // simple plan generation for MVP
    return `# Implementation Plan

## Overview

**Estimated Duration:** 2-4 hours
**Complexity:** Medium
**Risk Level:** Low

## Quick Summary

Implement the requested feature following Head Shakers project patterns and conventions.

## Prerequisites

- Node.js and npm installed
- PostgreSQL database running
- Environment variables configured
- Dependencies installed

## Implementation Steps

### Step 1: Setup and Planning
**What:** Review requirements and existing codebase
**Why:** Ensure understanding of the task and existing patterns
**Confidence:** High
**Files:** ${files.slice(0, 3).join(', ')}
**Validation Commands:** npm run lint:fix && npm run typecheck
**Success Criteria:** Clear understanding of implementation approach

### Step 2: Core Implementation
**What:** Implement the main feature logic
**Why:** Core functionality is the foundation
**Confidence:** High
**Files:** ${files.slice(3, 6).join(', ')}
**Validation Commands:** npm run lint:fix && npm run typecheck
**Success Criteria:** Feature works as expected

### Step 3: Testing and Validation
**What:** Add tests and validate implementation
**Why:** Ensure quality and prevent regressions
**Confidence:** High
**Files:** Test files
**Validation Commands:** npm run test && npm run lint:fix && npm run typecheck
**Success Criteria:** All tests pass, no lint or type errors

## Quality Gates

- All TypeScript types properly defined
- No use of 'any' type
- Code formatted with Prettier
- ESLint rules pass
- Tests provide adequate coverage
- Documentation updated if needed

## Notes

- Follow existing patterns in the codebase
- Use existing UI components from Radix UI
- Implement proper error handling
- Add appropriate logging`;
  }

  private simpleRefineRequest(request: string, _claudeMd: string, packageJson: string): string {
    // simple refinement logic for MVP
    const parsedJson = JSON.parse(packageJson || '{}') as { dependencies?: Record<string, string> };
    const deps = parsedJson.dependencies ?? {};
    const techStack = Object.keys(deps).slice(0, 5).join(', ');

    return `${request}. This feature will be implemented in the Head Shakers bobblehead collection platform using Next.js 15 with App Router, React 19, TypeScript, and Tailwind CSS. The application uses PostgreSQL with Drizzle ORM for the database, Clerk for authentication, and includes real-time features with Ably. Key technologies include: ${techStack}. The implementation should follow existing patterns for server actions, validation with Zod, and UI components built on Radix UI primitives.`;
  }
}
