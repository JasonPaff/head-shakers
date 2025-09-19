import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SpinnerProps = ClassName & ComponentTestIdProps;

export const Spinner = ({ className, testId }: SpinnerProps) => {
  const spinnerTestId = testId || generateTestId('ui', 'spinner');

  return (
    <div className={cn('relative size-12', className)} data-testid={spinnerTestId}>
      <div className={'absolute inset-0 rounded-full border-2 border-muted'}></div>
      <div
        className={cn(
          'absolute inset-0 animate-spin rounded-full',
          'border-2 border-primary border-t-transparent',
        )}
      ></div>
    </div>
  );
};
