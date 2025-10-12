'use client';

import type { ComponentProps } from 'react';

import { FileTextIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepThreeProps extends ComponentProps<'div'>, ComponentTestIdProps {
  // Future props for implementation planning functionality
  implementationPlan?: string;
  onImplementationPlanning?: () => void;
  validationCommands?: Array<string>;
}

/**
 * Step 3: Implementation Planning
 * Generates comprehensive implementation plan with validation commands
 */
export const StepThree = ({
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  implementationPlan: _implementationPlan,
  onImplementationPlanning,
  testId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validationCommands: _validationCommands = [],
  ...props
}: StepThreeProps) => {
  const stepThreeTestId = testId || generateTestId('feature', 'card');

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
            <p className={'mb-4 text-sm text-muted-foreground'}>
              This step will generate a comprehensive implementation plan based on the refined feature request
              and discovered files. It will provide step-by-step guidance, code snippets, and validation
              commands to ensure successful feature implementation.
            </p>
            {onImplementationPlanning && (
              <button
                className={
                  'rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                }
                onClick={onImplementationPlanning}
                type={'button'}
              >
                Generate Implementation Plan
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
