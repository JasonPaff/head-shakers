import { promises as fs } from 'fs';
import path from 'path';

export class LoggingService {
  async initializeOrchestrationDirectory(orchestrationDir: string, featureName: string): Promise<void> {
    await fs.mkdir(orchestrationDir, { recursive: true });

    const indexPath = path.join(orchestrationDir, '00-orchestration-index.md');
    const indexContent = `# Feature Planning Orchestration

**Feature:** ${featureName}
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

  async saveFinalPlan(
    plan: string,
    originalRequest: string,
    refinedRequest: string,
    featureName: string,
    date: string,
  ): Promise<string> {
    const planDir = path.join(process.cwd(), 'docs', date, 'plans');
    await fs.mkdir(planDir, { recursive: true });

    const planPath = path.join(planDir, `${featureName}-implementation-plan.md`);

    const fullPlan = `# ${featureName} Implementation Plan

**Generated:** ${new Date().toISOString()}
**Original Request:** ${originalRequest}
**Refined Request:** ${refinedRequest}

${plan}
`;

    await fs.writeFile(planPath, fullPlan);

    return planPath;
  }
}
