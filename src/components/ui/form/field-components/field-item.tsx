'use client';

import { FieldAriaProvider } from '@/components/ui/form/field-aria-provider';
import { cn } from '@/utils/tailwind-utils';

type FieldItemProps = Classname<RequiredChildren>;

export const FieldItem = ({ children, classname }: FieldItemProps) => {
  return (
    <FieldAriaProvider>
      <div className={cn('space-y-2', classname)}>{children}</div>
    </FieldAriaProvider>
  );
};
