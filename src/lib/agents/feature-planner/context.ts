import { promises as fs } from 'fs';
import path from 'path';

interface ProjectContext {
  architecture: {
    authSystem: string;
    database: string;
    framework: string;
    stateManagement: string[];
    styling: string;
  };
  codebase: {
    formatting: string;
    isTypeCheckingEnabled: boolean;
    linting: string;
    testingFramework: string;
  };
  documentation: {
    claudeMd: string;
    packageInfo: Record<string, unknown>;
    readme: string;
  };
  infrastructure: {
    caching: string;
    deployment: string;
    monitoring: string;
    realtime: string;
  };
  patterns: {
    componentStructure: string;
    hasServerActions: boolean;
    isTypeSafetyEnabled: boolean;
    routingPattern: string;
  };
}

export class ContextService {
  async gatherProjectContext(): Promise<ProjectContext> {
    try {
      const [claudeMd, readme, packageJson] = await Promise.all([
        this.readClaudeMd(),
        this.readReadme(),
        this.readPackageJson(),
      ]);

      return {
        architecture: {
          authSystem: 'Clerk with role-based permissions',
          database: 'PostgreSQL with Neon serverless and Drizzle ORM',
          framework: 'Next.js 15.5.3 with App Router',
          stateManagement: ['TanStack Query', 'Nuqs for URL state', 'React state'],
          styling: 'Tailwind CSS with Radix UI components',
        },
        codebase: {
          formatting: 'Prettier',
          isTypeCheckingEnabled: true,
          linting: 'ESLint with multiple plugins',
          testingFramework: 'Vitest with Testing Library and Playwright',
        },
        documentation: {
          claudeMd,
          packageInfo: packageJson,
          readme,
        },
        infrastructure: {
          caching: 'Upstash Redis',
          deployment: 'Vercel',
          monitoring: 'Sentry for error tracking',
          realtime: 'Ably for real-time features',
        },
        patterns: {
          componentStructure: 'Feature-based with UI component library',
          hasServerActions: true,
          isTypeSafetyEnabled: true,
          routingPattern: 'App Router with route groups',
        },
      };
    } catch {
      // fallback context
      return this.getDefaultContext();
    }
  }

  private getDefaultContext(): ProjectContext {
    return {
      architecture: {
        authSystem: 'Clerk',
        database: 'PostgreSQL with Drizzle ORM',
        framework: 'Next.js with App Router',
        stateManagement: ['React state'],
        styling: 'Tailwind CSS',
      },
      codebase: {
        formatting: 'Prettier',
        isTypeCheckingEnabled: true,
        linting: 'ESLint',
        testingFramework: 'Unknown',
      },
      documentation: {
        claudeMd: '',
        packageInfo: {},
        readme: '',
      },
      infrastructure: {
        caching: 'Unknown',
        deployment: 'Unknown',
        monitoring: 'Unknown',
        realtime: 'Unknown',
      },
      patterns: {
        componentStructure: 'Component-based',
        hasServerActions: true,
        isTypeSafetyEnabled: true,
        routingPattern: 'App Router',
      },
    };
  }

  private async readClaudeMd(): Promise<string> {
    try {
      const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
      return await fs.readFile(claudeMdPath, 'utf-8');
    } catch {
      return '';
    }
  }

  private async readPackageJson(): Promise<Record<string, unknown>> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const content = await fs.readFile(packagePath, 'utf-8');
      return JSON.parse(content) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private async readReadme(): Promise<string> {
    try {
      const readmePath = path.join(process.cwd(), 'README.md');
      return await fs.readFile(readmePath, 'utf-8');
    } catch {
      return '';
    }
  }
}
