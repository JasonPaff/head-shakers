'use client';

import { useStore } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form';

type SubmitButtonProps = RequiredChildren<{ isDisabled?: boolean }>;

export const SubmitButton = ({ children, isDisabled }: SubmitButtonProps) => {
  const form = useFormContext();

  const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

  return (
    <Button disabled={isSubmitting || isDisabled} type={'submit'}>
      {children}
    </Button>
  );
};
