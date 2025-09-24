import { promises as fs } from 'fs';
import path from 'path';

export class ContextService {
  async gatherProjectContext(): Promise<Record<string, unknown>> {
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
}