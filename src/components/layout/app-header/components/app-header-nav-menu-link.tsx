'use client';

import type { ComponentProps, ReactNode } from 'react';

import Link from 'next/link';

import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { cn } from '@/utils/tailwind-utils';

type AppHeaderNavMenuLinkProps = Omit<ComponentProps<typeof Link>, 'title'> & {
  isAuthRequired?: boolean;
  title: ReactNode;
};

export const AppHeaderNavMenuLink = ({ children, className, title, ...props }: AppHeaderNavMenuLinkProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          className={cn(
            'block space-y-1 rounded-md p-3 leading-none no-underline transition-colors',
            'outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent',
            'focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className={'flex items-center text-sm leading-none font-medium'}>{title}</div>
          <p className={'line-clamp-2 text-sm leading-snug text-muted-foreground'}>{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
