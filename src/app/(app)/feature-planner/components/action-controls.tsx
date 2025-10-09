'use client';

import type { ComponentProps } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/components/steps/step-orchestrator';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const getStepTitle = (step: WorkflowStep): string => {
  switch (step) {
    case 1:
      return 'Feature Request Input';
    case 2:
      return 'File Discovery';
    case 3:
      return 'Implementation Planning';
    default:
      return 'Unknown Step';
  }
};

interface ActionControlsProps extends ComponentProps<'div'> {
  canProceed: boolean;
  currentStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
}

export const ActionControls = ({
  canProceed,
  className,
  currentStep,
  onStepChange,
  ...props
}: ActionControlsProps) => {
  const handlePrevious = (): void => {
    if (!_canGoBack) return;
    onStepChange((currentStep - 1) as WorkflowStep);
  };

  const handleNext = (): void => {
    if (!_canGoForward) return;
    onStepChange((currentStep + 1) as WorkflowStep);
  };

  const _actionControlsTestId = generateTestId('feature', 'button');
  const _canGoBack = currentStep > 1;
  const _canGoForward = currentStep < 3 && canProceed;
  const _shouldShowHelpText = !canProceed && currentStep === 1;

  return (
    <div className={cn('mt-8', className)} data-testid={_actionControlsTestId} {...props}>
      <Card>
        <CardContent className={'p-4'}>
          <div className={'flex items-center justify-between'}>
            {/* Previous Button */}
            <Button className={'gap-2'} disabled={!_canGoBack} onClick={handlePrevious} variant={'outline'}>
              <ChevronLeftIcon aria-hidden className={'size-4'} />
              <Conditional fallback={'Previous'} isCondition={_canGoBack}>
                Back to {getStepTitle((currentStep - 1) as WorkflowStep)}
              </Conditional>
            </Button>

            {/* Step Indicator */}
            <div className={'flex items-center gap-2 text-sm text-muted-foreground'}>
              <span>Step {currentStep} of 3</span>
              <span>•</span>
              <span>{getStepTitle(currentStep)}</span>
            </div>

            {/* Next Button */}
            <Button className={'gap-2'} disabled={!_canGoForward} onClick={handleNext}>
              <Conditional fallback={'Next'} isCondition={_canGoForward}>
                Continue to {getStepTitle((currentStep + 1) as WorkflowStep)}
              </Conditional>
              <ChevronRightIcon aria-hidden className={'size-4'} />
            </Button>
          </div>

          {/* Help Text */}
          <Conditional isCondition={_shouldShowHelpText}>
            <div className={'mt-3 text-center text-sm text-muted-foreground'}>
              Enter a feature description to proceed to the next step
            </div>
          </Conditional>
        </CardContent>
      </Card>
    </div>
  );
};
