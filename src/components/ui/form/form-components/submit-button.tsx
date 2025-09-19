'use client';

import { useStore } from '@tanstack/react-form';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form';
import { generateTestId } from '@/lib/test-ids';

type SubmitButtonProps = ComponentTestIdProps & RequiredChildren<{ isDisabled?: boolean }>;

export const SubmitButton = ({ children, isDisabled, testId }: SubmitButtonProps) => {
  const form = useFormContext();
  const submitButtonTestId = testId || generateTestId('ui', 'form-submit');

  const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

  return (
    <Button disabled={isSubmitting || isDisabled} testId={submitButtonTestId} type={'submit'}>
      {children}
    </Button>
  );
};
