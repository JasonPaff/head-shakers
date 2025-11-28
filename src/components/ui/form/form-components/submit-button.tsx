'use client';

import { useStore } from '@tanstack/react-form';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form';
import { generateTestId } from '@/lib/test-ids';
import { trackFormSubmit } from '@/lib/utils/sentry-breadcrumbs';

type SubmitButtonProps = ClassName<RequiredChildren<{ isDisabled?: boolean }>> &
  ComponentTestIdProps & {
    /** When provided, tracks form submission with Sentry breadcrumbs */
    trackingContext?: TrackingContext;
  };

type TrackingContext = {
  /** Component containing the form (e.g., 'footer-newsletter', 'edit-bobblehead-form') */
  component: string;
  /** Name of the form being submitted (e.g., 'newsletter', 'bobblehead-edit') */
  formName: string;
};

export const SubmitButton = ({
  children,
  className,
  isDisabled,
  testId,
  trackingContext,
}: SubmitButtonProps) => {
  const form = useFormContext();
  const submitButtonTestId = testId || generateTestId('ui', 'form-submit');

  const [isSubmitting] = useStore(form.store, (state) => [state.isSubmitting]);

  const handleClick = () => {
    if (trackingContext) {
      trackFormSubmit(trackingContext.formName, trackingContext.component);
    }
  };

  return (
    <Button
      className={className}
      disabled={isSubmitting || isDisabled}
      onClick={handleClick}
      testId={submitButtonTestId}
      type={'submit'}
    >
      {children}
    </Button>
  );
};
