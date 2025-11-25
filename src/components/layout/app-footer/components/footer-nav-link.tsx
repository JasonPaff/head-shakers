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
          'text-sm text-muted-foreground transition-colors',
          'hover:text-foreground focus:text-foreground',
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
