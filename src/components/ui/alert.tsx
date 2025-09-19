import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cva } from 'class-variance-authority';
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import { useMemo } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

const style = cva('me-3 -mt-0.5 inline-flex size-5', {
  defaultVariants: { variant: 'info' },
  variants: {
    variant: {
      error: 'text-destructive',
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-amber-500',
    },
  },
});

const getIcon = (variant: VariantProps<typeof style>['variant']) => {
  switch (variant) {
    case 'error':
      return CircleAlertIcon;
    case 'info':
      return InfoIcon;
    case 'success':
      return CircleCheckIcon;
    case 'warning':
      return TriangleAlertIcon;
    default:
      return TriangleAlertIcon;
  }
};

type AlertProps = ComponentProps<'div'> & ComponentTestIdProps & VariantProps<typeof style>;

export const Alert = ({ children, className, testId, variant, ...props }: AlertProps) => {
  const Icon = useMemo(() => getIcon(variant), [variant]);
  const alertTestId = testId || generateTestId('ui', 'alert');

  return (
    <div className={'rounded-md border px-4 py-3'} data-testid={alertTestId} {...props}>
      <p className={'text-sm'}>
        <Icon aria-hidden className={cn(style({ variant }), className)} />
        {children}
      </p>
    </div>
  );
};
