import type { LucideIcon } from 'lucide-react';

import { ClockIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

const getColorClass = (color: string) => {
  switch (color) {
    case 'secondary':
      return 'text-orange-600';
    case 'success':
      return 'text-green-600';
    default:
      return 'text-primary';
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

interface BobbleheadTimestampsCardProps {
  bobblehead: BobbleheadWithRelations;
}

const TimestampItem = ({
  color = 'primary',
  date,
  icon: Icon,
  label,
}: {
  color?: 'primary' | 'secondary' | 'success';
  date: Date | null | undefined;
  icon: LucideIcon;
  label: string;
}) => {
  return (
    <Conditional isCondition={!!date}>
      <div className={'flex items-start gap-3'}>
        <Icon aria-hidden className={`mt-0.5 size-5 ${getColorClass(color)}`} />
        <div className={'flex-1'}>
          <span className={'text-sm text-muted-foreground'}>{label}</span>
          <p className={'font-medium'}>{formatDate(date!)}</p>
          <p className={'text-xs text-muted-foreground'}>{getRelativeTime(date!)}</p>
        </div>
      </div>
    </Conditional>
  );
};

export const BobbleheadTimestampsCard = ({ bobblehead }: BobbleheadTimestampsCardProps) => {
  const _hasMultipleTimestamps = !!bobblehead?.createdAt && !!bobblehead?.updatedAt; // &&
  //bobblehead.createdAt.getTime() !== bobblehead.updatedAt.getTime();
  const _hasOnlyUpdatedAt = !_hasMultipleTimestamps && bobblehead.updatedAt && !bobblehead.createdAt;
  const _hasTimestamp = false; // !!bobblehead.createdAt || !!bobblehead.updatedAt;

  return (
    <Conditional isCondition={_hasTimestamp}>
      <Card>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2'}>
            <div className={'size-2 rounded-full bg-indigo-500'}></div>
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          <Conditional isCondition={!!bobblehead.createdAt}>
            <TimestampItem color={'success'} date={bobblehead.createdAt} icon={PlusIcon} label={'Created'} />
          </Conditional>

          <Conditional isCondition={_hasMultipleTimestamps}>
            <TimestampItem
              color={'secondary'}
              date={bobblehead.updatedAt}
              icon={RefreshCwIcon}
              label={'Last Updated'}
            />
          </Conditional>

          <Conditional isCondition={_hasOnlyUpdatedAt}>
            <TimestampItem
              color={'primary'}
              date={bobblehead.updatedAt}
              icon={ClockIcon}
              label={'Recorded'}
            />
          </Conditional>
        </CardContent>
      </Card>
    </Conditional>
  );
};
