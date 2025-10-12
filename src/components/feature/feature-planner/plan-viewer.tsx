import type { ComponentProps } from 'react';

import { auth } from '@clerk/nextjs/server';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  ListIcon,
} from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { createProtectedQueryContext } from '@/lib/queries/base/query-context';
import { FeaturePlannerQuery } from '@/lib/queries/feature-planner/feature-planner.query';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface PlanViewerProps extends ComponentProps<'div'>, ComponentTestIdProps {
  /**
   * Either provide planId to show the latest/selected generation,
   * or provide generationId to show a specific generation
   */
  generationId?: string;
  planId?: string;
}

/**
 * Plan Viewer Component
 * Displays generated implementation plans with metadata and steps
 * Server component that fetches data using facades
 */
export const PlanViewer = async ({ className, generationId, planId, testId, ...props }: PlanViewerProps) => {
  const planViewerTestId = testId || generateTestId('ui', 'plan-viewer', 'container');

  // Validate input
  if (!planId && !generationId) {
    return (
      <Card className={cn('border-destructive', className)} data-testid={planViewerTestId} {...props}>
        <CardHeader>
          <CardTitle className={'text-destructive'}>Invalid Configuration</CardTitle>
          <CardDescription>Either planId or generationId must be provided.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get user ID from Clerk
  const { userId } = await auth();
  if (!userId) {
    return (
      <Card className={cn('border-destructive', className)} data-testid={planViewerTestId} {...props}>
        <CardHeader>
          <CardTitle className={'text-destructive'}>Authentication Required</CardTitle>
          <CardDescription>You must be logged in to view this plan.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Create query context
  const context = createProtectedQueryContext(userId);

  // Fetch plan generation data
  let planGeneration;
  let plan;
  try {
    if (planId) {
      // Get plan to check for selected generation
      plan = await FeaturePlannerQuery.findPlanByIdAsync(planId, context);
      if (!plan) {
        throw new Error('Plan not found');
      }

      // Get all generations for this plan
      const generations = await FeaturePlannerQuery.getPlanGenerationsByPlanAsync(planId, context);

      // Use selected generation if available, otherwise use the latest completed one
      const selectedId = plan.selectedPlanGenerationId;
      if (selectedId) {
        planGeneration = generations.find((g) => g.id === selectedId);
      }
      if (!planGeneration) {
        planGeneration = generations.find((g) => g.status === 'completed') || generations[0];
      }
    } else if (generationId) {
      // Get generation by ID - need to get the plan first to get all generations
      // Since we don't have a direct method to get generation by ID, we need to find the plan
      // This is a limitation we might want to address later by adding a direct query method
      throw new Error('Direct generation lookup by ID not yet implemented. Please provide planId instead.');
    }
  } catch (error) {
    return (
      <Card className={cn('border-destructive', className)} data-testid={planViewerTestId} {...props}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-destructive'}>
            <AlertTriangleIcon aria-hidden className={'size-5'} />
            Error Loading Plan
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load plan generation data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!planGeneration) {
    return (
      <Card className={cn('', className)} data-testid={planViewerTestId} {...props}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-muted-foreground'} />
            Plan Not Found
          </CardTitle>
          <CardDescription>
            No plan generation found. Please generate an implementation plan first.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Fetch plan steps
  const planSteps = await FeaturePlannerQuery.getPlanStepsByGenerationAsync(planGeneration.id, context);

  // Determine complexity color
  const getComplexityColor = (complexity: null | string) => {
    switch (complexity) {
      case 'complex':
        return 'text-orange-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'simple':
        return 'text-green-600';
      case 'very-complex':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  // Determine risk level color
  const getRiskLevelColor = (riskLevel: null | string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('space-y-6', className)} data-testid={planViewerTestId} {...props}>
      {/* Plan Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-primary'} />
            Implementation Plan
          </CardTitle>
          {planGeneration.refinedRequest && (
            <CardDescription>{planGeneration.refinedRequest}</CardDescription>
          )}
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {/* Metadata Grid */}
          <div className={'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'}>
            {/* Estimated Duration */}
            {planGeneration.estimatedDuration && (
              <div className={'flex items-start gap-2'}>
                <ClockIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
                <div>
                  <p className={'text-sm font-medium'}>Duration</p>
                  <p className={'text-sm text-muted-foreground'}>{planGeneration.estimatedDuration}</p>
                </div>
              </div>
            )}

            {/* Complexity */}
            {planGeneration.complexity && (
              <div className={'flex items-start gap-2'}>
                <ListIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
                <div>
                  <p className={'text-sm font-medium'}>Complexity</p>
                  <p className={cn('text-sm capitalize', getComplexityColor(planGeneration.complexity))}>
                    {planGeneration.complexity.replace('-', ' ')}
                  </p>
                </div>
              </div>
            )}

            {/* Risk Level */}
            {planGeneration.riskLevel && (
              <div className={'flex items-start gap-2'}>
                <AlertTriangleIcon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
                <div>
                  <p className={'text-sm font-medium'}>Risk Level</p>
                  <p className={cn('text-sm capitalize', getRiskLevelColor(planGeneration.riskLevel))}>
                    {planGeneration.riskLevel}
                  </p>
                </div>
              </div>
            )}

            {/* Total Steps */}
            <div className={'flex items-start gap-2'}>
              <CheckCircle2Icon aria-hidden className={'mt-0.5 size-4 text-muted-foreground'} />
              <div>
                <p className={'text-sm font-medium'}>Total Steps</p>
                <p className={'text-sm text-muted-foreground'}>{planSteps.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Steps */}
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <ListIcon aria-hidden className={'size-5 text-primary'} />
            Implementation Steps
          </CardTitle>
          <CardDescription>Follow these steps to implement the feature</CardDescription>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {planSteps.length === 0 ?
            <div className={'rounded-lg bg-muted p-6 text-center'}>
              <p className={'text-sm text-muted-foreground'}>No steps found for this plan.</p>
            </div>
          : <div className={'space-y-3'}>
              {planSteps.map((step, index) => {
                const hasCommands = Boolean(step.commands && step.commands.length > 0);
                const hasValidationCommands = Boolean(
                  step.validationCommands && step.validationCommands.length > 0,
                );

                return (
                  <Collapsible key={step.id}>
                    <Card className={'border'}>
                      <CollapsibleTrigger className={'w-full'}>
                        <CardHeader className={'pb-3'}>
                          <div className={'flex items-start justify-between gap-4'}>
                            <div className={'flex items-start gap-3'}>
                              <div
                                className={
                                  'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground'
                                }
                              >
                                {index + 1}
                              </div>
                              <div className={'text-left'}>
                                <CardTitle className={'text-base'}>{step.title}</CardTitle>
                                {step.confidenceLevel && (
                                  <p className={'mt-1 text-xs text-muted-foreground'}>
                                    Confidence: <span className={'capitalize'}>{step.confidenceLevel}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronDownIcon
                              aria-hidden
                              className={
                                'size-5 shrink-0 text-muted-foreground transition-transform duration-200'
                              }
                            />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className={'space-y-3 pt-0'}>
                          {/* Description */}
                          {step.description && (
                            <div>
                              <h4 className={'mb-1 text-sm font-medium'}>Description</h4>
                              <p className={'text-sm whitespace-pre-wrap text-muted-foreground'}>
                                {step.description}
                              </p>
                            </div>
                          )}

                          {/* Category */}
                          {step.category && (
                            <div>
                              <h4 className={'mb-1 text-sm font-medium'}>Category</h4>
                              <p className={'text-sm text-muted-foreground capitalize'}>{step.category}</p>
                            </div>
                          )}

                          {/* Estimated Duration */}
                          {step.estimatedDuration && (
                            <div>
                              <h4 className={'mb-1 text-sm font-medium'}>Estimated Duration</h4>
                              <p className={'text-sm text-muted-foreground'}>{step.estimatedDuration}</p>
                            </div>
                          )}

                          {/* Commands */}
                          {hasCommands && (
                            <div>
                              <h4 className={'mb-1 text-sm font-medium'}>Commands</h4>
                              <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                                {step.commands?.map((command, cmdIndex) => (
                                  <li key={cmdIndex}>{command}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Validation Commands */}
                          {hasValidationCommands && (
                            <div>
                              <h4 className={'mb-1 text-sm font-medium'}>Validation Commands</h4>
                              <ul className={'list-inside list-disc space-y-1 text-sm text-muted-foreground'}>
                                {step.validationCommands?.map((command, cmdIndex) => (
                                  <li key={cmdIndex}>{command}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          }
        </CardContent>
      </Card>
    </div>
  );
};
