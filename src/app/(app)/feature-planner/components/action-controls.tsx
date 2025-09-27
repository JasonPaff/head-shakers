'use client';

import type { ComponentProps } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { WorkflowStep } from '@/app/(app)/feature-planner/page';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface ActionControlsProps extends ComponentProps<'div'>, ComponentTestIdProps {
  canProceed: boolean;
  currentStep: WorkflowStep;
  onStepChange: (step: WorkflowStep) => void;
}

export const ActionControls = ({
  canProceed,
  className,
  currentStep,
  onStepChange,
  testId,
  ...props
}: ActionControlsProps) => {
  const actionControlsTestId = testId || generateTestId('feature', 'button');

  const canGoBack = currentStep > 1;
  const canGoForward = currentStep < 3 && canProceed;

  const handlePrevious = () => {
    if (canGoBack) {
      onStepChange((currentStep - 1) as WorkflowStep);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      onStepChange((currentStep + 1) as WorkflowStep);
    }
  };

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

  return (
    <div
      className={cn('mt-8', className)}
      data-testid={actionControlsTestId}
      {...props}
    >
      <Card>
        <CardContent className={"p-4"}>
          <div className={"flex items-center justify-between"}>
            {/* Previous Button */}
            <Button
              className={"gap-2"}
              disabled={!canGoBack}
              onClick={handlePrevious}
              variant={"outline"}
            >
              <ChevronLeft className={"h-4 w-4"} />
              {canGoBack ? `Back to ${getStepTitle((currentStep - 1) as WorkflowStep)}` : 'Previous'}
            </Button>

            {/* Step Indicator */}
            <div className={"flex items-center gap-2 text-sm text-muted-foreground"}>
              <span>Step {currentStep} of 3</span>
              <span>•</span>
              <span>{getStepTitle(currentStep)}</span>
            </div>

            {/* Next Button */}
            <Button
              className={"gap-2"}
              disabled={!canGoForward}
              onClick={handleNext}
            >
              {canGoForward ? `Continue to ${getStepTitle((currentStep + 1) as WorkflowStep)}` : 'Next'}
              <ChevronRight className={"h-4 w-4"} />
            </Button>
          </div>

          {/* Help Text */}
          {(() => {
            const shouldShowHelpText = !canProceed && currentStep === 1;
            return shouldShowHelpText ? (
              <div className={"mt-3 text-center text-sm text-muted-foreground"}>
                Enter a feature description to proceed to the next step
              </div>
            ) : null;
          })()}
        </CardContent>
      </Card>
    </div>
  );
};