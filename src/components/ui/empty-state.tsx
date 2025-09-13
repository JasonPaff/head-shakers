import type { ElementType, ReactNode } from 'react';

import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

type EmptyStateProps = ClassName<{
  action?: ReactNode;
  description: string;
  icon?: ElementType;
  title: string;
}>;

export function EmptyState({ action, className, description, icon: Icon, title }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center',
        'rounded-lg border border-dashed p-8 text-center',
        className,
      )}
    >
      {Icon && <Icon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />}
      <h3 className={'mb-2 text-lg font-semibold'}>{title}</h3>
      <p className={'mb-4 max-w-sm text-sm text-muted-foreground'}>{description}</p>

      {/* Action Button */}
      <Conditional isCondition={!!action}>
        <div className={'mt-2'}>{action}</div>
      </Conditional>
    </div>
  );
}
