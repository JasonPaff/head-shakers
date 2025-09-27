'use client';

import type { ToolUIPart } from 'ai';
import type { ComponentProps, ReactNode } from 'react';

import {
  CheckCircleIcon,
  ChevronDownIcon,
  CircleIcon,
  ClockIcon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/utils/tailwind-utils';

import { CodeBlock } from './code-block';

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, ...props }: ToolProps) => (
  <Collapsible className={cn('mb-4 w-full rounded-md border', className)} {...props} />
);

export type ToolHeaderProps = {
  className?: string;
  state: ToolUIPart['state'];
  title?: string;
  type: ToolUIPart['type'];
};

const getStatusBadge = (status: ToolUIPart['state']) => {
  const labels = {
    'input-available': 'Running',
    'input-streaming': 'Pending',
    'output-available': 'Completed',
    'output-error': 'Error',
  } as const;

  const icons = {
    'input-available': <ClockIcon className={'size-4 animate-pulse'} />,
    'input-streaming': <CircleIcon className={'size-4'} />,
    'output-available': <CheckCircleIcon className={'size-4 text-green-600'} />,
    'output-error': <XCircleIcon className={'size-4 text-red-600'} />,
  } as const;

  return (
    <Badge className={'gap-1.5 rounded-full text-xs'} variant={'secondary'}>
      {icons[status]}
      {labels[status]}
    </Badge>
  );
};

export const ToolHeader = ({ className, state, title, type, ...props }: ToolHeaderProps) => (
  <CollapsibleTrigger
    className={cn('flex w-full items-center justify-between gap-4 p-3', className)}
    {...props}
  >
    <div className={'flex items-center gap-2'}>
      <WrenchIcon className={'size-4 text-muted-foreground'} />
      <span className={'text-sm font-medium'}>{title ?? type.split('-').slice(1).join('-')}</span>
      {getStatusBadge(state)}
    </div>
    <ChevronDownIcon
      className={'size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180'}
    />
  </CollapsibleTrigger>
);

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({ className, ...props }: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      'text-popover-foreground outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2',
      className,
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<'div'> & {
  input: ToolUIPart['input'];
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => (
  <div className={cn('space-y-2 overflow-hidden p-4', className)} {...props}>
    <h4 className={'text-xs font-medium tracking-wide text-muted-foreground uppercase'}>Parameters</h4>
    <div className={'rounded-md bg-muted/50'}>
      <CodeBlock code={JSON.stringify(input, null, 2)} language={'json'} />
    </div>
  </div>
);

export type ToolOutputProps = ComponentProps<'div'> & {
  errorText: ToolUIPart['errorText'];
  output: ToolUIPart['output'];
};

export const ToolOutput = ({ className, errorText, output, ...props }: ToolOutputProps) => {
  if (!(output || errorText)) {
    return null;
  }

  let Output = <div>{output as ReactNode}</div>;

  if (typeof output === 'object') {
    Output = <CodeBlock code={JSON.stringify(output, null, 2)} language={'json'} />;
  } else if (typeof output === 'string') {
    Output = <CodeBlock code={output} language={'json'} />;
  }

  return (
    <div className={cn('space-y-2 p-4', className)} {...props}>
      <h4 className={'text-xs font-medium tracking-wide text-muted-foreground uppercase'}>
        {errorText ? 'Error' : 'Result'}
      </h4>
      <div
        className={cn(
          'overflow-x-auto rounded-md text-xs [&_table]:w-full',
          errorText ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-foreground',
        )}
      >
        {errorText && <div>{errorText}</div>}
        {Output}
      </div>
    </div>
  );
};
