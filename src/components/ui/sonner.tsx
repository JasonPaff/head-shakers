'use client';

import type { CSSProperties } from 'react';
import type { ToasterProps } from 'sonner';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';

export const Toaster = ({ testId, ...props }: ComponentTestIdProps & ToasterProps) => {
  const { theme = 'system' } = useTheme();

  const toasterTestId = testId || generateTestId('ui', 'sonner');

  return (
    <Sonner
      className={'group'}
      data-testid={toasterTestId}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
        } as CSSProperties
      }
      theme={theme as ToasterProps['theme']}
      {...props}
    />
  );
};
