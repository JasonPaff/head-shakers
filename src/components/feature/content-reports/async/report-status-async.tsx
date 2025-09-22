import 'server-only';

import type { ReportTargetType } from '@/components/feature/content-reports/report-button';

import { ContentReportsFacade } from '@/lib/facades/content-reports/content-reports.facade';
import { getUserId } from '@/utils/user-utils';

import { ReportStatusIndicator } from '../report-status-indicator';

interface ReportStatusAsyncProps {
  targetId: string;
  targetType: ReportTargetType;
}

export const ReportStatusAsync = async ({ targetId, targetType }: ReportStatusAsyncProps) => {
  const currentUserId = await getUserId();

  const reportStatus = await ContentReportsFacade.getReportStatusAsync(currentUserId, targetId, targetType);

  return (
    <ReportStatusIndicator hasReported={reportStatus.hasReported} status={reportStatus.report?.status} />
  );
};
