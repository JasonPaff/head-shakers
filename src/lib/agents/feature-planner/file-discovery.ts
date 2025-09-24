import { promises as fs } from 'fs';
import path from 'path';

import type { StepResult } from './types';

export class FileDiscoveryService {
  async discoverFiles(
    refinedRequest: string,
    orchestrationDir: string,
  ): Promise<StepResult> {
    const stepStart = Date.now();

    try {
      // for MVP, we'll do simple file discovery based on keywords
      // in production, this would use the file-discovery-agent
      const discoveredFiles = this.simpleFileDiscovery(refinedRequest);

      // save step log
      const logPath = path.join(orchestrationDir, '02-file-discovery.md');
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
}