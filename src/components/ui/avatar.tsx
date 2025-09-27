'use client';

import type { ComponentProps } from 'react';

import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/utils/tailwind-utils';

type AvatarFallbackProps = ComponentProps<typeof AvatarPrimitive.Fallback>;
type AvatarImageProps = ComponentProps<typeof AvatarPrimitive.Image>;
type AvatarProps = ComponentProps<typeof AvatarPrimitive.Root>;

export const Avatar = ({ className, ...props }: AvatarProps) => {
  return (
    <AvatarPrimitive.Root
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      data-slot={'avatar'}
      {...props}
    />
  );
};

export const AvatarFallback = ({ className, ...props }: AvatarFallbackProps) => {
  return (
    <AvatarPrimitive.Fallback
      className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
      data-slot={'avatar-fallback'}
      {...props}
    />
  );
};

export const AvatarImage = ({ className, ...props }: AvatarImageProps) => {
  return (
    <AvatarPrimitive.Image
      className={cn('aspect-square size-full', className)}
      data-slot={'avatar-image'}
      {...props}
    />
  );
};
