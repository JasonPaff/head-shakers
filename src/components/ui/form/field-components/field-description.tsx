'use client';

import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { useFieldAria } from '@/components/ui/form/field-components/use-field-aria';
import { cn } from '@/utils/tailwind-utils';

type FieldDescriptionProps = ComponentTestIdProps & RequiredChildren<ComponentProps<'p'>>;

export const FieldDescription = ({ children, className, testId, ...props }: FieldDescriptionProps) => {
  const { descriptionId } = useFieldAria();

  return (
    <Conditional isCondition={!!children}>
      <p className={cn('text-sm text-muted-foreground', className)} data-testid={testId} id={descriptionId} {...props}>
        {children}
      </p>
    </Conditional>
  );
};
