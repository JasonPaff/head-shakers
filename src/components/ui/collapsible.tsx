'use client';

import type {
  CollapsibleContent as RadixCollapsibleContent,
  CollapsibleTrigger as RadixCollapsibleTrigger,
} from '@radix-ui/react-collapsible';
import type { ComponentProps } from 'react';

import { Root } from '@radix-ui/react-collapsible';

type CollapsibleContentProps = ComponentProps<typeof RadixCollapsibleContent>;
type CollapsibleProps = ComponentProps<typeof Root>;
type CollapsibleTriggerProps = ComponentProps<typeof RadixCollapsibleTrigger>;

export const Collapsible = ({ ...props }: CollapsibleProps) => {
  return <Root data-slot={'collapsible'} {...props} />;
};

export const CollapsibleTrigger = ({ ...props }: CollapsibleTriggerProps) => {
  return <CollapsibleTrigger data-slot={'collapsible-trigger'} {...props} />;
};

export const CollapsibleContent = ({ ...props }: CollapsibleContentProps) => {
  return <CollapsibleContent data-slot={'collapsible-content'} {...props} />;
};
