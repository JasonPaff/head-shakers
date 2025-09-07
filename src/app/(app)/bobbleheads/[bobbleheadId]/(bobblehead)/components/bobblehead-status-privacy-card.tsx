import type { LucideIcon } from 'lucide-react';

import { EyeIcon, EyeOffIcon, HeartIcon, MessageCircleIcon, StarIcon, TrendingUpIcon } from 'lucide-react';

import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ColorVariant = 'destructive' | 'primary' | 'secondary' | 'success' | 'warning' | undefined;
type StatusVariant = 'owned' | 'sold' | 'trading' | 'wanted' | undefined;

const getStatusVariant = (status: StatusVariant): string => {
  switch (status?.toLowerCase()) {
    case 'owned':
      return 'success';
    case 'sold':
      return 'secondary';
    case 'trading':
      return 'default';
    case 'wanted':
      return 'warning';
    default:
      return 'default';
  }
};

const getColorClass = (color: ColorVariant): string => {
  switch (color) {
    case 'destructive':
      return 'text-red-600';
    case 'secondary':
      return 'text-orange-600';
    case 'success':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-600';
    default:
      return 'text-primary';
  }
};

interface BobbleheadStatusPrivacyCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

const StatusItem = ({
  color = 'primary',
  icon: Icon,
  label,
  // eslint-disable-next-line react-snob/require-boolean-prefix-is
  value,
  variant = 'default',
}: {
  color: ColorVariant;
  icon: LucideIcon;
  label: string;
  value: boolean | number | string;
  variant?: 'badge' | 'default';
}) => {
  return (
    <div className={'flex items-center gap-3'}>
      <Icon aria-hidden className={`size-5 ${getColorClass(color)}`} />
      <div className={'flex-1'}>
        <span className={'text-sm text-muted-foreground'}>{label}</span>
        {variant === 'badge' ?
          <Badge className={'mt-1 ml-2'} variant={color === 'success' ? 'default' : 'secondary'}>
            {typeof value === 'boolean' ?
              value ?
                'Yes'
              : 'No'
            : value}
          </Badge>
        : <p className={'font-medium'}>
            {typeof value === 'boolean' ?
              value ?
                'Yes'
              : 'No'
            : value}
          </p>
        }
      </div>
    </div>
  );
};

export const BobbleheadStatusPrivacyCard = ({ bobblehead }: BobbleheadStatusPrivacyCardProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    else if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-blue-500'}></div>
          Status & Engagement
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <StatusItem
          color={getStatusVariant((bobblehead.status || '') as StatusVariant) as ColorVariant}
          icon={StarIcon}
          label={'Status'}
          value={bobblehead.status || 'Not set'}
          variant={'badge'}
        />

        <StatusItem
          color={bobblehead.isPublic ? 'success' : 'secondary'}
          icon={bobblehead.isPublic ? EyeIcon : EyeOffIcon}
          label={'Visibility'}
          value={bobblehead.isPublic ? 'Public' : 'Private'}
          variant={'badge'}
        />

        {bobblehead.isFeatured && (
          <StatusItem
            color={'warning'}
            icon={TrendingUpIcon}
            label={'Featured'}
            value={bobblehead.isFeatured}
            variant={'badge'}
          />
        )}

        <div className={'border-t pt-2'}>
          <span className={'mb-3 block text-sm text-muted-foreground'}>Engagement</span>
          <div className={'grid grid-cols-3 gap-4'}>
            <div className={'text-center'}>
              <div className={'mb-1 flex items-center justify-center gap-1'}>
                <EyeIcon className={'size-4 text-muted-foreground'} />
                <span className={'text-sm font-medium'}>{formatNumber(bobblehead.viewCount || 0)}</span>
              </div>
              <p className={'text-xs text-muted-foreground'}>Views</p>
            </div>

            <div className={'text-center'}>
              <div className={'mb-1 flex items-center justify-center gap-1'}>
                <HeartIcon className={'size-4 text-muted-foreground'} />
                <span className={'text-sm font-medium'}>{formatNumber(bobblehead.likeCount || 0)}</span>
              </div>
              <p className={'text-xs text-muted-foreground'}>Likes</p>
            </div>

            <div className={'text-center'}>
              <div className={'mb-1 flex items-center justify-center gap-1'}>
                <MessageCircleIcon className={'size-4 text-muted-foreground'} />
                <span className={'text-sm font-medium'}>{formatNumber(bobblehead.commentCount || 0)}</span>
              </div>
              <p className={'text-xs text-muted-foreground'}>Comments</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
