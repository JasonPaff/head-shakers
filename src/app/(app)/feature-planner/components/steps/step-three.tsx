'use client';

import type { ComponentProps } from 'react';

import { FileTextIcon } from 'lucide-react';

import { ExecutionMetrics } from '@/app/(app)/feature-planner/components/execution-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface GenerationData {
  completionTokens?: number;
  estimatedDuration?: string;
  executionTimeMs?: number;
  generationId?: string;
  implementationPlan?: string;
  promptTokens?: number;
  status?: string;
  totalTokens?: number;
  validationCommands?: Array<string>;
}

interface StepThreeProps extends ComponentProps<'div'> {
  generationData?: GenerationData;
  isGeneratingPlan: boolean;
  onImplementationPlanning?: () => void;
  planId: null | string;
}

export const StepThree = ({
  className,
  generationData,
  isGeneratingPlan,
  onImplementationPlanning,
  planId,
  ...props
}: StepThreeProps) => {
  const stepThreeTestId = generateTestId('feature', 'card');

  // if currently generating plan, show loading state
  if (isGeneratingPlan) {
    return (
      <div className={cn('space-y-6', className)} data-testid={stepThreeTestId} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className={'flex items-center gap-2'}>
              <FileTextIcon aria-hidden className={'size-5 text-primary'} />
              Step 3: Implementation Planning
            </CardTitle>
          </CardHeader>
          <CardContent className={'space-y-4'}>
            <div className={'rounded-lg bg-muted p-6'}>
              <div className={'flex items-center gap-3'}>
                <div
                  className={'size-5 animate-spin rounded-full border-2 border-primary border-t-transparent'}
                />
                <div>
                  <h3 className={'font-medium'}>Generating implementation plan...</h3>
                  <p className={'text-sm text-muted-foreground'}>
                    Creating comprehensive plan with step-by-step guidance. This may take 1-2 minutes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // if a plan has been generated, show metrics only (parent will render PlanViewer)
  if (generationData && planId) {
    return (
      <div className={cn('space-y-6', className)} data-testid={stepThreeTestId} {...props}>
        {/* Execution Metrics */}
        <ExecutionMetrics
          completionTokens={generationData.completionTokens ?? 0}
          executionTimeMs={generationData.executionTimeMs ?? 0}
          promptTokens={generationData.promptTokens ?? 0}
          status={generationData.status ?? 'unknown'}
          totalTokens={generationData.totalTokens ?? 0}
        />
      </div>
    );
  }

  // default state: show a button to start plan generation
  return (
    <div className={cn('space-y-6', className)} data-testid={stepThreeTestId} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <FileTextIcon aria-hidden className={'size-5 text-primary'} />
            Step 3: Implementation Planning
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <div className={'rounded-lg bg-muted p-4'}>
            <h3 className={'mb-2 font-medium'}>Generate Implementation Plan</h3>
            <p className={'mb-4 text-sm text-muted-foreground'}>
              This step will generate a comprehensive implementation plan based on the refined feature request
              and discovered files. It will provide step-by-step guidance, code snippets, and validation
              commands to ensure successful feature implementation.
            </p>
            <Conditional isCondition={!!onImplementationPlanning}>
              <button
                className={
                  'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                }
                onClick={onImplementationPlanning}
                type={'button'}
              >
                Generate Implementation Plan
              </button>
            </Conditional>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
