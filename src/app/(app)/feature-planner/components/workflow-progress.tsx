'use client';

import type { ComponentProps } from 'react';

import { Check } from 'lucide-react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/page';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Progress } from '@/components/ui/progress';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface WorkflowProgressProps extends ComponentProps<'div'>, ComponentTestIdProps {
  currentStep: WorkflowStep;
}

const steps = [
  { description: 'Enter and refine your feature request', id: 1, title: 'Feature Request Input' },
  { description: 'AI-powered analysis to find relevant files', id: 2, title: 'File Discovery' },
  { description: 'Generate detailed implementation plan', id: 3, title: 'Implementation Planning' },
] as const;

export const WorkflowProgress = ({ className, currentStep, testId, ...props }: WorkflowProgressProps) => {
  const progressTestId = testId || generateTestId('feature', 'progress');
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid={progressTestId}
      {...props}
    >
      {/* Progress Bar */}
      <div className={"space-y-2"}>
        <div className={"flex justify-between text-sm text-muted-foreground"}>
          <span>Step {currentStep} of 3</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress className={"h-2"} value={progressPercentage} />
      </div>

      {/* Step Indicators */}
      <div className={"flex justify-between"}>
        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <div
              className={cn(
                'flex flex-col items-center space-y-2 text-center',
                'max-w-[200px] flex-1'
              )}
              key={step.id}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                  {
                    'border-green-500 bg-green-500 text-white': isCompleted,
                    'border-muted-foreground text-muted-foreground': isUpcoming,
                    'border-primary bg-primary text-primary-foreground': isCurrent,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className={"h-4 w-4"} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Info */}
              <div className={"space-y-1"}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    {
                      'text-foreground': isCurrent || isCompleted,
                      'text-muted-foreground': isUpcoming,
                    }
                  )}
                >
                  {step.title}
                </p>
                <p className={"text-xs text-muted-foreground"}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};