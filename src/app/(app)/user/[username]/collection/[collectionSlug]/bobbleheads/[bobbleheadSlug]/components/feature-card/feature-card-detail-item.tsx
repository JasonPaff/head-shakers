import type { LucideIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FeatureCardDetailItemProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    icon?: LucideIcon;
    label: string;
    value: ReactNode;
  };

export const FeatureCardDetailItem = ({
  className,
  icon: Icon,
  label,
  testId,
  value,
  ...props
}: FeatureCardDetailItemProps) => {
  const detailItemTestId = testId || generateTestId('feature', 'bobblehead-details', 'item');

  const _hasValue = value !== null && value !== undefined && value !== '';

  return (
    <div
      className={cn('flex items-center justify-between gap-3', className)}
      data-slot={'feature-card-detail-item'}
      data-testid={detailItemTestId}
      {...props}
    >
      {/* Label Section */}
      <div className={'flex items-center gap-2'}>
        {Icon && <Icon aria-hidden className={'size-4 shrink-0 text-muted-foreground'} />}
        <span className={'text-sm text-muted-foreground'}>{label}</span>
      </div>

      {/* Value Section */}
      <Conditional
        fallback={<span className={'text-sm text-muted-foreground/60 italic'}>Not specified</span>}
        isCondition={_hasValue}
      >
        <span className={'text-sm font-medium'}>{value}</span>
      </Conditional>
    </div>
  );
};
