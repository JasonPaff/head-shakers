'use client';

import type { ComponentProps, ReactNode } from 'react';

import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FeatureCardSectionProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    children: ReactNode;
    isDefaultOpen?: boolean;
    itemCount?: number;
    title: string;
  };

export const FeatureCardSection = ({
  children,
  className,
  isDefaultOpen = true,
  itemCount,
  testId,
  title,
  ...props
}: FeatureCardSectionProps) => {
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const sectionTestId = testId || generateTestId('feature', 'bobblehead-details', 'section');

  const _hasItemCount = itemCount !== undefined && itemCount >= 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Collapsible
      className={cn('border-t border-border pt-4', className)}
      data-slot={'feature-card-section'}
      data-testid={sectionTestId}
      onOpenChange={handleOpenChange}
      open={isOpen}
      {...props}
    >
      {/* Section Header */}
      <CollapsibleTrigger
        aria-expanded={isOpen}
        className={'flex w-full items-center justify-between gap-2 text-left hover:opacity-80'}
        data-slot={'feature-card-section-trigger'}
      >
        <div className={'flex items-center gap-2'}>
          <span className={'text-sm font-semibold'}>{title}</span>
          <Conditional isCondition={_hasItemCount}>
            <span className={'text-xs text-muted-foreground'}>({itemCount} items)</span>
          </Conditional>
        </div>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </CollapsibleTrigger>

      {/* Section Content */}
      <CollapsibleContent className={'mt-3 space-y-3'} data-slot={'feature-card-section-content'}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};
