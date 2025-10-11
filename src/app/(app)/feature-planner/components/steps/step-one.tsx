'use client';

import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { RefinementSettings } from '@/lib/validations/feature-planner.validation';

import { RequestInput } from '@/app/(app)/feature-planner/components/request-input';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface StepOneProps extends ComponentTestIdProps, Omit<ComponentProps<'div'>, 'onChange'> {
  isRefining: boolean;
  onChange: (value: string) => void;
  onParallelRefineRequest: () => void;
  onRefineRequest: () => void;
  settings: RefinementSettings;
  value: string;
}

export const StepOne = ({
  className,
  isRefining,
  onChange,
  onParallelRefineRequest,
  onRefineRequest,
  settings,
  testId,
  value,
  ...props
}: StepOneProps) => {
  const stepOneTestId = testId || generateTestId('feature', 'form');

  return (
    <div className={cn('space-y-6', className)} data-testid={stepOneTestId} {...props}>
      <RequestInput
        isRefining={isRefining}
        onChange={onChange}
        onParallelRefineRequest={onParallelRefineRequest}
        onRefineRequest={onRefineRequest}
        settings={settings}
        value={value}
      />
    </div>
  );
};
