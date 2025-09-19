'use client';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { FieldAriaProvider } from '@/components/ui/form/field-components/field-aria-provider';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FieldItemProps = ClassName<RequiredChildren> & ComponentTestIdProps;

export const FieldItem = ({ children, className, testId }: FieldItemProps) => {
  const fieldItemTestId = testId || generateTestId('ui', 'form-field');

  return (
    <FieldAriaProvider>
      <div className={cn('space-y-2', className)} data-testid={fieldItemTestId}>
        {children}
      </div>
    </FieldAriaProvider>
  );
};
