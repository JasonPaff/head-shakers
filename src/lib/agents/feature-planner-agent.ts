import path from 'path';

import {
  ContextService,
  type FeaturePlannerResult,
  FileDiscoveryService,
  LoggingService,
  PlanGenerationService,
  RefinementService,
} from './feature-planner';

export class FeaturePlannerAgent {
  private contextService = new ContextService();
  private readonly date: string = '';
  private featureName: string = '';
  private fileDiscoveryService = new FileDiscoveryService();

  private loggingService = new LoggingService();
  private orchestrationDir: string = '';
  private planGenerationService = new PlanGenerationService();
  private refinementService = new RefinementService();
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
      await this.loggingService.initializeOrchestrationDirectory(this.orchestrationDir, this.featureName);

      // step 1: refine feature request
      const refinedResult = await this.refinementService.refineFeatureRequest(
        featureRequest,
        this.orchestrationDir,
      );
      if (!refinedResult.isSuccessful) {
        throw new Error(`Feature refinement failed: ${refinedResult.error}`);
      }

      // step 2 & 3: run file discovery and context gathering in parallel
      const [filesResult, contextData] = await Promise.all([
        this.fileDiscoveryService.discoverFiles(refinedResult.data as string, this.orchestrationDir),
        this.contextService.gatherProjectContext(),
      ]);

      if (!filesResult.isSuccessful) {
        throw new Error(`File discovery failed: ${filesResult.error}`);
      }

      // step 4: generate the implementation plan
      const planResult = await this.planGenerationService.generateImplementationPlan(
        refinedResult.data as string,
        filesResult.data as string[],
        contextData,
        this.orchestrationDir,
      );

      if (!planResult.isSuccessful) {
        throw new Error(`Implementation plan generation failed: ${planResult.error}`);
      }

      // save final implementation plan
      const planPath = await this.loggingService.saveFinalPlan(
        planResult.data as string,
        featureRequest,
        refinedResult.data as string,
        this.featureName,
        this.date,
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

  private generateFeatureName(request: string): string {
    // generate a clean feature name from the request
    const cleanName = request
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);

    return cleanName || 'feature';
  }
}