'use client';

import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useServerAction } from '@/hooks/use-server-action';
import { createContentReportAction } from '@/lib/actions/content-reports/content-reports.actions';
import { generateTestId } from '@/lib/test-ids';

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
] as const;

export const ReportReasonDialog = ({
  isOpen,
  onClose,
  targetId,
  targetType,
  testId,
}: ReportReasonDialogProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const { executeAsync, isExecuting } = useServerAction(createContentReportAction, {
    onSuccess: () => {
      handleClose();
    },
    toastMessages: {
      error: 'Failed to submit report. Please try again.',
      loading: 'Submitting report...',
      success: 'Report submitted successfully. Thank you for helping keep our community safe.',
    },
  });

  const reportDialogTestId = testId || generateTestId('feature', 'dialog', 'report');

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting this content.');
      return;
    }

    await executeAsync({
      description: description.trim() || undefined,
      reason: selectedReason as
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
    });
  };

  const getDialogTitle = () => {
    switch (targetType) {
      case 'bobblehead':
        return 'Report Bobblehead';
      case 'collection':
        return 'Report Collection';
      case 'subcollection':
        return 'Report Subcollection';
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
      case 'subcollection':
        return 'Help us maintain a positive community by reporting inappropriate subcollections. Your report will be reviewed by our moderation team.';
      default:
        return 'Help us maintain a positive community by reporting inappropriate content. Your report will be reviewed by our moderation team.';
    }
  };

  return (
    <AlertDialog onOpenChange={handleClose} open={isOpen}>
      <AlertDialogContent className={'sm:max-w-md'} testId={reportDialogTestId}>
        <AlertDialogHeader>
          <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
          <AlertDialogDescription>{getDialogDescription()}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className={'space-y-4 py-4'}>
          {/* Report Reason */}
          <div className={'space-y-2'}>
            <Label htmlFor={'reason'}>Reason for reporting *</Label>
            <Select onValueChange={setSelectedReason} value={selectedReason}>
              <SelectTrigger aria-label={'Select reason for reporting'} id={'reason'}>
                <SelectValue placeholder={'Select a reason'} />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className={'space-y-2'}>
            <Label htmlFor={'description'}>Additional details (optional)</Label>
            <Textarea
              aria-label={'Additional details about the report'}
              id={'description'}
              maxLength={500}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              placeholder={"Provide additional context about why you're reporting this content..."}
              rows={3}
              value={description}
            />
            <p className={'text-xs text-muted-foreground'}>{description.length}/500 characters</p>
          </div>
        </div>

        {/* Action Buttons */}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExecuting} onClick={handleClose}>
            Cancel
          </AlertDialogCancel>
          <Button
            className={'min-w-[100px]'}
            disabled={isExecuting || !selectedReason}
            onClick={handleSubmit}
            variant={'destructive'}
          >
            <Conditional fallback={'Submit Report'} isCondition={isExecuting}>
              <Loader2Icon aria-hidden className={'animate-spin'} />
              Submitting...
            </Conditional>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
