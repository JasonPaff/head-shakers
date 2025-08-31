'use client';

import type { ComponentProps } from 'react';

import { Conditional } from '@/components/ui/conditional';
import { useFieldAria } from '@/components/ui/form/use-field-aria';
import { cn } from '@/utils/tailwind-utils';

type FieldDescriptionProps = RequiredChildren<ComponentProps<'p'>>;

export const FieldDescription = ({ children, className, ...props }: FieldDescriptionProps) => {
  const { descriptionId } = useFieldAria();

  return (
    <Conditional isCondition={!!children}>
      <p className={cn('text-sm text-muted-foreground', className)} id={descriptionId} {...props}>
        {children}
      </p>
    </Conditional>
  );
};
