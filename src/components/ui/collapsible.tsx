'use client';

import type { ComponentProps } from 'react';

import {
  CollapsibleContent as RadixCollapsibleContent,
  CollapsibleTrigger as RadixCollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import { Root } from '@radix-ui/react-collapsible';

type CollapsibleContentProps = ComponentProps<typeof RadixCollapsibleContent>;
type CollapsibleProps = ComponentProps<typeof Root>;
type CollapsibleTriggerProps = ComponentProps<typeof RadixCollapsibleTrigger>;

export const Collapsible = ({ children, ...props }: CollapsibleProps) => {
  return (
    <Root data-slot={'collapsible'} {...props}>
      {children}
    </Root>
  );
};

export const CollapsibleTrigger = ({ children, ...props }: CollapsibleTriggerProps) => {
  return (
    <RadixCollapsibleTrigger data-slot={'collapsible-trigger'} {...props}>
      {children}
    </RadixCollapsibleTrigger>
  );
};

export const CollapsibleContent = ({ children, ...props }: CollapsibleContentProps) => {
  return (
    <RadixCollapsibleContent data-slot={'collapsible-content'} {...props}>
      {children}
    </RadixCollapsibleContent>
  );
};
