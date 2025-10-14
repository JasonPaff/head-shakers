'use client';

import type { ComponentProps } from 'react';

import { Lightbulb, XIcon } from 'lucide-react';
import { useCallback } from 'react';

import type {
  FeatureType,
  PriorityLevel,
  SuggestionResult,
} from '@/lib/validations/feature-planner.validation';

import { FeatureSuggestionForm } from '@/app/(app)/feature-planner/components/feature-suggestion-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface FeatureSuggestionDialogProps extends Omit<ComponentProps<'div'>, 'onError' | 'onSubmit'> {
  error?: null | string;
  initialPageOrComponent?: string;
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onSubmit: (params: {
    additionalContext?: string;
    featureType: FeatureType;
    pageOrComponent: string;
    priorityLevel: PriorityLevel;
  }) => Promise<unknown>;
  partialText: string;
  progress: number;
  status: Status;
  suggestions: Array<SuggestionResult> | null;
}

type Status = 'complete' | 'connecting' | 'creating' | 'error' | 'idle' | 'streaming';

export const FeatureSuggestionDialog = ({
  className,
  error,
  initialPageOrComponent = '',
  isOpen,
  onClose,
  onRetry,
  onSubmit,
  partialText,
  progress,
  status,
  suggestions,
  ...props
}: FeatureSuggestionDialogProps) => {
  const dialogTestId = generateTestId('feature', 'dialog');

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (params: {
      additionalContext?: string;
      featureType: FeatureType;
      pageOrComponent: string;
      priorityLevel: PriorityLevel;
    }) => {
      await onSubmit(params);
    },
    [onSubmit],
  );

  // Handle dialog close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent
        className={cn('flex max-h-[90vh] flex-col sm:max-w-4xl', className)}
        data-testid={dialogTestId}
        {...props}
      >
        <DialogHeader>
          <DialogTitle className={'flex items-center gap-2'}>
            <Lightbulb aria-hidden className={'size-5 text-primary'} />
            AI Feature Suggestions
          </DialogTitle>
          <DialogDescription>
            Configure parameters to generate AI-powered feature suggestions tailored to your needs.
          </DialogDescription>
        </DialogHeader>

        <div className={'flex-1 space-y-4 overflow-y-auto'}>
          {/* Feature Suggestion Form - Now handles all UI states internally */}
          <FeatureSuggestionForm
            error={error ?? null}
            initialPageOrComponent={initialPageOrComponent}
            onCancel={handleClose}
            onRetry={onRetry}
            onSubmit={handleFormSubmit}
            partialText={partialText}
            progress={progress}
            status={status}
            suggestions={suggestions}
          />
        </div>

        <DialogFooter>
          <Button onClick={handleClose} size={'sm'} variant={'outline'}>
            <XIcon aria-hidden className={'mr-2 size-4'} />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
