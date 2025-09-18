'use client';

import { useId, useMemo } from 'react';

import type { UseFieldAriaContext } from '@/components/ui/form/field-components/use-field-aria';

import { FieldAriaContext } from '@/components/ui/form/field-components/use-field-aria';

type FieldAriaProviderProps = RequiredChildren;

export const FieldAriaProvider = ({ children }: FieldAriaProviderProps) => {
  const id = useId();

  const { descriptionId, errorId } = useMemo(() => {
    return { descriptionId: `${id}-description`, errorId: `${id}-error` };
  }, [id]);

  const context: UseFieldAriaContext = useMemo(
    () => ({
      descriptionId,
      errorId,
      id,
    }),
    [descriptionId, errorId, id],
  );

  return <FieldAriaContext.Provider value={context}>{children}</FieldAriaContext.Provider>;
};
