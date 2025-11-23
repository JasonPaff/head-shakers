import type { ComponentProps } from 'react';

import { EyeIcon, EyeOffIcon, StarIcon, TrendingUpIcon } from 'lucide-react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardSection } from './feature-card-section';

type FeatureCardStatusProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: BobbleheadWithRelations;
  };

type StatusVariant = 'owned' | 'sold' | 'trading' | 'wanted' | undefined;

const getStatusBadgeVariant = (
  status: StatusVariant,
): 'default' | 'destructive' | 'outline' | 'secondary' => {
  switch (status?.toLowerCase()) {
    case 'owned':
      return 'default';
    case 'sold':
      return 'secondary';
    case 'trading':
      return 'outline';
    case 'wanted':
      return 'secondary';
    default:
      return 'outline';
  }
};

export const FeatureCardStatus = ({ bobblehead, className, testId, ...props }: FeatureCardStatusProps) => {
  const statusTestId = testId || generateTestId('feature', 'bobblehead-details', 'status');

  const _hasStatus = !!bobblehead.status;
  const _itemCount =
    (_hasStatus ? 1 : 0) +
    1 + // visibility is always shown
    (bobblehead.isFeatured ? 1 : 0);

  return (
    <div className={cn(className)} data-slot={'feature-card-status'} data-testid={statusTestId} {...props}>
      <FeatureCardSection isDefaultOpen={false} itemCount={_itemCount} title={'Status & Visibility'}>
        <div className={'space-y-3'}>
          {/* Status */}
          <Conditional isCondition={_hasStatus}>
            <div className={'flex items-center justify-between'} data-testid={`${statusTestId}-status`}>
              <div className={'flex items-center gap-2'}>
                <StarIcon aria-hidden className={'size-4 text-muted-foreground'} />
                <span className={'text-sm text-muted-foreground'}>Status</span>
              </div>
              <Badge variant={getStatusBadgeVariant(bobblehead.status as StatusVariant)}>
                {bobblehead.status || 'Not set'}
              </Badge>
            </div>
          </Conditional>

          {/* Visibility */}
          <div className={'flex items-center justify-between'} data-testid={`${statusTestId}-visibility`}>
            <div className={'flex items-center gap-2'}>
              {bobblehead.isPublic ?
                <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
              : <EyeOffIcon aria-hidden className={'size-4 text-muted-foreground'} />}
              <span className={'text-sm text-muted-foreground'}>Visibility</span>
            </div>
            <Badge variant={bobblehead.isPublic ? 'default' : 'secondary'}>
              {bobblehead.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>

          {/* Featured */}
          <Conditional isCondition={bobblehead.isFeatured}>
            <div className={'flex items-center justify-between'} data-testid={`${statusTestId}-featured`}>
              <div className={'flex items-center gap-2'}>
                <TrendingUpIcon aria-hidden className={'size-4 text-muted-foreground'} />
                <span className={'text-sm text-muted-foreground'}>Featured</span>
              </div>
              <Badge variant={'default'}>Yes</Badge>
            </div>
          </Conditional>
        </div>
      </FeatureCardSection>
    </div>
  );
};
