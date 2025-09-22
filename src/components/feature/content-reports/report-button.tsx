'use client';

import { FlagIcon } from 'lucide-react';
import { Fragment, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { generateTestId } from '@/lib/test-ids';

import { ReportReasonDialog } from './report-reason-dialog';

export type ReportTargetType = 'bobblehead' | 'collection' | 'subcollection';

interface ReportButtonProps extends ComponentTestIdProps {
  className?: string;
  isDisabled?: boolean;
  targetId: string;
  targetType: ReportTargetType;
  variant?: 'default' | 'ghost' | 'outline';
}

export const ReportButton = ({
  className,
  isDisabled = false,
  targetId,
  targetType,
  testId,
  variant = 'ghost',
}: ReportButtonProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getAriaLabel = () => {
    switch (targetType) {
      case 'bobblehead':
        return 'Report this bobblehead';
      case 'collection':
        return 'Report this collection';
      case 'subcollection':
        return 'Report this subcollection';
      default:
        return 'Report this content';
    }
  };
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const reportButtonTestId = testId || generateTestId('feature', 'button', 'report');

  return (
    <Fragment>
      <Button
        aria-label={getAriaLabel()}
        className={className}
        disabled={isDisabled}
        onClick={handleOpenDialog}
        size={'sm'}
        testId={reportButtonTestId}
        variant={variant}
      >
        <FlagIcon aria-hidden />
        Report
      </Button>

      <ReportReasonDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        targetId={targetId}
        targetType={targetType}
      />
    </Fragment>
  );
};
