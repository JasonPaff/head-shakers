'use client';

import type { ComponentProps } from 'react';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { BrainIcon, ChevronDownIcon, DotIcon, type LucideIcon } from 'lucide-react';
import { createContext, memo, useContext } from 'react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/utils/tailwind-utils';

type ChainOfThoughtContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ChainOfThoughtContext = createContext<ChainOfThoughtContextValue | null>(null);

const useChainOfThought = () => {
  const context = useContext(ChainOfThoughtContext);
  if (!context) {
    throw new Error('ChainOfThought components must be used within ChainOfThought');
  }
  return context;
};

export type ChainOfThoughtProps = ComponentProps<'div'> & {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
};

export const ChainOfThought = memo(
  ({ children, className, defaultOpen = false, onOpenChange, open, ...props }: ChainOfThoughtProps) => {
    const [isOpen, setIsOpen] = useControllableState({
      defaultProp: defaultOpen,
      onChange: onOpenChange,
      prop: open,
    });

    return (
      <ChainOfThoughtContext.Provider value={{ isOpen, setIsOpen }}>
        <div className={cn('not-prose max-w-prose space-y-4', className)} {...props}>
          {children}
        </div>
      </ChainOfThoughtContext.Provider>
    );
  },
);

export type ChainOfThoughtHeaderProps = ComponentProps<typeof CollapsibleTrigger>;

export const ChainOfThoughtHeader = memo(({ children, className, ...props }: ChainOfThoughtHeaderProps) => {
  const { isOpen, setIsOpen } = useChainOfThought();

  return (
    <Collapsible onOpenChange={setIsOpen} open={isOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
          className,
        )}
        {...props}
      >
        <BrainIcon className={'size-4'} />
        <span className={'flex-1 text-left'}>{children ?? 'Chain of Thought'}</span>
        <ChevronDownIcon className={cn('size-4 transition-transform', isOpen ? 'rotate-180' : 'rotate-0')} />
      </CollapsibleTrigger>
    </Collapsible>
  );
});

export type ChainOfThoughtStepProps = ComponentProps<'div'> & {
  description?: string;
  icon?: LucideIcon;
  label: string;
  status?: 'active' | 'complete' | 'pending';
};

export const ChainOfThoughtStep = memo(
  ({
    children,
    className,
    description,
    icon: Icon = DotIcon,
    label,
    status = 'complete',
    ...props
  }: ChainOfThoughtStepProps) => {
    const statusStyles = {
      active: 'text-foreground',
      complete: 'text-muted-foreground',
      pending: 'text-muted-foreground/50',
    };

    return (
      <div
        className={cn(
          'flex gap-2 text-sm',
          statusStyles[status],
          'animate-in fade-in-0 slide-in-from-top-2',
          className,
        )}
        {...props}
      >
        <div className={'relative mt-0.5'}>
          <Icon className={'size-4'} />
          <div className={'absolute top-7 bottom-0 left-1/2 -mx-px w-px bg-border'} />
        </div>
        <div className={'flex-1 space-y-2'}>
          <div>{label}</div>
          {description && <div className={'text-xs text-muted-foreground'}>{description}</div>}
          {children}
        </div>
      </div>
    );
  },
);

export type ChainOfThoughtSearchResultsProps = ComponentProps<'div'>;

export const ChainOfThoughtSearchResults = memo(
  ({ className, ...props }: ChainOfThoughtSearchResultsProps) => (
    <div className={cn('flex items-center gap-2', className)} {...props} />
  ),
);

export type ChainOfThoughtSearchResultProps = ComponentProps<typeof Badge>;

export const ChainOfThoughtSearchResult = memo(
  ({ children, className, ...props }: ChainOfThoughtSearchResultProps) => (
    <Badge
      className={cn('gap-1 px-2 py-0.5 text-xs font-normal', className)}
      variant={'secondary'}
      {...props}
    >
      {children}
    </Badge>
  ),
);

export type ChainOfThoughtContentProps = ComponentProps<typeof CollapsibleContent>;

export const ChainOfThoughtContent = memo(({ children, className, ...props }: ChainOfThoughtContentProps) => {
  const { isOpen } = useChainOfThought();

  return (
    <Collapsible open={isOpen}>
      <CollapsibleContent
        className={cn(
          'mt-2 space-y-3',
          'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
          className,
        )}
        {...props}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
});

export type ChainOfThoughtImageProps = ComponentProps<'div'> & {
  caption?: string;
};

export const ChainOfThoughtImage = memo(
  ({ caption, children, className, ...props }: ChainOfThoughtImageProps) => (
    <div className={cn('mt-2 space-y-2', className)} {...props}>
      <div
        className={
          'relative flex max-h-[22rem] items-center justify-center overflow-hidden rounded-lg bg-muted p-3'
        }
      >
        {children}
      </div>
      {caption && <p className={'text-xs text-muted-foreground'}>{caption}</p>}
    </div>
  ),
);

ChainOfThought.displayName = 'ChainOfThought';
ChainOfThoughtHeader.displayName = 'ChainOfThoughtHeader';
ChainOfThoughtStep.displayName = 'ChainOfThoughtStep';
ChainOfThoughtSearchResults.displayName = 'ChainOfThoughtSearchResults';
ChainOfThoughtSearchResult.displayName = 'ChainOfThoughtSearchResult';
ChainOfThoughtContent.displayName = 'ChainOfThoughtContent';
ChainOfThoughtImage.displayName = 'ChainOfThoughtImage';
