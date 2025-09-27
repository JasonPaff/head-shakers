'use client';

import type { ComponentProps } from 'react';

import { ArrowDownIcon } from 'lucide-react';
import { useCallback } from 'react';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn('relative flex-1 overflow-y-auto', className)}
    initial={'smooth'}
    resize={'smooth'}
    role={'log'}
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, ...props }: ConversationContentProps) => (
  <StickToBottom.Content className={cn('p-4', className)} {...props} />
);

export type ConversationEmptyStateProps = ComponentProps<'div'> & {
  description?: string;
  icon?: React.ReactNode;
  title?: string;
};

export const ConversationEmptyState = ({
  children,
  className,
  description = 'Start a conversation to see messages here',
  icon,
  title = 'No messages yet',
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn('flex size-full flex-col items-center justify-center gap-3 p-8 text-center', className)}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className={'text-muted-foreground'}>{icon}</div>}
        <div className={'space-y-1'}>
          <h3 className={'text-sm font-medium'}>{title}</h3>
          {description && <p className={'text-sm text-muted-foreground'}>{description}</p>}
        </div>
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({ className, ...props }: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    void scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <Button
        className={cn('absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full', className)}
        onClick={handleScrollToBottom}
        size={'icon'}
        type={'button'}
        variant={'outline'}
        {...props}
      >
        <ArrowDownIcon className={'size-4'} />
      </Button>
    )
  );
};
