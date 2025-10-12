'use client';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  ListIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/utils/tailwind-utils';

interface PlanGeneration {
  complexity: null | string;
  estimatedDuration: null | string;
  id: string;
  refinedRequest: null | string;
  riskLevel: null | string;
  status: string;
}

interface PlanStep {
  category: null | string;
  commands: null | string[];
  confidenceLevel: null | string;
  description: null | string;
  displayOrder: number;
  estimatedDuration: null | string;
  id: string;
  stepNumber: number;
  title: string;
  validationCommands: null | string[];
}

interface PlanViewerClientProps {
  planId: string;
}

/**
 * Client-side Plan Viewer Component
 * Fetches and displays generated implementation plans
 */
export const PlanViewerClient = ({ planId }: PlanViewerClientProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [planGeneration, setPlanGeneration] = useState<null | PlanGeneration>(null);
  const [planSteps, setPlanSteps] = useState<PlanStep[]>([]);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/feature-planner/${planId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }

        const data = (await response.json()) as {
          data?: {
            planGeneration?: PlanGeneration;
            planSteps?: PlanStep[];
          };
          success: boolean;
        };

        if (data.data?.planGeneration) {
          setPlanGeneration(data.data.planGeneration);
        }

        if (data.data?.planSteps) {
          setPlanSteps(data.data.planSteps);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPlan();
  }, [planId]);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-primary'} />
            Loading Implementation Plan...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'flex items-center gap-3 py-4'}>
            <div
              className={'size-5 animate-spin rounded-full border-2 border-primary border-t-transparent'}
            />
            <p className={'text-sm text-muted-foreground'}>Loading plan details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={'border-destructive'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-destructive'}>
            <AlertTriangleIcon aria-hidden className={'size-5'} />
            Error Loading Plan
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!planGeneration) {
    return (
      <Card>
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

  return (
    <div className={'space-y-6'}>
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
