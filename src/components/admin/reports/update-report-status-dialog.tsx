'use client';

import type { ComponentPropsWithRef } from 'react';

import { revalidateLogic } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import { Loader2Icon } from 'lucide-react';
import React from 'react';

import type { SelectContentReport } from '@/lib/validations/moderation.validation';

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
import { updateReportStatusAction } from '@/lib/actions/admin/admin-content-reports.actions';
import { ENUMS, SCHEMA_LIMITS } from '@/lib/constants';

interface UpdateReportStatusDialogProps extends ComponentPropsWithRef<'div'> {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  report: null | SelectContentReport;
}

const statusOptions = ENUMS.CONTENT_REPORT.STATUS.map((status) => ({
  label: status.charAt(0).toUpperCase() + status.slice(1),
  value: status,
}));

const UpdateReportStatusDialogContent = withFocusManagement<UpdateReportStatusDialogProps>(
  ({ isOpen, onClose, onSuccess, report }) => {
    const { focusFirstError } = useFocusContext();

    // useState hooks
    const [isFormDirty, setIsFormDirty] = React.useState(false);

    // Server action for updating report status
    const { executeAsync: updateReportStatus, isExecuting } = useServerAction(updateReportStatusAction, {
      onSuccess: () => {
        onSuccess?.();
        onClose();
      },
      toastMessages: {
        error: 'Failed to update report status',
        loading: 'Updating report status...',
        success: 'Report status updated successfully',
      },
    });

    // Form setup
    const form = useAppForm({
      canSubmitWhenInvalid: true,
      defaultValues: {
        moderatorNotes: report?.moderatorNotes ?? undefined,
        reportId: report?.id ?? '',
        status: report?.status ?? ('pending' as const),
      },
      onSubmit: async ({ value }) => {
        // Convert empty string to undefined for optional field
        const submitData = {
          ...value,
          moderatorNotes: value.moderatorNotes?.trim() || undefined,
        };
        await updateReportStatus(submitData);
      },
      onSubmitInvalid: ({ formApi }) => {
        focusFirstError(formApi);
      },
      validationLogic: revalidateLogic({
        mode: 'blur',
        modeAfterSubmission: 'change',
      }),
    });

    // Get current form values
    const currentStatus = useStore(form.store, (state) => state.values.status);
    const currentNotes = useStore(form.store, (state) => state.values.moderatorNotes);

    // useEffect hooks
    React.useEffect(() => {
      if (isOpen && report) {
        form.reset();
        form.setFieldValue('reportId', report.id);
        form.setFieldValue('status', report.status);
        form.setFieldValue('moderatorNotes', report.moderatorNotes ?? undefined);
        setIsFormDirty(false);
      }
    }, [isOpen, report, form]);

    React.useEffect(() => {
      const hasChanges =
        currentStatus !== report?.status ||
        (currentNotes?.trim() || undefined) !== (report?.moderatorNotes ?? undefined);
      setIsFormDirty(hasChanges);
    }, [currentStatus, currentNotes, report]);

    // Event handlers
    const handleClose = () => {
      if (!isExecuting) {
        onClose();
      }
    };

    // Derived variables for conditional rendering
    const _hasReport = !!report;
    const _canSubmit = isFormDirty && !isExecuting;
    const _notesLength = currentNotes?.length ?? 0;
    const _maxNotesLength = SCHEMA_LIMITS.CONTENT_REPORT.MODERATOR_NOTES.MAX;
    const _isNotesTooLong = _notesLength > _maxNotesLength;

    return (
      <Dialog onOpenChange={handleClose} open={isOpen}>
        <DialogContent className={'max-w-lg'}>
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the report status and add resolution notes for your records
            </DialogDescription>
          </DialogHeader>

          <Conditional isCondition={!_hasReport}>
            <div className={'py-8 text-center text-muted-foreground'}>No report data available</div>
          </Conditional>

          <Conditional isCondition={_hasReport}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
            >
              <div className={'space-y-4'}>
                {/* Status Field */}
                <form.AppField name={'status'}>
                  {(field) => (
                    <field.SelectField
                      isRequired
                      label={'Status'}
                      options={statusOptions}
                      placeholder={'Select status...'}
                    />
                  )}
                </form.AppField>

                {/* Moderator Notes Field */}
                <form.AppField name={'moderatorNotes'}>
                  {(field) => (
                    <div className={'space-y-2'}>
                      <field.TextareaField
                        description={`Optional notes about this report. ${_notesLength}/${_maxNotesLength} characters.`}
                        disabled={isExecuting}
                        label={'Resolution Notes'}
                        placeholder={'Add notes about your decision or actions taken...'}
                        rows={4}
                      />
                      <Conditional isCondition={_isNotesTooLong}>
                        <p className={'text-sm text-destructive'}>
                          Notes exceed maximum length of {_maxNotesLength} characters
                        </p>
                      </Conditional>
                    </div>
                  )}
                </form.AppField>
              </div>

              <DialogFooter className={'mt-6'}>
                {/* Action Buttons */}
                <div className={'flex w-full justify-end gap-2'}>
                  <Button disabled={isExecuting} onClick={handleClose} type={'button'} variant={'outline'}>
                    Cancel
                  </Button>
                  <Button disabled={!_canSubmit || _isNotesTooLong} type={'submit'}>
                    <Conditional isCondition={isExecuting}>
                      <Loader2Icon className={'mr-2 size-4 animate-spin'} />
                    </Conditional>
                    {isExecuting ? 'Updating...' : 'Update Status'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Conditional>
        </DialogContent>
      </Dialog>
    );
  },
);

UpdateReportStatusDialogContent.displayName = 'UpdateReportStatusDialogContent';

export const UpdateReportStatusDialog = (props: UpdateReportStatusDialogProps) => {
  return <UpdateReportStatusDialogContent {...props} />;
};

UpdateReportStatusDialog.displayName = 'UpdateReportStatusDialog';
