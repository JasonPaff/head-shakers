'use client';

import { revalidateLogic } from '@tanstack/form-core';
import { Loader2Icon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppForm } from '@/components/ui/form';
import { useFocusContext } from '@/components/ui/form/focus-management/focus-context';
import { withFocusManagement } from '@/components/ui/form/focus-management/with-focus-management';
import { useServerAction } from '@/hooks/use-server-action';
import { createContentReportAction } from '@/lib/actions/content-reports/content-reports.actions';
import { generateTestId } from '@/lib/test-ids';
import { createContentReportSchema } from '@/lib/validations/moderation.validation';

import type { ReportTargetType } from './report-button';

interface ReportReasonDialogProps extends ComponentTestIdProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: ReportTargetType;
}

const REPORT_REASONS = [
  { label: 'Spam', value: 'spam' },
  { label: 'Harassment', value: 'harassment' },
  { label: 'Inappropriate Content', value: 'inappropriate_content' },
  { label: 'Copyright Violation', value: 'copyright_violation' },
  { label: 'Misinformation', value: 'misinformation' },
  { label: 'Hate Speech', value: 'hate_speech' },
  { label: 'Violence', value: 'violence' },
  { label: 'Other', value: 'other' },
];

export const ReportReasonDialog = withFocusManagement(
  ({ isOpen, onClose, targetId, targetType, testId }: ReportReasonDialogProps) => {
    const reportDialogTestId = testId || generateTestId('feature', 'dialog', 'report');
    const formTestId = generateTestId('feature', 'form', 'report-reason');
    const cancelButtonTestId = generateTestId('feature', 'button', 'report-reason-cancel');
    const submitButtonTestId = generateTestId('feature', 'button', 'report-reason-submit');

    const { focusFirstError } = useFocusContext();

    const { executeAsync, isExecuting } = useServerAction(createContentReportAction, {
      loadingMessage: 'Submitting report...',
      onSuccess: () => {
        handleClose();
      },
    });

    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        description: '',
        reason: '' as
          | 'copyright_violation'
          | 'harassment'
          | 'hate_speech'
          | 'inappropriate_content'
          | 'misinformation'
          | 'other'
          | 'spam'
          | 'violence',
        targetId,
        targetType,
      },
      onSubmit: async ({ value }) => {
        await executeAsync(value);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'submit',
        modeAfterSubmission: 'change',
      }),
      validators: {
        onSubmit: createContentReportSchema,
      },
    });

    const handleOpenChange = (isOpen: boolean) => {
      if (isOpen) return;
      handleClose();
    };

    const handleClose = () => {
      setTimeout(() => form.reset(), 300);
      onClose();
    };

    const getDialogTitle = () => {
      switch (targetType) {
        case 'bobblehead':
          return 'Report Bobblehead';
        case 'collection':
          return 'Report Collection';
        case 'comment':
          return 'Report Comment';
        default:
          return 'Report Content';
      }
    };

    const getDialogDescription = () => {
      switch (targetType) {
        case 'bobblehead':
          return 'Help us maintain a positive community by reporting inappropriate bobbleheads. Your report will be reviewed by our moderation team.';
        case 'collection':
          return 'Help us maintain a positive community by reporting inappropriate collections. Your report will be reviewed by our moderation team.';
        case 'comment':
          return 'Help us maintain a respectful community by reporting comments that violate our guidelines.';
        default:
          return 'Help us maintain a positive community by reporting inappropriate content. Your report will be reviewed by our moderation team.';
      }
    };

    return (
      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className={'sm:max-w-md'} testId={reportDialogTestId}>
          <form
            data-testid={formTestId}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
          >
            {/* Header */}
            <DialogHeader>
              <DialogTitle>{getDialogTitle()}</DialogTitle>
              <DialogDescription>{getDialogDescription()}</DialogDescription>
            </DialogHeader>

            {/* Form Fields */}
            <div className={'space-y-4 py-4'}>
              {/* Report Reason */}
              <form.AppField name={'reason'}>
                {(field) => (
                  <field.SelectField
                    isRequired
                    label={'Reason for reporting'}
                    options={REPORT_REASONS}
                    placeholder={'Select a reason'}
                  />
                )}
              </form.AppField>

              {/* Description */}
              <form.AppField name={'description'}>
                {(field) => (
                  <field.TextareaField
                    label={'Additional details (optional)'}
                    maxLength={500}
                    placeholder={"Provide additional context about why you're reporting this content..."}
                    rows={3}
                  />
                )}
              </form.AppField>
            </div>

            {/* Action Buttons */}
            <DialogFooter>
              <Button
                disabled={isExecuting}
                onClick={handleClose}
                testId={cancelButtonTestId}
                variant={'outline'}
              >
                Cancel
              </Button>
              <Button
                className={'min-w-[100px]'}
                disabled={isExecuting}
                testId={submitButtonTestId}
                type={'submit'}
                variant={'destructive'}
              >
                <Conditional fallback={'Submit Report'} isCondition={isExecuting}>
                  <Loader2Icon aria-hidden className={'animate-spin'} />
                  Submitting...
                </Conditional>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  },
);
