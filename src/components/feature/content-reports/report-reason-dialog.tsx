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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  targetId, // eslint-disable-line @typescript-eslint/no-unused-vars -- will be used for server actions
  targetType,
  testId,
}: ReportReasonDialogProps) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const reportDialogTestId = testId || generateTestId('feature', 'dialog', 'report');

  const handleClose = () => {
    // Reset form state when closing
    setSelectedReason('');
    setDescription('');
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting this content.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual server action call when available
      // await createContentReportAction({
      //   targetType,
      //   reason: selectedReason as any,
      //   description: description.trim() || undefined,
      // });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Report submitted successfully. Thank you for helping keep our community safe.');
      handleClose();
    } catch (error) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

          <div className={'space-y-2'}>
            <Label htmlFor={'description'}>Additional details (optional)</Label>
            <Textarea
              aria-label={'Additional details about the report'}
              id={'description'}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"Provide additional context about why you're reporting this content..."}
              rows={3}
              value={description}
            />
            <p className={'text-xs text-muted-foreground'}>{description.length}/500 characters</p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} onClick={handleClose}>
            Cancel
          </AlertDialogCancel>
          <Button
            className={'min-w-[100px]'}
            disabled={isSubmitting || !selectedReason}
            onClick={handleSubmit}
            variant={'destructive'}
          >
            {isSubmitting ?
              <>
                <Loader2Icon className={'animate-spin'} />
                Submitting...
              </>
            : 'Submit Report'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
