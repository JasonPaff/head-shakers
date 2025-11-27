import type { ComponentProps } from 'react';

import Link from 'next/link';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type FooterNavLinkProps = ComponentProps<typeof Link> &
  ComponentTestIdProps & {
    /**
     * Label text for the navigation link
     */
    label: string;
  };

export const FooterNavLink = ({ className, href, label, testId, ...props }: FooterNavLinkProps) => {
  const linkTestId = testId || generateTestId('layout', 'app-footer', 'nav-link');

  return (
    <li data-slot={'footer-nav-link-item'}>
      <Link
        className={cn(
          'text-sm text-slate-600 transition-colors dark:text-slate-400',
          'hover:text-orange-600 focus:text-orange-600 dark:hover:text-orange-400 dark:focus:text-orange-400',
          'focus:outline-none focus-visible:underline focus-visible:underline-offset-4',
          className,
        )}
        data-slot={'footer-nav-link'}
        data-testid={linkTestId}
        href={href}
        {...props}
      >
        {label}
      </Link>
    </li>
  );
};
