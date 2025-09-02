'use client';

import { FieldAriaProvider } from '@/components/ui/form/field-aria-provider';
import { cn } from '@/utils/tailwind-utils';

type FieldItemProps = ClassName<RequiredChildren>;

export const FieldItem = ({ children, className }: FieldItemProps) => {
  return (
    <FieldAriaProvider>
      <div className={cn('space-y-2', className)}>{children}</div>
    </FieldAriaProvider>
  );
};
