import type { ElementType, ReactNode } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type EmptyStateProps = ClassName<{
  action?: ReactNode;
  description: string;
  icon?: ElementType;
  title: string;
}> & ComponentTestIdProps;

export function EmptyState({ action, className, description, icon: Icon, testId, title }: EmptyStateProps) {
  const emptyStateTestId = testId || generateTestId('ui', 'empty-state');

  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center',
        'rounded-lg border border-dashed bg-card p-8 text-center',
        className,
      )}
      data-testid={emptyStateTestId}
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
