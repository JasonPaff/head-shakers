'use client';

import { CheckCircleIcon, ClockIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface ReportStatusIndicatorProps {
  hasReported: boolean;
  status?: 'dismissed' | 'pending' | 'resolved' | 'reviewed' | null;
}

export const ReportStatusIndicator = ({ hasReported, status }: ReportStatusIndicatorProps) => {
  if (!hasReported || !status) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'dismissed':
        return {
          color: 'secondary' as const,
          icon: CheckCircleIcon,
          text: 'Dismissed',
        };
      case 'pending':
        return {
          color: 'secondary' as const,
          icon: ClockIcon,
          text: 'Report Pending',
        };
      case 'resolved':
        return {
          color: 'default' as const,
          icon: CheckCircleIcon,
          text: 'Resolved',
        };
      case 'reviewed':
        return {
          color: 'default' as const,
          icon: ClockIcon,
          text: 'Under Review',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge className={'flex items-center gap-1 text-xs'} variant={config.color}>
      <Icon aria-hidden className={'size-3'} />
      {config.text}
    </Badge>
  );
};
